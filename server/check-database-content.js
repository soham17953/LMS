/**
 * Check what content exists in the database
 * Run with: node check-database-content.js
 */

const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const supabase = require('./config/supabase');

async function checkContent() {
  console.log('\n=== CHECKING DATABASE CONTENT ===\n');

  // Check lectures
  console.log('--- LECTURES ---');
  const { data: lectures, error: lecturesError } = await supabase
    .from('lectures')
    .select('id, title, class, medium')
    .limit(10);

  if (lecturesError) {
    console.error('Error:', lecturesError);
  } else if (lectures.length === 0) {
    console.log('❌ No lectures found in database');
  } else {
    console.log(`✅ Found ${lectures.length} lectures (showing first 10):`);
    lectures.forEach(l => {
      console.log(`   - "${l.title}" | Class: "${l.class}" | Medium: "${l.medium}"`);
    });
  }

  // Check homework
  console.log('\n--- HOMEWORK ---');
  const { data: homework, error: homeworkError } = await supabase
    .from('homework')
    .select('id, title, class, medium')
    .limit(10);

  if (homeworkError) {
    console.error('Error:', homeworkError);
  } else if (homework.length === 0) {
    console.log('❌ No homework found in database');
  } else {
    console.log(`✅ Found ${homework.length} homework items (showing first 10):`);
    homework.forEach(h => {
      console.log(`   - "${h.title}" | Class: "${h.class}" | Medium: "${h.medium}"`);
    });
  }

  // Check study materials
  console.log('\n--- STUDY MATERIALS ---');
  const { data: materials, error: materialsError } = await supabase
    .from('study_materials')
    .select('id, title, class, medium')
    .limit(10);

  if (materialsError) {
    console.error('Error:', materialsError);
  } else if (materials.length === 0) {
    console.log('❌ No study materials found in database');
  } else {
    console.log(`✅ Found ${materials.length} study materials (showing first 10):`);
    materials.forEach(m => {
      console.log(`   - "${m.title}" | Class: "${m.class}" | Medium: "${m.medium}"`);
    });
  }

  // Group by class and medium
  console.log('\n--- CONTENT SUMMARY BY CLASS/MEDIUM ---');
  
  const { data: lectureGroups } = await supabase
    .from('lectures')
    .select('class, medium');
  
  const { data: homeworkGroups } = await supabase
    .from('homework')
    .select('class, medium');
  
  const { data: materialGroups } = await supabase
    .from('study_materials')
    .select('class, medium');

  const allGroups = [
    ...(lectureGroups || []),
    ...(homeworkGroups || []),
    ...(materialGroups || [])
  ];

  const groupMap = {};
  allGroups.forEach(item => {
    const key = `${item.class}|${item.medium}`;
    groupMap[key] = (groupMap[key] || 0) + 1;
  });

  if (Object.keys(groupMap).length === 0) {
    console.log('❌ No content found in any table');
  } else {
    console.log('Content exists for these class/medium combinations:');
    Object.entries(groupMap).forEach(([key, count]) => {
      const [cls, med] = key.split('|');
      console.log(`   - Class: "${cls}" | Medium: "${med}" | Total items: ${count}`);
    });
  }

  // Check student profile
  console.log('\n--- STUDENT PROFILE ---');
  const studentId = 'user_3CaDOA9Mgw2RZ8rzXZt27D1kLqe';
  const { data: profile } = await supabase
    .from('profiles')
    .select('standards, medium, subjects')
    .eq('id', studentId)
    .single();

  if (profile) {
    console.log('Student is looking for:');
    console.log(`   - Standards: ${JSON.stringify(profile.standards)}`);
    console.log(`   - Medium: "${profile.medium}"`);
    console.log(`   - Subjects: ${JSON.stringify(profile.subjects)}`);
  }

  console.log('\n=== DIAGNOSIS ===');
  if (Object.keys(groupMap).length === 0) {
    console.log('🔴 ISSUE: No content exists in the database at all.');
    console.log('   SOLUTION: Create content using teacher/admin dashboard.');
  } else if (profile) {
    const studentStandards = profile.standards || [];
    const studentMedium = profile.medium;
    let foundMatch = false;

    studentStandards.forEach(std => {
      const key = `${std}|${studentMedium}`;
      if (groupMap[key]) {
        foundMatch = true;
      }
    });

    if (!foundMatch) {
      console.log('🟡 ISSUE: Content exists but not for this student\'s class/medium.');
      console.log('   Student needs: Class in', JSON.stringify(studentStandards), 'AND Medium:', studentMedium);
      console.log('   Available combinations:', Object.keys(groupMap).map(k => {
        const [c, m] = k.split('|');
        return `Class "${c}" + Medium "${m}"`;
      }).join(', '));
      console.log('\n   SOLUTIONS:');
      console.log('   1. Create content for the student\'s class/medium');
      console.log('   2. OR update student profile to match existing content:');
      const firstKey = Object.keys(groupMap)[0];
      const [firstClass, firstMedium] = firstKey.split('|');
      console.log(`      UPDATE profiles SET standards = '["${firstClass}"]'::jsonb, medium = '${firstMedium}' WHERE id = '${studentId}';`);
    }
  }

  console.log('\n=== CHECK COMPLETE ===\n');
}

checkContent().catch(console.error);
