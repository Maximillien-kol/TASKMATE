'use client';

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import AIDemo from '@/components/AIDemo';

export default function LandingPage() {
  const handleGetStarted = () => {
    window.location.href = '/signup';
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero onGetStarted={handleGetStarted} />
      <Features />
      <AIDemo />
      <Testimonials />
      <Pricing />
      <CTA onGetStarted={handleGetStarted} />
      <Footer />
    </div>
  );
}
