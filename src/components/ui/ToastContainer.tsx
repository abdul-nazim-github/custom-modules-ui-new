
'use client';

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { removeToast } from '@/lib/features/toast/toastSlice';
import { Check, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContainer = () => {
    const dispatch = useAppDispatch();
    const toasts = useAppSelector((state) => state.toast.toasts);

    useEffect(() => {
        if (toasts.length > 0) {
            const timer = setTimeout(() => {
                dispatch(removeToast(toasts[0].id));
            }, 3000); // Auto dismiss after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [toasts, dispatch]);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-center gap-3 px-6 py-3 rounded-lg shadow-lg border pointer-events-auto animate-in fade-in slide-in-from-top-2
                        ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
                        ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
                        ${toast.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
                        ${toast.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : ''}
                    `}
                >
                    {toast.type === 'success' && <Check className="w-5 h-5 text-green-500" />}
                    {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                    {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                    {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}

                    <span className="font-medium text-sm">{toast.message}</span>

                    <button
                        onClick={() => dispatch(removeToast(toast.id))}
                        className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
