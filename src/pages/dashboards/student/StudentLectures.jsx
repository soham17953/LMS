import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { AuthService } from '../../../lib/authService';

const StudentLectures = () => {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [lectures, setLectures] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  useEffect(() => {
    fetchLectures();
  }, []);

  const fetchLectures = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const data = await AuthService.getStudentLectures(token);
      setLectures(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const allowedSubjects = useMemo(() => {
    const subjects = lectures.map(l => l.subjectName || 'General');
    return [...new Set(subjects)];
  }, [lectures]);

  useEffect(() => {
    if (subjectFilter && !allowedSubjects.includes(subjectFilter)) {
      setSubjectFilter('');
    }
  }, [allowedSubjects, subjectFilter]);

  const filteredLectures = useMemo(() => {
    return lectures
      // For date filter, we can just check if lecture's created_at starts with the date string (e.g. YYYY-MM-DD),
      // but normally lectures have their own scheduled 'date' column in a real app.
      // If we don't have a date column, we can filter by created_at.
      .filter((lecture) => {
        if (!dateFilter) return true;
        // Basic match for date string
        return lecture.created_at?.startsWith(dateFilter);
      })
      .filter((lecture) => !subjectFilter || (lecture.subjectName || 'General') === subjectFilter);
  }, [lectures, dateFilter, subjectFilter]);

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
          <label className="block text-sm font-semibold text-gray-700 mb-1">Filter by Date (Created)</label>
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
                <th className="p-4">Date Created</th>
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
                    <td className="p-4 pl-6 font-semibold text-gray-900">
                      {lecture.video_url ? (
                        <a href={lecture.video_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                          {lecture.title}
                        </a>
                      ) : (
                        lecture.title
                      )}
                    </td>
                    <td className="p-4 text-gray-600">{lecture.subjectName || 'General'}</td>
                    <td className="p-4 text-gray-600">{new Date(lecture.created_at).toLocaleDateString()}</td>
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
              <p className="font-bold text-gray-900">
                 {lecture.video_url ? (
                   <a href={lecture.video_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                     {lecture.title}
                   </a>
                 ) : (
                   lecture.title
                 )}
              </p>
              <p className="text-sm text-gray-600 mt-1">{lecture.subjectName || 'General'}</p>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(lecture.created_at).toLocaleDateString()}</p>
              <p className="text-xs text-gray-500 mt-1">{lecture.medium} • Std {lecture.class}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentLectures;
