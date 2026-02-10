'use client';

import { useState, Suspense, useEffect } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { showToast } from '@/lib/features/toast/toastSlice';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, RefreshCw, Check } from 'lucide-react';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const tokenFromUrl = searchParams.get('token') || '';
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const emailFromUrl = searchParams.get('email') || '';

    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const [requirements, setRequirements] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
    });

    useEffect(() => {
        setRequirements({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
    }, [password]);

    const isPasswordStrong = Object.values(requirements).every(Boolean);
    const passwordsMatch = password === confirmPassword && password !== '' && isPasswordStrong;

    const generatePassword = () => {
        const length = 12;
        const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lower = "abcdefghijklmnopqrstuvwxyz";
        const numbers = "0123456789";
        const special = "!@#$%^&*";

        let retVal = "";
        retVal += upper[Math.floor(Math.random() * upper.length)];
        retVal += lower[Math.floor(Math.random() * lower.length)];
        retVal += numbers[Math.floor(Math.random() * numbers.length)];
        retVal += special[Math.floor(Math.random() * special.length)];

        const all = upper + lower + numbers + special;
        for (let i = 0; i < length - 4; ++i) {
            retVal += all.charAt(Math.floor(Math.random() * all.length));
        }

        retVal = retVal.split('').sort(() => 0.5 - Math.random()).join('');

        setPassword(retVal);
        setConfirmPassword(retVal);
        setShowPassword(true);
        setShowConfirmPassword(true);
        setPasswordError('');
        setConfirmPasswordError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check for empty fields
        let hasError = false;
        if (!password) {
            setPasswordError('Password is required');
            hasError = true;
        }
        if (!confirmPassword) {
            setConfirmPasswordError('Confirm password is required');
            hasError = true;
        }

        if (hasError) return;

        if (!isPasswordStrong) {
            dispatch(showToast({ message: 'Please meet all password requirements.', type: 'error' }));
            return;
        }

        if (!passwordsMatch) {
            dispatch(showToast({ message: 'Passwords do not match.', type: 'error' }));
            return;
        }

        if (!tokenFromUrl) {
            dispatch(showToast({ message: 'Reset token is missing from the URL.', type: 'error' }));
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: tokenFromUrl,
                    password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                dispatch(showToast({ message: data.message || 'Password reset successfully.', type: 'success' }));
                router.push('/');
            } else {
                dispatch(showToast({ message: data.message || 'Failed to reset password.', type: 'error' }));
            }
        } catch (error) {
            dispatch(showToast({ message: 'An error occurred. Please try again later.', type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    };

    if (!tokenFromUrl) {
        return (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-red-100 dark:border-red-900/30 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invalid Reset Link</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    The password reset token is missing or invalid. Please request a new link.
                </p>
                <Link href="/forgot-password" size-small className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors cursor-pointer">
                    Request New Link
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {emailFromUrl ? 'Resetting password for:' : 'Resetting password with token:'}
                </p>
                <code className="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded block break-all text-blue-600 dark:text-blue-400 font-mono">
                    {emailFromUrl || `${tokenFromUrl.substring(0, 30)}...${tokenFromUrl.substring(tokenFromUrl.length - 10)}`}
                </code>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-left relative">
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            New Password
                        </label>
                        <button
                            type="button"
                            onClick={generatePassword}
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1 cursor-pointer"
                        >
                            <RefreshCw className="w-3 h-3" /> Generate Secure Password
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (e.target.value) setPasswordError('');
                            }}
                            onBlur={() => {
                                if (!password) setPasswordError('Password is required');
                            }}
                            placeholder="••••••••"
                            className={`w-full px-4 py-3 rounded-xl border ${passwordError ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {passwordError && <p className="mt-1 text-xs text-red-500 font-medium">{passwordError}</p>}
                </div>

                <div className="text-left relative">
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (e.target.value) setConfirmPasswordError('');
                            }}
                            onBlur={() => {
                                if (!confirmPassword) setConfirmPasswordError('Confirm password is required');
                            }}
                            placeholder="••••••••"
                            className={`w-full px-4 py-3 rounded-xl border ${confirmPasswordError || (confirmPassword && !passwordsMatch) ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                                } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                        >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {confirmPasswordError && <p className="mt-1 text-xs text-red-500 font-medium">{confirmPasswordError}</p>}
                </div>

                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Password Requirements</p>
                    <ul className="space-y-1">
                        <RequirementItem label="At least 8 characters" met={requirements.length} />
                        <RequirementItem label="At least one uppercase letter" met={requirements.uppercase} />
                        <RequirementItem label="At least one lowercase letter" met={requirements.lowercase} />
                        <RequirementItem label="At least one number" met={requirements.number} />
                        <RequirementItem label="At least one special character" met={requirements.special} />
                    </ul>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !isPasswordStrong || !passwordsMatch}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating Password...
                        </span>
                    ) : (
                        'Reset Password'
                    )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-sm">
                <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

function RequirementItem({ label, met }: { label: string; met: boolean }) {
    return (
        <li className="flex items-center gap-2 text-sm">
            {met ? (
                <Check className="w-4 h-4 text-green-500" />
            ) : (
                <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                </div>
            )}
            <span className={met ? 'text-green-700 dark:text-green-400 transition-colors' : 'text-gray-500 dark:text-gray-400 transition-colors'}>
                {label}
            </span>
        </li>
    );
}

export default function ResetPasswordPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 bg-gray-50 dark:bg-gray-900">
            <div className="text-center max-w-md w-full">
                <h1 className="text-4xl font-extrabold mb-8 text-gray-900 dark:text-white tracking-tight">
                    Reset Password
                </h1>
                <Suspense fallback={
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-center">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full mb-6"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        </div>
                    </div>
                }>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </main>
    );
}
