"use client";

import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { Search, Edit2, Trash2, Plus, Loader2, FileText, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/features/toast/toastSlice';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { Pagination } from '@/components/ui/Pagination';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface ContentItem {
    id?: string;
    _id?: string;
    title: string;
    shortDescription: string;
    content: string;
    status: number;
    created_at: string;
}

export default function ContentPage() {
    const router = useRouter();
    const { user: loggedInUser } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [contentList, setContentList] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, title: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const isSuperAdmin = loggedInUser?.role?.includes('super_admin');

    useEffect(() => {
        if (!loading && !isSuperAdmin && loggedInUser) {
            router.push('/dashboard');
            dispatch(showToast({ message: 'You do not have permission to access Content Management', type: 'error' }));
        }
    }, [isSuperAdmin, loading, loggedInUser, router, dispatch]);

    const debouncedSearch = useCallback(
        debounce((query: string) => {
            setSearchQuery(query);
            setPage(1);
        }, 2000),
        []
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    useEffect(() => {
        fetchData();
    }, [page, limit, searchQuery]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/content/list?page=${page}&limit=${limit}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`);
            const result = await response.json();

            if (result.success) {
                setContentList(result.data || []);
                setTotalCount(result.meta?.totalCount || result.total || (result.data?.length || 0));
                setTotalPages(result.meta?.totalPages || result.totalPages || Math.ceil((result.meta?.totalCount || result.total || (result.data?.length || 0)) / limit));
            } else {
                dispatch(showToast({ message: result.message || 'Failed to load content', type: 'error' }));
            }
        } catch (error) {
            console.error('Error fetching content:', error);
            dispatch(showToast({ message: 'Error loading page data', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;

        try {
            setIsDeleting(true);
            const response = await fetch(`/api/content/delete/${itemToDelete.id}`, {
                method: 'DELETE',
            });
            const result = await response.json();

            if (result.success) {
                dispatch(showToast({ message: 'Content deleted successfully', type: 'success' }));
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
                fetchData();
            } else {
                dispatch(showToast({ message: result.message || 'Failed to delete content', type: 'error' }));
            }
        } catch (error) {
            console.error('Error deleting content:', error);
            dispatch(showToast({ message: 'Error deleting content', type: 'error' }));
        } finally {
            setIsDeleting(false);
        }
    };

    const openDeleteModal = (id: string, title: string) => {
        setItemToDelete({ id, title });
        setIsDeleteModalOpen(true);
    };

    const filteredContent = contentList;

    if (!loggedInUser && loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Content Management</h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Create and manage content modules for the application.</p>
                </div>
                <Tooltip
                    content={!isSuperAdmin ? "You do not have permission to create content" : ""}
                >
                    <div className={!isSuperAdmin ? "cursor-not-allowed w-fit" : "w-fit"}>
                        <Link
                            href={isSuperAdmin ? "/content/create" : "#"}
                            className={`flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/25 w-fit ${!isSuperAdmin ? 'opacity-50 pointer-events-none grayscale-[0.5]' : 'cursor-pointer'}`}
                        >
                            <Plus className="h-5 w-5" />
                            Create New Content
                        </Link>
                    </div>
                </Tooltip>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title or description..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8">
                            <TableSkeleton rows={limit} columns={4} />
                        </div>
                    ) : filteredContent.length === 0 ? (
                        <EmptyState
                            title={searchQuery ? "No content found" : "No content yet"}
                            description={searchQuery
                                ? `No content modules matched your search for "${searchTerm}"`
                                : "Start creating and managing your website's content modules."}
                            icon={<FileText className="h-12 w-12 text-gray-400" />}
                            action={{
                                label: "Add Content",
                                onClick: () => router.push('/content/create'),
                                disabled: !isSuperAdmin,
                                tooltip: !isSuperAdmin ? "You do not have permission to create content" : ""
                            }}
                        />
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-900/50">
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Title</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Short Description</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Created At</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredContent.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-10 text-center text-gray-500">
                                            No content found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredContent.map((item) => {
                                        const contentId = item.id || item._id;
                                        return (
                                            <tr key={contentId} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{item.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 max-w-xs">{item.shortDescription}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${item.status === 1
                                                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100/50 dark:border-green-800/50"
                                                        : "bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-400 border-gray-100/50 dark:border-gray-800/50"
                                                        }`}>
                                                        {item.status === 1 ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(item.created_at).toLocaleDateString('en-GB')}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Tooltip content="View Content">
                                                            <Link
                                                                href={`/content/view/${contentId}`}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Tooltip>
                                                        <Tooltip
                                                            content={!isSuperAdmin ? "You do not have permission to edit content" : "Edit Content"}
                                                        >
                                                            <div className={!isSuperAdmin ? "cursor-not-allowed" : ""}>
                                                                <Link
                                                                    href={isSuperAdmin ? `/content/edit/${contentId}` : "#"}
                                                                    className={`p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition-colors flex items-center justify-center ${!isSuperAdmin ? 'opacity-30 pointer-events-none' : 'cursor-pointer'}`}
                                                                >
                                                                    <Edit2 className="h-4 w-4" />
                                                                </Link>
                                                            </div>
                                                        </Tooltip>
                                                        <Tooltip
                                                            content={!isSuperAdmin ? "You do not have permission to delete content" : "Delete Content"}
                                                        >
                                                            <div className={!isSuperAdmin ? "cursor-not-allowed" : ""}>
                                                                <button
                                                                    onClick={() => contentId && openDeleteModal(contentId, item.title)}
                                                                    disabled={!isSuperAdmin}
                                                                    className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    limit={limit}
                    onLimitChange={(newLimit) => {
                        setLimit(newLimit);
                        setPage(1);
                    }}
                    totalItems={totalCount}
                />
            </div>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                itemName={itemToDelete?.title}
                isLoading={isDeleting}
                message="Are you sure you want to delete this content module? This action will permanently remove it from the system."
            />
        </div >
    );
}
