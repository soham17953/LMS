import React, { useState } from 'react';
import { Edit, Trash2, X, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_NOTICES = [
  { id: 1, title: 'Math Extra Class', description: 'Mandatory extra class for Algebra equations.', teacher: 'Ramesh Patil', medium: 'English', class: '10', date: '2026-03-12' },
  { id: 2, title: 'Science Lab Shifted', description: 'Chemistry practical will be held in Lab B today.', teacher: 'Sunita Sharma', medium: 'Marathi', class: '8', date: '2026-03-14' },
];

const AdminNotices = () => {
  const [notices, setNotices] = useState(MOCK_NOTICES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(null);

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to delete this notice?')) {
      setNotices(notices.filter(n => n.id !== id));
      toast.success('Notice deleted successfully.');
    }
  };

  const handleEdit = (notice) => {
    setFormData(notice);
    setIsModalOpen(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return toast.error('Check required fields.');
    setNotices(notices.map(n => n.id === formData.id ? formData : n));
    toast.success('Notice updated successfully.');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Institutional Notices</h2>
        <p className="text-gray-500 mt-1">Review and manage notices posted by teachers.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4 pl-6">Notice Details</th>
                <th className="p-4">Teacher</th>
                <th className="p-4">Medium</th>
                <th className="p-4">Class</th>
                <th className="p-4">Date</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {notices.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No notices found.</td></tr>
              ) : (
                notices.map(notice => (
                  <tr key={notice.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 max-w-xs">
                      <p className="font-bold text-gray-900 truncate">{notice.title}</p>
                      <p className="text-xs text-gray-500 truncate" title={notice.description}>{notice.description}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-700">{notice.teacher}</td>
                    <td className="p-4 text-sm"><span className="px-2 py-1 bg-gray-100 rounded text-gray-600 font-medium">{notice.medium}</span></td>
                    <td className="p-4 text-sm font-bold text-gray-800">Std {notice.class}</td>
                    <td className="p-4 text-sm text-gray-500">{notice.date}</td>
                    <td className="p-4 pr-6">
                       <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(notice)} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(notice.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && formData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
               <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Bell className="w-5 h-5 text-indigo-500" /> Edit Notice</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
             </div>
             <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" required/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none" required></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Medium</label>
                    <select value={formData.medium} onChange={e => setFormData({...formData, medium: e.target.value, class: ''})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="English">English</option>
                      <option value="Marathi">Marathi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Class</label>
                    <select value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" required>
                      <option value="" disabled>Select Class</option>
                      {formData.medium === 'English' && [8,9,10].map(s => <option key={s} value={s}>Std {s}</option>)}
                      {formData.medium === 'Marathi' && [3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>Std {s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex gap-3 justify-end">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Cancel</button>
                   <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md">Update Notice</button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotices;
