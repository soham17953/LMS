import React, { useEffect, useState } from 'react';
import { Users, UserCheck, AlertCircle, Megaphone, Check, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthService } from '../../lib/authService';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';

const AdminHome = () => {
  const [users, setUsers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({ studentCount: 0, teacherCount: 0, pendingCount: 0, announcementCount: 0 });
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const [userData, dashStats, announcementData] = await Promise.all([
        AuthService.getAllUsers(token),
        AuthService.getAdminDashboard(token),
        AuthService.getAdminAnnouncements(token),
      ]);
      setUsers(userData);
      setStats(dashStats);
      setAnnouncements(announcementData.slice(0, 3));
    } catch (e) {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusUpdate = async (userId, newStatus) => {
    const loadingToast = toast.loading(`Marking user as ${newStatus}...`);
    try {
      const token = await getToken();
      await AuthService.updateUserStatus(token, userId, newStatus);
      toast.success(`User ${newStatus.toLowerCase()} successfully`, { id: loadingToast });
      fetchData();
    } catch {
      toast.error('Operation failed.', { id: loadingToast });
    }
  };

  const pendingRequests = users.filter((u) => u.status === 'PENDING' && u.role !== 'ADMIN');

  const statCards = [
    { label: 'Students', value: stats.studentCount, icon: <Users className="w-7 h-7" />, bg: 'bg-indigo-50', color: 'text-indigo-600' },
    { label: 'Teachers', value: stats.teacherCount, icon: <UserCheck className="w-7 h-7" />, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { label: 'Pending Requests', value: stats.pendingCount, icon: <AlertCircle className="w-7 h-7" />, bg: 'bg-amber-50', color: 'text-amber-600' },
    { label: 'Announcements', value: stats.announcementCount, icon: <Megaphone className="w-7 h-7" />, bg: 'bg-blue-50', color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Admin Overview</h2>
        <p className="text-gray-500 mt-1">Summary of your institution's current status.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <motion.div key={card.label} whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">{card.label}</p>
              <h3 className="text-3xl font-extrabold text-gray-900">
                {loading ? <Loader2 className="w-6 h-6 animate-spin text-gray-300" /> : card.value}
              </h3>
            </div>
            <div className={`w-14 h-14 ${card.bg} rounded-2xl flex items-center justify-center ${card.color}`}>
              {card.icon}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Approvals */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Pending Approvals</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    <th className="p-4 pl-6">Name & Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Class</th>
                    <th className="p-4">Medium</th>
                    <th className="p-4 text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-400"><Loader2 className="w-5 h-5 animate-spin inline" /></td></tr>
                  ) : pendingRequests.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">No pending approvals.</td></tr>
                  ) : (
                    pendingRequests.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 pl-6">
                          <p className="font-bold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === 'TEACHER' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {Array.isArray(user.standards) && user.standards.length > 0 ? user.standards.join(', ') : '—'}
                        </td>
                        <td className="p-4 text-sm text-gray-600">{user.medium || '—'}</td>
                        <td className="p-4 pr-6 flex justify-end gap-2">
                          <button onClick={() => handleStatusUpdate(user.id, 'APPROVED')} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg border border-green-200" title="Approve">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleStatusUpdate(user.id, 'REJECTED')} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg border border-red-200" title="Reject">
                            <X className="w-4 h-4" />
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

        {/* Recent Announcements */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Recent Announcements</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-6 text-center"><Loader2 className="w-5 h-5 animate-spin inline text-gray-400" /></div>
            ) : announcements.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">No announcements yet.</div>
            ) : (
              <div className="p-2">
                {announcements.map((a) => (
                  <div key={a.id} className="p-4 hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-50 last:border-0">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <Megaphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{a.title}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
