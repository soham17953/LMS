import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { getSubjects } from '../../../lib/studentSubjects';

const STUDENT_PROFILE = { medium: 'English', class: '9' };

const ALL_LECTURES = [
  { id: 1, title: 'Trigonometry Basics', subject: 'Maths', date: '2026-04-21', time: '10:00', medium: 'English', class: '9' },
  { id: 2, title: 'Chemical Reactions', subject: 'Science', date: '2026-04-22', time: '12:00', medium: 'English', class: '9' },
  { id: 3, title: 'Grammar Practice', subject: 'English', date: '2026-04-22', time: '09:00', medium: 'English', class: '8' },
];

const StudentLectures = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  const allowedSubjects = useMemo(
    () => getSubjects(STUDENT_PROFILE.medium, STUDENT_PROFILE.class),
    [STUDENT_PROFILE.medium, STUDENT_PROFILE.class]
  );

  useEffect(() => {
    if (subjectFilter && !allowedSubjects.includes(subjectFilter)) {
      setSubjectFilter('');
    }
  }, [allowedSubjects, subjectFilter]);

  const filteredLectures = useMemo(() => {
    return ALL_LECTURES
      .filter((lecture) => lecture.medium === STUDENT_PROFILE.medium && lecture.class === STUDENT_PROFILE.class)
      .filter((lecture) => !dateFilter || lecture.date === dateFilter)
      .filter((lecture) => !subjectFilter || lecture.subject === subjectFilter);
  }, [dateFilter, subjectFilter]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900">Lectures</h2>
        <p className="text-gray-500 mt-1">View your scheduled lectures.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Filter by Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Filter by Subject</label>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Subjects</option>
            {allowedSubjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-max">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <th className="p-4 pl-6">Title</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Medium</th>
                <th className="p-4">Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLectures.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No data available</td></tr>
              ) : (
                filteredLectures.map((lecture) => (
                  <tr key={lecture.id}>
                    <td className="p-4 pl-6 font-semibold text-gray-900">{lecture.title}</td>
                    <td className="p-4 text-gray-600">{lecture.subject}</td>
                    <td className="p-4 text-gray-600">{lecture.date} at {lecture.time}</td>
                    <td className="p-4 text-gray-600">{lecture.medium}</td>
                    <td className="p-4 text-gray-700 font-semibold">Std {lecture.class}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {filteredLectures.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-500">No data available</div>
        ) : (
          filteredLectures.map((lecture) => (
            <div key={lecture.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="font-bold text-gray-900">{lecture.title}</p>
              <p className="text-sm text-gray-600 mt-1">{lecture.subject}</p>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1"><Calendar className="w-4 h-4" />{lecture.date} at {lecture.time}</p>
              <p className="text-xs text-gray-500 mt-1">{lecture.medium} • Std {lecture.class}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentLectures;
