import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import { AuthService } from '../../../lib/authService';

const StudentAttendance = () => {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const data = await AuthService.getStudentAttendance(token);
      setRecords(data);
    } catch {
      toast.error('Failed to load attendance.');
    } finally {
      setIsLoading(false);
    }
  };

  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const totalClasses = records.length;
  const percentage = totalClasses ? Math.round((presentCount / totalClasses) * 100) : 0;

  const statusStyle = (status) => {
    switch (status) {
      case 'present': return 'bg-green-50 text-green-700';
      case 'absent': return 'bg-red-50 text-red-700';
      case 'late': return 'bg-amber-50 text-amber-700';
      case 'excused': return 'bg-blue-50 text-blue-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

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
        <h2 className="text-2xl font-extrabold text-gray-900">Attendance</h2>
        <p className="text-gray-500 mt-1">Track your attendance records.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Classes</p>
          <p className="text-2xl font-extrabold text-gray-900">{totalClasses}</p>
        </div>
        <div className="bg-white rounded-2xl border border-green-100 p-4">
          <p className="text-sm text-green-700">Present</p>
          <p className="text-2xl font-extrabold text-green-700">{presentCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-red-100 p-4">
          <p className="text-sm text-red-600">Absent</p>
          <p className="text-2xl font-extrabold text-red-600">{absentCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-indigo-100 p-4">
          <p className="text-sm text-indigo-700">Attendance %</p>
          <p className={`text-2xl font-extrabold ${percentage >= 75 ? 'text-green-700' : 'text-red-600'}`}>
            {percentage}%
          </p>
        </div>
      </div>

      {/* Attendance % bar */}
      {totalClasses > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex justify-between text-sm font-semibold text-gray-600 mb-2">
            <span>Attendance Rate</span>
            <span className={percentage >= 75 ? 'text-green-700' : 'text-red-600'}>{percentage}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${percentage >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          {percentage < 75 && (
            <p className="text-xs text-red-600 mt-2 font-medium">⚠ Attendance below 75% — please attend more classes.</p>
          )}
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-max">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <th className="p-4 pl-6">Date</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Class</th>
                <th className="p-4">Medium</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No attendance records yet</td></tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-gray-900">{record.date}</td>
                    <td className="p-4 text-gray-600">{record.subjectName || 'General'}</td>
                    <td className="p-4 text-gray-700 font-semibold">Std {record.class}</td>
                    <td className="p-4 text-gray-600">{record.medium}</td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold capitalize ${statusStyle(record.status)}`}>
                        {record.status}
                      </span>
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
        {records.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-500">No attendance records yet</div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900">{record.date}</p>
                  <p className="text-sm text-gray-600 mt-1">{record.subjectName || 'General'}</p>
                  <p className="text-xs text-gray-500 mt-1">{record.medium} • Std {record.class}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${statusStyle(record.status)}`}>
                  {record.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;
