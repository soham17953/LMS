import React, { useState, useEffect } from 'react';
import { Check, X, Search, Filter } from 'lucide-react';
import { AuthService } from '../../../lib/authService';
import toast from 'react-hot-toast';

const AdminRequests = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING'); // PENDING | APPROVED | REJECTED
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const data = await AuthService.getAllUsers();
      setUsers(data);
    } catch (e) {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusUpdate = async (userId, newStatus) => {
    const loadingToast = toast.loading(`Marking user as ${newStatus}...`);
    try {
      await AuthService.updateUserStatus(userId, newStatus);
      toast.success(`User successfully ${newStatus}`, { id: loadingToast });
      fetchUsers();
    } catch (error) {
      toast.error('Operation failed.', { id: loadingToast });
    }
  };

  const filteredUsers = users.filter(u => {
    if (u.role === 'ADMIN') return false;
    if (filter !== 'ALL' && u.status !== filter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Access Requests</h2>
          <p className="text-gray-500 mt-1">Manage student and teacher onboarding approvals.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filter === f ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4 pl-6 lg:w-1/3">Name & Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Medium</th>
                <th className="p-4">Class</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500 font-medium">Loading requests...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500 font-medium">No users found for this filter.</td></tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </td>
                    <td className="p-4 font-medium">
                      <span className={`px-2 py-1 rounded text-xs ${user.role === 'Teacher' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{user.medium || '-'}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {user.role === 'Student' ? user.standards[0] || '-' : (user.standards || []).join(', ') || '-'}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        user.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                        user.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6">
                       <div className="flex justify-end gap-2">
                          <button 
                            disabled={user.status === 'APPROVED'}
                            onClick={() => handleStatusUpdate(user.id, 'APPROVED')} 
                            className={`p-2 rounded-lg transition-colors border ${user.status === 'APPROVED' ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200'}`} 
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            disabled={user.status === 'REJECTED'}
                            onClick={() => handleStatusUpdate(user.id, 'REJECTED')} 
                            className={`p-2 rounded-lg transition-colors border ${user.status === 'REJECTED' ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200'}`} 
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                       </div>
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

export default AdminRequests;
