import React, { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';

const STUDENT_PROFILE = { medium: 'English', class: '9' };

const ALL_ATTENDANCE = [
  { id: 1, date: '2026-04-10', subject: 'Maths', status: 'Present', class: '9', medium: 'English' },
  { id: 2, date: '2026-04-11', subject: 'Science', status: 'Absent', class: '9', medium: 'English' },
  { id: 3, date: '2026-04-12', subject: 'English', status: 'Present', class: '9', medium: 'English' },
  { id: 4, date: '2026-04-12', subject: 'Marathi', status: 'Present', class: '9', medium: 'Marathi' },
];

const StudentAttendance = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  const records = useMemo(
    () => ALL_ATTENDANCE.filter((entry) => entry.class === STUDENT_PROFILE.class && entry.medium === STUDENT_PROFILE.medium),
    []
  );
  const presentCount = records.filter((record) => record.status === 'Present').length;
  const totalClasses = records.length;
  const percentage = totalClasses ? Math.round((presentCount / totalClasses) * 100) : 0;

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Classes</p>
          <p className="text-2xl font-extrabold text-gray-900">{totalClasses}</p>
        </div>
        <div className="bg-white rounded-2xl border border-green-100 p-4">
          <p className="text-sm text-green-700">Present Count</p>
          <p className="text-2xl font-extrabold text-green-700">{presentCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-indigo-100 p-4">
          <p className="text-sm text-indigo-700">Attendance %</p>
          <p className="text-2xl font-extrabold text-indigo-700">{percentage}%</p>
        </div>
      </div>

      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-max">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <th className="p-4 pl-6">Date</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.length === 0 ? (
                <tr><td colSpan="3" className="p-8 text-center text-gray-500">No data available</td></tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id}>
                    <td className="p-4 pl-6 font-semibold text-gray-900">{record.date}</td>
                    <td className="p-4 text-gray-600">{record.subject}</td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${record.status === 'Present' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
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

      <div className="md:hidden space-y-3">
        {records.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-500">No data available</div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="font-bold text-gray-900">{record.date}</p>
              <p className="text-sm text-gray-600 mt-1">{record.subject}</p>
              <p className={`mt-2 text-sm font-semibold ${record.status === 'Present' ? 'text-green-700' : 'text-red-700'}`}>{record.status}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;
