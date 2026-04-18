import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { coursesData } from '../data/courses';
import { motion } from 'framer-motion';
import { BookOpen, Clock, MapPin, IndianRupee, ChevronRight, CheckCircle, GraduationCap, ClipboardList, Megaphone, CalendarCheck, Users, Search } from 'lucide-react';

const CourseDetails = () => {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on load
    const foundCourse = coursesData.find((c) => c.slug === slug);
    setTimeout(() => {
      setCourse(foundCourse);
      setLoading(false);
    }, 400); // Simulate network load
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center text-center p-6">
          <Search className="w-16 h-16 text-gray-300 mb-6" />
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Course Not Found</h1>
          <p className="text-gray-500 mb-8 max-w-md">We couldn't locate the specific course you're looking for. It may have been removed or the URL is incorrect.</p>
          <Link to="/courses" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-xl transition-all">
            Browse All Courses
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Dynamic header description based on medium
  const headerDescription = course.medium === 'English'
    ? 'Comprehensive coaching program designed for English Medium students from Std 8 to 10, focusing on strong fundamentals and board exam preparation.'
    : 'Structured coaching program for Marathi Medium students from Std 3 to 10, focusing on concept clarity and academic growth.';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/courses" className="hover:text-primary-600 transition-colors">Courses</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-semibold">{course.title}</span>
          </nav>

          {/* Header Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-primary-600 rounded-3xl p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden mb-12"
          >
            {/* Decals */}
            <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>

            <div className="relative z-10 max-w-3xl">
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold tracking-widest uppercase mb-4 shadow-sm border border-white/20">
                {course.medium} Medium Focus
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                {course.title}
              </h1>
              <p className="text-primary-100 text-lg lg:text-xl leading-relaxed max-w-3xl mb-2">
                {headerDescription}
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">

            {/* Left Content Area (2-Col Ratio) */}
            <div className="lg:col-span-2 space-y-10">

              <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Description</h2>
                <div className="w-12 h-1 bg-primary-500 rounded-full mb-6"></div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  This course is designed to help students build strong academic foundations, improve conceptual understanding, and excel in examinations. With structured lectures, regular assessments, and expert guidance, students receive complete academic support throughout the year.
                </p>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">What You Will Learn</h3>
                <div className="w-12 h-1 bg-primary-500 rounded-full mb-6"></div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Strong subject fundamentals",
                    "Exam-oriented preparation",
                    "Regular tests and revisions",
                    "Doubt-solving sessions",
                    "Time management strategies"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700 font-medium">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Program Features</h3>
                <div className="w-12 h-1 bg-primary-500 rounded-full mb-6"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-2xl">
                    <ClipboardList className="w-8 h-8 text-primary-500 mb-3" />
                    <span className="font-bold text-gray-900">Weekly Tests</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-2xl">
                    <BookOpen className="w-8 h-8 text-primary-500 mb-3" />
                    <span className="font-bold text-gray-900">Study Materials</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-2xl">
                    <Megaphone className="w-8 h-8 text-primary-500 mb-3" />
                    <span className="font-bold text-gray-900">Notices</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-2xl">
                    <CalendarCheck className="w-8 h-8 text-primary-500 mb-3" />
                    <span className="font-bold text-gray-900">Attendance</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-2xl">
                    <Users className="w-8 h-8 text-primary-500 mb-3" />
                    <span className="font-bold text-gray-900">Expert Faculty</span>
                  </div>
                </div>
              </motion.section>

            </div>

            {/* Right Sticky Sidebar (Overview Card) */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 sticky top-24"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Course Overview</h3>

                <div className="space-y-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-500">Subjects Covered</p>
                      <p className="text-gray-900 font-semibold leading-snug break-words">{course.subjects}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-500">Duration</p>
                      <p className="text-gray-900 font-semibold">{course.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-500">Learning Mode</p>
                      <p className="text-gray-900 font-semibold">{course.mode}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <IndianRupee className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-500">Program Fees</p>
                      <p className="text-green-700 font-bold text-lg">{course.fees}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <h4 className="font-bold text-gray-900 mb-2">Ready to start your learning journey?</h4>
                  <div className="flex flex-col gap-3 mt-4">
                    <Link to="/contact" className="w-full bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-3 rounded-xl transition-colors shadow-sm">
                      Contact Us
                    </Link>
                  </div>
                </div>

              </motion.div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseDetails;
