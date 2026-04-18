import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, BookOpen, Clock, MapPin, IndianRupee, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { coursesData } from '../data/courses';

const Courses = () => {
  const [searchParams] = useSearchParams();
  const initialMedium = searchParams.get('medium') === 'marathi' ? 'Marathi' : 'English';
  
  const [activeTab, setActiveTab] = useState(initialMedium);
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    const mediumParam = searchParams.get('medium');
    if (mediumParam === 'marathi') {
      setActiveTab('Marathi');
    } else if (mediumParam === 'english') {
      setActiveTab('English');
    }
  }, [searchParams]);

  const filteredCourses = coursesData.filter((course) => {
    const matchesMedium = course.medium === activeTab;
    const query = searchTerm.toLowerCase();
    const matchesSearch = course.title.toLowerCase().includes(query) || 
                          course.subjects.toLowerCase().includes(query) ||
                          course.medium.toLowerCase().includes(query);
    return matchesMedium && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow pt-16 pb-24">
        
        {/* Page Header */}
        <section className="text-center max-w-4xl mx-auto px-4 sm:px-6 mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6"
          >
            Our Courses
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto"
          >
            Explore our structured coaching programs for English and Marathi medium students. Designed for academic excellence.
          </motion.p>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Tabs Section */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
              <button
                onClick={() => { setActiveTab('English'); setSearchTerm(''); }}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'English' 
                  ? 'bg-primary-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                }`}
              >
                English Medium (8-10)
              </button>
              <button
                onClick={() => { setActiveTab('Marathi'); setSearchTerm(''); }}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'Marathi' 
                  ? 'bg-primary-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                }`}
              >
                Marathi Medium (3-10)
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-16 relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search courses or subjects..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <AnimatePresence mode="popLayout">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <motion.div 
                    key={course.id}
                    layout // ensure smooth structural shifts
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
                  >
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 font-semibold text-xs rounded-full uppercase tracking-wider mb-3">
                        {course.medium} Medium
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {course.title}
                      </h3>
                    </div>
                    
                    <div className="space-y-3 mb-8 flex-grow">
                      <div className="flex items-start gap-3 text-gray-600">
                        <BookOpen className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm leading-tight">{course.subjects}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Clock className="w-5 h-5 text-primary-500 flex-shrink-0" />
                        <span className="text-sm">{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0" />
                        <span className="text-sm">{course.mode}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600 font-semibold">
                        <IndianRupee className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-green-700">{course.fees}</span>
                      </div>
                    </div>
                    
                    <Link 
                      to={`/courses/${course.slug}`} 
                      className="w-full block text-center bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white font-bold py-3 rounded-xl transition-colors duration-300"
                    >
                      View Details
                    </Link>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                   key="empty"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="col-span-full py-20 text-center bg-white rounded-3xl shadow-sm border border-gray-100"
                >
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl font-bold text-gray-900 mb-2">No courses found</p>
                  <p className="text-gray-500">There are no courses matching "{searchTerm}"</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Call-to-Action Help Section */}
          <div className="bg-primary-600 rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Need help choosing the right course?</h2>
              <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
                Our counselors are here to help you understand the curriculum and choose the right path for your academic success.
              </p>
              <Link to="/contact" className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
                <PhoneCall className="w-5 h-5" />
                Contact Us Today
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Courses;
