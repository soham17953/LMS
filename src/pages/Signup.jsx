import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Lock, Eye, EyeOff, UserPlus, GraduationCap, Briefcase, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthService } from '../lib/authService';
import toast from 'react-hot-toast';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const googleData = location.state?.googleData; // Picked up from Login page

  const [step, setStep] = useState(googleData ? 2 : 1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: googleData?.name || '',
    email: googleData?.email || '',
    password: '',
    confirmPassword: '',
    role: '',
    studentMedium: '',
    studentStd: '',
    teacherMedium: '',
    teacherSubjects: [],
    teacherStandards: [],
    authType: googleData ? 'google' : 'email'
  });

  const [errorMsg, setErrorMsg] = useState('');

  // Validate Step 1 logic
  const validatePassword = (pwd) => {
    // Min 6 chars, contains letter and number
    const regex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
    return regex.test(pwd);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleMultiSelect = (field, value) => {
    const currentValues = formData[field];
    if (currentValues.includes(value)) {
      setFormData({ ...formData, [field]: currentValues.filter(v => v !== value) });
    } else {
      setFormData({ ...formData, [field]: [...currentValues, value] });
    }
  };

  const proceedToStep2 = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      return setErrorMsg('All fields are required.');
    }
    
    // Strict validations based on prompt
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
       return setErrorMsg('Invalid email format.');
    }
    if (!validatePassword(formData.password)) {
      return setErrorMsg('Password must be at least 6 characters and include letters and numbers.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setErrorMsg('Passwords do not match.');
    }

    setIsSubmitting(true);
    const id = toast.loading('Verifying credentials...');
    try {
      await AuthService.signupCore(formData.name, formData.email, formData.password);
      toast.success('Credentials verified.', { id });
      setStep(2);
    } catch (error) {
      toast.error(error.message || 'Error occurred.', { id });
      setErrorMsg(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsSubmitting(true);
    const id = toast.loading('Connecting to Google...');
    try {
      const gUser = await AuthService.signInWithGoogle();
      const existing = await AuthService.checkUserExists(gUser.email);
      if (existing) {
        toast.error('Email already exists. Please log in.', { id });
        navigate('/login');
      } else {
        toast.success('Authenticated', { id });
        setFormData({ ...formData, name: gUser.name, email: gUser.email, authType: 'google' });
        setStep(2);
      }
    } catch (e) {
      toast.error('Google Auth Failed', { id });
    } finally {
      setIsSubmitting(false);
    }
  };

  const proceedToStep3 = () => {
    if (!formData.role) return setErrorMsg('Please select a role.');
    setStep(3);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    
    // Validate based on role
    if (formData.role === 'Student') {
      if (!formData.studentMedium || !formData.studentStd) {
        return setErrorMsg('Please select medium and standard');
      }
    } else if (formData.role === 'Teacher') {
      if (!formData.teacherMedium || formData.teacherSubjects.length === 0 || formData.teacherStandards.length === 0) {
        return setErrorMsg('Please complete all selection criteria');
      }
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Preparing your profile...');

    const finalPayload = {
       name: formData.name,
       email: formData.email,
       password: formData.password,
       role: formData.role,
       authType: formData.authType,
       medium: formData.role === 'Student' ? formData.studentMedium : formData.teacherMedium,
       standards: formData.role === 'Student' ? [formData.studentStd] : formData.teacherStandards,
       subjects: formData.role === 'Teacher' ? formData.teacherSubjects : []
    };

    try {
      await AuthService.finalizeOnboarding(finalPayload);
      toast.success('Registration Executed Successfully (No Redirect)', { id: loadingToast });
      // Reset form to indicate isolation from workflows
      setStep(1);
      setFormData({
        name: '', email: '', password: '', confirmPassword: '', role: '',
        studentMedium: '', studentStd: '', teacherMedium: '',
        teacherSubjects: [], teacherStandards: [], authType: 'email'
      });
    } catch (error) {
      toast.error(error.message || 'Failed to save profile', { id: loadingToast });
      setErrorMsg(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="max-w-xl w-full relative z-10">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Basic Credentials */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create an Account</h2>
                  <p className="text-gray-500">Join Shree Classes and start your journey</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                  <Link to="/login" className="flex-1 py-2.5 text-center rounded-lg font-bold text-sm text-gray-500 hover:text-gray-900 transition-all">Log In</Link>
                  <button className="flex-1 py-2.5 bg-white shadow rounded-lg font-bold text-sm text-primary-600 transition-all">Sign Up</button>
                </div>

                <button onClick={handleGoogleSignup} disabled={isSubmitting} className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-3 px-4 rounded-xl shadow-sm transition-all mb-6 disabled:opacity-50">
                  <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                  Sign up with Google
                </button>

                <div className="relative flex items-center justify-center mb-6"><div className="absolute border-b border-gray-200 w-full"></div><span className="bg-white px-4 text-sm text-gray-400 relative z-10">or register with email</span></div>

                <form onSubmit={proceedToStep2} className="space-y-4">
                  {errorMsg && <div className="p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-lg text-center border border-red-100">{errorMsg}</div>}
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required readOnly={isSubmitting} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="John Doe" /></div>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label><div className="relative"><Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" /><input type="email" name="email" value={formData.email} onChange={handleChange} required readOnly={isSubmitting} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="john@example.com" /></div></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                      <div className="relative"><Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required readOnly={isSubmitting} className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                      <div className="relative"><Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required readOnly={isSubmitting} className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
                    </div>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-md text-white bg-primary-600 hover:bg-primary-700 font-bold transition-all mt-6 disabled:opacity-50">
                    {isSubmitting ? 'Evaluating...' : 'Continue'} <ChevronRight className="w-5 h-5" />
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 2: Role Selection (Skipping Admin) */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
                <div className="text-center mb-8"><h2 className="text-3xl font-extrabold text-gray-900 mb-2">Select Your Role</h2><p className="text-gray-500">Tell us how you'll be using Shree Classes</p></div>
                {errorMsg && <div className="mb-4 text-center text-red-500 text-sm font-bold">{errorMsg}</div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <button onClick={() => {setFormData({...formData, role: 'Student'}); setErrorMsg('');}} className={`p-6 border-2 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all ${formData.role === 'Student' ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-md' : 'border-gray-200 hover:border-primary-300 text-gray-600'}`}>
                    <GraduationCap className={`w-10 h-10 ${formData.role === 'Student' ? 'text-primary-600' : 'text-gray-400'}`} /><span className="font-bold text-lg">Student</span>
                  </button>
                  <button onClick={() => {setFormData({...formData, role: 'Teacher'}); setErrorMsg('');}} className={`p-6 border-2 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all ${formData.role === 'Teacher' ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-md' : 'border-gray-200 hover:border-primary-300 text-gray-600'}`}>
                    <Briefcase className={`w-10 h-10 ${formData.role === 'Teacher' ? 'text-primary-600' : 'text-gray-400'}`} /><span className="font-bold text-lg">Teacher</span>
                  </button>
                </div>
                <div className="flex gap-4">
                  {formData.authType === 'email' && (
                     <button onClick={() => setStep(1)} className="w-1/3 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Back</button>
                  )}
                  <button onClick={proceedToStep3} className={`${formData.authType === 'email' ? 'w-2/3' : 'w-full'} py-3.5 bg-primary-600 text-white font-bold rounded-xl shadow-md hover:bg-primary-700 transition-colors`}>Next Step</button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Domain Configurations */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
                <div className="text-center mb-8"><h2 className="text-3xl font-extrabold text-gray-900 mb-2">Final Details</h2><p className="text-gray-500">Provide your academic specifics</p></div>
                <form onSubmit={handleFinalSubmit} className="space-y-6">
                  {errorMsg && <div className="p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-lg text-center border border-red-100">{errorMsg}</div>}
                  
                  {formData.role === 'Student' ? (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Reporting Medium</label>
                        <select name="studentMedium" value={formData.studentMedium} onChange={(e) => { handleChange(e); setFormData(f => ({...f, studentStd: ''})) }} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500">
                          <option value="" disabled>Select Medium</option>
                          <option value="English">English</option>
                          <option value="Marathi">Marathi</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Standard (Class)</label>
                        <select name="studentStd" value={formData.studentStd} onChange={handleChange} required disabled={!formData.studentMedium} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50">
                          <option value="" disabled>Select Standard</option>
                          {formData.studentMedium === 'English' && [8,9,10].map(s => <option key={s} value={s}>Std {s}</option>)}
                          {formData.studentMedium === 'Marathi' && [3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>Std {s}</option>)}
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Teaching Medium</label>
                        <select name="teacherMedium" value={formData.teacherMedium} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500">
                          <option value="" disabled>Select Medium</option>
                          <option value="English">English</option>
                          <option value="Marathi">Marathi</option>
                          <option value="Both">Both Domains</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Subjects (Multi-Select)</label>
                        <div className="flex flex-wrap gap-2">
                          {['Maths', 'Science', 'English', 'Marathi', 'Social Studies'].map(sub => (
                             <button key={sub} type="button" onClick={() => handleMultiSelect('teacherSubjects', sub)} className={`px-3 py-1.5 text-sm rounded-lg border ${formData.teacherSubjects.includes(sub) ? 'bg-primary-100 border-primary-500 text-primary-700 font-bold' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>{sub}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Standards Handled (Multi-Select)</label>
                        <div className="flex flex-wrap gap-2">
                          {[3,4,5,6,7,8,9,10].map(std => (
                             <button key={std} type="button" onClick={() => handleMultiSelect('teacherStandards', std)} className={`px-3 py-1.5 text-sm rounded-lg border ${formData.teacherStandards.includes(std) ? 'bg-primary-100 border-primary-500 text-primary-700 font-bold' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>Std {std}</button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setStep(2)} disabled={isSubmitting} className="w-1/3 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50">Back</button>
                    <button type="submit" disabled={isSubmitting} className="w-2/3 py-3.5 flex justify-center items-center gap-2 bg-primary-600 text-white font-bold rounded-xl shadow-md hover:bg-primary-700 transition-colors disabled:opacity-50">
                      {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <UserPlus className="w-5 h-5" />}
                      {isSubmitting ? 'Saving' : 'Submit for Approval'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
