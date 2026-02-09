'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch } from '@/lib/hooks';
import { showToast } from '@/lib/features/toast/toastSlice';
import { setCredentials } from '@/lib/features/auth/authSlice';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const dispatch = useAppDispatch();

    const validate = (trimmedEmail: string, trimmedPassword: string) => {
        const newErrors: { email?: string; password?: string } = {};

        if (!trimmedEmail) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!trimmedPassword) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!validate(trimmedEmail, trimmedPassword)) return;

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Update Redux state with user details
                dispatch(setCredentials({ user: data.data.user }));
                dispatch(showToast({ message: data.message || 'Login successful!', type: 'success' }));
                router.push('/');
            } else {
                dispatch(showToast({ message: data.message || 'Login failed', type: 'error' }));
            }
        } catch (error) {
            dispatch(showToast({ message: 'An error occurred. Please try again.', type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="bg-white dark:bg-gray-800 shadow-xl rounded-xl px-8 pt-8 pb-10 mb-4 border border-gray-100 dark:border-gray-700">
            <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2" htmlFor="email">
                    Email Address
                </label>
                <input
                    className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 transition-all duration-200 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600'
                        }`}
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                />
                {errors.email && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>
                )}
            </div>
            <div className="mb-8">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2" htmlFor="password">
                    Password
                </label>
                <div className="relative">
                    <input
                        className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-100 mb-0 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 transition-all duration-200 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600'
                            }`}
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors({ ...errors, password: undefined });
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors duration-200 cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>
                )}
            </div>
            <div className="flex items-center justify-between mt-4">
                <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform active:scale-[0.98] cursor-pointer"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Logging in...
                        </span>
                    ) : 'Sign In'}
                </button>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Don't have an account?{' '}
                    <Link
                        href="/register"
                        className="text-blue-600 hover:text-blue-700 font-bold transition-colors duration-200 cursor-pointer"
                    >
                        Register
                    </Link>
                </p>
            </div>
        </form>
    );
}
