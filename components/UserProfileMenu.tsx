'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function UserProfileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user, signOut, userRole } = useAuth();
    const router = useRouter();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    const handleViewProfile = () => {
        setIsOpen(false);
        // TODO: Navigate to profile page
        router.push('/profile');
    };

    // Get user initials for avatar
    const getInitials = () => {
        if (!user?.email) return 'U';
        const email = user.email;
        return email.charAt(0).toUpperCase();
    };

    // Get display name
    const getDisplayName = () => {
        return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="User menu"
            >
                <i className="fas fa-user-circle text-2xl"></i>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400">
                                <i className="fas fa-user-circle text-3xl"></i>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                    {getDisplayName()}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        {/* Role Badge */}
                        <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary capitalize">
                                {userRole}
                            </span>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        <button
                            onClick={handleViewProfile}
                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                        >
                            <i className="fas fa-user w-4 text-center text-slate-400"></i>
                            <span>View Profile</span>
                        </button>

                        <button
                            onClick={() => {
                                setIsOpen(false);
                                router.push('/settings');
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                        >
                            <i className="fas fa-cog w-4 text-center text-slate-400"></i>
                            <span>Settings</span>
                        </button>

                        {userRole === 'admin' && (
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    router.push('/admin');
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                            >
                                <i className="fas fa-shield-alt w-4 text-center text-slate-400"></i>
                                <span>Admin Panel</span>
                            </button>
                        )}
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-slate-100 py-2">
                        <button
                            onClick={handleSignOut}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                        >
                            <i className="fas fa-sign-out-alt w-4 text-center"></i>
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
