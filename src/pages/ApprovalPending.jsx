import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ApprovalPending = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Pending Approval</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            your account is not approved by admin, please wait for some time.
          </p>
          <Link to="/" className="inline-flex items-center justify-center gap-2 text-primary-600 font-bold hover:text-primary-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Return to Homepage
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApprovalPending;
