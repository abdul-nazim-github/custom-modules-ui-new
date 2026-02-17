"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Loader2, FileText, Calendar, Layout, Info, AlignLeft, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { showToast } from '@/lib/features/toast/toastSlice';

interface ContentItem {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    status: number;
    created_at: string;
    updated_at?: string;
}

export default function ViewContentPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState<ContentItem | null>(null);

    const { user: loggedInUser } = useAppSelector((state) => state.auth);
    const isSuperAdmin = loggedInUser?.role?.includes('super_admin');

    useEffect(() => {
        if (!loading && !isSuperAdmin && loggedInUser) {
            router.push('/dashboard');
            dispatch(showToast({ message: 'You do not have permission to access Content Management', type: 'error' }));
        }
    }, [isSuperAdmin, loading, loggedInUser, router, dispatch]);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch(`/api/content/list/${id}`);
                const result = await response.json();

                if (result.success && result.data) {
                    setContent(result.data);
                } else {
                    dispatch(showToast({ message: result.message || 'Failed to fetch content', type: 'error' }));
                    router.push('/content');
                }
            } catch (error) {
                console.error('Error fetching content:', error);
                dispatch(showToast({ message: 'Error loading content', type: 'error' }));
                router.push('/content');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchContent();
    }, [id, router, dispatch]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!content) return null;

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
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">View Content</h1>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">Previewing content module details.</p>
                    </div>
                </div>
                <Link
                    href={`/content/edit/${id}`}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/25 w-fit"
                >
                    <Edit2 className="h-4 w-4" />
                    Edit Content
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm p-8 md:p-10">
                        <div className="prose prose-blue dark:prose-invert max-w-none">
                            <h1 className="text-2xl font-bold mb-6">{content.title}</h1>
                            <div
                                className="content-rendered"
                                dangerouslySetInnerHTML={{ __html: content.content }}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm p-8 space-y-6">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Meta Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Created At</p>
                                        <p className="text-sm font-bold">{new Date(content.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                {content.updated_at && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Last Updated</p>
                                            <p className="text-sm font-bold">{new Date(content.updated_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${content.status === 1 ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Status</p>
                                        <p className={`text-sm font-bold ${content.status === 1 ? 'text-green-600' : 'text-gray-500'}`}>
                                            {content.status === 1 ? 'Published' : 'Draft'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Short Description</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">
                                "{content.shortDescription}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
