import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, BookOpen, LayoutDashboard } from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-2xl text-gray-900 tracking-tight">Shree Classes</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Home</Link>
            <Link to="/about" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">About</Link>
            <Link to="/courses" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Courses</Link>
            <Link to="/announcements" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Announcements</Link>
            <Link to="/contact" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Contact</Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <SignedOut>
              <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium px-3 py-2 transition-colors">
                Login
              </Link>
              <Link to="/signup" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Sign Up
              </Link>
            </SignedOut>
            <SignedIn>
              <button onClick={() => navigate('/dashboard-routing')} className="text-gray-600 hover:text-primary-600 flex items-center gap-2 font-medium px-3 py-2 transition-colors">
                <LayoutDashboard className="w-5 h-5"/> Dashboard
              </button>
              <div className="pl-4 border-l border-gray-200">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>

          {/* Mobile menu button */}
          <div className="md:flex lg:hidden xl:hidden 2xl:hidden flex items-center gap-4">
            <div className="md:hidden">
              <SignedIn>
                 <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none md:hidden"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50">Home</Link>
            <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50">About</Link>
            <Link to="/courses" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50">Courses</Link>
            <Link to="/announcements" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50">Announcements</Link>
            <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50">Contact</Link>
            <div className="pt-4 flex flex-col gap-3">
              <SignedOut>
                <Link to="/login" className="block w-full text-center px-4 py-2 border border-primary-600 text-primary-600 rounded-md font-medium">
                  Login
                </Link>
                <Link to="/signup" className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-md font-medium">
                  Sign Up
                </Link>
              </SignedOut>
              <SignedIn>
                <button onClick={() => navigate('/dashboard-routing')} className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-md font-medium flex justify-center items-center gap-2">
                  <LayoutDashboard className="w-5 h-5"/> Go to Dashboard
                </button>
              </SignedIn>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
