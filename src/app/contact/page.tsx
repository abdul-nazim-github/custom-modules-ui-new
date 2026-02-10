"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch } from "@/lib/hooks";
import { showToast } from "@/lib/features/toast/toastSlice";
import api from "@/lib/api";
import { isAxiosError } from "axios";
import { ContactFormData } from "@/types/contact";

interface FormErrors {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    general?: string;
}

export default function ContactPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState<ContactFormData>({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
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
        } else if (formData.email.trim().length > 100) {
            newErrors.email = "Email must be less than 100 characters";
            isValid = false;
        }

        if (!formData.subject.trim()) {
            newErrors.subject = "Subject is required";
            isValid = false;
        } else if (formData.subject.trim().length > 200) {
            newErrors.subject = "Subject must be less than 200 characters";
            isValid = false;
        }

        if (!formData.message.trim()) {
            newErrors.message = "Message is required";
            isValid = false;
        } else if (formData.message.trim().length < 10) {
            newErrors.message = "Message must be at least 10 characters";
            isValid = false;
        } else if (formData.message.trim().length > 2000) {
            newErrors.message = "Message must be less than 2000 characters";
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
        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        setErrors({});

        try {
            const response = await api.post("/api/contact/submit", {
                name: formData.name.trim(),
                email: formData.email.trim(),
                subject: formData.subject.trim(),
                message: formData.message.trim(),
            });

            const data = response.data;

            dispatch(showToast({ message: data?.message || "Contact form submitted successfully.", type: "success" }));
            setFormData({ name: "", email: "", subject: "", message: "" });

            // Navigate back to home or contact list after success
            router.push("/");

        } catch (err: unknown) {
            let errorMessage = "Failed to send message";
            if (isAxiosError(err)) {
                errorMessage = err.response?.data?.message || err.message || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            dispatch(showToast({ message: errorMessage, type: "error" }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 dark:bg-gray-900 transition-colors">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center mb-6">
                    <div className="rounded-full bg-blue-600 p-3 text-white shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                </Link>
                <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    Drop us your query
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    We'd love to hear from you. We usually respond within 24 hours.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-blue-500/5 sm:rounded-2xl sm:px-10 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <form onSubmit={handleSubmit} noValidate className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={isLoading}
                                className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition dark:bg-gray-700 dark:text-white ${errors.name ? "border-red-500 shadow-sm shadow-red-500/10" : "border-gray-300 dark:border-gray-600 focus:border-blue-500"}`}
                            />
                            {errors.name && (
                                <p className="text-xs font-medium text-red-500 mt-1.5 ml-1">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isLoading}
                                className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition dark:bg-gray-700 dark:text-white ${errors.email ? "border-red-500 shadow-sm shadow-red-500/10" : "border-gray-300 dark:border-gray-600 focus:border-blue-500"}`}
                            />
                            {errors.email && (
                                <p className="text-xs font-medium text-red-500 mt-1.5 ml-1">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="subject"
                                name="subject"
                                placeholder="How can we help?"
                                value={formData.subject}
                                onChange={handleChange}
                                disabled={isLoading}
                                className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition dark:bg-gray-700 dark:text-white ${errors.subject ? "border-red-500 shadow-sm shadow-red-500/10" : "border-gray-300 dark:border-gray-600 focus:border-blue-500"}`}
                            />
                            {errors.subject && (
                                <p className="text-xs font-medium text-red-500 mt-1.5 ml-1">{errors.subject}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                Message <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                id="message"
                                name="message"
                                placeholder="Please describe your query in detail..."
                                value={formData.message}
                                onChange={handleChange}
                                disabled={isLoading}
                                className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition dark:bg-gray-700 dark:text-white min-h-[140px] resize-none ${errors.message ? "border-red-500 shadow-sm shadow-red-500/10" : "border-gray-300 dark:border-gray-600 focus:border-blue-500"}`}
                            />
                            {errors.message && (
                                <p className="text-xs font-medium text-red-500 mt-1.5 ml-1">{errors.message}</p>
                            )}
                        </div>

                        {errors.general && (
                            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
                                {errors.general}
                            </div>
                        )}

                        <div className="flex flex-col gap-3 pt-2">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 text-base font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending message...
                                    </span>
                                ) : (
                                    "Send Message"
                                )}
                            </Button>
                            <Link href="/" className="w-full">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-11 text-base font-medium rounded-xl border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Interested in seeing other requests?{" "}
                        <Link href="/contact-support" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
                            View Contact List
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
