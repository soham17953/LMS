const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// Helper: ensure standards is a plain array of strings
const getStandardsArray = (standards) => {
  if (!standards) return [];
  if (Array.isArray(standards)) {
    return standards.map(s => {
      if (typeof s === 'object' && s !== null) {
        // Handle case where standards might be objects with a value property
        return String(s.value || s.standard || s);
      }
      return String(s);
    }).filter(Boolean);
  }
  if (typeof standards === 'string') {
    try { 
      const parsed = JSON.parse(standards);
      return Array.isArray(parsed) ? parsed.map(String) : [standards]; 
    } catch { 
      return [standards]; 
    }
  }
  return [];
};

// Helper: get subject IDs from a list of subject names
const getSubjectIds = async (subjectNames) => {
  if (!subjectNames || !subjectNames.length) return null;
  const { data } = await supabase
    .from('subjects')
    .select('id')
    .in('name', subjectNames);
  return data ? data.map((s) => s.id) : null;
};

exports.getLectures = async (req, res) => {
  try {
    const profile = req.userProfile;
    const standards = getStandardsArray(profile.standards);
    const studentSubjects = Array.isArray(profile.subjects) ? profile.subjects : [];

    console.log('[getLectures] Profile:', { 
      id: profile.id, 
      standards, 
      medium: profile.medium, 
      subjects: studentSubjects 
    });

    if (!standards.length || !profile.medium) {
      console.log('[getLectures] Missing standards or medium, returning empty array');
      return res.json([]);
    }

    let query = supabase
      .from('lectures')
      .select('*, subject:subjects(name)')
      .in('class', standards)
      .eq('medium', profile.medium)
      .order('scheduled_at', { ascending: true, nullsFirst: false });

    // If student has specific subjects enrolled, filter by those subject IDs
    // Otherwise show all lectures for their class/medium
    if (studentSubjects.length > 0) {
      const subjectIds = await getSubjectIds(studentSubjects);
      console.log('[getLectures] Student subjects:', studentSubjects, 'IDs:', subjectIds);
      if (subjectIds && subjectIds.length > 0) {
        // Show lectures for enrolled subjects OR lectures with no subject (general)
        query = query.or(`subject_id.in.(${subjectIds.join(',')}),subject_id.is.null`);
      }
    } else {
      console.log('[getLectures] No subject filter - showing all lectures for class/medium');
    }

    const { data, error } = await query;
    if (error) {
      console.error('[getLectures] Query error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('[getLectures] Found', data?.length || 0, 'lectures');

    res.json(
      (data || []).map((lecture) => ({
        ...lecture,
        subjectName: lecture.subject?.name || 'General',
      }))
    );
  } catch (error) {
    console.error('[getLectures] Exception:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const profile = req.userProfile;

    console.log('[getAttendance] Fetching attendance for student:', profile.id);

    // attendance.student_id is text (Clerk ID) — matches profile.id directly
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        id,
        student_id,
        date,
        status,
        class,
        medium,
        subject_id,
        created_at,
        subject:subjects(id, name)
      `)
      .eq('student_id', profile.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('[getAttendance] Query error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('[getAttendance] Found', data?.length || 0, 'attendance records');

    res.json(
      (data || []).map((a) => ({
        ...a,
        subjectName: a.subject?.name || 'General',
      }))
    );
  } catch (error) {
    console.error('[getAttendance] Exception:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getHomework = async (req, res) => {
  try {
    const profile = req.userProfile;
    const standards = getStandardsArray(profile.standards);
    const studentSubjects = Array.isArray(profile.subjects) ? profile.subjects : [];

    console.log('[getHomework] Profile:', { 
      id: profile.id, 
      standards, 
      medium: profile.medium, 
      subjects: studentSubjects 
    });

    if (!standards.length || !profile.medium) {
      console.log('[getHomework] Missing standards or medium, returning empty array');
      return res.json([]);
    }

    // Select explicit columns — avoids schema cache errors for columns that may not exist
    let query = supabase
      .from('homework')
      .select('id, title, description, due_date, class, medium, subject_id, created_at, teacher_id, subject:subjects(name)')
      .in('class', standards)
      .eq('medium', profile.medium)
      .order('due_date', { ascending: true });

    // Filter by student's enrolled subjects if set
    if (studentSubjects.length > 0) {
      const subjectIds = await getSubjectIds(studentSubjects);
      console.log('[getHomework] Student subjects:', studentSubjects, 'IDs:', subjectIds);
      if (subjectIds && subjectIds.length > 0) {
        query = query.or(`subject_id.in.(${subjectIds.join(',')}),subject_id.is.null`);
      }
    } else {
      console.log('[getHomework] No subject filter - showing all homework for class/medium');
    }

    const { data, error } = await query;

    if (error) {
      console.error('[getHomework] Query error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('[getHomework] Found', data?.length || 0, 'homework items');

    // Try to also fetch file_url — gracefully handle if column doesn't exist
    let fileUrlMap = {};
    try {
      const { data: fileData } = await supabase
        .from('homework')
        .select('id, file_url')
        .in('class', standards)
        .eq('medium', profile.medium);
      if (fileData) {
        fileData.forEach((row) => { fileUrlMap[row.id] = row.file_url || null; });
      }
    } catch (err) { 
      console.log('[getHomework] file_url column may not exist:', err.message);
    }

    // Fetch this student's submissions
    const { data: subsData, error: subsError } = await supabase
      .from('homework_submissions')
      .select('homework_id, file_url, submitted_at')
      .eq('student_id', profile.id);

    if (subsError) {
      console.error('[getHomework] Submissions query error:', subsError);
      return res.status(500).json({ error: subsError.message });
    }

    const subsMap = {};
    (subsData || []).forEach((sub) => {
      subsMap[sub.homework_id] = { file_url: sub.file_url, submitted_at: sub.submitted_at };
    });

    res.json(
      (data || []).map((hw) => ({
        ...hw,
        subjectName: hw.subject?.name || 'General',
        file_url: fileUrlMap[hw.id] ?? null,
        submission_url: subsMap[hw.id]?.file_url || null,
        submission_date: subsMap[hw.id]?.submitted_at || null,
        isSubmitted: !!subsMap[hw.id],
      }))
    );
  } catch (error) {
    console.error('[getHomework] Exception:', error);
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
    const studentSubjects = Array.isArray(profile.subjects) ? profile.subjects : [];

    console.log('[getMaterials] Profile:', { 
      id: profile.id, 
      standards, 
      medium: profile.medium, 
      subjects: studentSubjects 
    });

    if (!standards.length || !profile.medium) {
      console.log('[getMaterials] Missing standards or medium, returning empty array');
      return res.json([]);
    }

    let query = supabase
      .from('study_materials')
      .select('*, subject:subjects(name)')
      .in('class', standards)
      .eq('medium', profile.medium)
      .order('created_at', { ascending: false });

    if (studentSubjects.length > 0) {
      const subjectIds = await getSubjectIds(studentSubjects);
      console.log('[getMaterials] Student subjects:', studentSubjects, 'IDs:', subjectIds);
      if (subjectIds && subjectIds.length > 0) {
        query = query.or(`subject_id.in.(${subjectIds.join(',')}),subject_id.is.null`);
      }
    } else {
      console.log('[getMaterials] No subject filter - showing all materials for class/medium');
    }

    const { data, error } = await query;
    if (error) {
      console.error('[getMaterials] Query error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('[getMaterials] Found', data?.length || 0, 'materials');

    res.json(
      (data || []).map((m) => ({
        ...m,
        subjectName: m.subject?.name || 'General',
      }))
    );
  } catch (error) {
    console.error('[getMaterials] Exception:', error);
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
