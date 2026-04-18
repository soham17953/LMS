import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Megaphone, Bell, BookOpen, AlertTriangle, Calendar, Clock, User, Filter, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Dummy announcements data
const initialAnnouncements = [
  {
    id: 1,
    title: 'Math Test on Monday',
    description: 'A reminder that the Chapter 4 & 5 mathematics open book test will take place this coming Monday. Please prepare accordingly.',
    date: '2026-04-18',
    time: '10:00 AM',
    postBy: 'Mr. Sharma (Admin)',
    tag: 'Exams',
    audience: 'Std 10 - English Medium',
    urgent: true
  },
  {
    id: 2,
    title: 'Science Project Submission',
    description: 'The deadline for submitting your working physics models has been extended to Friday. Late submissions will face a penalty.',
    date: '2026-04-16',
    time: '02:30 PM',
    postBy: 'Mrs. Deshmukh',
    tag: 'Homework',
    audience: 'Std 9 - Marathi Medium',
    urgent: false
  },
  {
    id: 3,
    title: 'Annual Sports Meet Enrollment',
    description: 'Students interested in participating in the annual sports meet should register their names at the main office by end of the week.',
    date: '2026-04-15',
    time: '09:00 AM',
    postBy: 'Admin Office',
    tag: 'General',
    audience: 'All Students',
    urgent: false
  },
  {
    id: 4,
    title: 'Tomorrow Class Cancelled',
    description: 'Due to ongoing local elections, tomorrow\'s morning batch classes will remain cancelled. Regular schedule resumes day after.',
    date: '2026-04-14',
    time: '06:00 PM',
    postBy: 'Admin Office',
    tag: 'Urgent',
    audience: 'All Users',
    urgent: true
  }
];

const categories = ['All', 'Homework', 'General', 'Exams', 'Urgent'];

const Announcements = () => {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter Logic
  const filteredAnnouncements = announcements.filter(ann => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Urgent') return ann.urgent;
    return ann.tag === activeCategory;
  });

  const getTagColor = (tag, isUrgent) => {
    if (isUrgent) return 'bg-red-100 text-red-700 border-red-200';
    switch (tag) {
      case 'Exams': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Homework': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'General': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-primary-100 text-primary-700 border-primary-200';
    }
  };

  const getTagIcon = (tag, isUrgent) => {
    if (isUrgent) return <AlertTriangle className="w-4 h-4" />;
    switch (tag) {
      case 'Exams': return <BookOpen className="w-4 h-4" />;
      case 'Homework': return <Calendar className="w-4 h-4" />;
      case 'General': return <Bell className="w-4 h-4" />;
      default: return <Megaphone className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow pt-16 pb-24">
        
        {/* Page Header */}
        <section className="text-center max-w-4xl mx-auto px-4 sm:px-6 mb-12 relative">
          <div className="absolute top-0 right-10 opacity-10">
             <Megaphone className="w-32 h-32 text-primary-600" />
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6"
          >
            Announcements
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto"
          >
            Stay updated with the latest notices and important updates. Never miss a critical deadline or exam notification again.
          </motion.p>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            
            {/* Filters Section */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 scrollbar-hide">
              <Filter className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                    activeCategory === category 
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md transform scale-105' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Add Announcement CTA (Mock for Teachers/Admin) */}
            <div className="w-full md:w-auto">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm focus:outline-none"
              >
                <Plus className="w-5 h-5" />
                Post Announcement
              </button>
            </div>
          </div>

          {/* Announcements List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredAnnouncements.length > 0 ? (
                filteredAnnouncements.map((ann, index) => (
                  <motion.div 
                    key={ann.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`bg-white rounded-2xl p-6 border-l-4 shadow-sm hover:shadow-lg transition-all ${
                      ann.urgent ? 'border-l-red-500' : 'border-l-primary-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <div className="flex-1">
                         <div className="flex items-center gap-2 mb-2 flex-wrap">
                           <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getTagColor(ann.tag, ann.urgent)}`}>
                             {getTagIcon(ann.tag, ann.urgent)}
                             {ann.urgent ? 'Urgent' : ann.tag}
                           </span>
                           <span className="inline-flex items-center text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                             Target: {ann.audience}
                           </span>
                         </div>
                         <h3 className="text-xl font-bold text-gray-900 leading-tight">
                           {ann.title}
                         </h3>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {ann.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-auto">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{ann.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{ann.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 col-span-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>Posted by: {ann.postBy}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No announcements found</h3>
                  <p className="text-gray-500">Check back later or try changing your filters.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Post Modal (Mockup) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl relative"
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-sans">Post Announcement</h2>
            
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="Announcement title..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white">
                  <option>General</option>
                  <option>Homework</option>
                  <option>Exams</option>
                  <option>Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white">
                  <option>All Users</option>
                  <option>Students</option>
                  <option>Teachers</option>
                  <option>Specific Class (Std / Medium)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows="4" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none  resize-none" placeholder="Provide details..."></textarea>
              </div>
              <button 
                type="submit" 
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors"
              >
                Publish Now
              </button>
            </form>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Announcements;
