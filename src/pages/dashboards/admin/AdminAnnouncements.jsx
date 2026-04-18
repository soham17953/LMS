import React, { useState } from 'react';
import { Megaphone, Edit, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_ANNOUNCEMENTS = [
  { id: 1, title: 'Holiday Declaration', description: 'Institute will remain closed for Diwali from 20th to 25th Oct.', date: '2026-10-15' },
  { id: 2, title: 'Fees Payment Reminder', description: 'Last date for second installment is 5th Nov. Please ignore if paid.', date: '2026-10-28' },
];

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState(MOCK_ANNOUNCEMENTS);
  const [formData, setFormData] = useState({ id: null, title: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);

  const handlePublish = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return toast.error('Fields are required');
    
    if (isEditing) {
      setAnnouncements(announcements.map(a => a.id === formData.id ? { ...a, title: formData.title, description: formData.description } : a));
      toast.success('Announcement updated');
    } else {
      setAnnouncements([{ ...formData, id: Date.now(), date: new Date().toISOString().split('T')[0] }, ...announcements]);
      toast.success('Announcement published globally');
    }
    
    setFormData({ id: null, title: '', description: '' });
    setIsEditing(false);
  };

  const editItem = (item) => {
    setFormData(item);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteItem = (id) => {
    if(window.confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements(announcements.filter(a => a.id !== id));
      toast.success('Announcement deleted');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Global Announcements</h2>
        <p className="text-gray-500 mt-1">Publish updates that will be visible to all students and teachers.</p>
      </div>

      {/* Form Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-blue-500" />
          {isEditing ? 'Edit Announcement' : 'Create New Announcement'}
        </h3>
        
        <form onSubmit={handlePublish} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Announcement Title</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="e.g. Exam Schedule Released"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              rows="4"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              placeholder="Detailed announcement text..."
            ></textarea>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            {isEditing && (
              <button 
                type="button" 
                onClick={() => {setIsEditing(false); setFormData({id: null, title: '', description: ''});}} 
                className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              {isEditing ? <Edit className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
              {isEditing ? 'Update Published' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </div>

      {/* List Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Recent Announcements</h3>
        
        {announcements.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-gray-100">
             <p className="text-gray-500 font-medium">No active announcements available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {announcements.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 sm:justify-between items-start sm:items-center hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full">{item.date}</span>
                    <h4 className="text-lg font-bold text-gray-900">{item.title}</h4>
                  </div>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100">
                  <button onClick={() => editItem(item)} className="flex-1 sm:flex-none p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors text-sm font-bold flex items-center justify-center gap-2">
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => deleteItem(item.id)} className="flex-1 sm:flex-none p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors text-sm font-bold flex items-center justify-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminAnnouncements;
