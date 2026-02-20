"use client";

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { notFound, useRouter } from 'next/navigation';
import { showToast } from '@/lib/features/toast/toastSlice';
import { updateUser } from '@/lib/features/auth/authSlice';
import { User, Mail, Shield, Calendar, Edit2, Camera, Loader2, Save, X } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

export default function ProfilePage() {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: ''
    });

    const hasPermission = user?.role?.includes('super_admin') || user?.permissions?.includes('profile.view') || user?.permissions?.includes('profile.tab');
    const canEdit = user?.role?.includes('super_admin') || user?.permissions?.includes('profile.edit');

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || ''
            });
        }
    }, [user]);

    useEffect(() => {
        if (user && !hasPermission) {
            router.push('/dashboard');
            dispatch(showToast({ message: 'You do not have permission to access this page', type: 'error' }));
        }
    }, [user, hasPermission, router, dispatch]);

    const handleSave = async () => {
        if (!canEdit) {
            dispatch(showToast({ message: 'You do not have permission to edit profile', type: 'error' }));
            return;
        }
        try {
            setLoading(true);
            const response = await fetch('/api/auth/profile/edit', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                const updatedFullName = `${formData.first_name} ${formData.last_name}`.trim();
                dispatch(updateUser({
                    full_name: updatedFullName,
                    first_name: formData.first_name,
                    last_name: formData.last_name
                }));
                dispatch(showToast({ message: 'Profile updated successfully', type: 'success' }));
                setIsModalOpen(false);
                // Also update localStorage so it persists on reload
                const savedUser = localStorage.getItem('user');
                if (savedUser) {
                    const userObj = JSON.parse(savedUser);
                    localStorage.setItem('user', JSON.stringify({
                        ...userObj,
                        full_name: updatedFullName,
                        first_name: formData.first_name,
                        last_name: formData.last_name
                    }));
                }
            } else {
                dispatch(showToast({ message: result.message || result.error || 'Failed to update profile', type: 'error' }));
            }
        } catch (error) {
            console.error('Update profile error:', error);
            dispatch(showToast({ message: 'An error occurred while updating profile', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Profile Settings</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Manage your public profile and account information.</p>
                </div>
                <Tooltip
                    content={!canEdit ? "You do not have permission to edit profile" : ""}
                >
                    <div className={!canEdit ? "cursor-not-allowed" : ""}>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            disabled={!canEdit}
                            className={`flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${!canEdit ? 'grayscale-[0.5]' : ''}`}
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit Profile
                        </button>
                    </div>
                </Tooltip>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column - Avatar & Basic Info */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
                        <div className="flex flex-col items-center">
                            <div className="relative group cursor-pointer">
                                <div className="h-32 w-32 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-xl ring-4 ring-white dark:ring-gray-900">
                                    {user.full_name.charAt(0)}
                                </div>
                                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white text-center">
                                {user.full_name}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mt-1">{user.role.join(', ')}</p>
                        </div>

                        <div className="mt-10 space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <Mail className="h-5 w-5 text-blue-600" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Email Address</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <Calendar className="h-5 w-5 text-emerald-600" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Member Since</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB') : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - User Details */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Account Details</h3>
                        </div>
                        <div className="p-8 grid gap-8 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 dark:text-gray-400">First Name</label>
                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium">
                                    {user.first_name || user.full_name.split(' ')[0]}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 dark:text-gray-400">Last Name</label>
                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium">
                                    {user.last_name || user.full_name.split(' ').slice(1).join(' ')}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 dark:text-gray-400">Email</label>
                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 font-medium">
                                    {user.email}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 dark:text-gray-400">Role</label>
                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-medium">
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                                        {user.role.join(', ')}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 dark:text-gray-400">Account ID</label>
                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 font-mono text-sm overflow-hidden text-ellipsis">
                                    {user.id}
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-8 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                                    <Shield className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Privacy Control</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your data is secured with end-to-end encryption and will never be shared.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                    <Edit2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Edit Profile</h2>
                                    <p className="text-xs text-gray-500">Update your personal information</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors cursor-pointer"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">First Name</label>
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                                    placeholder="Enter your first name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Last Name</label>
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                                    placeholder="Enter your last name"
                                />
                            </div>
                        </div>

                        <div className="p-8 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-6 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
