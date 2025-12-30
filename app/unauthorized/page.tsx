'use client';

import Link from 'next/link';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-10 h-10 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Access Denied
                </h1>

                {/* Message */}
                <p className="text-gray-600 mb-8">
                    You don't have permission to access this page. Please contact your administrator if you believe this is an error.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Go to Home
                    </Link>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
