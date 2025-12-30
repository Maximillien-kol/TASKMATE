'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onGetStarted?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onGetStarted }) => {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleLogin = () => {
    router.push('/signin');
  };

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/signup');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <div className="flex items-center justify-center">
            <Image src="/favicon.svg" alt="TaskMaster Logo" width={36} height={36} className="w-9 h-9" />
          </div>
          <h2 className="text-xl font-medium tracking-tight text-slate-900">TaskMaster</h2>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-primary">Features</a>
          <a href="#testimonials" className="text-sm font-semibold text-slate-600 hover:text-primary">Testimonials</a>
          <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-primary">Pricing</a>
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium text-slate-900 hover:bg-slate-100"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="flex h-9 items-center justify-center rounded-lg border border-slate-300 px-5 text-sm font-medium text-slate-900 hover:bg-slate-100"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleLogin}
                className="hidden sm:flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium text-slate-900 hover:bg-slate-100"
              >
                Login
              </button>
              <button
                onClick={onGetStarted || handleGetStarted}
                className="flex h-9 items-center justify-center rounded-lg bg-primary hover:bg-primary/90 px-5 text-sm font-medium text-white transition-colors"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
