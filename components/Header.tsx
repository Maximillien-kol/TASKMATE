'use client';

import React, { useState } from 'react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 cursor-pointer">
          <div className="flex items-center justify-center">
            <Image src="/favicon.svg" alt="TaskMaster Logo" width={36} height={36} className="w-7 h-7 sm:w-9 sm:h-9" />
          </div>
          <h2 className="text-lg sm:text-xl font-medium tracking-tight text-slate-900">TaskMaster</h2>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-primary">Features</a>
          <a href="#testimonials" className="text-sm font-semibold text-slate-600 hover:text-primary">Testimonials</a>
          <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-primary">Pricing</a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium text-slate-900 hover:bg-slate-100"
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
                className="flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium text-slate-900 hover:bg-slate-100"
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

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-slate-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <span className="material-symbols-outlined">close</span>
          ) : (
            <span className="material-symbols-outlined">menu</span>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white p-4 absolute top-full left-0 right-0 shadow-lg flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-4">
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
            <a href="#testimonials" className="text-sm font-semibold text-slate-600 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Testimonials</a>
            <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
          </nav>
          <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
            {loading ? (
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-slate-900 bg-slate-100 hover:bg-slate-200"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}
                  className="flex h-10 items-center justify-center rounded-lg border border-slate-300 px-5 text-sm font-medium text-slate-900 hover:bg-slate-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { handleLogin(); setIsMobileMenuOpen(false); }}
                  className="flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-slate-900 bg-slate-100 hover:bg-slate-200"
                >
                  Login
                </button>
                <button
                  onClick={() => { if (onGetStarted) onGetStarted(); else handleGetStarted(); setIsMobileMenuOpen(false); }}
                  className="flex h-10 items-center justify-center rounded-lg bg-primary hover:bg-primary/90 px-5 text-sm font-medium text-white transition-colors"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
