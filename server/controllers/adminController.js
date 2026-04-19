const supabase = require('../config/supabase');

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      { count: studentCount },
      { count: teacherCount },
      { count: pendingCount },
      { count: announcementCount },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'STUDENT'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'TEACHER'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'PENDING').neq('role', 'ADMIN'),
      // Announcements stored as notices with class='ALL'
      supabase.from('notices').select('*', { count: 'exact', head: true }).eq('class', 'ALL'),
    ]);

    res.json({
      studentCount: studentCount || 0,
      teacherCount: teacherCount || 0,
      pendingCount: pendingCount || 0,
      announcementCount: announcementCount || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Announcements (stored as notices with class='ALL', medium='ALL') ─────────

exports.getAnnouncements = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('class', 'ALL')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json((data || []).map((n) => ({ ...n, description: n.content })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const profile = req.userProfile;
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const { data, error } = await supabase
      .from('notices')
      .insert([{
        title: title.trim(),
        content: description.trim(),
        class: 'ALL',
        medium: 'ALL',
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

exports.updateAnnouncement = async (req, res) => {
  try {
    const profile = req.userProfile;
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const { data, error } = await supabase
      .from('notices')
      .update({ title: title.trim(), content: description.trim() })
      .eq('id', req.params.id)
      .eq('class', 'ALL')
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Announcement not found' });

    res.json({ ...data, description: data.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notices')
      .delete()
      .eq('id', req.params.id)
      .eq('class', 'ALL')
      .select('id');

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) return res.status(404).json({ error: 'Announcement not found' });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Notices (all teacher notices, admin can view/edit/delete) ────────────────

exports.getAllNotices = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notices')
      .select('*, teacher:profiles(name)')
      .neq('class', 'ALL') // exclude announcements
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(
      (data || []).map((n) => ({
        ...n,
        description: n.content,
        teacherName: n.teacher?.name || 'Unknown',
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateNotice = async (req, res) => {
  try {
    const { title, description, medium, class: std } = req.body;

    if (!title || !description || !medium || !std) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('notices')
      .update({ title: title.trim(), content: description.trim(), medium, class: std })
      .eq('id', req.params.id)
      .select('*, teacher:profiles(name)')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Notice not found' });

    res.json({ ...data, description: data.content, teacherName: data.teacher?.name || 'Unknown' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNotice = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notices')
      .delete()
      .eq('id', req.params.id)
      .select('id');

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) return res.status(404).json({ error: 'Notice not found' });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Lectures (admin sees all, can create/edit/delete) ────────────────────────

exports.getAllLectures = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('lectures')
      .select('*, subject:subjects(name), teacher:profiles(name)')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(
      (data || []).map((l) => ({
        ...l,
        subjectName: l.subject?.name || 'General',
        teacherName: l.teacher?.name || 'Unknown',
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createLecture = async (req, res) => {
  try {
    const profile = req.userProfile;
    const { title, description, subjectName, date, time, medium, class: std } = req.body;

    if (!title || !medium || !std || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let subject_id = null;
    if (subjectName) {
      const { data: subData } = await supabase
        .from('subjects')
        .select('id')
        .ilike('name', subjectName.trim())
        .limit(1);
      if (subData && subData.length > 0) {
        subject_id = subData[0].id;
      } else {
        const { data: created } = await supabase
          .from('subjects')
          .insert([{ name: subjectName.trim() }])
          .select('id')
          .single();
        subject_id = created?.id || null;
      }
    }

    const { data, error } = await supabase
      .from('lectures')
      .insert([{
        title: title.trim(),
        description: description?.trim() || null,
        subject_id,
        medium,
        class: std,
        teacher_id: profile.id,
      }])
      .select('*, subject:subjects(name), teacher:profiles(name)')
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.json({
      ...data,
      subjectName: data.subject?.name || 'General',
      teacherName: data.teacher?.name || 'Unknown',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateLecture = async (req, res) => {
  try {
    const { title, description, subjectName, medium, class: std } = req.body;

    if (!title || !medium || !std) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let subject_id = null;
    if (subjectName) {
      const { data: subData } = await supabase
        .from('subjects')
        .select('id')
        .ilike('name', subjectName.trim())
        .limit(1);
      if (subData && subData.length > 0) {
        subject_id = subData[0].id;
      } else {
        const { data: created } = await supabase
          .from('subjects')
          .insert([{ name: subjectName.trim() }])
          .select('id')
          .single();
        subject_id = created?.id || null;
      }
    }

    const { data, error } = await supabase
      .from('lectures')
      .update({ title: title.trim(), description: description?.trim() || null, subject_id, medium, class: std })
      .eq('id', req.params.id)
      .select('*, subject:subjects(name), teacher:profiles(name)')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Lecture not found' });

    res.json({
      ...data,
      subjectName: data.subject?.name || 'General',
      teacherName: data.teacher?.name || 'Unknown',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteLecture = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('lectures')
      .delete()
      .eq('id', req.params.id)
      .select('id');

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) return res.status(404).json({ error: 'Lecture not found' });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Attendance (admin sees all records) ─────────────────────────────────────

exports.getAllAttendance = async (req, res) => {
  try {
    // Fetch all attendance records
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
        teacher_id,
        created_at
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('[getAllAttendance] Query error:', error);
      return res.status(500).json({ error: error.message });
    }

    // Fetch student names separately
    const studentIds = [...new Set((data || []).map(r => r.student_id))];
    const { data: students } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', studentIds);
    
    const studentMap = {};
    (students || []).forEach(s => { studentMap[s.id] = s.name; });

    // Fetch teacher names separately
    const teacherIds = [...new Set((data || []).map(r => r.teacher_id).filter(Boolean))];
    const { data: teachers } = teacherIds.length > 0
      ? await supabase.from('profiles').select('id, name').in('id', teacherIds)
      : { data: [] };
    
    const teacherMap = {};
    (teachers || []).forEach(t => { teacherMap[t.id] = t.name; });

    // Fetch subject names separately
    const subjectIds = [...new Set((data || []).map(r => r.subject_id).filter(Boolean))];
    const { data: subjects } = subjectIds.length > 0 
      ? await supabase.from('subjects').select('id, name').in('id', subjectIds)
      : { data: [] };
    
    const subjectMap = {};
    (subjects || []).forEach(s => { subjectMap[s.id] = s.name; });

    // Group by date + teacher + class + medium + subject
    const grouped = {};
    for (const row of data || []) {
      const key = `${row.date}_${row.teacher_id}_${row.medium}_${row.class}_${row.subject_id || 'null'}`;
      if (!grouped[key]) {
        grouped[key] = {
          id: row.id,
          date: row.date,
          medium: row.medium,
          class: row.class,
          subjectName: row.subject_id ? subjectMap[row.subject_id] || null : null,
          teacherName: row.teacher_id ? teacherMap[row.teacher_id] || 'Unknown' : 'Unknown',
          teacher_id: row.teacher_id,
          present: 0,
          absent: 0,
          total: 0,
          students: [],
        };
      }
      grouped[key].total++;
      if (row.status === 'present') grouped[key].present++;
      else if (row.status === 'absent') grouped[key].absent++;

      grouped[key].students.push({
        id: row.student_id,
        name: studentMap[row.student_id] || 'Unknown',
        status: row.status,
        record_id: row.id,
      });
    }

    res.json(Object.values(grouped));
  } catch (error) {
    console.error('[getAllAttendance] Exception:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateAttendanceRecord = async (req, res) => {
  try {
    const { students } = req.body; // [{ id: student_id, status: 'present'|'absent' }]
    const { recordId } = req.params;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'Students array is required' });
    }

    // Get reference record to find the session
    const { data: refRecord, error: refError } = await supabase
      .from('attendance')
      .select('date, medium, class, subject_id, teacher_id')
      .eq('id', recordId)
      .single();

    if (refError || !refRecord) return res.status(404).json({ error: 'Session not found' });

    const updates = students.map((s) => {
      let q = supabase
        .from('attendance')
        .update({ status: (s.status || 'present').toLowerCase() })
        .eq('date', refRecord.date)
        .eq('class', refRecord.class)
        .eq('medium', refRecord.medium)
        .eq('teacher_id', refRecord.teacher_id)
        .eq('student_id', s.id);

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
