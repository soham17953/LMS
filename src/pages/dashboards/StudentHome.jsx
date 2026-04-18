import React from 'react';
import { BookOpen, FileText, ClipboardList, Bell, Clock, CalendarCheck, Megaphone, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const StudentHome = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome, Rahul! 👋</h2>
        <p className="text-gray-500 mt-1">Here is your study overview for today.</p>
      </div>

      {/* Top Cards (1 Row Analytics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Upcoming Lectures</p>
            <h3 className="text-3xl font-extrabold text-gray-900">2</h3>
          </div>
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <BookOpen className="w-7 h-7" />
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Pending HW</p>
            <h3 className="text-3xl font-extrabold text-red-600">1</h3>
          </div>
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
            <FileText className="w-7 h-7" />
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Attendance</p>
            <h3 className="text-3xl font-extrabold text-green-600">95%</h3>
          </div>
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
            <ClipboardList className="w-7 h-7" />
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Notices</p>
            <h3 className="text-3xl font-extrabold text-amber-500">3</h3>
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
             {/* Timeline Item 1 */}
             <div className="flex gap-4">
               <div className="flex flex-col items-center">
                 <div className="w-3 h-3 rounded-full bg-primary-600 mt-1.5"></div>
                 <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
               </div>
               <div className="pb-4">
                 <p className="text-sm font-bold text-gray-500 mb-1">10:00 AM - 11:30 AM</p>
                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors cursor-pointer">
                   <h4 className="font-bold text-gray-900">Mathematics</h4>
                   <p className="text-sm text-gray-600 mt-1">Chapter 4: Quadratic Equations</p>
                   <div className="flex items-center gap-2 mt-3">
                     <span className="text-xs font-semibold px-2 py-1 bg-white border border-gray-200 rounded text-gray-600">Offline</span>
                     <span className="text-xs font-semibold px-2 py-1 bg-white border border-gray-200 rounded text-gray-600">Mr. Sharma</span>
                   </div>
                 </div>
               </div>
             </div>

             {/* Timeline Item 2 */}
             <div className="flex gap-4">
               <div className="flex flex-col items-center">
                 <div className="w-3 h-3 rounded-full bg-primary-600 mt-1.5"></div>
                 <div className="w-0.5 h-full bg-transparent mt-2"></div>
               </div>
               <div>
                 <p className="text-sm font-bold text-gray-500 mb-1">01:00 PM - 02:00 PM</p>
                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors cursor-pointer">
                   <h4 className="font-bold text-gray-900">Science</h4>
                   <p className="text-sm text-gray-600 mt-1">Physics Lab Session</p>
                   <div className="flex items-center gap-2 mt-3">
                     <span className="text-xs font-semibold px-2 py-1 bg-blue-50 border border-blue-100 rounded text-blue-700">Online Link</span>
                     <span className="text-xs font-semibold px-2 py-1 bg-white border border-gray-200 rounded text-gray-600">Mrs. Deshmukh</span>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Section 2: Recent Notices */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
             <h3 className="text-lg font-bold text-gray-900">Recent Notices</h3>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
            {/* Notice 1 (Urgent) */}
            <div className="p-4 hover:bg-red-50/30 rounded-xl transition-colors cursor-pointer border-b border-gray-50 last:border-0 group">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 group-hover:text-red-700 transition-colors">Tomorrow Class Cancelled</h4>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">Due to ongoing local elections...</p>
                  <p className="text-xs text-gray-400 mt-2 font-medium">Today</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-red-600 transform group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            {/* Notice 2 */}
            <div className="p-4 hover:bg-blue-50/30 rounded-xl transition-colors cursor-pointer border-b border-gray-50 last:border-0 group">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">Math Test on Monday</h4>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">Chapter 4 & 5 mathematics open book...</p>
                  <p className="text-xs text-gray-400 mt-2 font-medium">Yesterday</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            <div className="p-4 text-center">
              <Link to="/student/notices" className="text-sm font-bold text-primary-600 hover:text-primary-700 inline-block py-2">
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
