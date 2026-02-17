import React, { useState } from 'react';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = 'top',
    delay = 0,
    disabled = false
}) => {
    const [isVisible, setIsVisible] = useState(false);
    let timeout: NodeJS.Timeout;

    if (!content || disabled) return <>{children}</>;

    const showTooltip = () => {
        timeout = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };

    const hideTooltip = () => {
        clearInterval(timeout);
        setIsVisible(false);
    };

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-gray-900 dark:border-t-gray-800',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-gray-900 dark:border-b-gray-800',
        left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-l-gray-900 dark:border-l-gray-800',
        right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-r-gray-900 dark:border-r-gray-800'
    };

    return (
        <div
            className="relative flex items-center w-fit"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
        >
            {children}
            {isVisible && (
                <div className={`absolute z-[100] ${positionClasses[position]} animate-in fade-in zoom-in duration-200`}>
                    <div className="relative px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-[10px] font-bold rounded-lg shadow-xl whitespace-nowrap border border-white/10">
                        {content}
                        <div className={`absolute border-4 border-transparent ${arrowClasses[position]}`} />
                    </div>
                </div>
            )}
        </div>
    );
};
