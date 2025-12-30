
import React from 'react';

interface CTAProps {
  onGetStarted: () => void;
}

const CTA: React.FC<CTAProps> = ({ onGetStarted }) => {
  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-20 text-center sm:px-16 sm:py-24">
          <h2 className="mx-auto max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl">
            Ready to finally get organized?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-xl text-slate-400">
            Join thousands of users who have transformed their productivity with TaskMaster.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={onGetStarted}
              className="flex h-14 items-center justify-center rounded-2xl bg-primary px-10 text-lg font-medium text-white"
            >
              Start for free
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
