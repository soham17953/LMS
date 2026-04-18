import React, { useState } from 'react';
import { Eye, Edit, X, ClipboardList, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_ATTENDANCE = [
  { id: 1, date: '2026-03-20', teacher: 'Ramesh Patil', medium: 'English', class: '9', total: 45, present: 42, absent: 3, students: [
      { id: 'S1', name: 'Alok Kumar', status: 'Present' },
      { id: 'S2', name: 'Rahul Desai', status: 'Absent' },
      { id: 'S3', name: 'Neha Sharma', status: 'Present' },
  ] },
  { id: 2, date: '2026-03-20', teacher: 'Sunita Sharma', medium: 'Marathi', class: '7', total: 30, present: 30, absent: 0, students: [
      { id: 'S4', name: 'Sneha Kadam', status: 'Present' },
      { id: 'S5', name: 'Omkar Joshi', status: 'Present' },
  ] }
];

const AdminAttendance = () => {
  const [records, setRecords] = useState(MOCK_ATTENDANCE);
  const [viewModal, setViewModal] = useState(null); // holds record to view
  const [editModal, setEditModal] = useState(null); // holds record to edit

  const toggleStudentStatus = (studentId) => {
    setEditModal({
      ...editModal,
      students: editModal.students.map(s => s.id === studentId ? { ...s, status: s.status === 'Present' ? 'Absent' : 'Present' } : s)
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    // Recalculate totals
    const present = editModal.students.filter(s => s.status === 'Present').length;
    const absent = editModal.students.filter(s => s.status === 'Absent').length;
    
    setRecords(records.map(r => r.id === editModal.id ? { ...editModal, present, absent } : r));
    setEditModal(null);
    toast.success('Attendance record updated successfully.');
  };

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
                <th className="p-4">Class</th>
                <th className="p-4">Total</th>
                <th className="p-4">Stats</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map(record => (
                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 pl-6 font-bold text-gray-900">{record.date}</td>
                  <td className="p-4 text-sm text-gray-700">{record.teacher}</td>
                  <td className="p-4 text-sm font-bold text-gray-800">{record.medium} - Std {record.class}</td>
                  <td className="p-4 text-sm font-medium text-gray-600">{record.total}</td>
                  <td className="p-4">
                    <div className="flex gap-2 text-xs font-bold">
                       <span className="px-2 py-1 bg-green-50 text-green-700 rounded">P: {record.present}</span>
                       <span className="px-2 py-1 bg-red-50 text-red-700 rounded">A: {record.absent}</span>
                    </div>
                  </td>
                  <td className="p-4 pr-6 flex justify-end gap-2">
                     <button onClick={() => setViewModal(record)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200" title="View Roster">
                       <Eye className="w-4 h-4" />
                     </button>
                     <button onClick={() => setEditModal(record)} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200" title="Edit Roster">
                       <Edit className="w-4 h-4" />
                     </button>
                  </td>
                </tr>
              ))}
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
                   <p className="font-bold text-gray-900">{viewModal.medium} - Std {viewModal.class}</p>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                   {viewModal.students.map(s => (
                     <div key={s.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl bg-gray-50">
                        <span className="font-semibold text-gray-800">{s.name}</span>
                        {s.status === 'Present' ? (
                          <span className="flex items-center gap-1 text-green-600 font-bold text-sm"><CheckCircle className="w-4 h-4" /> {s.status}</span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 font-bold text-sm"><XCircle className="w-4 h-4" /> {s.status}</span>
                        )}
                     </div>
                   ))}
                </div>
                <button onClick={() => setViewModal(null)} className="mt-6 w-full py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Close View</button>
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
               <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
             </div>
             <form onSubmit={handleUpdate} className="p-6">
                <div className="flex justify-between items-center mb-4 text-sm bg-indigo-50 p-3 rounded-lg text-indigo-900 border border-indigo-100">
                   <p className="font-semibold opacity-80">{editModal.date}</p>
                   <p className="font-bold">{editModal.medium} - Std {editModal.class}</p>
                </div>
                <p className="text-xs text-center text-gray-500 mb-2">Click on status badge to toggle</p>
                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                   {editModal.students.map(s => (
                     <div key={s.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-xl bg-white shadow-sm hover:border-gray-300 transition-colors">
                        <span className="font-semibold text-gray-800">{s.name}</span>
                        <button 
                           type="button"
                           onClick={() => toggleStudentStatus(s.id)}
                           className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors ${
                              s.status === 'Present' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                           }`}
                        >
                           {s.status === 'Present' ? <CheckCircle className="w-4 h-4"/> : <XCircle className="w-4 h-4"/>}
                           {s.status}
                        </button>
                     </div>
                   ))}
                </div>
                <div className="pt-6 flex gap-3 justify-end border-t border-gray-100 mt-4">
                   <button type="button" onClick={() => setEditModal(null)} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors w-1/3">Cancel</button>
                   <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md transition-colors w-2/3">Save Changes</button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;
