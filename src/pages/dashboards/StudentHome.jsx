import React, { useEffect, useState } from 'react';
import { BookOpen, FileText, ClipboardList, Bell, Megaphone, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { AuthService } from '../../lib/authService';

const StudentHome = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    upcomingLectures: 0,
    pendingHomework: 0,
    attendanceRate: 'NA',
    noticesCount: 0,
    recentNotices: [],
    todayLectures: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();

      const [lectures, homework, attendance, notices] = await Promise.all([
        AuthService.getStudentLectures(token),
        AuthService.getStudentHomework(token),
        AuthService.getStudentAttendance(token),
        AuthService.getStudentNotices(token),
      ]);

      const pendingHW = homework.filter((hw) => !hw.isSubmitted).length;

      const totalDays = attendance.length;
      const presentDays = attendance.filter((a) => a.status === 'present').length;
      const attendanceRate = totalDays === 0 ? 'NA' : `${Math.round((presentDays / totalDays) * 100)}%`;

      // Filter lectures scheduled for today using scheduled_at
      const todayStr = new Date().toISOString().split('T')[0];
      const todayLectures = lectures
        .filter((l) => l.scheduled_at && l.scheduled_at.startsWith(todayStr))
        .slice(0, 3);

      setDashboardData({
        upcomingLectures: lectures.length,
        pendingHomework: pendingHW,
        attendanceRate,
        noticesCount: notices.length,
        recentNotices: notices.slice(0, 3),
        todayLectures,
      });
    } catch (error) {
      console.error('Failed to load dashboard', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ label, value, color, bg, icon }) => (
    <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">{label}</p>
        <h3 className={`text-3xl font-extrabold ${color}`}>
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-gray-300" /> : value}
        </h3>
      </div>
      <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Welcome, {user?.firstName || 'Student'}! 👋
        </h2>
        <p className="text-gray-500 mt-1">Here is your study overview for today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Lectures" value={dashboardData.upcomingLectures} color="text-gray-900" bg="bg-blue-50" icon={<BookOpen className="w-7 h-7 text-blue-600" />} />
        <StatCard label="Pending HW" value={dashboardData.pendingHomework} color="text-red-600" bg="bg-red-50" icon={<FileText className="w-7 h-7 text-red-600" />} />
        <StatCard label="Attendance Rate" value={dashboardData.attendanceRate} color="text-green-600" bg="bg-green-50" icon={<ClipboardList className="w-7 h-7 text-green-600" />} />
        <StatCard label="Notices" value={dashboardData.noticesCount} color="text-amber-500" bg="bg-amber-50" icon={<Bell className="w-7 h-7 text-amber-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Today's Schedule */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900">Today's Schedule</h3>
            <Link to="/student/lectures" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              All Lectures
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
              </div>
            ) : dashboardData.todayLectures.length === 0 ? (
              <p className="text-gray-500 text-center p-4 text-sm">No lectures scheduled for today</p>
            ) : (
              dashboardData.todayLectures.map((lecture, i) => (
                <div key={lecture.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary-600 mt-1.5 flex-shrink-0"></div>
                    {i !== dashboardData.todayLectures.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  <div className="pb-4 flex-1">
                    <p className="text-xs font-bold text-gray-400 mb-1">
                      {lecture.scheduled_at
                        ? new Date(lecture.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Scheduled'}
                    </p>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors w-full">
                      <h4 className="font-bold text-gray-900">{lecture.title}</h4>
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {lecture.subjectName || lecture.description || '—'}
                      </p>
                      <span className="mt-2 inline-block text-xs font-semibold px-2 py-1 bg-blue-50 border border-blue-100 rounded text-blue-700">
                        Class {lecture.class}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Notices */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900">Recent Notices</h3>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
              </div>
            ) : dashboardData.recentNotices.length === 0 ? (
              <p className="text-gray-500 text-center p-4 text-sm">No active notices</p>
            ) : (
              dashboardData.recentNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="p-4 hover:bg-blue-50/30 rounded-xl transition-colors cursor-pointer border-b border-gray-50 last:border-0 group"
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                        {notice.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{notice.content}</p>
                      <p className="text-xs text-gray-400 mt-2 font-medium">
                        {new Date(notice.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </div>
              ))
            )}

            <div className="p-4 text-center border-t border-gray-50">
              <Link to="/student/notices" className="text-sm font-bold text-primary-600 hover:text-primary-700 inline-block">
                View All Notices
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentHome;
