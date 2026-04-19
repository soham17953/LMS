import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { AuthService } from '../../../lib/authService';

const StudentNotices = () => {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const data = await AuthService.getStudentNotices(token);
      setNotices(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900">Notices</h2>
        <p className="text-gray-500 mt-1">View important updates for your class.</p>
      </div>

      <div className="space-y-3">
        {notices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-500">No notices available</div>
        ) : (
          notices.map((notice) => (
            <div key={notice.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="font-bold text-gray-900">{notice.title}</p>
              <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
              <p className="text-xs text-gray-500 mt-2">Date: {new Date(notice.created_at).toLocaleDateString()}</p>
              <p className="text-xs text-gray-500 mt-1">{notice.medium} • Std {notice.class}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentNotices;
