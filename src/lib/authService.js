/**
 * Frontend AuthService — calls the Node/Express backend.
 */
export const AuthService = {

  // ─── User / Profile ──────────────────────────────────────────────────────────

  getCurrentUserProfile: async (clerkToken) => {
    const res = await fetch('/api/profiles/me', {
      headers: { Authorization: `Bearer ${clerkToken}` },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch user profile');
    }
    return await res.json();
  },

  finalizeOnboarding: async (clerkToken, userData) => {
    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clerkToken}` },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to finalize onboarding');
    }
    return await res.json();
  },

  getAllUsers: async (clerkToken) => {
    const res = await fetch('/api/users', {
      headers: { Authorization: `Bearer ${clerkToken}` },
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch users');
    }
    return await res.json();
  },

  updateUserStatus: async (clerkToken, userId, newStatus) => {
    const res = await fetch(`/api/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clerkToken}` },
      body: JSON.stringify({ newStatus }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to update user status');
    }
    return await res.json();
  },

  // ─── Student ─────────────────────────────────────────────────────────────────

  getStudentLectures: async (clerkToken) => {
    const res = await fetch('/api/student/lectures', { headers: { Authorization: `Bearer ${clerkToken}` } });
    if (!res.ok) throw new Error('Failed to fetch lectures');
    return await res.json();
  },

  getStudentAttendance: async (clerkToken) => {
    const res = await fetch('/api/student/attendance', { headers: { Authorization: `Bearer ${clerkToken}` } });
    if (!res.ok) throw new Error('Failed to fetch attendance');
    return await res.json();
  },

  getStudentHomework: async (clerkToken) => {
    const res = await fetch('/api/student/homework', { headers: { Authorization: `Bearer ${clerkToken}` } });
    if (!res.ok) throw new Error('Failed to fetch homework');
    return await res.json();
  },

  submitHomework: async (clerkToken, homeworkId, file) => {
    const formData = new FormData();
    formData.append('hw_pdf', file);
    const res = await fetch(`/api/student/homework/${homeworkId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clerkToken}` },
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to submit homework');
    }
    return await res.json();
  },

  getStudentMaterials: async (clerkToken) => {
    const res = await fetch('/api/student/materials', { headers: { Authorization: `Bearer ${clerkToken}` } });
    if (!res.ok) throw new Error('Failed to fetch materials');
    return await res.json();
  },

  getStudentNotices: async (clerkToken) => {
    const res = await fetch('/api/student/notices', { headers: { Authorization: `Bearer ${clerkToken}` } });
    if (!res.ok) throw new Error('Failed to fetch notices');
    return await res.json();
  },

  // ─── Teacher ─────────────────────────────────────────────────────────────────

  getTeacherDashboard: async (clerkToken) => {
    const res = await fetch('/api/teacher/dashboard', { headers: { Authorization: `Bearer ${clerkToken}` } });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return await res.json();
  },

  getTeacherLectures: async (clerkToken) => {
    const res = await fetch('/api/teacher/lectures', { headers: { Authorization: `Bearer ${clerkToken}` } });
    if (!res.ok) throw new Error('Failed to fetch lectures');
    return await res.json();
  },
  createTeacherLecture: async (clerkToken, data) => {
    const res = await fetch('/api/teacher/lectures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clerkToken}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to create lecture'); }
    return await res.json();
  },
  updateTeacherLecture: async (clerkToken, id, data) => {
    const res = await fetch(`/api/teacher/lectures/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clerkToken}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to update lecture'); }
    return await res.json();
  },
  deleteTeacherLecture: async (clerkToken, id) => {
    const res = await fetch(`/api/teacher/lectures/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${clerkToken}` },
    });
    if (!res.ok) throw new Error('Failed to delete lecture');
    return await res.json();
  },

  getTeacherHomework: async (clerkToken) => {
    const res = await fetch('/api/teacher/homework', { headers: { Authorization: `Bearer ${clerkToken}` } });
    if (!res.ok) throw new Error('Failed to fetch homework');
    return await res.json();
  },
  createTeacherHomework: async (clerkToken, formData) => {
    const res = await fetch('/api/teacher/homework', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clerkToken}` },
      body: formData,
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to create homework'); }
    return await res.json();
  },
  updateTeacherHomework: async (clerkToken, id, formData) => {
    const res = await fetch(`/api/teacher/homework/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${clerkToken}` },
      body: formData,
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to update homework'); }
    return await res.json();
  },
  deleteTeacherHomework: async (clerkToken, id) => {
    const res = await fetch(`/api/teacher/homework/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${clerkToken}` },
    });
    if (!res.ok) throw new Error('Failed to delete homework');
    return await res.json();
  },

  getTeacherMaterials: async (clerkToken) => {
    const res = await fetch('/api/teacher/materials', { headers: { Authorization: `Bearer ${clerkToken}` } });
    if (!res.ok) throw new Error('Failed to fetch materials');
    return await res.json();
  },
  createTeacherMaterial: async (clerkToken, formData) => {
    const res = await fetch('/api/teacher/materials', {
      method: 'POST',
      headers: { Authorization: `Bearer ${clerkToken}` },
      body: formData,
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to upload material'); }
    return await res.json();
  },
  updateTeacherMaterial: async (clerkToken, id, formData) => {
    const res = await fetch(`/api/teacher/materials/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${clerkToken}` },
      body: formData,
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to update material'); }
    return await res.json();
  },
  deleteTeacherMaterial: async (clerkToken, id) => {
    const res = await fetch(`/api/teacher/materials/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${clerkToken}` },
    });
    if (!res.ok) throw new Error('Failed to delete material');
    return await res.json();
  },

  getTeacherNotices: async (clerkToken) => {
    const res = await fetch('/api/teacher/notices', { headers: { Authorization: `Bearer ${clerkToken}` } });
    if (!res.ok) throw new Error('Failed to fetch notices');
    return await res.json();
  },
  createTeacherNotice: async (clerkToken, data) => {
    const res = await fetch('/api/teacher/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clerkToken}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to post notice'); }
    return await res.json();
  },
  updateTeacherNotice: async (clerkToken, id, data) => {
    const res = await fetch(`/api/teacher/notices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clerkToken}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to update notice'); }
    return await res.json();
  },
  deleteTeacherNotice: async (clerkToken, id) => {
    const res = await fetch(`/api/teacher/notices/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${clerkToken}` },
    });
    if (!res.ok) throw new Error('Failed to delete notice');
    return await res.json();
  },

  getTeacherStudents: async (clerkToken, medium, std) => {
    const params = new URLSearchParams();
    if (medium) params.append('medium', medium);
    if (std) params.append('std', std);
    const res = await fetch(`/api/teacher/students?${params.toString()}`, {
      headers: { Authorization: `Bearer ${clerkToken}` },
    });
    if (!res.ok) throw new Error('Failed to fetch students');
    return await res.json();
  },
  createTeacherAttendance: async (clerkToken, data) => {
    const res = await fetch('/api/teacher/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clerkToken}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to submit attendance'); }
    return await res.json();
  },
  getTeacherAttendance: async (clerkToken) => {
    const res = await fetch('/api/teacher/attendance/history', {
      headers: { Authorization: `Bearer ${clerkToken}` },
    });
    if (!res.ok) throw new Error('Failed to fetch attendance history');
    return await res.json();
  },
  updateTeacherAttendance: async (clerkToken, recordId, data) => {
    const res = await fetch(`/api/teacher/attendance/${recordId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clerkToken}` },
      body: JSON.stringify({ attendance: data }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to update attendance'); }
    return await res.json();
  },

  // ─── Admin ───────────────────────────────────────────────────────────────────

  getAdminDashboard: async (clerkToken) => {
    const res = await fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${clerkToken}` } });
    if (!res.ok) throw new Error('Failed to fetch admin dashboard');
    return await res.json();
  },

  getAdminAnnouncements: async (clerkToken) => {
    const res = await fetch('/api/admin/announcements', { headers: { Authorization: `Bearer ${clerkToken}` } });
    if (!res.ok) throw new Error('Failed to fetch announcements');
    return await res.json();
  },
  createAdminAnnouncement: async (clerkToken, data) => {
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clerkToken}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to create announcement'); }
    return await res.json();
  },
  updateAdminAnnouncement: async (clerkToken, id, data) => {
    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clerkToken}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to update announcement'); }
    return await res.json();
  },
  deleteAdminAnnouncement: async (clerkToken, id) => {
    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${clerkToken}` },
    });
    if (!res.ok) throw new Error('Failed to delete announcement');
    return await res.json();
  },

  getAdminNotices: async (clerkToken) => {
    const res = await fetch('/api/admin/notices', { headers: { Authorization: `Bearer ${clerkToken}` } });
    if (!res.ok) throw new Error('Failed to fetch notices');
    return await res.json();
  },
  updateAdminNotice: async (clerkToken, id, data) => {
    const res = await fetch(`/api/admin/notices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clerkToken}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to update notice'); }
    return await res.json();
  },
  deleteAdminNotice: async (clerkToken, id) => {
    const res = await fetch(`/api/admin/notices/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${clerkToken}` },
    });
    if (!res.ok) throw new Error('Failed to delete notice');
    return await res.json();
  },

  getAdminLectures: async (clerkToken) => {
    const res = await fetch('/api/admin/lectures', { headers: { Authorization: `Bearer ${clerkToken}` } });
    if (!res.ok) throw new Error('Failed to fetch lectures');
    return await res.json();
  },
  createAdminLecture: async (clerkToken, data) => {
    const res = await fetch('/api/admin/lectures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clerkToken}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to create lecture'); }
    return await res.json();
  },
  updateAdminLecture: async (clerkToken, id, data) => {
    const res = await fetch(`/api/admin/lectures/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clerkToken}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to update lecture'); }
    return await res.json();
  },
  deleteAdminLecture: async (clerkToken, id) => {
    const res = await fetch(`/api/admin/lectures/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${clerkToken}` },
    });
    if (!res.ok) throw new Error('Failed to delete lecture');
    return await res.json();
  },

  getAdminAttendance: async (clerkToken) => {
    const res = await fetch('/api/admin/attendance', { headers: { Authorization: `Bearer ${clerkToken}` } });
    if (!res.ok) throw new Error('Failed to fetch attendance');
    return await res.json();
  },
  updateAdminAttendance: async (clerkToken, recordId, students) => {
    const res = await fetch(`/api/admin/attendance/${recordId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clerkToken}` },
      body: JSON.stringify({ students }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to update attendance'); }
    return await res.json();
  },
};
