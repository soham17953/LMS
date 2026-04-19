/**
 * Frontend AuthService calling our separated Node/Express backend.
 */
export const AuthService = {
  // Retrieve the user profile from Backend
  getCurrentUserProfile: async (clerkToken) => {
    const res = await fetch('/api/profiles/me', {
      headers: {
        Authorization: `Bearer ${clerkToken}`
      }
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch user profile');
    }
    
    return await res.json(); // Returns single profile or null
  },

  // Finalize onboarding by creating the user in Backend
  finalizeOnboarding: async (clerkToken, userData) => {
    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clerkToken}`
      },
      body: JSON.stringify(userData)
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to finalize onboarding');
    }

    return await res.json();
  },

  // Admin: Get all users
  getAllUsers: async (clerkToken) => {
    const res = await fetch('/api/users', {
      headers: {
        Authorization: `Bearer ${clerkToken}`
      }
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch users');
    }
    
    return await res.json();
  },

  // Admin: Update User Status
  updateUserStatus: async (clerkToken, userId, newStatus) => {
    const res = await fetch(`/api/users/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clerkToken}`
      },
      body: JSON.stringify({ newStatus })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to update user status');
    }

    return await res.json();
  }
};
