import React, { useMemo, useState, useRef } from 'react';
import { BookMarked, Edit, Trash2, Plus, Upload, File, Loader2, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_MATERIALS = [
  { id: 1, title: 'Geometry Chapter 3 Notes', description: 'Important circle theorems', file: 'geometry_ch3.pdf', medium: 'English', class: '9', date: '2026-03-10' },
];

const TeacherMaterials = () => {
  const [materialsList, setMaterialsList] = useState(MOCK_MATERIALS);
  const [formData, setFormData] = useState({ id: null, title: '', description: '', file: null, medium: 'English', class: '8' });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const classOptions = useMemo(
    () => (formData.medium === 'English' ? [8, 9, 10] : [3, 4, 5, 6, 7, 8, 9, 10]),
    [formData.medium]
  );

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to delete this study material?')) {
      setMaterialsList(materialsList.filter(l => l.id !== id));
      toast.success('Study material deleted.');
    }
  };

  const handleEdit = (mat) => {
    setIsEditing(true);
    setFormData(mat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed!');
        setErrors({ ...errors, file: 'Only PDF files are allowed.' });
        e.target.value = null;
        return;
      }
      setErrors({ ...errors, file: '' });
      setFormData({ ...formData, file: file.name });
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    setFormData({ id: null, title: '', description: '', file: null, medium: 'English', class: '8' });
    if(fileInputRef.current) fileInputRef.current.value = null;
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.title.trim()) nextErrors.title = 'Title is required.';
    if (!formData.description.trim()) nextErrors.description = 'Description is required.';
    if (!formData.file) nextErrors.file = 'PDF file is required.';
    if (!formData.class) nextErrors.class = 'Class is required.';
    if (formData.medium === 'English' && ![8, 9, 10].includes(Number(formData.class))) {
      nextErrors.class = 'English medium supports classes 8, 9, and 10 only.';
    }
    if (formData.medium === 'Marathi' && !(Number(formData.class) >= 3 && Number(formData.class) <= 10)) {
      nextErrors.class = 'Marathi medium supports classes 3 to 10 only.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      return toast.error('Please fix highlighted fields.');
    }

    const isDuplicate = materialsList.some(
      (material) =>
        material.id !== formData.id &&
        material.title.trim().toLowerCase() === formData.title.trim().toLowerCase() &&
        material.class === formData.class &&
        material.medium === formData.medium &&
        material.file === formData.file
    );
    if (isDuplicate) {
      return toast.error('Duplicate material record detected.');
    }

    setIsSubmitting(true);
    setTimeout(() => {
      if (isEditing) {
        setMaterialsList(materialsList.map(h => h.id === formData.id ? { ...formData, title: formData.title.trim(), description: formData.description.trim(), date: h.date } : h));
        toast.success('Study material updated successfully.');
      } else {
        setMaterialsList([{ ...formData, id: Date.now(), title: formData.title.trim(), description: formData.description.trim(), date: new Date().toISOString().split('T')[0] }, ...materialsList]);
        toast.success('Study material uploaded successfully.');
      }
      setIsSubmitting(false);
      cancelEdit();
    }, 500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Study Materials</h2>
        <p className="text-gray-500 mt-1">Upload and share learning resources for students.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-indigo-500" />
          {isEditing ? 'Edit Material' : 'Upload New Material'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-5">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Material Title</label>
                <input type="text" value={formData.title} onChange={e => { setFormData({...formData, title: e.target.value}); setErrors({ ...errors, title: '' }); }} className={`w-full px-4 py-2 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 outline-none ${errors.title ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`} required/>
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
                <textarea value={formData.description} onChange={e => { setFormData({...formData, description: e.target.value}); setErrors({ ...errors, description: '' }); }} rows="2" className={`w-full px-4 py-2 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 outline-none resize-none ${errors.description ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`}></textarea>
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Upload PDF File</label>
                <div className="relative flex items-center h-12 w-full bg-gray-50 border border-gray-200 border-dashed rounded-xl overflow-hidden hover:bg-gray-100 transition-colors cursor-pointer">
                  <input type="file" ref={fileInputRef} accept=".pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  <div className="flex items-center justify-center w-full gap-2 text-sm font-bold text-gray-600 pointer-events-none">
                  {formData.file ? <span className="text-indigo-600 flex items-center gap-1"><File className="w-4 h-4"/> {formData.file}</span> : <span className="flex items-center gap-1"><Upload className="w-4 h-4"/> Click to browse PDF</span>}
                  </div>
                </div>
                {errors.file && <p className="text-xs text-red-500 mt-1">{errors.file}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Medium</label>
                <select value={formData.medium} onChange={e => { setFormData({...formData, medium: e.target.value, class: ''}); setErrors({ ...errors, class: '' }); }} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="English">English</option>
                  <option value="Marathi">Marathi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Class</label>
                <select value={formData.class} onChange={e => { setFormData({...formData, class: e.target.value}); setErrors({ ...errors, class: '' }); }} className={`w-full px-4 py-2 bg-gray-50 border rounded-xl focus:bg-white focus:ring-2 outline-none disabled:bg-gray-100 ${errors.class ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-500'}`} required disabled={!formData.medium}>
                  <option value="" disabled>Select Class</option>
                  {classOptions.map(s => <option key={s} value={s}>Std {s}</option>)}
                </select>
                {errors.class && <p className="text-xs text-red-500 mt-1">{errors.class}</p>}
              </div>
           </div>

           <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 mt-6">
             {isEditing && (
               <button type="button" onClick={cancelEdit} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
             )}
             <button type="submit" disabled={!formData.class || !formData.file || isSubmitting} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
               {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? <Edit className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
               {isEditing ? 'Update Material' : 'Upload Material'}
             </button>
           </div>
        </form>
      </div>

      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4 pl-6">Title</th>
                <th className="p-4">Class</th>
                <th className="p-4">Medium</th>
                <th className="p-4">File</th>
                <th className="p-4">Date</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {materialsList.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No data available</td></tr>
              ) : (
                materialsList.map(mat => (
                  <tr key={mat.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-bold text-gray-900 max-w-[200px] truncate">{mat.title}</td>
                    <td className="p-4 text-sm font-bold text-gray-800">Std {mat.class}</td>
                    <td className="p-4 text-sm text-gray-600">{mat.medium}</td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-md max-w-[150px] truncate">
                        <File className="w-3 h-3 flex-shrink-0"/> {mat.file}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{mat.date}</td>
                    <td className="p-4 pr-6 flex justify-end gap-2">
                      <button onClick={() => handleEdit(mat)} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200" title="Edit">
                         <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(mat.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200" title="Delete">
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

      <div className="md:hidden space-y-3">
        {materialsList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-500">No data available</div>
        ) : (
          materialsList.map((material) => (
            <div key={material.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900">{material.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{material.medium} • Std {material.class}</p>
                </div>
                <details className="relative">
                  <summary className="list-none cursor-pointer p-2 rounded-lg hover:bg-gray-100"><MoreVertical className="w-4 h-4 text-gray-600" /></summary>
                  <div className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button onClick={() => handleEdit(material)} className="w-full text-left px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50">Edit</button>
                    <button onClick={() => handleDelete(material.id)} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button>
                  </div>
                </details>
              </div>
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-1"><File className="w-4 h-4" /> {material.file}</p>
              <p className="text-xs text-gray-500 mt-1">{material.date}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherMaterials;
