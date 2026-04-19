import React, { useEffect, useState } from 'react';
import { Loader2, Bell, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';
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
    } catch {
      toast.error('Failed to load notices.');
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

  // Separate global announcements from class notices
  const announcements = notices.filter((n) => n.class === 'ALL');
  const classNotices = notices.filter((n) => n.class !== 'ALL');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900">Notices</h2>
        <p className="text-gray-500 mt-1">View important updates for your class.</p>
      </div>

      {/* Global Announcements */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-gray-700 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-blue-500" /> Global Announcements
          </h3>
          {announcements.map((notice) => (
            <div key={notice.id} className="bg-blue-50 rounded-2xl border border-blue-100 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{notice.title}</p>
                  <p className="text-sm text-gray-700 mt-1">{notice.content}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(notice.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Class Notices */}
      <div className="space-y-3">
        {announcements.length > 0 && (
          <h3 className="text-base font-bold text-gray-700 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-500" /> Class Notices
          </h3>
        )}
        {classNotices.length === 0 && announcements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-500">
            No notices available
          </div>
        ) : classNotices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-500">
            No class notices
          </div>
        ) : (
          classNotices.map((notice) => (
            <div key={notice.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="font-bold text-gray-900">{notice.title}</p>
              <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
              <p className="text-xs text-gray-500 mt-2">
                {notice.medium} • Std {notice.class} • {new Date(notice.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentNotices;
