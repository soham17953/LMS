import React, { useEffect, useMemo, useState } from 'react';
import { Download, Loader2, ExternalLink, File } from 'lucide-react';
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
    } catch {
      toast.error('Failed to load study materials.');
    } finally {
      setIsLoading(false);
    }
  };

  const allowedSubjects = useMemo(() => {
    const subjects = materials.map((m) => m.subjectName || 'General');
    return [...new Set(subjects)];
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    return materials.filter(
      (m) => !subjectFilter || (m.subjectName || 'General') === subjectFilter
    );
  }, [materials, subjectFilter]);

  const handleDownload = (fileUrl) => {
    if (!fileUrl) {
      toast.error('No file available for download.');
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
        <p className="text-gray-500 mt-1">Access and download your learning resources.</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 max-w-xs">
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

      {/* Desktop Table */}
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
                <th className="p-4">Uploaded</th>
                <th className="p-4 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMaterials.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No materials available</td></tr>
              ) : (
                filteredMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-gray-900 max-w-[180px] truncate">{material.title}</td>
                    <td className="p-4 text-gray-500 text-sm max-w-[200px] truncate">{material.description || '—'}</td>
                    <td className="p-4 text-gray-600">{material.subjectName || 'General'}</td>
                    <td className="p-4 text-gray-700 font-semibold">Std {material.class}</td>
                    <td className="p-4 text-gray-600">{material.medium}</td>
                    <td className="p-4 text-gray-500 text-sm">
                      {material.created_at ? new Date(material.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {material.file_url ? (
                        <button
                          onClick={() => handleDownload(material.file_url)}
                          className="px-3 py-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 inline-flex items-center gap-1 text-sm hover:bg-blue-100 transition-colors"
                        >
                          <Download className="w-4 h-4" /> Download PDF
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">No file</span>
                      )}
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
        {filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-500">No materials available</div>
        ) : (
          filteredMaterials.map((material) => (
            <div key={material.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="font-bold text-gray-900">{material.title}</p>
              {material.description && <p className="text-sm text-gray-600 mt-1">{material.description}</p>}
              <p className="text-xs text-gray-500 mt-1">
                {material.subjectName || 'General'} • {material.medium} • Std {material.class}
              </p>
              {material.created_at && (
                <p className="text-xs text-gray-400 mt-1">{new Date(material.created_at).toLocaleDateString()}</p>
              )}
              {material.file_url ? (
                <button
                  onClick={() => handleDownload(material.file_url)}
                  className="mt-3 w-full px-3 py-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 text-sm inline-flex items-center justify-center gap-1"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              ) : (
                <p className="mt-2 text-xs text-gray-400 flex items-center gap-1"><File className="w-3 h-3" /> No file attached</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentMaterials;
