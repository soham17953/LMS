import React, { useMemo, useState, useEffect, useRef } from 'react';
import { FileText, Edit, Trash2, Plus, Upload, File, Loader2, MoreVertical, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import { AuthService } from '../../../lib/authService';

const SUBJECTS = ['Maths', 'Science', 'English', 'Marathi', 'Social Studies', 'Hindi', 'Sanskrit'];

const emptyForm = { id: null, title: '', description: '', medium: 'English', class: '8', subject: 'Maths', due_date: '' };

const TeacherHomework = () => {
  const { getToken } = useAuth();
  const [homeworkList, setHomeworkList] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState(null); // actual File object
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);

  const classOptions = useMemo(
    () => (formData.medium === 'English' ? [8, 9, 10] : [3, 4, 5, 6, 7, 8, 9, 10]),
    [formData.medium]
  );

  useEffect(() => { fetchHomework(); }, []);

  const fetchHomework = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const data = await AuthService.getTeacherHomework(token);
      setHomeworkList(data);
    } catch {
      toast.error('Failed to fetch homework');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed!');
      setErrors({ ...errors, file: 'Only PDF files are allowed.' });
      e.target.value = null;
      return;
    }
    setErrors({ ...errors, file: '' });
    setSelectedFile(file);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    setFormData(emptyForm);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleEdit = (hw) => {
    setFormData({
      id: hw.id,
      title: hw.title,
      description: hw.description || '',
      medium: hw.medium,
      class: hw.class,
      subject: hw.subjectName || 'Maths',
      due_date: hw.due_date ? hw.due_date.split('T')[0] : '',
    });
    setSelectedFile(null);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this homework assignment?')) return;
    try {
      const token = await getToken();
      await AuthService.deleteTeacherHomework(token, id);
      setHomeworkList((prev) => prev.filter((h) => h.id !== id));
      toast.success('Homework deleted.');
    } catch {
      toast.error('Failed to delete homework.');
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required.';
    if (!formData.due_date) errs.due_date = 'Due date is required.';
    if (!formData.class) errs.class = 'Class is required.';
    if (!isEditing && !selectedFile) errs.file = 'PDF file is required.';
    if (formData.medium === 'English' && ![8, 9, 10].includes(Number(formData.class)))
      errs.class = 'English medium supports classes 8, 9, and 10 only.';
    if (formData.medium === 'Marathi' && !(Number(formData.class) >= 3 && Number(formData.class) <= 10))
      errs.class = 'Marathi medium supports classes 3 to 10 only.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return toast.error('Please fix highlighted fields.');
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append('title', formData.title.trim());
      fd.append('description', formData.description.trim());
      fd.append('medium', formData.medium);
      fd.append('class', formData.class);
      fd.append('subjectName', formData.subject);
      fd.append('due_date', formData.due_date);
      if (selectedFile) fd.append('hw_pdf', selectedFile);

      if (isEditing) {
        const updated = await AuthService.updateTeacherHomework(token, formData.id, fd);
        setHomeworkList((prev) => prev.map((h) => (h.id === formData.id ? updated : h)));
        toast.success('Homework updated successfully.');
      } else {
        const created = await AuthService.createTeacherHomework(token, fd);
        setHomeworkList((prev) => [created, ...prev]);
        toast.success('Homework assigned successfully.');
      }
      cancelEdit();
    } catch (err) {
      toast.error(err.message || 'Failed to save homework.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Homework Assignments</h2>
        <p className="text-gray-500 mt-1">Upload and distribute PDF homework to specific classes.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          {isEditing ? 'Edit Homework' : 'Assign New Homework'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Homework Title</label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="2"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Upload PDF File {isEditing && <span className="text-gray-400 font-normal">(leave empty to keep existing)</span>}
              </label>
              <div className={`relative flex items-center h-12 w-full bg-gray-50 border border-dashed rounded-xl overflow-hidden hover:bg-gray-100 transition-colors cursor-pointer ${errors.file ? 'border-red-400' : 'border-gray-200'}`}>
                <input type="file" ref={fileInputRef} accept=".pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                <div className="flex items-center justify-center w-full gap-2 text-sm font-bold text-gray-600 pointer-events-none">
                  {selectedFile
                    ? <span className="text-indigo-600 flex items-center gap-1"><File className="w-4 h-4" /> {selectedFile.name}</span>
                    : <span className="flex items-center gap-1"><Upload className="w-4 h-4" /> Click to browse PDF</span>}
                </div>
              </div>
              {errors.file && <p className="text-xs text-red-500 mt-1">{errors.file}</p>}
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
              <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => { setFormData({ ...formData, due_date: e.target.value }); setErrors({ ...errors, due_date: '' }); }}
                className={`w-full px-4 py-2 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 outline-none ${errors.due_date ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}
                required
              />
              {errors.due_date && <p className="text-xs text-red-500 mt-1">{errors.due_date}</p>}
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
              {isEditing ? 'Update Homework' : 'Assign Homework'}
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
                <th className="p-4">Class</th>
                <th className="p-4">Medium</th>
                <th className="p-4">File</th>
                <th className="p-4">Due Date</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin inline" /></td></tr>
              ) : homeworkList.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No homework assigned yet</td></tr>
              ) : (
                homeworkList.map((hw) => (
                  <tr key={hw.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-bold text-gray-900 max-w-[180px] truncate">{hw.title}</td>
                    <td className="p-4 text-sm text-gray-600">{hw.subjectName}</td>
                    <td className="p-4 text-sm font-bold text-gray-800">Std {hw.class}</td>
                    <td className="p-4 text-sm text-gray-600">{hw.medium}</td>
                    <td className="p-4">
                      {hw.file_url ? (
                        <a href={hw.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-md hover:bg-red-100 transition-colors">
                          <File className="w-3 h-3 flex-shrink-0" /> View PDF <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">No file</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-500">{hw.due_date ? new Date(hw.due_date).toLocaleDateString() : '—'}</td>
                    <td className="p-4 pr-6 flex justify-end gap-2">
                      <button onClick={() => handleEdit(hw)} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(hw.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200" title="Delete">
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center"><Loader2 className="w-5 h-5 animate-spin inline text-gray-400" /></div>
        ) : homeworkList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-500">No homework assigned yet</div>
        ) : (
          homeworkList.map((hw) => (
            <div key={hw.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900">{hw.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{hw.subjectName} • {hw.medium} • Std {hw.class}</p>
                </div>
                <details className="relative">
                  <summary className="list-none cursor-pointer p-2 rounded-lg hover:bg-gray-100"><MoreVertical className="w-4 h-4 text-gray-600" /></summary>
                  <div className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button onClick={() => handleEdit(hw)} className="w-full text-left px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50">Edit</button>
                    <button onClick={() => handleDelete(hw.id)} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button>
                  </div>
                </details>
              </div>
              {hw.file_url && (
                <a href={hw.file_url} target="_blank" rel="noopener noreferrer" className="mt-2 text-sm text-red-600 flex items-center gap-1 hover:underline">
                  <File className="w-4 h-4" /> View PDF
                </a>
              )}
              <p className="text-xs text-gray-500 mt-1">Due: {hw.due_date ? new Date(hw.due_date).toLocaleDateString() : '—'}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherHomework;
