import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { AuthService } from '../lib/authService';

const DashboardRouting = () => {
    const navigate = useNavigate();
    const { isLoaded, isSignedIn, getToken, userId } = useAuth();
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const routeUser = async () => {
            if (!isLoaded) return;
            if (!isSignedIn) {
                navigate('/login');
                return;
            }

            try {
                const token = await getToken();
                console.log('Fetching user profile...'); // Debug log
                const profile = await AuthService.getCurrentUserProfile(token);
                
                console.log('Profile received:', profile); // Debug log
                
                if (!profile) {
                     console.log('No profile found, redirecting to onboarding');
                     navigate('/onboarding');
                     return;
                }

                if (profile.status === 'PENDING') {
                    console.log('User pending approval');
                    navigate('/approval-pending');
                } else if (profile.role === 'ADMIN') {
                    console.log('Routing to admin dashboard');
                    navigate('/admin');
                } else if (profile.role === 'TEACHER') {
                    console.log('Routing to teacher dashboard');
                    navigate('/teacher');
                } else {
                    console.log('Routing to student dashboard');
                    navigate('/student');
                }
            } catch (err) {
                console.error("Routing error: ", err);
                setError(err.message);
                // Don't redirect on API errors - show error instead
            }
        };

        routeUser();
    }, [isLoaded, isSignedIn, navigate, getToken, userId]);

    if (error) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <div className="text-center max-w-md p-6">
                    <div className="text-red-500 mb-4 text-6xl">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <p className="text-sm text-gray-500 mb-4">
                        Please check that your backend is running and the API URL is configured correctly.
                    </p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
};

export default DashboardRouting;
