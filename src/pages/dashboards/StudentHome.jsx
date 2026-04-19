import React, { useEffect, useState } from 'react';
import { BookOpen, FileText, ClipboardList, Bell, Clock, CalendarCheck, Megaphone, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { AuthService } from '../../lib/authService';

const StudentHome = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  
  const [dashboardData, setDashboardData] = useState({
    upcomingLectures: 0,
    pendingHomework: 0,
    attendanceRate: '0%',
    noticesCount: 0,
    recentNotices: [],
    todayLectures: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = await getToken();
      
      const [lectures, homework, attendance, notices] = await Promise.all([
        AuthService.getStudentLectures(token),
        AuthService.getStudentHomework(token),
        AuthService.getStudentAttendance(token),
        AuthService.getStudentNotices(token)
      ]);


      // Calculate Pending HW
      const pendingHW = homework.filter(hw => !hw.isSubmitted).length;

      // Calculate Attendance %
      const totalDays = attendance.length;
      const presentDays = attendance.filter(a => a.status === 'present').length;
      const attendanceRate = totalDays === 0 ? 'NA' : `${Math.round((presentDays / totalDays) * 100)}%`;

      setDashboardData({
        upcomingLectures: lectures.length,
        pendingHomework: pendingHW,
        attendanceRate,
        noticesCount: notices.length,
        recentNotices: notices.slice(0, 3), // Top 3
        todayLectures: lectures.slice(0, 2) // Just mock top 2 as today for demo
      });
    } catch (error) {
      console.error('Failed to load dashboard', error);
      // Non-blocking — dashboard still renders with defaults
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome, {user?.firstName || 'Student'}! 👋</h2>
        <p className="text-gray-500 mt-1">Here is your study overview for today.</p>
      </div>

      {/* Top Cards (1 Row Analytics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Upcoming Lectures</p>
            <h3 className="text-3xl font-extrabold text-gray-900">{dashboardData.upcomingLectures}</h3>
          </div>
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <BookOpen className="w-7 h-7" />
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Pending HW</p>
            <h3 className="text-3xl font-extrabold text-red-600">{dashboardData.pendingHomework}</h3>
          </div>
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
            <FileText className="w-7 h-7" />
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Attendance Rate</p>
            <h3 className="text-3xl font-extrabold text-green-600">{dashboardData.attendanceRate}</h3>
          </div>
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
            <ClipboardList className="w-7 h-7" />
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Notices</p>
            <h3 className="text-3xl font-extrabold text-amber-500">{dashboardData.noticesCount}</h3>
          </div>
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <Bell className="w-7 h-7" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Section 1: Today's Schedule */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900">Today's Schedule</h3>
            <Link to="/student/lectures" className="text-sm font-medium text-primary-600 hover:text-primary-700">Full Timetable</Link>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
             {dashboardData.todayLectures.length === 0 ? (
               <p className="text-gray-500 text-center p-4">No lectures scheduled today</p>
             ) : (
               dashboardData.todayLectures.map((lecture, i) => (
                 <div key={lecture.id} className="flex gap-4">
                   <div className="flex flex-col items-center">
                     <div className="w-3 h-3 rounded-full bg-primary-600 mt-1.5"></div>
                     {i !== dashboardData.todayLectures.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-2"></div>}
                   </div>
                   <div className="pb-4 flex-1">
                     <p className="text-sm font-bold text-gray-500 mb-1">Upcoming</p>
                     <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors cursor-pointer w-full">
                       <h4 className="font-bold text-gray-900">{lecture.title}</h4>
                       <p className="text-sm text-gray-600 mt-1 truncate">{lecture.description || lecture.subjectName}</p>
                       <div className="flex items-center gap-2 mt-3">
                         <span className="text-xs font-semibold px-2 py-1 bg-blue-50 border border-blue-100 rounded text-blue-700">Class {lecture.class}</span>
                       </div>
                     </div>
                   </div>
                 </div>
               ))
             )}
          </div>
        </div>

        {/* Section 2: Recent Notices */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
             <h3 className="text-lg font-bold text-gray-900">Recent Notices</h3>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
            {dashboardData.recentNotices.length === 0 ? (
               <p className="text-gray-500 text-center p-4">No active notices</p>
            ) : (
              dashboardData.recentNotices.map((notice) => (
                <div key={notice.id} className="p-4 hover:bg-blue-50/30 rounded-xl transition-colors cursor-pointer border-b border-gray-50 last:border-0 group">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{notice.title}</h4>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{notice.content}</p>
                      <p className="text-xs text-gray-400 mt-2 font-medium">{new Date(notice.created_at).toLocaleDateString()}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))
            )}

            <div className="p-4 text-center border-t border-gray-50">
              <Link to="/student/notices" className="text-sm font-bold text-primary-600 hover:text-primary-700 inline-block">
                View Board
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentHome;
