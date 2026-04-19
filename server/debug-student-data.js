/**
 * Debug script to check student data visibility
 * Run with: node server/debug-student-data.js <student_clerk_id>
 */

const dotenv = require('dotenv');
dotenv.config({ path: './server/.env' });

const supabase = require('./server/config/supabase');

const studentId = process.argv[2];

if (!studentId) {
  console.error('Usage: node server/debug-student-data.js <student_clerk_id>');
  process.exit(1);
}

async function debugStudentData() {
  console.log('\n=== DEBUGGING STUDENT DATA ===\n');
  console.log('Student ID:', studentId);

  // 1. Check student profile
  console.log('\n--- Student Profile ---');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', studentId)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return;
  }

  console.log('Profile:', JSON.stringify(profile, null, 2));

  const standards = Array.isArray(profile.standards) 
    ? profile.standards.map(String) 
    : [];
  const medium = profile.medium;
  const subjects = Array.isArray(profile.subjects) ? profile.subjects : [];

  console.log('\nParsed values:');
  console.log('  Standards:', standards);
  console.log('  Medium:', medium);
  console.log('  Subjects:', subjects);

  if (!standards.length || !medium) {
    console.log('\n⚠️  WARNING: Student has no standards or medium set!');
    return;
  }

  // 2. Check lectures
  console.log('\n--- Lectures ---');
  const { data: lectures, error: lecturesError } = await supabase
    .from('lectures')
    .select('*, subject:subjects(name)')
    .in('class', standards)
    .eq('medium', medium);

  if (lecturesError) {
    console.error('Error fetching lectures:', lecturesError);
  } else {
    console.log(`Found ${lectures.length} lectures for class ${standards.join(',')} and medium ${medium}`);
    lectures.forEach(l => {
      console.log(`  - ${l.title} (${l.subject?.name || 'General'}) - Class ${l.class}`);
    });
  }

  // 3. Check homework
  console.log('\n--- Homework ---');
  const { data: homework, error: homeworkError } = await supabase
    .from('homework')
    .select('*, subject:subjects(name)')
    .in('class', standards)
    .eq('medium', medium);

  if (homeworkError) {
    console.error('Error fetching homework:', homeworkError);
  } else {
    console.log(`Found ${homework.length} homework items for class ${standards.join(',')} and medium ${medium}`);
    homework.forEach(h => {
      console.log(`  - ${h.title} (${h.subject?.name || 'General'}) - Class ${h.class}`);
    });
  }

  // 4. Check study materials
  console.log('\n--- Study Materials ---');
  const { data: materials, error: materialsError } = await supabase
    .from('study_materials')
    .select('*, subject:subjects(name)')
    .in('class', standards)
    .eq('medium', medium);

  if (materialsError) {
    console.error('Error fetching materials:', materialsError);
  } else {
    console.log(`Found ${materials.length} study materials for class ${standards.join(',')} and medium ${medium}`);
    materials.forEach(m => {
      console.log(`  - ${m.title} (${m.subject?.name || 'General'}) - Class ${m.class}`);
    });
  }

  // 5. Check subject filtering
  if (subjects.length > 0) {
    console.log('\n--- Subject Filtering ---');
    const { data: subjectData } = await supabase
      .from('subjects')
      .select('id, name')
      .in('name', subjects);

    console.log('Student enrolled subjects:', subjects);
    console.log('Subject IDs:', subjectData?.map(s => `${s.name}:${s.id}`).join(', '));

    if (subjectData && subjectData.length > 0) {
      const subjectIds = subjectData.map(s => s.id);
      
      // Check filtered lectures
      const { data: filteredLectures } = await supabase
        .from('lectures')
        .select('*, subject:subjects(name)')
        .in('class', standards)
        .eq('medium', medium)
        .or(`subject_id.in.(${subjectIds.join(',')}),subject_id.is.null`);

      console.log(`\nFiltered lectures (with subject filter): ${filteredLectures?.length || 0}`);
    }
  }

  console.log('\n=== DEBUG COMPLETE ===\n');
}

debugStudentData().catch(console.error);
