import React, { useState, useRef } from 'react';
import { FileText, Edit, Trash2, Plus, Upload, File } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_HOMEWORK = [
  { id: 1, title: 'Algebra Equations', description: 'Solve chapters 4 and 5', file: 'algebra_hw_1.pdf', medium: 'English', class: '10', date: '2026-03-15' },
];

const TeacherHomework = () => {
  const [homeworkList, setHomeworkList] = useState(MOCK_HOMEWORK);
  const [formData, setFormData] = useState({ id: null, title: '', description: '', file: null, medium: 'English', class: '8' });
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to delete this homework assignment?')) {
      setHomeworkList(homeworkList.filter(l => l.id !== id));
      toast.success('Homework entry deleted.');
    }
  };

  const handleEdit = (hw) => {
    setIsEditing(true);
    setFormData(hw);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed!');
        e.target.value = null;
        return;
      }
      setFormData({ ...formData, file: file.name });
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({ id: null, title: '', description: '', file: null, medium: 'English', class: '8' });
    if(fileInputRef.current) fileInputRef.current.value = null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!formData.title || !formData.file || !formData.class) {
       return toast.error('Title, Class, and PDF File are required.');
    }
    
    if (isEditing) {
      setHomeworkList(homeworkList.map(h => h.id === formData.id ? { ...formData, date: h.date } : h));
      toast.success('Homework updated successfully.');
    } else {
      setHomeworkList([{ ...formData, id: Date.now(), date: new Date().toISOString().split('T')[0] }, ...homeworkList]);
      toast.success('Homework assigned successfully.');
    }
    cancelEdit();
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
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" required/>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="2" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"></textarea>
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Upload PDF File</label>
                <div className="relative flex items-center h-12 w-full bg-gray-50 border border-gray-200 border-dashed rounded-xl overflow-hidden hover:bg-gray-100 transition-colors cursor-pointer">
                  <input type="file" ref={fileInputRef} accept=".pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  <div className="flex items-center justify-center w-full gap-2 text-sm font-bold text-gray-600 pointer-events-none">
                     {formData.file ? <span className="text-indigo-600 flex items-center gap-1"><File className="w-4 h-4"/> {formData.file}</span> : <span className="flex items-center gap-1"><Upload className="w-4 h-4"/> Click to browse PDF</span>}
                  </div>
                </div>
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
             <button type="submit" disabled={!formData.class || !formData.file} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50">
               {isEditing ? <Edit className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
               {isEditing ? 'Update Homework' : 'Assign Homework'}
             </button>
           </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
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
              {homeworkList.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No homework assigned yet.</td></tr>
              ) : (
                homeworkList.map(hw => (
                  <tr key={hw.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-bold text-gray-900 max-w-[200px] truncate">{hw.title}</td>
                    <td className="p-4 text-sm font-bold text-gray-800">Std {hw.class}</td>
                    <td className="p-4 text-sm text-gray-600">{hw.medium}</td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-md max-w-[150px] truncate">
                        <File className="w-3 h-3 flex-shrink-0"/> {hw.file}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{hw.date}</td>
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
    </div>
  );
};

export default TeacherHomework;
