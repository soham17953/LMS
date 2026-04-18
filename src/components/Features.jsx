import React from 'react';
import { BookOpen, Users, Clock, FileText, Bell, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const featuresList = [
  {
    title: 'Structured Lectures',
    description: 'Organized learning content tailored for both English and Marathi mediums.',
    icon: <BookOpen className="w-6 h-6 text-primary-600" />,
  },
  {
    title: 'Role-Based Access',
    description: 'Separate personalized dashboards for students, teachers, and admins.',
    icon: <Users className="w-6 h-6 text-primary-600" />,
  },
  {
    title: 'Attendance Tracking',
    description: 'Real-time monitoring and reporting of student attendance.',
    icon: <Clock className="w-6 h-6 text-primary-600" />,
  },
  {
    title: 'Homework & Materials',
    description: 'Easy upload, submission, and management of study content and assignments.',
    icon: <FileText className="w-6 h-6 text-primary-600" />,
  },
  {
    title: 'Announcements',
    description: 'Instant communication for notices, schedules, and important updates.',
    icon: <Bell className="w-6 h-6 text-primary-600" />,
  },
  {
    title: 'Exam Preparation',
    description: 'Practice materials, mock tests, and revision support to excel in exams.',
    icon: <Award className="w-6 h-6 text-primary-600" />,
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-semibold text-primary-600 tracking-wide uppercase mb-2">Everything You Need</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Powerful Features for Modern Learning
          </h3>
          <p className="mt-4 text-xl text-gray-600">
            Our platform provides all the tools necessary for an effective and engaging educational experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 z-0"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
