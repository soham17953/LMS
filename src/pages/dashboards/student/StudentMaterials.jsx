import React, { useEffect, useMemo, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import { AuthService } from '../../../lib/authService';

const StudentMaterials = () => {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const data = await AuthService.getStudentMaterials(token);
      setMaterials(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const allowedSubjects = useMemo(() => {
    const subjects = materials.map(m => m.subjectName || 'General');
    return [...new Set(subjects)];
  }, [materials]);

  useEffect(() => {
    if (subjectFilter && !allowedSubjects.includes(subjectFilter)) {
      setSubjectFilter('');
    }
  }, [allowedSubjects, subjectFilter]);

  const filteredMaterials = useMemo(() => {
    return materials
      .filter((material) => !subjectFilter || (material.subjectName || 'General') === subjectFilter);
  }, [materials, subjectFilter]);

  const handleDownload = (fileUrl) => {
    if (!fileUrl) {
      toast.error('No file available for download');
      return;
    }
    window.open(fileUrl, '_blank');
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
        <h2 className="text-2xl font-extrabold text-gray-900">Study Materials</h2>
        <p className="text-gray-500 mt-1">Access your learning resources.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Filter by Subject</label>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Subjects</option>
            {allowedSubjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-max">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <th className="p-4 pl-6">Title</th>
                <th className="p-4">Description</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Class</th>
                <th className="p-4">Medium</th>
                <th className="p-4 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMaterials.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No data available</td></tr>
              ) : (
                filteredMaterials.map((material) => (
                  <tr key={material.id}>
                    <td className="p-4 pl-6 font-semibold text-gray-900">{material.title}</td>
                    <td className="p-4 text-gray-600">{material.description}</td>
                    <td className="p-4 text-gray-600">{material.subjectName || 'General'}</td>
                    <td className="p-4 text-gray-700 font-semibold">Std {material.class}</td>
                    <td className="p-4 text-gray-600">{material.medium}</td>
                    <td className="p-4 pr-6 text-right">
                      {material.file_url && (
                        <button onClick={() => handleDownload(material.file_url)} className="px-3 py-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 inline-flex items-center gap-1">
                          <Download className="w-4 h-4" /> Download PDF
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-500">No data available</div>
        ) : (
          filteredMaterials.map((material) => (
            <div key={material.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="font-bold text-gray-900">{material.title}</p>
              <p className="text-sm text-gray-600 mt-1">{material.description}</p>
              <p className="text-xs text-gray-500 mt-1">{material.subjectName || 'General'} • {material.medium} • Std {material.class}</p>
              {material.file_url && (
                <button onClick={() => handleDownload(material.file_url)} className="mt-3 w-full px-3 py-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 text-sm">
                  Download PDF
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentMaterials;
