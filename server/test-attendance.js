/**
 * Test script for attendance endpoints
 * Run with: node server/test-attendance.js
 */

const supabase = require('./config/supabase');

async function testAttendanceQueries() {
  console.log('🧪 Testing Attendance Queries\n');

  try {
    // Test 1: Fetch all attendance records with proper joins
    console.log('Test 1: Fetching all attendance records...');
    const { data: allRecords, error: allError } = await supabase
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
        created_at,
        student:student_id(id, name),
        teacher:teacher_id(id, name),
        subject:subjects(id, name)
      `)
      .order('date', { ascending: false })
      .limit(5);

    if (allError) {
      console.error('❌ Error:', allError.message);
    } else {
      console.log(`✅ Found ${allRecords?.length || 0} records`);
      if (allRecords && allRecords.length > 0) {
        console.log('Sample record:', JSON.stringify(allRecords[0], null, 2));
      }
    }

    // Test 2: Fetch attendance for a specific student
    console.log('\nTest 2: Fetching student attendance...');
    const { data: students, error: studError } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('role', 'STUDENT')
      .eq('status', 'APPROVED')
      .limit(1);

    if (studError || !students || students.length === 0) {
      console.log('⚠️  No approved students found to test');
    } else {
      const studentId = students[0].id;
      console.log(`Testing with student: ${students[0].name} (${studentId})`);

      const { data: studentRecords, error: studentError } = await supabase
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
        .eq('student_id', studentId)
        .order('date', { ascending: false });

      if (studentError) {
        console.error('❌ Error:', studentError.message);
      } else {
        console.log(`✅ Found ${studentRecords?.length || 0} attendance records for student`);
      }
    }

    // Test 3: Fetch attendance for a specific teacher
    console.log('\nTest 3: Fetching teacher attendance history...');
    const { data: teachers, error: teachError } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('role', 'TEACHER')
      .eq('status', 'APPROVED')
      .limit(1);

    if (teachError || !teachers || teachers.length === 0) {
      console.log('⚠️  No approved teachers found to test');
    } else {
      const teacherId = teachers[0].id;
      console.log(`Testing with teacher: ${teachers[0].name} (${teacherId})`);

      const { data: teacherRecords, error: teacherError } = await supabase
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
          created_at,
          student:student_id(id, name),
          subject:subjects(id, name)
        `)
        .eq('teacher_id', teacherId)
        .order('date', { ascending: false });

      if (teacherError) {
        console.error('❌ Error:', teacherError.message);
      } else {
        console.log(`✅ Found ${teacherRecords?.length || 0} attendance records for teacher`);
      }
    }

    // Test 4: Test grouping logic
    console.log('\nTest 4: Testing grouping logic...');
    const { data: groupData, error: groupError } = await supabase
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
        student:student_id(id, name),
        subject:subjects(id, name)
      `)
      .limit(20);

    if (groupError) {
      console.error('❌ Error:', groupError.message);
    } else {
      const grouped = {};
      for (const row of groupData || []) {
        const key = `${row.date}_${row.teacher_id}_${row.medium}_${row.class}_${row.subject_id || 'null'}`;
        if (!grouped[key]) {
          grouped[key] = {
            date: row.date,
            medium: row.medium,
            class: row.class,
            subjectName: row.subject?.name || null,
            present: 0,
            absent: 0,
            total: 0,
          };
        }
        grouped[key].total++;
        if (row.status === 'present') grouped[key].present++;
        else if (row.status === 'absent') grouped[key].absent++;
      }
      console.log(`✅ Grouped ${Object.keys(grouped).length} unique sessions`);
      if (Object.keys(grouped).length > 0) {
        console.log('Sample grouped session:', JSON.stringify(Object.values(grouped)[0], null, 2));
      }
    }

    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testAttendanceQueries();
