"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Loader2, FileText, Layout, Info, AlignLeft } from 'lucide-react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { showToast } from '@/lib/features/toast/toastSlice';

export default function CreateContentPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user: loggedInUser } = useAppSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);

    const isSuperAdmin = loggedInUser?.role?.includes('super_admin');

    useEffect(() => {
        if (!isSuperAdmin && loggedInUser) {
            router.push('/dashboard');
            dispatch(showToast({ message: 'You do not have permission to access Content Management', type: 'error' }));
        }
    }, [isSuperAdmin, loggedInUser, router, dispatch]);

    const [formData, setFormData] = useState({
        title: '',
        shortDescription: '',
        content: '',
        status: 1
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/content/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                dispatch(showToast({ message: 'Content created successfully', type: 'success' }));
                router.push('/content');
            } else {
                dispatch(showToast({ message: result.message || 'Failed to create content', type: 'error' }));
            }
        } catch (error) {
            console.error('Error creating content:', error);
            dispatch(showToast({ message: 'Error creating content', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/content"
                        className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Create Content</h1>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">Add a new content module to the system.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="p-8 md:p-12 space-y-10">
                        {/* Title Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <Layout className="h-4 w-4 text-blue-600" />
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                    Content Title
                                </label>
                            </div>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Terms of Service, About Us"
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg font-medium"
                            />
                        </div>

                        {/* Short Description Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <Info className="h-4 w-4 text-blue-600" />
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                    Short Description
                                </label>
                            </div>
                            <textarea
                                required
                                value={formData.shortDescription}
                                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                                placeholder="A brief overview of the module..."
                                rows={3}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                            />
                        </div>

                        {/* Main Content Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <AlignLeft className="h-4 w-4 text-blue-600" />
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                    Content Body (HTML supported)
                                </label>
                            </div>
                            <textarea
                                required
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="<h1>Main Body</h1><p>Your content here...</p>"
                                rows={10}
                                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm leading-relaxed"
                            />
                        </div>

                        {/* Status Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                    Publication Status
                                </label>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: 1 })}
                                    className={`flex-1 py-4 rounded-2xl border-2 transition-all font-bold ${formData.status === 1
                                        ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                                        : 'border-gray-100 dark:border-gray-800 text-gray-400'
                                        }`}
                                >
                                    Active / Published
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: 0 })}
                                    className={`flex-1 py-4 rounded-2xl border-2 transition-all font-bold ${formData.status === 0
                                        ? 'border-gray-600 bg-gray-50 text-gray-600 dark:bg-gray-800/50'
                                        : 'border-gray-100 dark:border-gray-800 text-gray-400'
                                        }`}
                                >
                                    Inactive / Draft
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-4">
                        <Link
                            href="/content"
                            className="px-8 py-4 font-bold text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-3 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/25 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            Create Content
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
