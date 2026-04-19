# Diagnostic Tools

## Available Scripts

### 1. Check Database Content
```bash
node check-database-content.js
```

**Purpose:** Shows what content exists in the database for each class/medium combination.

**Use when:**
- Student reports not seeing content
- Verifying content was created correctly
- Checking what classes have content available

**Output:**
- Lists all lectures, homework, and study materials
- Groups by class and medium
- Shows student profile details
- Provides diagnosis and solutions

### 2. Debug Student Data
```bash
node debug-student-data.js <student_clerk_id>
```

**Purpose:** Shows what a specific student should see based on their profile.

**Use when:**
- Debugging why a specific student can't see content
- Verifying student profile is correct
- Checking subject filtering

**Output:**
- Student profile details (standards, medium, subjects)
- All content available for their class/medium
- Subject filtering results
- What the student should see

## Common Issues

### Student sees no content
1. Run `node check-database-content.js`
2. Verify content exists for student's class/medium
3. Check student profile has correct `standards` format (e.g., `["8"]` not `["8th"]`)

### Content exists but student doesn't see it
1. Run `node debug-student-data.js <student_id>`
2. Check if standards match (e.g., `["8"]` vs `["8th"]`)
3. Verify medium matches exactly (case-sensitive)
4. Check subject filtering if student has subjects enrolled

## Backend Logs

Watch for these logs when students access their dashboard:

```
[getLectures] Profile: { id: '...', standards: ['8'], medium: 'English', subjects: [] }
[getLectures] Found 2 lectures
```

If "Found 0" but content exists, there's a mismatch in the query parameters.
