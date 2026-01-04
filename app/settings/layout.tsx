'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import UserProfileMenu from '@/components/UserProfileMenu';
import { Toaster } from 'react-hot-toast';

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="min-h-screen bg-slate-50">
            <Toaster position="top-center" />

            {/* Navigation */}
            <nav className="border-b border-slate-200 bg-white sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/dashboard')}>
                        <div className="flex items-center justify-center">
                            <Image src="/favicon.svg" alt="TaskMaster Logo" width={36} height={36} className="w-9 h-9" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-slate-900 hidden sm:block">Taskmaster</span>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Settings</span>

                        <Link
                            href="/dashboard"
                            className="text-slate-600 hover:text-primary transition-colors"
                        >
                            <span className="text-sm font-semibold">Dashboard</span>
                        </Link>
                        <UserProfileMenu />
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar */}
                    <aside className="lg:col-span-3">
                        <nav className="space-y-1">
                            <Link
                                href="/settings/achievements"
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors mb-6 ${isActive('/settings/achievements')
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isActive('/settings/achievements') ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <i className="fas fa-fire text-xs"></i>
                                </div>
                                Achievements
                            </Link>

                            <div className="mb-4 px-3">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">General</p>
                            </div>

                            <Link
                                href="/settings/account"
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive('/settings/account')
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                            >
                                <i className={`fas fa-user-circle w-5 text-center ${isActive('/settings/account') ? 'text-emerald-600' : 'text-slate-400'}`}></i>
                                Account
                            </Link>

                            <Link
                                href="/settings/preferences"
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive('/settings/preferences')
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                            >
                                <i className={`fas fa-sliders-h w-5 text-center ${isActive('/settings/preferences') ? 'text-emerald-600' : 'text-slate-400'}`}></i>
                                Preferences
                            </Link>
                        </nav>
                    </aside>

                    {/* Content */}
                    <div className="lg:col-span-9 space-y-6">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
