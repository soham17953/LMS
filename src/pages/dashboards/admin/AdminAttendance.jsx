import React, { useState, useEffect } from 'react';
import { Eye, Edit, X, ClipboardList, CheckCircle, XCircle, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import { AuthService } from '../../../lib/authService';

const AdminAttendance = () => {
  const { getToken } = useAuth();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => { fetchAttendance(); }, []);

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const data = await AuthService.getAdminAttendance(token);
      setRecords(data);
    } catch {
      toast.error('Failed to load attendance records.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStudentStatus = (studentId) => {
    setEditModal((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId ? { ...s, status: s.status === 'present' ? 'absent' : 'present' } : s
      ),
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editModal) return;
    setIsUpdating(true);
    try {
      const token = await getToken();
      await AuthService.updateAdminAttendance(token, editModal.id, editModal.students);
      toast.success('Attendance updated.');
      setEditModal(null);
      await fetchAttendance();
    } catch (err) {
      toast.error(err.message || 'Failed to update attendance.');
    } finally {
      setIsUpdating(false);
    }
  };

  const statusLabel = (s) => s === 'present' ? 'Present' : s === 'absent' ? 'Absent' : s;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Attendance Manager</h2>
        <p className="text-gray-500 mt-1">Audit and correct daily attendance logs mapped by teachers.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4 pl-6">Date</th>
                <th className="p-4">Teacher</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Class</th>
                <th className="p-4">Total</th>
                <th className="p-4">Stats</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin inline" /></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No attendance records found.</td></tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-bold text-gray-900">{record.date}</td>
                    <td className="p-4 text-sm text-gray-700">{record.teacherName}</td>
                    <td className="p-4 text-sm text-gray-600">{record.subjectName || '—'}</td>
                    <td className="p-4 text-sm font-bold text-gray-800">{record.medium} — Std {record.class}</td>
                    <td className="p-4 text-sm font-medium text-gray-600">{record.total}</td>
                    <td className="p-4">
                      <div className="flex gap-2 text-xs font-bold">
                        <span className="px-2 py-1 bg-green-50 text-green-700 rounded">P: {record.present}</span>
                        <span className="px-2 py-1 bg-red-50 text-red-700 rounded">A: {record.absent}</span>
                      </div>
                    </td>
                    <td className="p-4 pr-6 flex justify-end gap-2">
                      <button onClick={() => setViewModal(record)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg border border-blue-200" title="View Roster">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditModal({ ...record, students: record.students.map((s) => ({ ...s })) })} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg border border-indigo-200" title="Edit Roster">
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW MODAL */}
      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-blue-500" /> Attendance Roster</h3>
              <button onClick={() => setViewModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4 text-sm">
                <p className="text-gray-500 font-semibold">{viewModal.date}</p>
                <p className="font-bold text-gray-900">{viewModal.medium} — Std {viewModal.class}</p>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {viewModal.students.map((s) => (
                  <div key={s.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl bg-gray-50">
                    <span className="font-semibold text-gray-800">{s.name}</span>
                    {s.status === 'present' ? (
                      <span className="flex items-center gap-1 text-green-600 font-bold text-sm"><CheckCircle className="w-4 h-4" /> Present</span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 font-bold text-sm"><XCircle className="w-4 h-4" /> Absent</span>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => setViewModal(null)} className="mt-6 w-full py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Edit className="w-5 h-5 text-indigo-500" /> Edit Attendance</h3>
              <button onClick={() => !isUpdating && setEditModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-6">
              <div className="flex justify-between items-center mb-4 text-sm bg-indigo-50 p-3 rounded-lg text-indigo-900 border border-indigo-100">
                <p className="font-semibold opacity-80">{editModal.date}</p>
                <p className="font-bold">{editModal.medium} — Std {editModal.class}</p>
              </div>
              <p className="text-xs text-center text-gray-500 mb-3">Click the status badge to toggle</p>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                {editModal.students.map((s) => (
                  <div key={s.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-xl bg-white shadow-sm hover:border-gray-300 transition-colors">
                    <span className="font-semibold text-gray-800">{s.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleStudentStatus(s.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors ${
                        s.status === 'present' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {s.status === 'present' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {statusLabel(s.status)}
                    </button>
                  </div>
                ))}
              </div>
              <div className="pt-6 flex gap-3 justify-end border-t border-gray-100 mt-4">
                <button type="button" onClick={() => setEditModal(null)} disabled={isUpdating} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 w-1/3 disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isUpdating} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md w-2/3 flex items-center justify-center gap-2 disabled:opacity-50">
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;
