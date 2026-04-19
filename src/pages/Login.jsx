import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SignIn } from '@clerk/clerk-react';

const Login = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 w-full max-w-md flex justify-center">
            <SignIn 
              routing="path" 
              path="/login" 
              fallbackRedirectUrl="/dashboard-routing" 
              signUpUrl="/signup" 
            />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
