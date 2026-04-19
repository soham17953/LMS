const supabase = require('../config/supabase');
const { normalizeClassArray } = require('../utils/classUtils');

exports.getMe = async (req, res) => {
  try {
    const { userId: clerkUserId } = req.auth;
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
};

exports.createProfile = async (req, res) => {
  try {
    const clerkUserId = req.auth.userId;
    const userData = req.body;
    
    // Auto approve designated super admin
    const isSuperAdmin = userData.email === 'prajapatikeshav497@gmail.com';
    const status = isSuperAdmin ? 'APPROVED' : 'PENDING';
    const role = isSuperAdmin ? 'ADMIN' : (userData.role || '').toUpperCase();

    // Normalize standards to remove "th", "st", "nd", "rd" suffixes
    // This ensures consistency with database content format
    const normalizedStandards = normalizeClassArray(userData.standards || []);

    const newProfile = {
      id: clerkUserId, 
      name: userData.name,
      email: userData.email,
      role: role,
      medium: userData.medium || null,
      standards: normalizedStandards,
      subjects: userData.subjects || [],
      status: status
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
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
};
