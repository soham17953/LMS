import React, { useEffect, useState } from 'react';
import { BookOpen, FileText, ClipboardList, Bell, Calendar, Clock, Video, User, Megaphone, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { AuthService } from '../../lib/authService';

const TeacherHome = () => {
  const { getToken } = useAuth();
  const [stats, setStats] = useState({ lecturesToday: 0, homeworkOut: 0, avgAttendance: 100, noticesCount: 0 });
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const [dashboardStats, upcomingLectures] = await Promise.all([
        AuthService.getTeacherDashboard(token),
        AuthService.getTeacherLectures(token)
      ]);
      setStats(dashboardStats);
      // Get max 3 lectures 
      setLectures(upcomingLectures.slice(0, 3));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Teacher Dashboard</h2>
        <p className="text-gray-500 mt-1">Manage your classes, homework, and students efficiently.</p>
      </div>

      {/* Top Cards (1 Row Analytics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between group cursor-pointer">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Lectures Today</p>
            <h3 className="text-3xl font-extrabold text-gray-900">{stats.lecturesToday}</h3>
          </div>
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <BookOpen className="w-7 h-7" />
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between group cursor-pointer">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Homework</p>
            <h3 className="text-3xl font-extrabold text-gray-900">{stats.homeworkOut}</h3>
          </div>
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <FileText className="w-7 h-7" />
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between group cursor-pointer">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Avg Attendance</p>
            <h3 className="text-3xl font-extrabold text-gray-900">{stats.avgAttendance}%</h3>
          </div>
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
            <ClipboardList className="w-7 h-7" />
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between group cursor-pointer">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Active Notices</p>
            <h3 className="text-3xl font-extrabold text-gray-900">{stats.noticesCount}</h3>
          </div>
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Bell className="w-7 h-7" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Section 1: Upcoming Lectures */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900">Upcoming Lectures</h3>
            <Link to="/teacher/lectures" className="text-sm font-medium text-primary-600 hover:text-primary-700">Manage All</Link>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
            {lectures.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No scheduled lectures</div>
            ) : (
              lectures.map((lecture) => (
                <div key={lecture.id} className="p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 flex-shrink-0">
                    <span className="font-bold">{lecture.subjectName?.[0] || 'L'}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{lecture.subjectName} - {lecture.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1"><User className="w-4 h-4" /> Class {lecture.class} ({lecture.medium})</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md mb-1">
                      <Clock className="w-4 h-4" /> {lecture.scheduled_at ? new Date(lecture.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">Scheduled</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 2: Quick Actions (No direct forms) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Link to="/teacher/lectures" className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-primary-200 transition-all flex flex-col items-center justify-center text-center gap-3 group">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <span className="font-bold text-gray-700">Schedule Lecture</span>
            </Link>
            
            <Link to="/teacher/homework" className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-primary-200 transition-all flex flex-col items-center justify-center text-center gap-3 group">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <span className="font-bold text-gray-700">Assign Homework</span>
            </Link>

            <Link to="/teacher/attendance" className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-primary-200 transition-all flex flex-col items-center justify-center text-center gap-3 group">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <ClipboardList className="w-6 h-6" />
              </div>
              <span className="font-bold text-gray-700">Mark Attendance</span>
            </Link>

            <Link to="/teacher/notices" className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-primary-200 transition-all flex flex-col items-center justify-center text-center gap-3 group">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Megaphone className="w-6 h-6" />
              </div>
              <span className="font-bold text-gray-700">Add Notice</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherHome;
