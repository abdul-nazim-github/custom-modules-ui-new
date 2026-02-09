'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, RefreshCw, Check } from 'lucide-react';
import api from '@/lib/api';

import { AxiosError } from 'axios';
import { useAppDispatch } from '@/lib/hooks';
import { showToast } from '@/lib/features/toast/toastSlice';

const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

const RegisterForm = () => {
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);



    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }


    };

    const generatePassword = () => {
        const length = 12;
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const special = SPECIAL_CHARS;

        const allChars = upper + lower + numbers + special;
        let password = '';

        // Ensure at least one of each
        password += upper[Math.floor(Math.random() * upper.length)];
        password += lower[Math.floor(Math.random() * lower.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += special[Math.floor(Math.random() * special.length)];

        // Fill test
        for (let i = 4; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

        // Shuffle
        password = password.split('').sort(() => 0.5 - Math.random()).join('');

        setFormData((prev) => ({
            ...prev,
            password: password,
            confirmPassword: password,
        }));

        // Clear related errors
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.password;
            delete newErrors.confirmPassword;
            return newErrors;
        });
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (formData.firstName.trim().length < 3) {
            newErrors.firstName = 'First name must be at least 3 characters';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.trim().length < 3) {
            newErrors.lastName = 'Last name must be at least 3 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else {
            const escapedSpecialChars = SPECIAL_CHARS.split('').map(c => '\\' + c).join('');
            const specialCharRegex = new RegExp(`[${escapedSpecialChars}]`);

            const requirements = [
                { met: formData.password.length >= 8 },
                { met: /[A-Z]/.test(formData.password) },
                { met: /[a-z]/.test(formData.password) },
                { met: /[0-9]/.test(formData.password) },
                { met: specialCharRegex.test(formData.password) },
            ];
            if (!requirements.every(r => r.met)) {
                newErrors.password = 'Password does not meet requirements';
            }
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;
        // Also check if email error exists from debounce check
        if (errors.email) return;

        setIsLoading(true);

        try {
            await api.post('/api/auth/register', {
                first_name: formData.firstName.trim(),
                last_name: formData.lastName.trim(),
                email: formData.email.trim(),
                password: formData.password,
            });
            setSubmitSuccess(true);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: '',
            });
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            console.error('Registration failed:', error);
            const message = error.response?.status === 500
                ? 'Server error. Please try again later.'
                : (error.response?.data?.message || 'Registration failed. Please try again.');

            dispatch(showToast({ message, type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    };

    const passwordRequirements = [
        { label: 'At least 8 characters', met: formData.password.length >= 8 },
        { label: 'At least one uppercase letter', met: /[A-Z]/.test(formData.password) },
        { label: 'At least one lowercase letter', met: /[a-z]/.test(formData.password) },
        { label: 'At least one number', met: /[0-9]/.test(formData.password) },
        {
            label: 'At least one special character',
            met: new RegExp(
                `[${SPECIAL_CHARS.split('').map(c => '\\' + c).join('')}]`
            ).test(formData.password),
        },
    ];

    if (submitSuccess) {
        return (
            <div className="text-center p-8 bg-green-50 rounded-lg border border-green-200">
                <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-800 mb-2">User registered successfully!</h3>
                <p className="text-green-700">You can now log in with your credentials.</p>
                <button
                    onClick={() => setSubmitSuccess(false)}
                    className="mt-6 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                    Register Another Account
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="w-full max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">Create Account</h2>



            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition dark:bg-gray-700 dark:text-white ${errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        placeholder="John"
                        suppressHydrationWarning
                        maxLength={50}
                    />
                    {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition dark:bg-gray-700 dark:text-white ${errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        placeholder="Doe"
                        suppressHydrationWarning
                        maxLength={50}
                    />
                    {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <div className="relative">
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition dark:bg-gray-700 dark:text-white ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        placeholder="john.doe@example.com"
                        suppressHydrationWarning
                    />

                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
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
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition dark:bg-gray-700 dark:text-white ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        placeholder="••••••••"
                        suppressHydrationWarning
                        maxLength={50}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                <div className="relative">
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition dark:bg-gray-700 dark:text-white ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        placeholder="••••••••"
                        suppressHydrationWarning
                        maxLength={50}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Password Requirements</p>
                <ul className="space-y-1">
                    {passwordRequirements.map((req, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                            {req.met ? (
                                <Check className="w-4 h-4 text-green-500" />
                            ) : (
                                <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                </div>
                            )}
                            <span className={req.met ? 'text-green-700 dark:text-green-400 transition-colors' : 'text-gray-500 dark:text-gray-400 transition-colors'}>
                                {req.label}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all
                    ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                `}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Creating Account...
                    </span>
                ) : (
                    'Create Account'
                )}
            </button>
        </form>
    );
};

export default RegisterForm;
