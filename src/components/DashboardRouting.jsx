import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { AuthService } from '../lib/authService';

const DashboardRouting = () => {
    const navigate = useNavigate();
    const { isLoaded, isSignedIn, getToken, userId } = useAuth();
    
    useEffect(() => {
        const routeUser = async () => {
            if (!isLoaded) return;
            if (!isSignedIn) {
                navigate('/login');
                return;
            }

            try {
                const token = await getToken();
                const profile = await AuthService.getCurrentUserProfile(token);

                
                if (!profile) {
                     navigate('/onboarding');
                     return;
                }

                if (profile.status === 'PENDING') {
                    navigate('/approval-pending');
                } else if (profile.role === 'ADMIN') {
                    navigate('/admin');
                } else if (profile.role === 'TEACHER') {
                    navigate('/teacher');
                } else {
                    navigate('/student');
                }
            } catch (err) {
                console.error("Routing error: ", err);
                navigate('/login');
            }
        };

        routeUser();
    }, [isLoaded, isSignedIn, navigate, getToken, userId]);

    return (
        <div className="h-screen w-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
};

export default DashboardRouting;
