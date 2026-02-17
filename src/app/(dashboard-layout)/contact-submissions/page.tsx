"use client";

import { useState, useEffect } from 'react';
import { Mail, Search, Eye, Loader2, Calendar, User as UserIcon } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { notFound, useRouter } from 'next/navigation';
import { showToast } from '@/lib/features/toast/toastSlice';

interface ContactSubmission {
    _id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at: string;
}

export default function ContactFormPage() {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

    const hasAccess = user?.role?.includes('super_admin') || user?.permissions?.includes('contact.view');

    useEffect(() => {
        if (user && !hasAccess) {
            router.push('/dashboard');
            dispatch(showToast({ message: 'You do not have permission to access this page', type: 'error' }));
        }
    }, [user, hasAccess, router, dispatch]);

    if (!user) return null;

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/contact/list?page=1&limit=100');
            const result = await response.json();

            if (result.success && result.data) {
                setSubmissions(result.data);
            } else {
                dispatch(showToast({ message: 'Failed to load submissions', type: 'error' }));
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
            dispatch(showToast({ message: 'Error loading submissions', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    const filteredSubmissions = submissions.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Loading submissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Contact Form Submissions</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">View and manage all contact form submissions.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email or subject..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-bold text-gray-900 dark:text-white">{filteredSubmissions.length}</span> submissions
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-900/50">
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Sender</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Subject</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredSubmissions.map((submission) => (
                                <tr key={submission._id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                                {submission.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{submission.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{submission.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 max-w-md">
                                            {submission.subject}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(submission.created_at)}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => setSelectedSubmission(submission)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                                            title="View details"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedSubmission(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedSubmission.subject}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            From {selectedSubmission.name} • {formatDate(selectedSubmission.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedSubmission(null)}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition-colors"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</label>
                                <p className="mt-2 text-sm text-gray-900 dark:text-white">{selectedSubmission.email}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Message</label>
                                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {selectedSubmission.message}
                                </p>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                            <button
                                onClick={() => setSelectedSubmission(null)}
                                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/25"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
