import React, { useEffect, useRef, useState } from 'react';
import { Download, Loader2, Upload, File, CheckCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import { AuthService } from '../../../lib/authService';

const StudentHomework = () => {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [homeworkList, setHomeworkList] = useState([]);
  const [submitting, setSubmitting] = useState({}); // { [hwId]: true }
  const fileRefs = useRef({});

  useEffect(() => {
    fetchHomework();
  }, []);

  const fetchHomework = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const data = await AuthService.getStudentHomework(token);
      console.log('[StudentHomework] Fetched homework:', data);
      setHomeworkList(data);
    } catch (error) {
      console.error('[StudentHomework] Error:', error);
      toast.error(error.message || 'Failed to load homework.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (fileUrl) => {
    if (!fileUrl) {
      toast.error('No file available for download.');
      return;
    }
    window.open(fileUrl, '_blank');
  };

  const handleSubmission = async (homeworkId, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-selected if needed
    event.target.value = '';

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.');
      return;
    }

    setSubmitting((prev) => ({ ...prev, [homeworkId]: true }));
    const toastId = toast.loading('Uploading submission...');
    try {
      const token = await getToken();
      const result = await AuthService.submitHomework(token, homeworkId, file);
      // Update the homework item to reflect submission
      setHomeworkList((prev) =>
        prev.map((hw) =>
          hw.id === homeworkId
            ? { ...hw, isSubmitted: true, submission_url: result.data?.file_url || null }
            : hw
        )
      );
      toast.success('Submission uploaded successfully.', { id: toastId });
    } catch (error) {
      toast.error(error.message || 'Failed to submit homework.', { id: toastId });
    } finally {
      setSubmitting((prev) => ({ ...prev, [homeworkId]: false }));
    }
  };

  const pendingCount = homeworkList.filter((hw) => !hw.isSubmitted).length;
  const submittedCount = homeworkList.filter((hw) => hw.isSubmitted).length;

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
        <p className="text-gray-500 mt-1">Download assignments and upload your PDF submissions.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Assignments</p>
          <p className="text-2xl font-extrabold text-gray-900">{homeworkList.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-red-100 p-4">
          <p className="text-sm text-red-600">Pending</p>
          <p className="text-2xl font-extrabold text-red-600">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-green-100 p-4">
          <p className="text-sm text-green-700">Submitted</p>
          <p className="text-2xl font-extrabold text-green-700">{submittedCount}</p>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-max">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <th className="p-4 pl-6">Title</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Class</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Assignment</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {homeworkList.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No homework assigned yet</td></tr>
              ) : (
                homeworkList.map((hw) => (
                  <tr key={hw.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-gray-900 max-w-[160px] truncate">{hw.title}</td>
                    <td className="p-4 text-gray-600">{hw.subjectName || 'General'}</td>
                    <td className="p-4 text-gray-700 font-semibold">Std {hw.class}</td>
                    <td className="p-4 text-gray-600 text-sm">
                      {hw.due_date ? new Date(hw.due_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-4">
                      {hw.file_url ? (
                        <a
                          href={hw.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                        >
                          <File className="w-4 h-4" /> View PDF <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">No file</span>
                      )}
                    </td>
                    <td className="p-4">
                      {hw.isSubmitted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">
                          <CheckCircle className="w-3.5 h-3.5" /> Submitted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        {hw.file_url && (
                          <button
                            onClick={() => handleDownload(hw.file_url)}
                            className="px-3 py-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 inline-flex items-center gap-1 text-sm hover:bg-blue-100 transition-colors"
                          >
                            <Download className="w-4 h-4" /> Download
                          </button>
                        )}
                        {!hw.isSubmitted && (
                          <>
                            <button
                              onClick={() => fileRefs.current[hw.id]?.click()}
                              disabled={submitting[hw.id]}
                              className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 inline-flex items-center gap-1 text-sm hover:bg-indigo-100 transition-colors disabled:opacity-50"
                            >
                              {submitting[hw.id]
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Upload className="w-4 h-4" />}
                              Submit PDF
                            </button>
                            <input
                              ref={(el) => { fileRefs.current[hw.id] = el; }}
                              type="file"
                              accept=".pdf"
                              className="hidden"
                              onChange={(e) => handleSubmission(hw.id, e)}
                            />
                          </>
                        )}
                        {hw.isSubmitted && hw.submission_url && (
                          <a
                            href={hw.submission_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-lg bg-green-50 text-green-600 border border-green-200 inline-flex items-center gap-1 text-sm hover:bg-green-100 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" /> My Submission
                          </a>
                        )}
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
        {homeworkList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-500">No homework assigned yet</div>
        ) : (
          homeworkList.map((hw) => (
            <div key={hw.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-gray-900">{hw.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{hw.subjectName || 'General'}</p>
                  <p className="text-xs text-gray-500 mt-1">{hw.medium} • Std {hw.class}</p>
                  {hw.due_date && (
                    <p className="text-xs text-gray-500 mt-1">Due: {new Date(hw.due_date).toLocaleDateString()}</p>
                  )}
                </div>
                {hw.isSubmitted ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full flex-shrink-0">
                    <CheckCircle className="w-3 h-3" /> Done
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full flex-shrink-0">Pending</span>
                )}
              </div>

              <div className="flex gap-2 mt-3">
                {hw.file_url && (
                  <button
                    onClick={() => handleDownload(hw.file_url)}
                    className="flex-1 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 text-sm text-center"
                  >
                    Download
                  </button>
                )}
                {!hw.isSubmitted && (
                  <>
                    <button
                      onClick={() => fileRefs.current[hw.id]?.click()}
                      disabled={submitting[hw.id]}
                      className="flex-1 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 text-sm text-center disabled:opacity-50 inline-flex items-center justify-center gap-1"
                    >
                      {submitting[hw.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit PDF'}
                    </button>
                    <input
                      ref={(el) => { fileRefs.current[hw.id] = el; }}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handleSubmission(hw.id, e)}
                    />
                  </>
                )}
                {hw.isSubmitted && hw.submission_url && (
                  <a
                    href={hw.submission_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 rounded-lg bg-green-50 text-green-600 border border-green-200 text-sm text-center"
                  >
                    View Submission
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentHomework;
