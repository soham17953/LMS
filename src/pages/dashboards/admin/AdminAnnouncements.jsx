import React, { useState, useEffect } from 'react';
import { Megaphone, Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import { AuthService } from '../../../lib/authService';

const emptyForm = { id: null, title: '', description: '' };

const AdminAnnouncements = () => {
  const { getToken } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const data = await AuthService.getAdminAnnouncements(token);
      setAnnouncements(data);
    } catch {
      toast.error('Failed to load announcements.');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData(emptyForm);
  };

  const editItem = (item) => {
    setFormData({ id: item.id, title: item.title, description: item.description || item.content || '' });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      const token = await getToken();
      await AuthService.deleteAdminAnnouncement(token, id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      toast.success('Announcement deleted.');
    } catch {
      toast.error('Failed to delete announcement.');
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      return toast.error('Title and description are required.');
    }
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const payload = { title: formData.title.trim(), description: formData.description.trim() };

      if (isEditing) {
        const updated = await AuthService.updateAdminAnnouncement(token, formData.id, payload);
        setAnnouncements((prev) => prev.map((a) => (a.id === formData.id ? updated : a)));
        toast.success('Announcement updated.');
      } else {
        const created = await AuthService.createAdminAnnouncement(token, payload);
        setAnnouncements((prev) => [created, ...prev]);
        toast.success('Announcement published globally.');
      }
      cancelEdit();
    } catch (err) {
      toast.error(err.message || 'Failed to save announcement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Global Announcements</h2>
        <p className="text-gray-500 mt-1">Publish updates visible to all students and teachers.</p>
      </div>

      {/* Form */}
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
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="e.g. Exam Schedule Released"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="4"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              placeholder="Detailed announcement text..."
              required
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            {isEditing && (
              <button type="button" onClick={cancelEdit} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isEditing ? 'Update Announcement' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Recent Announcements</h3>
        {isLoading ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-gray-100">
            <Loader2 className="w-6 h-6 animate-spin inline text-gray-400" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-gray-100">
            <p className="text-gray-500 font-medium">No announcements yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {announcements.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 sm:justify-between items-start sm:items-center hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
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
