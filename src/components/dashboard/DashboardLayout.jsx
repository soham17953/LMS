import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Megaphone, BookOpen, Clock, Users, User, FileText, Briefcase, GraduationCap, 
  LayoutDashboard, ClipboardList, BookMarked, Bell, LogOut, Menu, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const sidebarConfig = {
  admin: [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard /> },
    { name: 'Requests', path: '/admin/requests', icon: <User /> },
    { name: 'Announcements', path: '/admin/announcements', icon: <Megaphone /> },
    { name: 'Notices', path: '/admin/notices', icon: <Bell /> },
    { name: 'Lectures', path: '/admin/lectures', icon: <BookOpen /> },
    { name: 'Attendance', path: '/admin/attendance', icon: <ClipboardList /> },
  ],
  teacher: [
    { name: 'Dashboard', path: '/teacher', icon: <LayoutDashboard /> },
    { name: 'Lectures', path: '/teacher/lectures', icon: <BookOpen /> },
    { name: 'Homework', path: '/teacher/homework', icon: <FileText /> },
    { name: 'Notices', path: '/teacher/notices', icon: <Bell /> },
    { name: 'Attendance', path: '/teacher/attendance', icon: <ClipboardList /> },
    { name: 'Study Material', path: '/teacher/materials', icon: <BookMarked /> },
  ],
  student: [
    { name: 'Dashboard', path: '/student', icon: <LayoutDashboard /> },
    { name: 'Lectures', path: '/student/lectures', icon: <BookOpen /> },
    { name: 'Homework', path: '/student/homework', icon: <FileText /> },
    { name: 'Study Material', path: '/student/materials', icon: <BookMarked /> },
    { name: 'Attendance', path: '/student/attendance', icon: <ClipboardList /> },
    { name: 'Notices', path: '/student/notices', icon: <Bell /> },
  ]
};

const DashboardLayout = ({ role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const links = sidebarConfig[role] || sidebarConfig.student;

  const handleLogout = () => {
    // Navigate home for now
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform lg:translate-x-0 lg:static lg:block flex-shrink-0 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col pt-5 pb-4 overflow-y-auto">
          {/* Logo Handle */}
          <div className="flex items-center justify-between px-6 mb-8">
             <div className="flex items-center gap-2">
                 <div className="bg-primary-600 p-2 rounded-lg">
                   <BookOpen className="h-6 w-6 text-white" />
                 </div>
                 <span className="font-bold text-xl text-gray-900 tracking-tight">Shree Classes</span>
             </div>
             <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-900">
               <X className="w-6 h-6" />
             </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-2 px-4 space-y-1 flex-1">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <NavLink
                  end={link.path.endsWith('admin') || link.path.endsWith('teacher') || link.path.endsWith('student')}
                  key={link.name}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    isActive 
                    ? 'bg-primary-50 text-primary-700 font-bold' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {React.cloneElement(link.icon, {
                    className: `mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'}`
                  })}
                  {link.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        
        {/* Topbar */}
        <header className="flex-shrink-0 relative h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30">
           <div className="flex items-center">
             <button
               className="lg:hidden text-gray-500 hover:text-gray-900 focus:outline-none mr-4"
               onClick={() => setSidebarOpen(true)}
             >
               <Menu className="w-6 h-6" />
             </button>
             <h1 className="text-xl font-bold text-gray-900 hidden sm:block capitalize">
               {role} Panel
             </h1>
           </div>

           <div className="flex items-center gap-4">
             <button className="text-gray-400 hover:text-gray-500 relative">
               <Bell className="w-6 h-6" />
               <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
             </button>
             <div className="w-px h-6 bg-gray-200"></div>
             <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold uppercase overflow-hidden ring-2 ring-white border border-gray-100">
                  {role.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-bold text-gray-700 leading-none capitalize">{role}</p>
                </div>
             </div>
             <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 ml-2" title="Logout">
                <LogOut className="w-5 h-5" />
             </button>
           </div>
        </header>

        {/* Dashboard Main Outlet Flow */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8">
           <Outlet />
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;
