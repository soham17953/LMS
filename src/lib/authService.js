// This file simulates Firebase Auth and Firestore for local development without actual API keys.
// It uses localStorage to mimic network requests and persist state.

const STORAGE_KEY = 'shree_classes_firestore_users';
const ADMIN_EMAIL = 'admin@shreeclasses.com';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getUsers = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveUsers = (users) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

// Seed Admin if not exists
const initializeAdmin = () => {
  let users = getUsers();
  if (!users.find(u => u.email === ADMIN_EMAIL)) {
    users.push({
      id: 'admin_123',
      name: 'Super Admin',
      email: ADMIN_EMAIL,
      password: 'Admin@123', // Optional requested password backup
      role: 'ADMIN',
      status: 'APPROVED',
      authType: 'email',
      createdAt: new Date().toISOString()
    });
    saveUsers(users);
  }
};
initializeAdmin();

export const AuthService = {
  
  // 1. Check if email exists
  checkUserExists: async (email) => {
    await delay(300);
    const users = getUsers();
    return users.find(u => u.email === email);
  },

  // 2. Login
  login: async (email, password) => {
    await delay(600);
    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) throw new Error('User not found. Please sign up.');
    
    // Bypass strictness for admin optionally, but enforce pwd matching
    if (user.password && user.password !== password) {
      if (email === ADMIN_EMAIL && password === 'Admin@123') {
         // force pass
      } else {
         throw new Error('Invalid credentials.');
      }
    }

    if (user.email === ADMIN_EMAIL) {
      user.role = 'ADMIN';
      user.status = 'APPROVED';
    }

    // Set active session
    localStorage.setItem('shree_active_session', JSON.stringify(user));
    return user;
  },

  // 3. Signup Core (Credentials)
  signupCore: async (name, email, password) => {
    await delay(500);
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      throw new Error('Email already exists.');
    }
    return { name, email, password, authType: 'email' };
  },

  // 4. Google Auth Mock
  signInWithGoogle: async () => {
    await delay(800);
    // Simulate picking a google account
    const mockGoogleEmail = `user_${Math.floor(Math.random()*1000)}@gmail.com`;
    return {
      name: 'Google User',
      email: mockGoogleEmail,
      authType: 'google'
    };
  },

  // 5. Finalize Onboarding & Save to "Firestore"
  finalizeOnboarding: async (userData) => {
    await delay(600);
    const users = getUsers();
    
    // Prevent duplicate saving
    if (users.find(u => u.email === userData.email)) {
       throw new Error('User already exists in Firestore.');
    }

    const newUser = {
      id: `uid_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      password: userData.password || null, // Might be null if Google Auth
      role: userData.role,
      medium: userData.medium || null,
      standards: userData.standards || [],
      subjects: userData.subjects || [],
      authType: userData.authType,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    if (newUser.email === ADMIN_EMAIL) {
       newUser.role = 'ADMIN';
       newUser.status = 'APPROVED';
    }

    users.push(newUser);
    saveUsers(users);

    // Set active session context
    localStorage.setItem('shree_active_session', JSON.stringify(newUser));
    return newUser;
  },

  // 6. Reset Password Fallback
  resetPassword: async (email) => {
    await delay(500);
    const users = getUsers();
    if (!users.find(u => u.email === email)) {
      throw new Error('No user found with this email.');
    }
    return true; // Pretend email sent
  },

  // 7. Get Current Active User
  getCurrentUser: () => {
    const data = localStorage.getItem('shree_active_session');
    return data ? JSON.parse(data) : null;
  },

  // 8. Admin: Get all users
  getAllUsers: async () => {
    await delay(300);
    return getUsers();
  },

  // 9. Admin: Update User Status
  updateUserStatus: async (userId, newStatus) => {
    await delay(400);
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('User not found');
    users[index].status = newStatus;
    saveUsers(users);
    return users[index];
  }
};
