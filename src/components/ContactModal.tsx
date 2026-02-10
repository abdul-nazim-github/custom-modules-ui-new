
"use client";

import React, { useState } from "react";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
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

export function ContactModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState<ContactFormData>({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    // Remove showSuccess state as we use Toast
    // const [showSuccess, setShowSuccess] = useState(false);

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

            // Axios throws on non-2xx status code automatically, so we don't need to check response.ok manually
            // unless we configured validateStatus
            const data = response.data;

            dispatch(showToast({ message: data?.message || "Contact form submitted successfully.", type: "success" }));
            setFormData({ name: "", email: "", subject: "", message: "" });

            // Close modal after success
            onClose();

        } catch (err: unknown) {
            let errorMessage = "Failed to send message";
            if (isAxiosError(err)) {
                errorMessage = err.response?.data?.message || err.message || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            dispatch(showToast({ message: errorMessage, type: "error" }));
            // Also set general error in form for visibility
            // setErrors({ general: errorMessage }); // Optional: if we want to show it in the modal too
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setErrors({});
        setFormData({ name: "", email: "", subject: "", message: "" });
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Drop us your query">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition dark:bg-gray-700 dark:text-white ${errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                    />
                    {errors.name && (
                        <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="example@domain.com"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition dark:bg-gray-700 dark:text-white ${errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                    />
                    {errors.email && (
                        <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subject <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="subject"
                        name="subject"
                        placeholder="Inquiry Subject"
                        value={formData.subject}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition dark:bg-gray-700 dark:text-white ${errors.subject ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                    />
                    {errors.subject && (
                        <p className="text-xs text-red-500 mt-1">{errors.subject}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Message <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                        id="message"
                        name="message"
                        placeholder="Your message here..."
                        value={formData.message}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition dark:bg-gray-700 dark:text-white min-h-[100px] ${errors.message ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                    />
                    {errors.message && (
                        <p className="text-xs text-red-500 mt-1">{errors.message}</p>
                    )}
                </div>

                {errors.general && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                        {errors.general}
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending...
                            </>
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
