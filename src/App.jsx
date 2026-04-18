import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import Announcements from './pages/Announcements';
import Contact from './pages/Contact';
import ApprovalPending from './pages/ApprovalPending';

// Dashboards
import DashboardLayout from './components/dashboard/DashboardLayout';
import AdminHome from './pages/dashboards/AdminHome';
import TeacherHome from './pages/dashboards/TeacherHome';
import StudentHome from './pages/dashboards/StudentHome';

// Admin Sub-pages
import AdminRequests from './pages/dashboards/admin/AdminRequests';
import AdminAnnouncements from './pages/dashboards/admin/AdminAnnouncements';
import AdminNotices from './pages/dashboards/admin/AdminNotices';
import AdminLectures from './pages/dashboards/admin/AdminLectures';
import AdminAttendance from './pages/dashboards/admin/AdminAttendance';
import TeacherLectures from './pages/dashboards/teacher/TeacherLectures';
import TeacherHomework from './pages/dashboards/teacher/TeacherHomework';
import TeacherNotices from './pages/dashboards/teacher/TeacherNotices';
import TeacherAttendance from './pages/dashboards/teacher/TeacherAttendance';
import TeacherMaterials from './pages/dashboards/teacher/TeacherMaterials';
import StudentLectures from './pages/dashboards/student/StudentLectures';
import StudentHomework from './pages/dashboards/student/StudentHomework';
import StudentMaterials from './pages/dashboards/student/StudentMaterials';
import StudentAttendance from './pages/dashboards/student/StudentAttendance';
import StudentNotices from './pages/dashboards/student/StudentNotices';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:slug" element={<CourseDetails />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/approval-pending" element={<ApprovalPending />} />

      {/* Admin Dashboard */}
      <Route path="/admin" element={<DashboardLayout role="admin" />}>
        <Route index element={<AdminHome />} />
        <Route path="requests" element={<AdminRequests />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="notices" element={<AdminNotices />} />
        <Route path="lectures" element={<AdminLectures />} />
        <Route path="attendance" element={<AdminAttendance />} />
      </Route>

      {/* Teacher Dashboard */}
      <Route path="/teacher" element={<DashboardLayout role="teacher" />}>
        <Route index element={<TeacherHome />} />
        <Route path="lectures" element={<TeacherLectures />} />
        <Route path="homework" element={<TeacherHomework />} />
        <Route path="notices" element={<TeacherNotices />} />
        <Route path="attendance" element={<TeacherAttendance />} />
        <Route path="materials" element={<TeacherMaterials />} />
      </Route>

      {/* Student Dashboard */}
      <Route path="/student" element={<DashboardLayout role="student" />}>
        <Route index element={<StudentHome />} />
        <Route path="lectures" element={<StudentLectures />} />
        <Route path="homework" element={<StudentHomework />} />
        <Route path="materials" element={<StudentMaterials />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="notices" element={<StudentNotices />} />
      </Route>
    </Routes>
    </>
  );
}

export default App;
