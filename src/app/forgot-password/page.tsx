'use client';

import { useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { showToast } from '@/lib/features/toast/toastSlice';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        if (value && !validateEmail(value)) {
            setEmailError('Please enter a valid email address.');
        } else {
            setEmailError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address.');
            return;
        }

        setIsLoading(true);
        setEmailError('');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                dispatch(showToast({ message: data.message || 'Password reset link sent to your email.', type: 'success' }));
                setEmail('');
            } else {
                dispatch(showToast({ message: data.message || 'Failed to send reset link.', type: 'error' }));
            }
        } catch (error) {
            dispatch(showToast({ message: 'An error occurred. Please try again later.', type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 bg-gray-50 dark:bg-gray-900">
            <div className="text-center max-w-md w-full">
                <h1 className="text-4xl font-extrabold mb-8 text-gray-900 dark:text-white tracking-tight">
                    Forgot Password
                </h1>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="text-left">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={handleEmailChange}
                                placeholder="name@company.com"
                                className={`w-full px-4 py-3 rounded-xl border ${emailError
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500'
                                    } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent transition-all outline-none`}
                            />
                            {emailError && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">
                                    {emailError}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !!emailError || !email}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending...
                                </span>
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-sm">
                        <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
