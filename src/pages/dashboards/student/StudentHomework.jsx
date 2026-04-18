import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Loader2, Upload, File } from 'lucide-react';
import toast from 'react-hot-toast';

const STUDENT_PROFILE = { medium: 'English', class: '9' };

const ALL_HOMEWORK = [
  { id: 1, title: 'Algebra Equations', description: 'Solve chapter 4 exercises.', class: '9', medium: 'English', file: 'algebra_hw.pdf' },
  { id: 2, title: 'Marathi Essay', description: 'Write essay on environment.', class: '9', medium: 'Marathi', file: 'essay_hw.pdf' },
];

const StudentHomework = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [submissions, setSubmissions] = useState({});
  const fileRefs = useRef({});

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  const homeworkList = useMemo(
    () => ALL_HOMEWORK.filter((item) => item.medium === STUDENT_PROFILE.medium && item.class === STUDENT_PROFILE.class),
    []
  );

  const handleDownload = (file) => {
    toast.success(`Downloading ${file}`);
  };

  const handleSubmission = (homeworkId, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.');
      event.target.value = '';
      return;
    }
    setSubmissions((prev) => ({ ...prev, [homeworkId]: file.name }));
    toast.success('Submission uploaded successfully.');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900">Homework</h2>
        <p className="text-gray-500 mt-1">Download homework and upload your submission.</p>
      </div>

      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-max">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <th className="p-4 pl-6">Title</th>
                <th className="p-4">Description</th>
                <th className="p-4">Class</th>
                <th className="p-4">Medium</th>
                <th className="p-4">File (PDF)</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {homeworkList.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No data available</td></tr>
              ) : (
                homeworkList.map((hw) => (
                  <tr key={hw.id}>
                    <td className="p-4 pl-6 font-semibold text-gray-900">{hw.title}</td>
                    <td className="p-4 text-gray-600">{hw.description}</td>
                    <td className="p-4 text-gray-700 font-semibold">Std {hw.class}</td>
                    <td className="p-4 text-gray-600">{hw.medium}</td>
                    <td className="p-4 text-gray-600">{hw.file}</td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleDownload(hw.file)} className="px-3 py-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 inline-flex items-center gap-1">
                          <Download className="w-4 h-4" /> Download
                        </button>
                        <button onClick={() => fileRefs.current[hw.id]?.click()} className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 inline-flex items-center gap-1">
                          <Upload className="w-4 h-4" /> Submit PDF
                        </button>
                        <input
                          ref={(el) => { fileRefs.current[hw.id] = el; }}
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => handleSubmission(hw.id, e)}
                        />
                      </div>
                      {submissions[hw.id] && <p className="text-xs text-green-600 mt-1 text-right">Submitted: {submissions[hw.id]}</p>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {homeworkList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-500">No data available</div>
        ) : (
          homeworkList.map((hw) => (
            <div key={hw.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="font-bold text-gray-900">{hw.title}</p>
              <p className="text-sm text-gray-600 mt-1">{hw.description}</p>
              <p className="text-xs text-gray-500 mt-1">{hw.medium} • Std {hw.class}</p>
              <p className="text-sm text-gray-700 mt-2 flex items-center gap-1"><File className="w-4 h-4" />{hw.file}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleDownload(hw.file)} className="flex-1 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 text-sm">Download</button>
                <button onClick={() => fileRefs.current[hw.id]?.click()} className="flex-1 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 text-sm">Submit PDF</button>
              </div>
              <input
                ref={(el) => { fileRefs.current[hw.id] = el; }}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleSubmission(hw.id, e)}
              />
              {submissions[hw.id] && <p className="text-xs text-green-600 mt-2">Submitted: {submissions[hw.id]}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentHomework;
