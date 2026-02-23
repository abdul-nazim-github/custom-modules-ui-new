
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAppDispatch } from '@/lib/hooks';
import { showToast } from '@/lib/features/toast/toastSlice';
import { logout } from '@/lib/features/auth/authSlice';

export default function ApiInterceptor({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const isRedirectingValue = useRef(false);

    useEffect(() => {
        const handleUnauthorized = () => {
            if (isRedirectingValue.current) return;
            isRedirectingValue.current = true;

            // Show a friendly message
            dispatch(showToast({
                message: 'Session expired. Please login again to continue.',
                type: 'error'
            }));

            // Clear local auth state
            dispatch(logout());
            localStorage.removeItem('user');

            // Redirect after a short delay so the user can see the message
            setTimeout(() => {
                isRedirectingValue.current = false;
                router.push('/login');
            }, 2000);
        };

        // 1. Setup Axios Interceptor
        const interceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Check if it's not the login API itself failing (which might return 401 for wrong credentials)
                    const isLoginRequest = error.config?.url?.includes('/auth/login');
                    if (!isLoginRequest) {
                        handleUnauthorized();
                    }
                }
                return Promise.reject(error);
            }
        );

        // 2. Setup Fetch Interceptor (Monkey patch for global coverage)
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);

                if (response.status === 401) {
                    const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
                    // Don't intercept login requests returning 401 (invalid credentials)
                    if (!url.includes('/auth/login')) {
                        handleUnauthorized();
                    }
                }
                return response;
            } catch (error) {
                return Promise.reject(error);
            }
        };

        return () => {
            // Cleanup
            api.interceptors.response.eject(interceptor);
            window.fetch = originalFetch;
        };
    }, [dispatch, router]);

    return <>{children}</>;
}
