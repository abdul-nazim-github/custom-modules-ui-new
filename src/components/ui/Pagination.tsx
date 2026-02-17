import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    limit: number;
    onLimitChange: (limit: number) => void;
    totalItems: number;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    limit,
    onLimitChange,
    totalItems,
}) => {
    const limitOptions = [10, 20, 50, 100];

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    if (totalItems === 0) return null;

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-8 py-6 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Rows per page:</span>
                    <select
                        value={limit}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer shadow-sm"
                    >
                        {limitOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 hidden md:block" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing <span className="font-bold text-gray-900 dark:text-white">{Math.min((currentPage - 1) * limit + 1, totalItems)}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min(currentPage * limit, totalItems)}</span> of <span className="font-bold text-gray-900 dark:text-white">{totalItems}</span>
                </p>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm group"
                >
                    <ChevronLeft className="h-4 w-4 group-hover:text-blue-500 transition-colors" />
                </button>

                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, idx) => (
                        page === '...' ? (
                            <span key={`dots-${idx}`} className="px-2 py-1 text-gray-400">
                                <MoreHorizontal className="h-4 w-4" />
                            </span>
                        ) : (
                            <button
                                key={idx}
                                onClick={() => onPageChange(page as number)}
                                className={`min-w-[40px] px-3 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer ${currentPage === page
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 border border-blue-600'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                                    }`}
                            >
                                {page}
                            </button>
                        )
                    ))}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-white dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm group"
                >
                    <ChevronRight className="h-4 w-4 group-hover:text-blue-500 transition-colors" />
                </button>
            </div>
        </div>
    );
};
