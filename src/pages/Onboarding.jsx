import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { GraduationCap, Briefcase, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthService } from '../lib/authService';
import { useAuth, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { normalizeClass, normalizeClassArray } from '../lib/classUtils';

const Onboarding = () => {
  const navigate = useNavigate();
  const { getToken, userId, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    role: '',
    studentMedium: '',
    studentStd: '',
    teacherMedium: '',
    teacherSubjects: [],
    teacherStandards: []
  });

  const [errorMsg, setErrorMsg] = useState('');

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

  const proceedToStep2 = () => {
    if (!formData.role) return setErrorMsg('Please select a role.');
    setStep(2);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!authLoaded || !userLoaded || !userId) return setErrorMsg('Not authenticated yet. Please sign in first.');
    
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

    // Normalize class values to remove "th", "st", "nd", "rd" suffixes
    // This ensures consistency with database content format
    const normalizedStandards = formData.role === 'Student' 
      ? [normalizeClass(formData.studentStd)]
      : normalizeClassArray(formData.teacherStandards);

    const finalPayload = {
       id: userId,
       name: user.fullName || user.firstName || 'User',
       email: user.primaryEmailAddress?.emailAddress || '',
       role: formData.role,
       authType: user.externalAccounts?.length > 0 ? 'oauth' : 'email',
       medium: formData.role === 'Student' ? formData.studentMedium : formData.teacherMedium,
       standards: normalizedStandards,
       subjects: formData.role === 'Teacher' ? formData.teacherSubjects : []
    };

    try {
      const token = await getToken();
      await AuthService.finalizeOnboarding(token, finalPayload);
      toast.success('Registration Executed Successfully!', { id: loadingToast });
      navigate('/dashboard-routing');

    } catch (error) {
      toast.error(error.message || 'Failed to save profile', { id: loadingToast });
      setErrorMsg(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authLoaded || !userLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="max-w-xl w-full relative z-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
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
                  <button onClick={proceedToStep2} className={"w-full py-3.5 bg-primary-600 text-white font-bold rounded-xl shadow-md hover:bg-primary-700 transition-colors"}>Next Step</button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
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
                          {formData.studentMedium === 'English' && ['8','9','10'].map(s => <option key={s} value={s}>Std {s}th</option>)}
                          {formData.studentMedium === 'Marathi' && ['5','6','7','8','9','10'].map(s => <option key={s} value={s}>Std {s}th</option>)}
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
                          {['5','6','7','8','9','10'].map(std => (
                             <button key={std} type="button" onClick={() => handleMultiSelect('teacherStandards', std)} className={`px-3 py-1.5 text-sm rounded-lg border ${formData.teacherStandards.includes(std) ? 'bg-primary-100 border-primary-500 text-primary-700 font-bold' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>{std}th</button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setStep(1)} disabled={isSubmitting} className="w-1/3 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50">Back</button>
                    <button type="submit" disabled={isSubmitting} className="w-2/3 py-3.5 flex justify-center items-center gap-2 bg-primary-600 text-white font-bold rounded-xl shadow-md hover:bg-primary-700 transition-colors disabled:opacity-50">
                      {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <ChevronRight className="w-5 h-5" />}
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

export default Onboarding;
