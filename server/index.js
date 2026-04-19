const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { clerkMiddleware, getAuth } = require('@clerk/express');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Supabase. 
// We use the SERVICE_ROLE_KEY to bypass RLS in the backend safely.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware to parse Clerk tokens and attach auth state
app.use(clerkMiddleware());

// Require authentication for all /api routes

// GET /api/profiles/me
app.get('/api/profiles/me', async (req, res) => {
  try {
    const auth = getAuth(req);
    const { userId: clerkUserId } = auth;
    if (!clerkUserId) return res.status(401).json({ error: "Unauthorized" });

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', clerkUserId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/profiles
app.post('/api/profiles', async (req, res) => {
  try {
    const auth = getAuth(req);
    const clerkUserId = auth.userId;
    if (!clerkUserId) return res.status(401).json({ error: "Unauthorized" });

    const userData = req.body;

    const isSuperAdmin = userData.email === 'prajapatikeshav497@gmail.com';
    const status = isSuperAdmin ? 'APPROVED' : 'PENDING';
    const role = isSuperAdmin ? 'ADMIN' : (userData.role || '').toUpperCase();

    const newProfile = {
      id: clerkUserId, 
      name: userData.name,
      email: userData.email,
      role: role,
      medium: userData.medium || null,
      standards: userData.standards || [],
      subjects: userData.subjects || [],
      status: status
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users
app.get('/api/users', async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) return res.status(401).json({ error: "Unauthorized" });

    // Add logic here to verify if `req.auth.userId` is actually an ADMIN if you want.
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/users/:userId/status
app.patch('/api/users/:userId/status', async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) return res.status(401).json({ error: "Unauthorized" });

    const { newStatus } = req.body;
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', userId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
