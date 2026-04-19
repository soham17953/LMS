const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

const isValidDate = (d) => d && !isNaN(new Date(d).getTime());

// Helper: Delete file from Supabase storage
const deleteSupabaseFile = async (fileUrl) => {
  if (!fileUrl) return;
  try {
    const urlParts = fileUrl.split('/lms-files/');
    if (urlParts.length === 2) {
      const filePath = decodeURIComponent(urlParts[1]);
      await supabase.storage.from('lms-files').remove([filePath]);
    }
  } catch (err) {
    console.error('Error deleting file from storage:', err.message);
  }
};

// Helper: Lookup or create subject by name, returns subject_id or null
const resolveSubjectId = async (subjectName) => {
  if (!subjectName) return null;
  const { data } = await supabase
    .from('subjects')
    .select('id')
    .ilike('name', subjectName.trim())
    .limit(1);
  if (data && data.length > 0) return data[0].id;
  // Auto-create subject if not found
  const { data: created } = await supabase
    .from('subjects')
    .insert([{ name: subjectName.trim() }])
    .select('id')
    .single();
  return created?.id || null;
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

exports.getDashboardStats = async (req, res) => {
  try {
    const profile = req.userProfile;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [{ count: lecturesCount }, { count: homeworkCount }, { count: noticesCount }] =
      await Promise.all([
        supabase
          .from('lectures')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', profile.id)
          .gte('created_at', startOfDay.toISOString()),
        supabase
          .from('homework')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', profile.id),
        supabase
          .from('notices')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', profile.id),
      ]);

    res.json({
      lecturesToday: lecturesCount || 0,
      homeworkOut: homeworkCount || 0,
      avgAttendance: 92,
      noticesCount: noticesCount || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Lectures ─────────────────────────────────────────────────────────────────

exports.getLectures = async (req, res) => {
  try {
    const profile = req.userProfile;
    const { data, error } = await supabase
      .from('lectures')
      .select('*, subject:subjects(name)')
      .eq('teacher_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(
      data.map((l) => ({ ...l, subjectName: l.subject?.name || 'General' }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createLecture = async (req, res) => {
  try {
    const profile = req.userProfile;
    const { title, description, medium, class: std, date, time, subjectName, video_url } = req.body;

    if (!title || !medium || !std || !date) {
      return res.status(400).json({ error: 'Missing required fields: title, medium, class, date' });
    }

    // Combine date + time into a single ISO timestamp
    const dateTimeStr = time ? `${date}T${time}:00` : `${date}T00:00:00`;
    if (!isValidDate(dateTimeStr)) {
      return res.status(400).json({ error: 'Invalid date/time format' });
    }

    const subject_id = await resolveSubjectId(subjectName);

    const { data, error } = await supabase
      .from('lectures')
      .insert([{
        title: title.trim(),
        description: description?.trim() || null,
        subject_id: subject_id || null,
        video_url: video_url || null,
        medium,
        class: std,
        teacher_id: profile.id,
        scheduled_at: dateTimeStr,
      }])
      .select('*, subject:subjects(name)')
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ ...data, subjectName: data.subject?.name || 'General' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateLecture = async (req, res) => {
  try {
    const profile = req.userProfile;
    const { title, description, medium, class: std, date, time, subjectName, video_url } = req.body;

    if (!title || !medium || !std || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const dateTimeStr = time ? `${date}T${time}:00` : `${date}T00:00:00`;
    if (!isValidDate(dateTimeStr)) {
      return res.status(400).json({ error: 'Invalid date/time format' });
    }

    const subject_id = await resolveSubjectId(subjectName);

    const { data, error } = await supabase
      .from('lectures')
      .update({
        title: title.trim(),
        description: description?.trim() || null,
        subject_id: subject_id || null,
        video_url: video_url || null,
        medium,
        class: std,
        scheduled_at: dateTimeStr,
      })
      .eq('id', req.params.id)
      .eq('teacher_id', profile.id)
      .select('*, subject:subjects(name)')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Lecture not found' });

    res.json({ ...data, subjectName: data.subject?.name || 'General' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteLecture = async (req, res) => {
  try {
    const profile = req.userProfile;
    const { data, error } = await supabase
      .from('lectures')
      .delete()
      .eq('id', req.params.id)
      .eq('teacher_id', profile.id)
      .select('id');

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) return res.status(404).json({ error: 'Lecture not found' });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Homework ─────────────────────────────────────────────────────────────────

exports.getHomework = async (req, res) => {
  try {
    const profile = req.userProfile;
    const { data, error } = await supabase
      .from('homework')
      .select('*, subject:subjects(name)')
      .eq('teacher_id', profile.id)
      .order('due_date', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    res.json(data.map((hw) => ({ ...hw, subjectName: hw.subject?.name || 'General' })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createHomework = async (req, res) => {
  let filePathKey = null;
  try {
    const profile = req.userProfile;
    const { title, description, medium, class: std, due_date, subjectName } = req.body;

    if (!title || !medium || !std || !due_date) {
      return res.status(400).json({ error: 'Missing required fields: title, medium, class, due_date' });
    }
    if (!isValidDate(due_date)) {
      return res.status(400).json({ error: 'Invalid due_date format' });
    }

    let publicUrl = null;
    if (req.file) {
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: 'Only PDFs are allowed' });
      }
      const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      filePathKey = `homework/${profile.id}/${uuidv4()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from('lms-files')
        .upload(filePathKey, req.file.buffer, { contentType: 'application/pdf' });
      if (uploadError) return res.status(500).json({ error: uploadError.message });
      const { data: urlData } = supabase.storage.from('lms-files').getPublicUrl(filePathKey);
      publicUrl = urlData.publicUrl;
    }

    const subject_id = await resolveSubjectId(subjectName);

    const { data, error } = await supabase
      .from('homework')
      .insert([{
        title: title.trim(),
        description: description?.trim() || null,
        medium,
        class: std,
        due_date,
        subject_id: subject_id || null,
        file_url: publicUrl,
        teacher_id: profile.id,
      }])
      .select('*, subject:subjects(name)')
      .single();

    if (error) {
      if (filePathKey) await supabase.storage.from('lms-files').remove([filePathKey]);
      return res.status(500).json({ error: error.message });
    }

    res.json({ ...data, subjectName: data.subject?.name || 'General' });
  } catch (error) {
    if (filePathKey) await supabase.storage.from('lms-files').remove([filePathKey]).catch(console.error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateHomework = async (req, res) => {
  let filePathKey = null;
  try {
    const profile = req.userProfile;
    const { title, description, medium, class: std, due_date, subjectName } = req.body;

    if (!title || !medium || !std || !due_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch existing to get old file_url
    const { data: existing, error: fetchErr } = await supabase
      .from('homework')
      .select('id, file_url')
      .eq('id', req.params.id)
      .eq('teacher_id', profile.id)
      .single();

    if (fetchErr || !existing) return res.status(404).json({ error: 'Homework not found' });

    let publicUrl = existing.file_url;
    if (req.file) {
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: 'Only PDFs are allowed' });
      }
      const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      filePathKey = `homework/${profile.id}/${uuidv4()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from('lms-files')
        .upload(filePathKey, req.file.buffer, { contentType: 'application/pdf' });
      if (uploadError) return res.status(500).json({ error: uploadError.message });
      const { data: urlData } = supabase.storage.from('lms-files').getPublicUrl(filePathKey);
      publicUrl = urlData.publicUrl;
      // Delete old file
      if (existing.file_url) await deleteSupabaseFile(existing.file_url);
    }

    const subject_id = await resolveSubjectId(subjectName);

    const { data, error } = await supabase
      .from('homework')
      .update({
        title: title.trim(),
        description: description?.trim() || null,
        medium,
        class: std,
        due_date,
        subject_id: subject_id || null,
        file_url: publicUrl,
      })
      .eq('id', req.params.id)
      .eq('teacher_id', profile.id)
      .select('*, subject:subjects(name)')
      .single();

    if (error) {
      if (filePathKey) await supabase.storage.from('lms-files').remove([filePathKey]);
      return res.status(500).json({ error: error.message });
    }

    res.json({ ...data, subjectName: data.subject?.name || 'General' });
  } catch (error) {
    if (filePathKey) await supabase.storage.from('lms-files').remove([filePathKey]).catch(console.error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteHomework = async (req, res) => {
  try {
    const profile = req.userProfile;
    const { data: hwData, error: fetchErr } = await supabase
      .from('homework')
      .select('id, file_url')
      .eq('id', req.params.id)
      .eq('teacher_id', profile.id)
      .single();

    if (fetchErr || !hwData) return res.status(404).json({ error: 'Homework not found' });

    const { error } = await supabase
      .from('homework')
      .delete()
      .eq('id', req.params.id)
      .eq('teacher_id', profile.id);

    if (error) return res.status(500).json({ error: error.message });

    if (hwData.file_url) await deleteSupabaseFile(hwData.file_url);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Study Materials ──────────────────────────────────────────────────────────

exports.getMaterials = async (req, res) => {
  try {
    const profile = req.userProfile;
    const { data, error } = await supabase
      .from('study_materials')
      .select('*, subject:subjects(name)')
      .eq('teacher_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(data.map((m) => ({ ...m, subjectName: m.subject?.name || 'General' })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createMaterial = async (req, res) => {
  let filePathKey = null;
  try {
    const profile = req.userProfile;
    const { title, description, medium, class: std, subjectName } = req.body;

    if (!title || !medium || !std) {
      return res.status(400).json({ error: 'Missing required fields: title, medium, class' });
    }

    let publicUrl = null;
    if (req.file) {
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: 'Only PDFs are allowed' });
      }
      const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      filePathKey = `materials/${profile.id}/${uuidv4()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from('lms-files')
        .upload(filePathKey, req.file.buffer, { contentType: 'application/pdf' });
      if (uploadError) return res.status(500).json({ error: uploadError.message });
      const { data: urlData } = supabase.storage.from('lms-files').getPublicUrl(filePathKey);
      publicUrl = urlData.publicUrl;
    }

    const subject_id = await resolveSubjectId(subjectName);

    const { data, error } = await supabase
      .from('study_materials')
      .insert([{
        title: title.trim(),
        description: description?.trim() || null,
        medium,
        class: std,
        subject_id: subject_id || null,
        file_url: publicUrl,
        teacher_id: profile.id,
      }])
      .select('*, subject:subjects(name)')
      .single();

    if (error) {
      if (filePathKey) await supabase.storage.from('lms-files').remove([filePathKey]);
      return res.status(500).json({ error: error.message });
    }

    res.json({ ...data, subjectName: data.subject?.name || 'General' });
  } catch (error) {
    if (filePathKey) await supabase.storage.from('lms-files').remove([filePathKey]).catch(console.error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateMaterial = async (req, res) => {
  let filePathKey = null;
  try {
    const profile = req.userProfile;
    const { title, description, medium, class: std, subjectName } = req.body;

    if (!title || !medium || !std) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: existing, error: fetchErr } = await supabase
      .from('study_materials')
      .select('id, file_url')
      .eq('id', req.params.id)
      .eq('teacher_id', profile.id)
      .single();

    if (fetchErr || !existing) return res.status(404).json({ error: 'Material not found' });

    let publicUrl = existing.file_url;
    if (req.file) {
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: 'Only PDFs are allowed' });
      }
      const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      filePathKey = `materials/${profile.id}/${uuidv4()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from('lms-files')
        .upload(filePathKey, req.file.buffer, { contentType: 'application/pdf' });
      if (uploadError) return res.status(500).json({ error: uploadError.message });
      const { data: urlData } = supabase.storage.from('lms-files').getPublicUrl(filePathKey);
      publicUrl = urlData.publicUrl;
      if (existing.file_url) await deleteSupabaseFile(existing.file_url);
    }

    const subject_id = await resolveSubjectId(subjectName);

    const { data, error } = await supabase
      .from('study_materials')
      .update({
        title: title.trim(),
        description: description?.trim() || null,
        medium,
        class: std,
        subject_id: subject_id || null,
        file_url: publicUrl,
      })
      .eq('id', req.params.id)
      .eq('teacher_id', profile.id)
      .select('*, subject:subjects(name)')
      .single();

    if (error) {
      if (filePathKey) await supabase.storage.from('lms-files').remove([filePathKey]);
      return res.status(500).json({ error: error.message });
    }

    res.json({ ...data, subjectName: data.subject?.name || 'General' });
  } catch (error) {
    if (filePathKey) await supabase.storage.from('lms-files').remove([filePathKey]).catch(console.error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const profile = req.userProfile;
    const { data: matData, error: fetchErr } = await supabase
      .from('study_materials')
      .select('id, file_url')
      .eq('id', req.params.id)
      .eq('teacher_id', profile.id)
      .single();

    if (fetchErr || !matData) return res.status(404).json({ error: 'Material not found' });

    const { error } = await supabase
      .from('study_materials')
      .delete()
      .eq('id', req.params.id)
      .eq('teacher_id', profile.id);

    if (error) return res.status(500).json({ error: error.message });

    if (matData.file_url) await deleteSupabaseFile(matData.file_url);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Notices ──────────────────────────────────────────────────────────────────

exports.getNotices = async (req, res) => {
  try {
    const profile = req.userProfile;
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('teacher_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    // Normalize: expose both content and description for frontend compatibility
    res.json((data || []).map((n) => ({ ...n, description: n.content })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createNotice = async (req, res) => {
  try {
    const profile = req.userProfile;
    const { title, description, medium, class: std } = req.body;

    if (!title || !description || !medium || !std) {
      return res.status(400).json({ error: 'Missing required fields: title, description, medium, class' });
    }

    const { data, error } = await supabase
      .from('notices')
      .insert([{
        title: title.trim(),
        content: description.trim(),
        medium,
        class: std,
        teacher_id: profile.id,
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ ...data, description: data.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateNotice = async (req, res) => {
  try {
    const profile = req.userProfile;
    const { title, description, medium, class: std } = req.body;

    if (!title || !description || !medium || !std) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('notices')
      .update({
        title: title.trim(),
        content: description.trim(),
        medium,
        class: std,
      })
      .eq('id', req.params.id)
      .eq('teacher_id', profile.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Notice not found' });

    res.json({ ...data, description: data.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNotice = async (req, res) => {
  try {
    const profile = req.userProfile;
    const { data, error } = await supabase
      .from('notices')
      .delete()
      .eq('id', req.params.id)
      .eq('teacher_id', profile.id)
      .select('id');

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) return res.status(404).json({ error: 'Notice not found' });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Attendance ───────────────────────────────────────────────────────────────

exports.getStudentsForAttendance = async (req, res) => {
  try {
    const { medium, std } = req.query;

    if (!medium || !std) {
      return res.status(400).json({ error: 'Missing required query params: medium, std' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('role', 'STUDENT')
      .eq('status', 'APPROVED')
      .eq('medium', medium)
      .contains('standards', [std]);

    if (error) return res.status(500).json({ error: error.message });

    res.json((data || []).map((d) => ({ ...d, status: 'present' })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendanceHistory = async (req, res) => {
  try {
    const profile = req.userProfile;
    const { data, error } = await supabase
      .from('attendance')
      .select('*, student:profiles(name), subject:subjects(name)')
      .eq('teacher_id', profile.id)
      .order('date', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    // Group by date + class + medium + subject
    const grouped = {};
    for (const row of data || []) {
      const key = `${row.date}_${row.medium}_${row.class}_${row.subject_id || 'null'}`;
      if (!grouped[key]) {
        grouped[key] = {
          id: row.id,
          date: row.date,
          medium: row.medium,
          class: row.class,
          subjectName: row.subject?.name || null,
          present: 0,
          absent: 0,
          students: [],
        };
      }
      if (row.status === 'present') grouped[key].present++;
      else grouped[key].absent++;

      grouped[key].students.push({
        id: row.student_id,
        name: row.student?.name || 'Unknown',
        status: row.status,
        record_id: row.id,
      });
    }

    res.json(Object.values(grouped));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.recordAttendance = async (req, res) => {
  try {
    const profile = req.userProfile;
    const { date, medium, std, subjectName, students } = req.body;

    if (!date || !medium || !std || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'Missing required fields or invalid students array' });
    }
    if (!isValidDate(date)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const subject_id = await resolveSubjectId(subjectName);

    const records = students.map((st) => ({
      student_id: st.id,
      date,
      subject_id: subject_id || null,
      // Normalize to lowercase to match DB constraint
      status: (st.status || 'present').toLowerCase(),
      teacher_id: profile.id,
      medium,
      class: std,
    }));

    const { error } = await supabase.from('attendance').insert(records);
    if (error) return res.status(500).json({ error: error.message });

    res.json({ success: true, message: 'Attendance recorded' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const profile = req.userProfile;
    const { attendance } = req.body;
    const { recordId } = req.params;

    if (!Array.isArray(attendance) || attendance.length === 0) {
      return res.status(400).json({ error: 'Attendance array missing or empty' });
    }

    const { data: refRecord, error: refError } = await supabase
      .from('attendance')
      .select('date, medium, class, subject_id')
      .eq('id', recordId)
      .single();

    if (refError || !refRecord) return res.status(404).json({ error: 'Session not found' });

    const updates = attendance.map((a) => {
      let q = supabase
        .from('attendance')
        .update({ status: (a.status || 'present').toLowerCase() })
        .eq('date', refRecord.date)
        .eq('class', refRecord.class)
        .eq('medium', refRecord.medium)
        .eq('teacher_id', profile.id)
        .eq('student_id', a.id);

      if (refRecord.subject_id === null) {
        q = q.is('subject_id', null);
      } else {
        q = q.eq('subject_id', refRecord.subject_id);
      }
      return q;
    });

    await Promise.all(updates);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
