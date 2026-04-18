import React, { useState } from 'react';
import { Bell, Edit, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_NOTICES = [
  { id: 1, title: 'Extra Algebra Class', description: 'Be present at 8 AM sharp.', medium: 'English', class: '9', date: '2026-03-12' },
];

const TeacherNotices = () => {
  const [notices, setNotices] = useState(MOCK_NOTICES);
  const [formData, setFormData] = useState({ id: null, title: '', description: '', medium: 'English', class: '8' });
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to delete this notice?')) {
      setNotices(notices.filter(l => l.id !== id));
      toast.success('Notice deleted.');
    }
  };

  const handleEdit = (notice) => {
    setIsEditing(true);
    setFormData(notice);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({ id: null, title: '', description: '', medium: 'English', class: '8' });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!formData.title || !formData.class) {
       return toast.error('Check required fields.');
    }
    
    if (isEditing) {
      setNotices(notices.map(n => n.id === formData.id ? { ...formData, date: n.date } : n));
      toast.success('Notice updated successfully.');
    } else {
      setNotices([{ ...formData, id: Date.now(), date: new Date().toISOString().split('T')[0] }, ...notices]);
      toast.success('Notice posted successfully.');
    }
    cancelEdit();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Class Notices</h2>
        <p className="text-gray-500 mt-1">Send targeted updates to specific classes.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-500" />
          {isEditing ? 'Edit Notice' : 'Create New Notice'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-5">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Notice Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" required/>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none" required></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Medium</label>
                <select value={formData.medium} onChange={e => setFormData({...formData, medium: e.target.value, class: ''})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="English">English</option>
                  <option value="Marathi">Marathi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Class</label>
                <select value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100" required disabled={!formData.medium}>
                  <option value="" disabled>Select Class</option>
                  {formData.medium === 'English' && [8,9,10].map(s => <option key={s} value={s}>Std {s}</option>)}
                  {formData.medium === 'Marathi' && [3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>Std {s}</option>)}
                </select>
              </div>
           </div>

           <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 mt-6">
             {isEditing && (
               <button type="button" onClick={cancelEdit} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
             )}
             <button type="submit" disabled={!formData.class} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50">
               {isEditing ? <Edit className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
               {isEditing ? 'Update Notice' : 'Post Notice'}
             </button>
           </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4 pl-6">Notice Info</th>
                <th className="p-4">Medium</th>
                <th className="p-4">Class</th>
                <th className="p-4">Date</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {notices.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No notices posted yet.</td></tr>
              ) : (
                notices.map(notice => (
                  <tr key={notice.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 max-w-sm">
                      <p className="font-bold text-gray-900 truncate">{notice.title}</p>
                      <p className="text-xs text-gray-500 truncate mt-1">{notice.description}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{notice.medium}</td>
                    <td className="p-4 text-sm font-bold text-gray-800">Std {notice.class}</td>
                    <td className="p-4 text-sm text-gray-500">{notice.date}</td>
                    <td className="p-4 pr-6 flex justify-end gap-2">
                      <button onClick={() => handleEdit(notice)} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200" title="Edit">
                         <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(notice.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200" title="Delete">
                         <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherNotices;
