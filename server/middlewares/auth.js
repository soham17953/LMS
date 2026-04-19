const { getAuth } = require('@clerk/express');
const supabase = require('../config/supabase');

// Basic auth check
const requireAuth = (req, res, next) => {
  const auth = getAuth(req);
  if (!auth.userId) return res.status(401).json({ error: "Unauthorized" });
  req.auth = auth;
  next();
};

const getStudentProfile = async (clerkUserId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('standards, medium, id')
    .eq('id', clerkUserId)
    .single();
  if (error || !data) throw new Error("Student profile not found");
  return data;
};

const getTeacherProfile = async (clerkUserId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', clerkUserId)
    .single();
  if (error || !data) throw new Error("Teacher profile not found");
  if (data.role !== 'TEACHER' && data.role !== 'ADMIN') throw new Error("Unauthorized role");
  return data;
};

// Check if user is an approved student
const requireStudent = async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) return res.status(401).json({ error: "Unauthorized" });
    const profile = await getStudentProfile(auth.userId);
    req.userProfile = profile;
    next();
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};

// Check if user is a teacher or admin
const requireTeacher = async (req, res, next) => {
  try {
    const auth = getAuth(req);
    if (!auth.userId) return res.status(401).json({ error: "Unauthorized" });
    const profile = await getTeacherProfile(auth.userId);
    req.userProfile = profile;
    next();
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};

module.exports = { requireAuth, requireStudent, requireTeacher };
