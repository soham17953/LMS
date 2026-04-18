import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4"
            >
              Contact Us
            </motion.h1>
            <motion.p 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: 0.1 }}
               className="text-lg text-gray-600"
            >
              We’d love to hear from you. Reach out for admissions, queries, or support.
            </motion.p>
          </div>

          {/* Two Columns Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto mb-20">
            
            {/* Left Side: Contact Information */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 flex flex-col justify-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Get in Touch</h2>
              <p className="text-gray-600 mb-10 leading-relaxed">
                Reach out to us for admissions, queries, or feedback. We are here to help you make your academic journey smooth.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-primary-600">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Phone</h3>
                    <p className="text-lg font-bold text-gray-900">+91 9867897622</p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-primary-600">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Email</h3>
                    <a href="mailto:shree.classes@gmail.com" className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors">
                      shree.classes@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-primary-600">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Address</h3>
                    <p className="text-lg font-bold text-gray-900 leading-snug">
                      Konkan Vashat, Omkar Society,<br />
                      Kalyan (West)
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side: Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-primary-600 p-10 rounded-3xl shadow-xl text-white relative overflow-hidden flex flex-col justify-center"
            >
              {/* Decorative Background */}
              <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">Have any Queries?</h2>
                <p className="text-primary-100 mb-8">Still not sure about the course? Drop us a message!</p>

                <form className="space-y-6">
                  <div>
                    <label htmlFor="name" className="sr-only">Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      placeholder="Your Name" 
                      required 
                      className="w-full px-5 py-4 bg-primary-700/50 border border-primary-500 rounded-xl text-white placeholder-primary-200 focus:outline-none focus:ring-2 focus:ring-white transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="sr-only">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      placeholder="Your Email" 
                      required 
                      className="w-full px-5 py-4 bg-primary-700/50 border border-primary-500 rounded-xl text-white placeholder-primary-200 focus:outline-none focus:ring-2 focus:ring-white transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="sr-only">Message</label>
                    <textarea 
                      id="message" 
                      rows="4" 
                      placeholder="How can we help you?" 
                      required 
                      className="w-full px-5 py-4 bg-primary-700/50 border border-primary-500 rounded-xl text-white placeholder-primary-200 focus:outline-none focus:ring-2 focus:ring-white transition-all resize-none"
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    className="w-full inline-flex items-center justify-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary-300 transition-all shadow-lg transform hover:-translate-y-1"
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                </form>
              </div>
            </motion.div>

          </div>

          {/* Map Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto bg-white p-4 rounded-3xl shadow-lg border border-gray-100"
          >
            <div className="w-full h-96 rounded-2xl overflow-hidden bg-gray-200 relative">
              {/* Embed Google Maps tracking Kalyan West location approximately */}
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3765.918237937402!2d73.1256334752101!3d19.24243994949216!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be79427b3f9ff73%3A0x6b71f98bf8c8e1e1!2sKalyan%20West%2C%20Kalyan%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1714152554763!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Shree Classes Location Map"
              ></iframe>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
