-- ============================================================================
-- Attendance Schema Verification and Fix Script
-- ============================================================================
-- This script verifies and fixes the attendance table schema
-- Run this if you encounter foreign key or data type issues
-- ============================================================================

-- Step 1: Check current schema
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'attendance'
ORDER BY ordinal_position;

-- Step 2: Check foreign key constraints
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'attendance';

-- Step 3: Verify data types match between tables
SELECT 
  'attendance.student_id' as column_ref,
  a.data_type as attendance_type,
  p.data_type as profiles_type,
  CASE 
    WHEN a.data_type = p.data_type THEN '✓ Match'
    ELSE '✗ Mismatch'
  END as status
FROM information_schema.columns a
CROSS JOIN information_schema.columns p
WHERE a.table_name = 'attendance' 
  AND a.column_name = 'student_id'
  AND p.table_name = 'profiles'
  AND p.column_name = 'id'

UNION ALL

SELECT 
  'attendance.teacher_id' as column_ref,
  a.data_type as attendance_type,
  p.data_type as profiles_type,
  CASE 
    WHEN a.data_type = p.data_type THEN '✓ Match'
    ELSE '✗ Mismatch'
  END as status
FROM information_schema.columns a
CROSS JOIN information_schema.columns p
WHERE a.table_name = 'attendance' 
  AND a.column_name = 'teacher_id'
  AND p.table_name = 'profiles'
  AND p.column_name = 'id';

-- Step 4: Check for orphaned records (students/teachers that don't exist)
SELECT 
  'Orphaned student records' as issue,
  COUNT(*) as count
FROM attendance a
LEFT JOIN profiles p ON a.student_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
  'Orphaned teacher records' as issue,
  COUNT(*) as count
FROM attendance a
LEFT JOIN profiles p ON a.teacher_id = p.id
WHERE p.id IS NULL AND a.teacher_id IS NOT NULL;

-- Step 5: Verify status values are valid
SELECT 
  status,
  COUNT(*) as count
FROM attendance
GROUP BY status
ORDER BY count DESC;

-- Step 6: Check for duplicate attendance records
SELECT 
  date,
  student_id,
  class,
  medium,
  subject_id,
  teacher_id,
  COUNT(*) as duplicate_count
FROM attendance
GROUP BY date, student_id, class, medium, subject_id, teacher_id
HAVING COUNT(*) > 1;

-- ============================================================================
-- FIX SCRIPTS (Only run if issues are found above)
-- ============================================================================

-- Fix 1: Add missing foreign key constraint for student_id (if missing)
-- Uncomment and run if constraint doesn't exist:
/*
ALTER TABLE attendance
ADD CONSTRAINT attendance_student_id_fkey 
FOREIGN KEY (student_id) 
REFERENCES profiles(id)
ON DELETE CASCADE;
*/

-- Fix 2: Add missing foreign key constraint for teacher_id (if missing)
-- Uncomment and run if constraint doesn't exist:
/*
ALTER TABLE attendance
ADD CONSTRAINT attendance_teacher_id_fkey 
FOREIGN KEY (teacher_id) 
REFERENCES profiles(id)
ON DELETE SET NULL;
*/

-- Fix 3: Fix invalid status values
-- Uncomment and run if invalid statuses found:
/*
UPDATE attendance
SET status = 'absent'
WHERE status NOT IN ('present', 'absent', 'late', 'excused');
*/

-- Fix 4: Remove orphaned records (CAREFUL - this deletes data!)
-- Uncomment and run only if you want to remove orphaned records:
/*
DELETE FROM attendance
WHERE student_id NOT IN (SELECT id FROM profiles);

DELETE FROM attendance
WHERE teacher_id IS NOT NULL 
  AND teacher_id NOT IN (SELECT id FROM profiles);
*/

-- Fix 5: Remove duplicate records (keeps the oldest)
-- Uncomment and run only if duplicates found:
/*
DELETE FROM attendance a
USING attendance b
WHERE a.id > b.id
  AND a.date = b.date
  AND a.student_id = b.student_id
  AND a.class = b.class
  AND a.medium = b.medium
  AND COALESCE(a.subject_id::text, 'null') = COALESCE(b.subject_id::text, 'null')
  AND COALESCE(a.teacher_id, 'null') = COALESCE(b.teacher_id, 'null');
*/

-- ============================================================================
-- RECOMMENDED INDEXES (for better performance)
-- ============================================================================

-- Check existing indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'attendance'
ORDER BY indexname;

-- Create indexes if they don't exist
-- Uncomment and run if indexes are missing:
/*
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_teacher_id ON attendance(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_class_medium ON attendance(class, medium);
CREATE INDEX IF NOT EXISTS idx_attendance_subject_id ON attendance(subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_attendance_lookup 
ON attendance(date, class, medium, subject_id, teacher_id);
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count total attendance records
SELECT COUNT(*) as total_records FROM attendance;

-- Count by status
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM attendance
GROUP BY status
ORDER BY count DESC;

-- Count by class and medium
SELECT 
  medium,
  class,
  COUNT(*) as records
FROM attendance
GROUP BY medium, class
ORDER BY medium, class;

-- Recent attendance records
SELECT 
  a.date,
  p_student.name as student_name,
  p_teacher.name as teacher_name,
  a.class,
  a.medium,
  s.name as subject_name,
  a.status
FROM attendance a
LEFT JOIN profiles p_student ON a.student_id = p_student.id
LEFT JOIN profiles p_teacher ON a.teacher_id = p_teacher.id
LEFT JOIN subjects s ON a.subject_id = s.id
ORDER BY a.date DESC, a.created_at DESC
LIMIT 20;

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Uncomment to insert sample attendance records for testing:
/*
-- First, get some student and teacher IDs
WITH sample_students AS (
  SELECT id FROM profiles WHERE role = 'STUDENT' AND status = 'APPROVED' LIMIT 5
),
sample_teacher AS (
  SELECT id FROM profiles WHERE role = 'TEACHER' AND status = 'APPROVED' LIMIT 1
),
sample_subject AS (
  SELECT id FROM subjects LIMIT 1
)
INSERT INTO attendance (student_id, teacher_id, date, status, class, medium, subject_id)
SELECT 
  s.id,
  t.id,
  CURRENT_DATE,
  'present',
  '8',
  'English',
  sub.id
FROM sample_students s
CROSS JOIN sample_teacher t
CROSS JOIN sample_subject sub;
*/
