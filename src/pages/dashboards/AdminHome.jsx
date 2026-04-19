import React, { useEffect, useState } from 'react';
import { Users, UserCheck, AlertCircle, Megaphone, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthService } from '../../lib/authService';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';

const AdminHome = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  const fetchUsers = async () => {
    try {
      const token = await getToken();
      const data = await AuthService.getAllUsers(token);
      setUsers(data);
    } catch (e) {
      toast.error('Failed to parse active user list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [getToken]);

  const handleStatusUpdate = async (userId, newStatus) => {
    const loadingToast = toast.loading(`Marking user as ${newStatus}...`);
    try {
      const token = await getToken();
      await AuthService.updateUserStatus(token, userId, newStatus);
      toast.success(`User successfully ${newStatus}`, { id: loadingToast });
      fetchUsers(); // Refresh
    } catch (error) {
      toast.error('Operation failed.', { id: loadingToast });
    }
  };

  const pendingRequests = users.filter(u => u.status === 'PENDING' && u.role !== 'ADMIN');
  const studentCount = users.filter(u => u.role === 'STUDENT').length;
  const teacherCount = users.filter(u => u.role === 'TEACHER').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Admin Overview</h2>
        <p className="text-gray-500 mt-1">Here is the summary of your institution's status.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Students</p>
            <h3 className="text-3xl font-extrabold text-gray-900">{studentCount}</h3>
          </div>
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <Users className="w-7 h-7" />
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Teachers</p>
            <h3 className="text-3xl font-extrabold text-gray-900">{teacherCount}</h3>
          </div>
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <UserCheck className="w-7 h-7" />
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Pending Requests</p>
            <h3 className="text-3xl font-extrabold text-gray-900">{pendingRequests.length}</h3>
          </div>
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <AlertCircle className="w-7 h-7" />
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Announcements</p>
            <h3 className="text-3xl font-extrabold text-gray-900">8</h3>
          </div>
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Megaphone className="w-7 h-7" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900">Pending Approvals</h3>
          </div>
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
                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading records...</td></tr>
                  ) : pendingRequests.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-500">No pending approvals remaining.</td></tr>
                  ) : (
                    pendingRequests.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 pl-6">
                          <p className="font-bold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </td>
                        <td className="p-4 text-gray-600 font-medium">
                          <span className={`px-2 py-1 rounded text-xs ${user.role === 'TEACHER' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">
                          {user.role === 'STUDENT' ? user.standards[0] || '-' : (user.standards || []).join(', ') || '-'}
                        </td>
                        <td className="p-4 text-gray-600">{user.medium || '-'}</td>
                        <td className="p-4 pr-6 flex justify-end gap-2">
                          <button onClick={() => handleStatusUpdate(user.id, 'APPROVED')} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-green-200" title="Approve">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleStatusUpdate(user.id, 'REJECTED')} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200" title="Reject">
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

        <div className="space-y-4">
           <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900">Recent Announcements</h3>
           </div>
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-2">
               <div className="p-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer border-b border-gray-50 last:border-0">
                 <div className="flex gap-3">
                   <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                     <Megaphone className="w-5 h-5" />
                   </div>
                   <div>
                     <h4 className="font-bold text-gray-900 text-sm">Tomorrow Class Cancelled</h4>
                     <p className="text-xs text-gray-500 mt-1 line-clamp-1">Due to ongoing local elections, tomorrow's morning batch...</p>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AdminHome;
