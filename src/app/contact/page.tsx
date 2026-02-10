'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useAppDispatch } from "@/lib/hooks";
import { showToast } from "@/lib/features/toast/toastSlice";
import { ContactFormData } from "@/types/contact";
import { ChevronLeft } from 'lucide-react';

export default function ContactPage() {
    const dispatch = useAppDispatch();

    const [formData, setFormData] = useState<ContactFormData>({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
            isValid = false;
        } else if (formData.name.trim().length > 100) {
            newErrors.name = "Name must be less than 100 characters";
            isValid = false;
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = "Invalid email format";
            isValid = false;
        }

        if (!formData.subject.trim()) {
            newErrors.subject = "Subject is required";
            isValid = false;
        }

        if (!formData.message.trim()) {
            newErrors.message = "Message is required";
            isValid = false;
        } else if (formData.message.trim().length < 10) {
            newErrors.message = "Message must be at least 10 characters";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);

        try {
            const response = await fetch("/api/contact/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    subject: formData.subject.trim(),
                    message: formData.message.trim(),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                dispatch(showToast({
                    message: data?.message || "Inquiry sent successfully!",
                    type: "success"
                }));
                setFormData({ name: "", email: "", subject: "", message: "" });
            } else {
                dispatch(showToast({
                    message: data?.message || "Failed to submit contact form",
                    type: "error"
                }));
            }
        } catch (err: unknown) {
            dispatch(showToast({
                message: err instanceof Error ? err.message : "An unexpected error occurred",
                type: "error"
            }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-xl">
                <Link
                    href="/login"
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-8 transition-colors group w-fit cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Login
                </Link>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 sm:p-12">
                    <div className="mb-10 text-center">
                        <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-3">Contact Support</h1>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">How can we help you today?</p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={isLoading}
                                className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 transition-all duration-200 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isLoading}
                                className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 transition-all duration-200 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="subject" className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="subject"
                                name="subject"
                                type="text"
                                placeholder="Report a bug / Feature request / Billing"
                                value={formData.subject}
                                onChange={handleChange}
                                disabled={isLoading}
                                className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 transition-all duration-200 ${errors.subject ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                            />
                            {errors.subject && <p className="text-red-500 text-xs mt-1 font-medium">{errors.subject}</p>}
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">
                                Message <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                placeholder="Please describe your issue in detail..."
                                value={formData.message}
                                onChange={handleChange}
                                disabled={isLoading}
                                rows={5}
                                className={`shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 transition-all duration-200 resize-none ${errors.message ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-600'}`}
                            />
                            {errors.message && <p className="text-red-500 text-xs mt-1 font-medium">{errors.message}</p>}
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-blue-500/30 transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-lg"
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending Inquiry...
                                    </span>
                                ) : (
                                    "Send Message"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
