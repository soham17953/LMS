const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// Helper: ensure standards is a plain array of strings
const getStandardsArray = (standards) => {
  if (!standards) return [];
  if (Array.isArray(standards)) return standards.map(String);
  if (typeof standards === 'string') {
    try { return JSON.parse(standards).map(String); } catch { return [standards]; }
  }
  return [];
};

exports.getLectures = async (req, res) => {
  try {
    const profile = req.userProfile;
    const standards = getStandardsArray(profile.standards);

    if (!standards.length || !profile.medium) {
      return res.json([]);
    }

    const { data, error } = await supabase
      .from('lectures')
      .select('*, subject:subjects(name)')
      .in('class', standards)
      .eq('medium', profile.medium)
      .order('scheduled_at', { ascending: true, nullsFirst: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(
      (data || []).map((lecture) => ({
        ...lecture,
        subjectName: lecture.subject?.name || 'General',
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const profile = req.userProfile;

    // attendance.student_id is uuid — profile.id is a Clerk text ID.
    // We cast via ::text comparison using a raw filter.
    const { data, error } = await supabase
      .from('attendance')
      .select('*, subject:subjects(name)')
      .eq('student_id', profile.id)
      .order('date', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(
      (data || []).map((a) => ({
        ...a,
        subjectName: a.subject?.name || 'General',
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHomework = async (req, res) => {
  try {
    const profile = req.userProfile;
    const standards = getStandardsArray(profile.standards);

    if (!standards.length || !profile.medium) {
      return res.json([]);
    }

    const { data, error } = await supabase
      .from('homework')
      .select('*, subject:subjects(name)')
      .in('class', standards)
      .eq('medium', profile.medium)
      .order('due_date', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    // Fetch this student's submissions
    const { data: subsData, error: subsError } = await supabase
      .from('homework_submissions')
      .select('homework_id, file_url, submitted_at')
      .eq('student_id', profile.id);

    if (subsError) return res.status(500).json({ error: subsError.message });

    const subsMap = {};
    (subsData || []).forEach((sub) => {
      subsMap[sub.homework_id] = { file_url: sub.file_url, submitted_at: sub.submitted_at };
    });

    res.json(
      (data || []).map((hw) => ({
        ...hw,
        subjectName: hw.subject?.name || 'General',
        submission_url: subsMap[hw.id]?.file_url || null,
        submission_date: subsMap[hw.id]?.submitted_at || null,
        isSubmitted: !!subsMap[hw.id],
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.submitHomework = async (req, res) => {
  try {
    const homeworkId = req.params.id;
    const file = req.file;
    const profile = req.userProfile;

    if (!file) return res.status(400).json({ error: 'No PDF file attached' });
    if (file.mimetype !== 'application/pdf') return res.status(400).json({ error: 'Only PDFs are allowed' });

    // Verify this homework is actually assigned to this student's class/medium
    const standards = getStandardsArray(profile.standards);
    const { data: hwCheck } = await supabase
      .from('homework')
      .select('id')
      .eq('id', homeworkId)
      .in('class', standards)
      .eq('medium', profile.medium)
      .maybeSingle();

    if (!hwCheck) {
      return res.status(403).json({ error: 'This homework is not assigned to your class.' });
    }

    // Check for duplicate submission
    const { data: existing } = await supabase
      .from('homework_submissions')
      .select('id')
      .eq('homework_id', homeworkId)
      .eq('student_id', profile.id)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: 'You have already submitted this homework.' });
    }

    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePathKey = `student-submissions/${profile.id}/${uuidv4()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('lms-files')
      .upload(filePathKey, file.buffer, { contentType: 'application/pdf' });

    if (uploadError) return res.status(500).json({ error: uploadError.message });

    const { data: urlData } = supabase.storage.from('lms-files').getPublicUrl(filePathKey);
    const publicUrl = urlData.publicUrl;

    const { data: insertData, error: insertError } = await supabase
      .from('homework_submissions')
      .insert({
        homework_id: homeworkId,
        student_id: profile.id,
        file_url: publicUrl,
      })
      .select()
      .single();

    if (insertError) {
      await supabase.storage.from('lms-files').remove([filePathKey]).catch(console.error);
      return res.status(500).json({ error: insertError.message });
    }

    res.json({ message: 'Homework submitted successfully!', data: insertData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMaterials = async (req, res) => {
  try {
    const profile = req.userProfile;
    const standards = getStandardsArray(profile.standards);

    if (!standards.length || !profile.medium) {
      return res.json([]);
    }

    const { data, error } = await supabase
      .from('study_materials')
      .select('*, subject:subjects(name)')
      .in('class', standards)
      .eq('medium', profile.medium)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(
      (data || []).map((m) => ({
        ...m,
        subjectName: m.subject?.name || 'General',
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNotices = async (req, res) => {
  try {
    const profile = req.userProfile;
    const standards = getStandardsArray(profile.standards);

    const queries = [];

    // Class-specific notices for this student's class(es) and medium
    if (standards.length && profile.medium) {
      queries.push(
        supabase
          .from('notices')
          .select('*')
          .in('class', standards)
          .eq('medium', profile.medium)
          .order('created_at', { ascending: false })
      );
    }

    // Global admin announcements (class='ALL', medium='ALL')
    queries.push(
      supabase
        .from('notices')
        .select('*')
        .eq('class', 'ALL')
        .eq('medium', 'ALL')
        .order('created_at', { ascending: false })
    );

    const results = await Promise.all(queries);
    for (const { error } of results) {
      if (error) return res.status(500).json({ error: error.message });
    }

    // Merge, deduplicate by id, sort newest first
    const allNotices = results.flatMap((r) => r.data || []);
    const seen = new Set();
    const unique = allNotices.filter((n) => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });
    unique.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(unique);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
