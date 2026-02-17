import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
    return (
        <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
    );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 4 }) => {
    return (
        <div className="w-full overflow-hidden">
            <div className="animate-pulse">
                {/* Header Skeleton */}
                <div className="h-12 bg-gray-100 dark:bg-gray-800/50 mb-4 rounded-xl" />

                {/* Rows Skeleton */}
                <div className="space-y-4">
                    {Array.from({ length: rows }).map((_, i) => (
                        <div key={i} className="flex gap-4 px-4">
                            {Array.from({ length: columns }).map((_, j) => (
                                <div key={j} className="h-10 bg-gray-50 dark:bg-gray-900/30 flex-1 rounded-lg" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
