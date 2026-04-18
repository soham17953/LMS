import React, { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';

const STUDENT_PROFILE = { medium: 'English', class: '9' };

const ALL_NOTICES = [
  { id: 1, title: 'Math Test Monday', description: 'Chapter 4 and 5 test schedule.', by: 'Mr. Sharma', date: '2026-04-18', subject: 'Maths', class: '9', medium: 'English' },
  { id: 2, title: 'Science Practical', description: 'Bring practical notebooks.', by: 'Admin', date: '2026-04-17', subject: 'Science', class: '9', medium: 'English' },
  { id: 3, title: 'Marathi Event', description: 'Marathi speech competition details.', by: 'Admin', date: '2026-04-16', subject: 'Marathi', class: '9', medium: 'Marathi' },
];

const StudentNotices = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [classFilter, setClassFilter] = useState(STUDENT_PROFILE.class);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  const filteredNotices = useMemo(() => {
    return ALL_NOTICES
      .filter((notice) => notice.medium === STUDENT_PROFILE.medium && notice.class === STUDENT_PROFILE.class)
      .filter((notice) => !subjectFilter || notice.subject === subjectFilter)
      .filter((notice) => !classFilter || notice.class === classFilter);
  }, [subjectFilter, classFilter]);

  const subjects = useMemo(() => [...new Set(filteredNotices.map((notice) => notice.subject))], [filteredNotices]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900">Notices</h2>
        <p className="text-gray-500 mt-1">View important updates for your class.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Filter by Subject</label>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Filter by Class</label>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={STUDENT_PROFILE.class}>Std {STUDENT_PROFILE.class}</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredNotices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-500">No data available</div>
        ) : (
          filteredNotices.map((notice) => (
            <div key={notice.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="font-bold text-gray-900">{notice.title}</p>
              <p className="text-sm text-gray-600 mt-1">{notice.description}</p>
              <p className="text-xs text-gray-500 mt-2">By: {notice.by} • {notice.date}</p>
              <p className="text-xs text-gray-500 mt-1">{notice.subject} • {notice.medium} • Std {notice.class}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentNotices;
