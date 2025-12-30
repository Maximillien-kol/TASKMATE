'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error } = await resetPassword(email);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setIsSubmitted(true);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <header className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex items-center justify-center">
                        <Image src="/favicon.svg" alt="TaskMaster Logo" width={36} height={36} className="w-9 h-9" />
                    </div>
                    <span className="text-xl font-medium tracking-tight text-gray-900">TaskMaster</span>
                </Link>
                <Link
                    href="/signin"
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                    Sign in
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    {/* Logo Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="flex items-center justify-center">
                            <Image src="/favicon.svg" alt="TaskMaster Logo" width={48} height={48} className="w-12 h-12" />
                        </div>
                    </div>

                    {isSubmitted ? (
                        /* Success State */
                        <div className="text-center">
                            <div className="mb-6 flex justify-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
                                Check your email
                            </h1>
                            <p className="text-gray-600 mb-6">
                                We've sent a password reset link to<br />
                                <span className="font-medium text-gray-900">{email}</span>
                            </p>
                            <p className="text-sm text-gray-500 mb-8">
                                Didn't receive the email?{' '}
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="text-primary hover:underline font-medium"
                                >
                                    Click to resend
                                </button>
                            </p>
                            <Link
                                href="/signin"
                                className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to sign in
                            </Link>
                        </div>
                    ) : (
                        /* Form State */
                        <>
                            {/* Heading */}
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                                    Forgot password?
                                </h1>
                                <p className="text-gray-600">
                                    No worries, we'll send you reset instructions
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Email Field */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="myemail@email.com"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                                >
                                    {loading ? 'Sending...' : 'Reset Password'}
                                </button>

                                {/* Back to Sign In */}
                                <div className="text-center pt-2">
                                    <Link
                                        href="/signin"
                                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Back to sign in
                                    </Link>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
