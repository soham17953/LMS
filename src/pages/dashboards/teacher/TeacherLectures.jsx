import React, { useMemo, useState, useEffect } from 'react';
import { BookOpen, Edit, Trash2, Plus, Calendar, Loader2, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import { AuthService } from '../../../lib/authService';

const SUBJECTS = ['Maths', 'Science', 'English', 'Marathi', 'Social Studies', 'Hindi', 'Sanskrit'];

const emptyForm = { id: null, title: '', description: '', subject: 'Maths', date: '', time: '', medium: 'English', class: '8' };

const TeacherLectures = () => {
  const { getToken } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const classOptions = useMemo(
    () => (formData.medium === 'English' ? [8, 9, 10] : [3, 4, 5, 6, 7, 8, 9, 10]),
    [formData.medium]
  );

  useEffect(() => { fetchLectures(); }, []);

  const fetchLectures = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const data = await AuthService.getTeacherLectures(token);
      setLectures(data);
    } catch (error) {
      toast.error('Failed to fetch lectures');
    } finally {
      setIsLoading(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required.';
    if (!formData.date) errs.date = 'Date is required.';
    if (!formData.time) errs.time = 'Time is required.';
    if (!formData.class) errs.class = 'Class is required.';
    if (formData.medium === 'English' && ![8, 9, 10].includes(Number(formData.class)))
      errs.class = 'English medium supports classes 8, 9, and 10 only.';
    if (formData.medium === 'Marathi' && !(Number(formData.class) >= 3 && Number(formData.class) <= 10))
      errs.class = 'Marathi medium supports classes 3 to 10 only.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    setFormData(emptyForm);
  };

  const handleEdit = (lecture) => {
    // Parse scheduled_at back into date + time fields (stored as UTC with Z suffix)
    const dt = lecture.scheduled_at ? new Date(lecture.scheduled_at) : new Date();
    // Use UTC values to match what was originally entered
    const date = dt.toISOString().split('T')[0];
    const time = dt.toISOString().split('T')[1].slice(0, 5);
    setFormData({
      id: lecture.id,
      title: lecture.title,
      description: lecture.description || '',
      subject: lecture.subjectName || 'Maths',
      date,
      time,
      medium: lecture.medium,
      class: lecture.class,
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lecture?')) return;
    try {
      const token = await getToken();
      await AuthService.deleteTeacherLecture(token, id);
      setLectures((prev) => prev.filter((l) => l.id !== id));
      toast.success('Lecture deleted.');
    } catch {
      toast.error('Failed to delete lecture.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return toast.error('Please fix highlighted fields.');
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        subjectName: formData.subject,
        date: formData.date,
        time: formData.time,
        medium: formData.medium,
        class: formData.class,
      };

      if (isEditing) {
        const updated = await AuthService.updateTeacherLecture(token, formData.id, payload);
        setLectures((prev) => prev.map((l) => (l.id === formData.id ? updated : l)));
        toast.success('Lecture updated successfully.');
      } else {
        const created = await AuthService.createTeacherLecture(token, payload);
        setLectures((prev) => [created, ...prev]);
        toast.success('Lecture scheduled successfully.');
      }
      cancelEdit();
    } catch (err) {
      toast.error(err.message || 'Failed to save lecture.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (isoStr) => {
    if (!isoStr) return '—';
    return new Date(isoStr).toLocaleString([], {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Schedule Lectures</h2>
        <p className="text-gray-500 mt-1">Create and manage your upcoming teaching sessions.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          {isEditing ? 'Edit Lecture' : 'Schedule New Lecture'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Lecture Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => { setFormData({ ...formData, title: e.target.value }); setErrors({ ...errors, title: '' }); }}
                className={`w-full px-4 py-2 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 outline-none ${errors.title ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}
                required
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="2"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date & Time</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => { setFormData({ ...formData, date: e.target.value }); setErrors({ ...errors, date: '' }); }}
                  className={`w-1/2 px-2 py-2 text-sm bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 outline-none ${errors.date ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}
                  required
                />
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => { setFormData({ ...formData, time: e.target.value }); setErrors({ ...errors, time: '' }); }}
                  className={`w-1/2 px-2 py-2 text-sm bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 outline-none ${errors.time ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}
                  required
                />
              </div>
              {(errors.date || errors.time) && <p className="text-xs text-red-500 mt-1">{errors.date || errors.time}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Medium</label>
              <select
                value={formData.medium}
                onChange={(e) => { setFormData({ ...formData, medium: e.target.value, class: '' }); setErrors({ ...errors, class: '' }); }}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="English">English</option>
                <option value="Marathi">Marathi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Class</label>
              <select
                value={formData.class}
                onChange={(e) => { setFormData({ ...formData, class: e.target.value }); setErrors({ ...errors, class: '' }); }}
                className={`w-full px-4 py-2 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 outline-none disabled:bg-gray-100 ${errors.class ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}
                required
                disabled={!formData.medium}
              >
                <option value="" disabled>Select Class</option>
                {classOptions.map((s) => <option key={s} value={s}>Std {s}</option>)}
              </select>
              {errors.class && <p className="text-xs text-red-500 mt-1">{errors.class}</p>}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 mt-6">
            {isEditing && (
              <button type="button" onClick={cancelEdit} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!formData.class || isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isEditing ? 'Update Lecture' : 'Schedule Lecture'}
            </button>
          </div>
        </form>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4 pl-6">Title</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Scheduled</th>
                <th className="p-4">Medium</th>
                <th className="p-4">Class</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin inline" /></td></tr>
              ) : lectures.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No lectures scheduled yet</td></tr>
              ) : (
                lectures.map((lecture) => (
                  <tr key={lecture.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-bold text-gray-900 max-w-[200px] truncate">{lecture.title}</td>
                    <td className="p-4"><span className="px-2.5 py-1 bg-gray-100 rounded-md text-gray-700 text-sm font-medium">{lecture.subjectName}</span></td>
                    <td className="p-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-gray-400" /> {formatDateTime(lecture.scheduled_at || lecture.created_at)}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{lecture.medium}</td>
                    <td className="p-4 text-sm font-bold text-gray-800">Std {lecture.class}</td>
                    <td className="p-4 pr-6">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(lecture)} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200" title="Edit">
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center"><Loader2 className="w-5 h-5 animate-spin inline text-gray-400" /></div>
        ) : lectures.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-500">No lectures scheduled yet</div>
        ) : (
          lectures.map((lecture) => (
            <div key={lecture.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900">{lecture.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{lecture.subjectName}</p>
                </div>
                <details className="relative">
                  <summary className="list-none cursor-pointer p-2 rounded-lg hover:bg-gray-100"><MoreVertical className="w-4 h-4 text-gray-600" /></summary>
                  <div className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button onClick={() => handleEdit(lecture)} className="w-full text-left px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50">Edit</button>
                    <button onClick={() => handleDelete(lecture.id)} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button>
                  </div>
                </details>
              </div>
              <p className="text-sm text-gray-600 mt-2">{formatDateTime(lecture.scheduled_at || lecture.created_at)}</p>
              <p className="text-sm text-gray-600 mt-1">{lecture.medium} • Std {lecture.class}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherLectures;
