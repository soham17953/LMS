import React, { useState } from 'react';
import { BookOpen, Edit, Trash2, Plus, X, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_LECTURES = [
  { id: 1, title: 'Trigonometry Basics', description: 'Introductory formulas', subject: 'Maths', creator: 'Ramesh Patil', date: '2026-03-20', time: '10:00', medium: 'English', class: '9' },
  { id: 2, title: 'Cell Structure', description: 'Animal vs Plant cells', subject: 'Science', creator: 'Admin', date: '2026-03-21', time: '14:30', medium: 'Marathi', class: '7' },
];

const AdminLectures = () => {
  const [lectures, setLectures] = useState(MOCK_LECTURES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, title: '', description: '', subject: 'Maths', creator: 'Admin', date: '', time: '', medium: 'English', class: '8' });
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to delete this lecture?')) {
      setLectures(lectures.filter(l => l.id !== id));
      toast.success('Lecture removed.');
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ id: null, title: '', description: '', subject: 'Maths', creator: 'Admin', date: '', time: '', medium: 'English', class: '8' });
    setIsModalOpen(true);
  };

  const openEditModal = (lecture) => {
    setIsEditing(true);
    setFormData(lecture);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!formData.title || !formData.date || !formData.time || !formData.class) {
       return toast.error('Check required fields.');
    }
    
    if (isEditing) {
      setLectures(lectures.map(l => l.id === formData.id ? formData : l));
      toast.success('Lecture updated successfully.');
    } else {
      setLectures([{ ...formData, id: Date.now() }, ...lectures]);
      toast.success('Lecture scheduled successfully.');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Lecture Scheduling</h2>
          <p className="text-gray-500 mt-1">Manage and audit academic lecture timetables.</p>
        </div>
        <button onClick={openAddModal} className="flex flex-shrink-0 items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-md">
           <Plus className="w-5 h-5" /> Schedule Lecture
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4 pl-6">Topic / Title</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Instructor</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Medium/Class</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lectures.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No lectures scheduled.</td></tr>
              ) : (
                lectures.map(lecture => (
                  <tr key={lecture.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="font-bold text-gray-900 truncate max-w-[200px]">{lecture.title}</p>
                    </td>
                    <td className="p-4"><span className="px-2.5 py-1 bg-gray-100 rounded-md text-gray-700 text-sm font-medium">{lecture.subject}</span></td>
                    <td className="p-4 text-sm text-gray-700 font-medium">
                       {lecture.creator === 'Admin' ? <span className="text-purple-600 font-bold">Admin</span> : lecture.creator}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-gray-400"/> {lecture.date} at {lecture.time}</div>
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-800">
                      {lecture.medium} - Std {lecture.class}
                    </td>
                    <td className="p-4 pr-6">
                       <div className="flex justify-end gap-2">
                          <button onClick={() => openEditModal(lecture)} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(lecture.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200" title="Delete">
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 mt-10 max-h-[90vh] overflow-y-auto">
             <div className="sticky top-0 bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
               <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-500" /> {isEditing ? 'Edit Lecture' : 'Schedule Lecture'}</h3>
               <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
             </div>
             
             <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Lecture Title</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" required/>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="2" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                    <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="Maths">Maths</option><option value="Science">Science</option>
                      <option value="English">English</option><option value="Marathi">Marathi</option>
                      <option value="Social Studies">Social Studies</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date & Time</label>
                    <div className="flex gap-2">
                      <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-1/2 px-2 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" required/>
                      <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-1/2 px-2 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" required/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Medium</label>
                    <select value={formData.medium} onChange={e => setFormData({...formData, medium: e.target.value, class: ''})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="English">English</option>
                      <option value="Marathi">Marathi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Class</label>
                    <select value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" required>
                      <option value="" disabled>Select Class</option>
                      {formData.medium === 'English' && [8,9,10].map(s => <option key={s} value={s}>Std {s}</option>)}
                      {formData.medium === 'Marathi' && [3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>Std {s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 mt-6">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                   <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md transition-colors">{isEditing ? 'Update Lecture' : 'Schedule Lecture'}</button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminLectures;
