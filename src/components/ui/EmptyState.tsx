import React from 'react';
import { SearchX, Plus } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    icon = <SearchX className="h-12 w-12 text-gray-400" />,
    action
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in duration-500">
            <div className="h-24 w-24 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center mb-6 border-4 border-white dark:border-gray-800 shadow-sm">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8">
                {description}
            </p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
                >
                    <Plus className="h-4 w-4" />
                    {action.label}
                </button>
            )}
        </div>
    );
};
