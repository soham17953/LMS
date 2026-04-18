import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthService } from '../lib/authService';
import toast from 'react-hot-toast';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Redirection sequences disconnected by request. UI will remain static upon interaction.

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Fill in all fields');

    setIsSubmitting(true);
    const loadingToast = toast.loading('Authenticating...');
    
    try {
      const user = await AuthService.login(email, password);
      toast.success('Login Validated Successfully (No Redirect)', { id: loadingToast });
      setEmail('');
      setPassword('');
    } catch (error) {
      toast.error(error.message || 'Invalid credentials', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    const loadingToast = toast.loading('Connecting to Google...');
    try {
      const gUser = await AuthService.signInWithGoogle();
      
      // Check if user exists in DB
      const existingUser = await AuthService.checkUserExists(gUser.email);
      if (existingUser) {
        toast.success('Login Validated Successfully (No Redirect)', { id: loadingToast });
        // Set local session since mock AuthService.login does this usually, but here we enforce:
        localStorage.setItem('shree_active_session', JSON.stringify(existingUser));
      } else {
        toast.dismiss(loadingToast);
        // New user detected -> Navigate to signup role selection, passing data
        navigate('/signup', { state: { googleData: gUser } });
      }
    } catch (error) {
      toast.error('Google Sign In Failed', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      return toast.error('Please enter your email address first.');
    }
    const loadingToast = toast.loading('Sending reset link...');
    try {
      await AuthService.resetPassword(email);
      toast.success('Password reset link sent to your email!', { id: loadingToast });
    } catch (error) {
      toast.error(error.message || 'Failed to send reset link', { id: loadingToast });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full relative z-10"
        >
          <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-500">Sign in to your account to continue</p>
            </div>

            {/* Auth Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
              <button className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-white shadow text-primary-600 transition-all">
                Log In
              </button>
              <Link to="/signup" className="flex-1 py-2.5 text-center rounded-lg font-bold text-sm text-gray-500 hover:text-gray-900 transition-all">
                Sign Up
              </Link>
            </div>

            {/* Google OAuth Mock */}
            <button 
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-3 px-4 rounded-xl shadow-sm transition-all mb-6 disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </button>

            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute border-b border-gray-200 w-full"></div>
              <span className="bg-white px-4 text-sm text-gray-400 relative z-10">or sign in with email</span>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    readOnly={isSubmitting}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-gray-900"
                    placeholder="student@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    readOnly={isSubmitting}
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-gray-900"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <input id="remember" type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-600">Remember me</label>
                </div>
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-white bg-primary-600 hover:bg-primary-700 font-bold focus:outline-none focus:ring-4 focus:ring-primary-300 transition-all mt-6 transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <LogIn className="w-5 h-5" />
                )}
                {isSubmitting ? 'Authenticating...' : 'Log In Securely'}
              </button>
            </form>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
