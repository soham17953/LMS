import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-2xl text-white tracking-tight">Shree Classes</span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Quality coaching for English Medium Std 8 to 10 and Marathi Medium Std 3 to 10. Building bright futures together.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all text-gray-400 font-bold">
                F
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all text-gray-400 font-bold">
                X
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all text-gray-400 font-bold">
                IG
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all text-gray-400 font-bold">
                IN
              </a>
            </div>
          </div>

          {/* Quick Links & Courses */}
          <div className="grid grid-cols-2 gap-8 col-span-1 md:col-span-2 lg:col-span-2">
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 uppercase tracking-wider text-sm">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link to="/" className="hover:text-primary-400 transition-colors">Home</Link></li>
                <li><Link to="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact</Link></li>
                <li><Link to="/login" className="hover:text-primary-400 transition-colors">Login</Link></li>
                <li><Link to="/signup" className="hover:text-primary-400 transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 uppercase tracking-wider text-sm">Courses</h4>
              <ul className="space-y-3">
                <li><Link to="/courses?medium=english" className="hover:text-primary-400 transition-colors">English Medium (Std 8-10)</Link></li>
                <li><Link to="/courses?medium=marathi" className="hover:text-primary-400 transition-colors">Marathi Medium (Std 3-10)</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact Information */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <h4 className="text-lg font-semibold text-white mb-6 uppercase tracking-wider text-sm">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-500 mt-1 flex-shrink-0" />
                <span>konkan vashat omkar society kalyan west</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span>+91 9867897622</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <a href="mailto:shree.classes.@gmail.com" className="hover:text-primary-400 transition-colors">shree.classes.@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 Shree Classes. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
            <a href="#" className="hover:text-white transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
