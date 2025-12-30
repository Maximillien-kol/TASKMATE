
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Footer from './components/Footer';
import AIDemo from './components/AIDemo';
import DashboardView from './components/DashboardView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');

  if (currentView === 'dashboard') {
    return <DashboardView onBackToLanding={() => setCurrentView('landing')} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNavigateToDashboard={() => setCurrentView('dashboard')} />
      <main className="flex-grow">
        <Hero onGetStarted={() => setCurrentView('dashboard')} />
        
        {/* Features Section */}
        <div id="features">
          <Features />
        </div>

        {/* AI Interaction Layer - Enhancing the user's request with Gemini capabilities */}
        <section id="ai-demo" className="py-20 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
               <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">Powered by Gemini</span>
               <h2 className="mt-4 text-3xl font-black text-slate-900 sm:text-4xl">Smart Task Suggestions</h2>
               <p className="mt-4 text-lg text-slate-600">See how our AI helps you organize your chaotic thoughts into structured tasks.</p>
            </div>
            <AIDemo />
          </div>
        </section>

        {/* Testimonials Section */}
        <div id="testimonials">
          <Testimonials />
        </div>

        <CTA onGetStarted={() => setCurrentView('dashboard')} />
      </main>
      <Footer />
    </div>
  );
};

export default App;
