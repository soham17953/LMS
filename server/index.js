const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { clerkMiddleware, getAuth } = require('@clerk/express');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Set up multer for memory storage (we will upload directly to Supabase from memory buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

// STUDENT ENDPOINTS

// Helper function to get student profile for filtering
const getStudentProfile = async (clerkUserId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('standards, medium, id')
    .eq('id', clerkUserId)
    .single();
  if (error || !data) throw new Error("Student profile not found");
  return data;
};

// GET /api/student/lectures
app.get('/api/student/lectures', async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) return res.status(401).json({ error: "Unauthorized" });
    
    // We get the student's standard/medium
    const profile = await getStudentProfile(auth.userId);
    
    const { data, error } = await supabase
      .from('lectures')
      .select('*, subject:subjects(name)')
      .in('class', profile.standards) // Student can have multiple standards technically in the array "standards", usually one.
      .eq('medium', profile.medium)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    
    // Format response if needed
    const formattedData = data.map(lecture => ({
      ...lecture,
      subjectName: lecture.subject?.name || 'General'
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/student/attendance
app.get('/api/student/attendance', async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) return res.status(401).json({ error: "Unauthorized" });
    
    const profile = await getStudentProfile(auth.userId);
    
    const { data, error } = await supabase
      .from('attendance')
      .select('*, subject:subjects(name)')
      .eq('student_id', profile.id)
      .order('date', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    const formattedData = data.map(a => ({
      ...a,
      subjectName: a.subject?.name || 'General'
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/student/homework
app.get('/api/student/homework', async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) return res.status(401).json({ error: "Unauthorized" });
    
    const profile = await getStudentProfile(auth.userId);
    
    // Fetch homework
    const { data, error } = await supabase
      .from('homework')
      .select('*, subject:subjects(name)')
      .in('class', profile.standards)
      .eq('medium', profile.medium)
      .order('due_date', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    // Fetch user's submissions to know if they already submitted
    const { data: subsData, error: subsError } = await supabase
      .from('homework_submissions')
      .select('homework_id, file_url')
      .eq('student_id', profile.id);

    if (subsError) return res.status(500).json({ error: subsError.message });

    // Create a map of submissions
    const subsMap = {};
    if (subsData) {
      subsData.forEach(sub => {
        subsMap[sub.homework_id] = sub.file_url;
      });
    }

    const formattedData = data.map(hw => ({
      ...hw,
      subjectName: hw.subject?.name || 'General',
      submission_url: subsMap[hw.id] || null, // null if not submitted
      isSubmitted: !!subsMap[hw.id]
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/student/homework/:id/submit
app.post('/api/student/homework/:id/submit', upload.single('hw_pdf'), async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) return res.status(401).json({ error: "Unauthorized" });

    const homeworkId = req.params.id;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "No PDF file attached" });
    if (file.mimetype !== 'application/pdf') return res.status(400).json({ error: "Only PDFs are allowed" });

    // Ensure it's for their homework by double-checking
    const profile = await getStudentProfile(auth.userId);

    // 1. Upload file buffer to Supabase Storage buffer
    const filename = `${uuidv4()}-${file.originalname}`;
    const filePathKey = `student-submissions/${profile.id}/${filename}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lms-files')
      .upload(filePathKey, file.buffer, {
        contentType: 'application/pdf'
      });

    if (uploadError) return res.status(500).json({ error: uploadError.message });

    // 2. Get public url of the uploaded file
    const { data: urlData } = supabase.storage
      .from('lms-files')
      .getPublicUrl(filePathKey);

    const publicUrl = urlData.publicUrl;

    // 3. Record the submission in DB
    const { data: insertData, error: insertError } = await supabase
      .from('homework_submissions')
      .insert({
        homework_id: homeworkId,
        student_id: profile.id,
        file_url: publicUrl
      })
      .select()
      .single();

    if (insertError) {
      // In a real app we'd try to delete the orphaned file from storage
      return res.status(500).json({ error: insertError.message });
    }

    res.json({ message: "Homework submitted successfully!", data: insertData });
  } catch (error) {
    console.error("Submit Homework Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/student/materials
app.get('/api/student/materials', async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) return res.status(401).json({ error: "Unauthorized" });
    
    const profile = await getStudentProfile(auth.userId);
    
    const { data, error } = await supabase
      .from('study_materials')
      .select('*, subject:subjects(name)')
      .in('class', profile.standards)
      .eq('medium', profile.medium)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    const formattedData = data.map(m => ({
      ...m,
      subjectName: m.subject?.name || 'General'
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/student/notices
app.get('/api/student/notices', async (req, res) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) return res.status(401).json({ error: "Unauthorized" });
    
    const profile = await getStudentProfile(auth.userId);
    
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .in('class', profile.standards)
      .eq('medium', profile.medium)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
