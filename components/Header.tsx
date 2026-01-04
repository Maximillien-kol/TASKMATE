'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Use a mounted state to prevent hydration mismatch for auth state
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <div className="flex items-center justify-center">
            <img src="/favicon.svg" alt="TaskMaster Logo" className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">TaskMaster</h2>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-primary">Features</a>
          <a href="#testimonials" className="text-sm font-semibold text-slate-600 hover:text-primary">Testimonials</a>
          <a href="#" className="text-sm font-semibold text-slate-600 hover:text-primary">Pricing</a>
        </nav>

        <div className="flex items-center gap-3">
          {mounted && !loading && user ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-white hover:bg-emerald-600 transition-colors"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => router.push('/signin')}
                className="hidden sm:flex h-9 items-center justify-center rounded-lg px-4 text-sm font-bold text-slate-900 hover:bg-slate-100"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/signup')}
                className="flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-white hover:bg-emerald-600 transition-colors"
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
