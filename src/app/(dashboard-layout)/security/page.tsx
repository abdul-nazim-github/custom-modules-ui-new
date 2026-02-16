"use client";

import { Shield, Key, Eye, EyeOff, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { notFound, useRouter } from 'next/navigation';
import { showToast } from '@/lib/features/toast/toastSlice';

export default function SecurityPage() {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const hasPermission = user?.role?.includes('super_admin') || user?.permissions?.includes('modules~permission~security');

    useEffect(() => {
        if (user && !hasPermission) {
            router.push('/dashboard');
            dispatch(showToast({ message: 'You do not have permission to access this page', type: 'error' }));
        }
    }, [user, hasPermission, router, dispatch]);

    if (!user) return null;

    const validatePassword = (password: string) => {
        const minLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return {
            minLength,
            hasUpper,
            hasLower,
            hasNumber,
            hasSpecial,
            isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial
        };
    };

    const passwordValidation = validatePassword(formData.newPassword);
    const passwordsMatch = formData.newPassword === formData.confirmPassword;
    const canSubmit = formData.oldPassword && formData.newPassword && formData.confirmPassword &&
        passwordValidation.isValid && passwordsMatch;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!canSubmit) {
            dispatch(showToast({ message: 'Please fill all fields correctly', type: 'error' }));
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('/api/password/change', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    oldPassword: formData.oldPassword,
                    newPassword: formData.newPassword
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                dispatch(showToast({ message: 'Password changed successfully', type: 'success' }));
                setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                dispatch(showToast({ message: result.message || 'Failed to change password', type: 'error' }));
            }
        } catch (error) {
            console.error('Error changing password:', error);
            dispatch(showToast({ message: 'Error changing password', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Security Center</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Manage your account security and password settings.</p>
            </div>

            {/* Password Change Form */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-blue-600 font-black shadow-sm">
                            <Key className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Change Password</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Update your password to keep your account secure</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrentPass ? 'text' : 'password'}
                                name="oldPassword"
                                value={formData.oldPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12"
                                placeholder="Enter your current password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPass(!showCurrentPass)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                {showCurrentPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPass ? 'text' : 'password'}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12"
                                placeholder="Enter your new password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPass(!showNewPass)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                {showNewPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        {/* Password Requirements */}
                        {formData.newPassword && (
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Password Requirements</p>
                                <div className="space-y-2">
                                    <PasswordRequirement met={passwordValidation.minLength} text="At least 8 characters" />
                                    <PasswordRequirement met={passwordValidation.hasUpper} text="One uppercase letter" />
                                    <PasswordRequirement met={passwordValidation.hasLower} text="One lowercase letter" />
                                    <PasswordRequirement met={passwordValidation.hasNumber} text="One number" />
                                    <PasswordRequirement met={passwordValidation.hasSpecial} text="One special character" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPass ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12"
                                placeholder="Confirm your new password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPass(!showConfirmPass)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                {showConfirmPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {formData.confirmPassword && (
                            <div className="mt-2">
                                {passwordsMatch ? (
                                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Passwords match
                                    </p>
                                ) : (
                                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        Passwords do not match
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={!canSubmit || loading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Changing Password...
                                </>
                            ) : (
                                <>
                                    <Key className="h-5 w-5" />
                                    Change Password
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Security Tips */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-3xl border border-orange-100 dark:border-orange-800 p-8">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
                        <Shield className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Security Best Practices</h4>
                        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                Use a unique password that you don't use anywhere else
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                Change your password regularly (every 3-6 months)
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                Never share your password with anyone
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                Use a password manager to store your passwords securely
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
    return (
        <div className="flex items-center gap-2">
            {met ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
                <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
            )}
            <span className={`text-sm ${met ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                {text}
            </span>
        </div>
    );
}
