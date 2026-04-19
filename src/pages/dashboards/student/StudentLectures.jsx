import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Loader2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import { AuthService } from '../../../lib/authService';

const StudentLectures = () => {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [lectures, setLectures] = useState([]);
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
    } catch {
      toast.error('Failed to load lectures.');
    } finally {
      setIsLoading(false);
    }
  };

  const allowedSubjects = useMemo(() => {
    const subjects = lectures.map((l) => l.subjectName || 'General');
    return [...new Set(subjects)];
  }, [lectures]);

  const filteredLectures = useMemo(() => {
    return lectures.filter(
      (l) => !subjectFilter || (l.subjectName || 'General') === subjectFilter
    );
  }, [lectures, subjectFilter]);

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
        <p className="text-gray-500 mt-1">View your scheduled lectures and resources.</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 max-w-xs">
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

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-max">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <th className="p-4 pl-6">Title</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Description</th>
                <th className="p-4">Scheduled</th>
                <th className="p-4">Medium</th>
                <th className="p-4">Class</th>
                <th className="p-4 pr-6">Video</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLectures.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No lectures available</td></tr>
              ) : (
                filteredLectures.map((lecture) => (
                  <tr key={lecture.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-gray-900 max-w-[180px] truncate">{lecture.title}</td>
                    <td className="p-4 text-gray-600">{lecture.subjectName || 'General'}</td>
                    <td className="p-4 text-gray-500 text-sm max-w-[200px] truncate">{lecture.description || '—'}</td>
                    <td className="p-4 text-gray-600 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {lecture.scheduled_at
                          ? new Date(lecture.scheduled_at).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : new Date(lecture.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{lecture.medium}</td>
                    <td className="p-4 text-gray-700 font-semibold">Std {lecture.class}</td>
                    <td className="p-4 pr-6">
                      {lecture.video_url ? (
                        <a
                          href={lecture.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg text-sm hover:bg-indigo-100 transition-colors"
                        >
                          Watch <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredLectures.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-500">No lectures available</div>
        ) : (
          filteredLectures.map((lecture) => (
            <div key={lecture.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="font-bold text-gray-900">{lecture.title}</p>
              <p className="text-sm text-gray-600 mt-1">{lecture.subjectName || 'General'}</p>
              {lecture.description && <p className="text-sm text-gray-500 mt-1">{lecture.description}</p>}
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {lecture.scheduled_at
                  ? new Date(lecture.scheduled_at).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : new Date(lecture.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">{lecture.medium} • Std {lecture.class}</p>
              {lecture.video_url && (
                <a
                  href={lecture.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full inline-flex items-center justify-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg text-sm"
                >
                  Watch Video <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentLectures;
