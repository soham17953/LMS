import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary-600 z-0"></div>
      
      {/* Abstract background patterns */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-10 pointer-events-none">
        <svg className="absolute left-[-20%] top-[-10%] w-[50%] h-[120%] text-primary-500 opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon fill="currentColor" points="0,0 100,0 50,100" />
        </svg>
        <svg className="absolute right-[-20%] bottom-[-10%] w-[50%] h-[120%] text-primary-700 opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon fill="currentColor" points="0,100 100,100 50,0" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6">
            Ready to Join Shree Classes?
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Take the first step towards academic excellence. Enroll today and unlock a world of personalized learning designed for your success.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              to="/login" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-full text-lg font-bold transition-transform hover:scale-105 shadow-xl"
            >
              <LogIn className="w-5 h-5" />
              Login to Dashboard
            </Link>
            
            <Link 
              to="/signup" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-bold transition-all hover:bg-white hover:text-primary-600"
            >
              <UserPlus className="w-5 h-5" />
              Sign Up Now
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
