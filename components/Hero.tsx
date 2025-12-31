
'use client';

import React from 'react';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <section className="relative overflow-hidden py-12 sm:py-24 lg:py-32 bg-white pt-20 sm:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4 sm:gap-6">
            <h1 className="text-4xl sm:text-5xl font-[900] leading-[1.1] tracking-tight text-slate-900 lg:text-7xl">
              Organize your work<br />and life, finally.
            </h1>
            <p className="text-base sm:text-xl text-slate-600 leading-relaxed max-w-lg">
              The simplest way to manage tasks, collaborate with teams, and hit your deadlines without the stress.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center lg:justify-start">
              <button
                onClick={onGetStarted}
                className="flex h-10 sm:h-12 items-center justify-center rounded-xl bg-primary px-6 sm:px-10 text-sm sm:text-base font-medium text-white w-full sm:w-auto"
              >
                Start for free
              </button>
              <button className="flex h-10 sm:h-12 items-center justify-center rounded-xl bg-white border border-slate-200 px-6 sm:px-10 text-sm sm:text-base font-medium text-slate-900 w-full sm:w-auto">
                View Demo
              </button>
            </div>
            <div className="mt-5 sm:mt-6 flex items-center justify-center lg:justify-start gap-3 sm:gap-4 text-sm text-slate-500 font-medium">
              <div className="flex -space-x-2 sm:-space-x-3">
                {[1, 2, 3].map((i) => (
                  <img
                    key={i}
                    src={`https://picsum.photos/seed/${i + 10}/64/64`}
                    alt="User"
                    className="h-7 w-7 sm:h-9 sm:w-9 rounded-full border-2 border-white ring-1 ring-slate-100 object-cover"
                  />
                ))}
              </div>
              <div>
                <p className=""><a href="#" className="text-primary font-medium hover:underline">Ready to give a feedback?</a></p>
              </div>
            </div>
          </div>

          <div className="hidden md:block relative mx-auto w-full max-w-lg lg:max-w-none select-none">
            <div className="flex flex-col gap-5 relative z-10">
              {/* Task 1: Completed */}
              <div className="flex items-center gap-4 rounded-[2rem] border border-slate-100 bg-white p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <span className="material-symbols-outlined text-2xl">check</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 line-through opacity-50 text-lg">Review Q3 Financial Report</h3>
                  <p className="text-sm text-slate-500 font-medium">Completed today at 9:30 AM</p>
                </div>
              </div>

              {/* Task 2: Priority Active */}
              <div className="relative flex items-center gap-4 rounded-[2rem] border-2 border-primary bg-white p-6">
                <div className="absolute -right-2 -top-2 flex h-7 items-center justify-center rounded-lg bg-primary px-3 text-[10px] font-black uppercase tracking-[0.1em] text-white">
                  Priority
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-3xl">access_time</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-slate-900 text-xl">Website Redesign Launch</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold">
                    <span>Due in 2 hours</span>
                  </div>
                </div>
                <button className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 sm:flex">
                  <span className="material-symbols-outlined font-bold">arrow_forward</span>
                </button>
              </div>

              {/* Task 3: Pending */}
              <div className="flex items-center gap-4 rounded-[2rem] border border-slate-100 bg-white p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <span className="material-symbols-outlined text-2xl">radio_button_unchecked</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 text-lg">Team Brainstorming</h3>
                  <p className="text-sm text-slate-500 font-medium">Tomorrow at 10:00 AM</p>
                </div>
                <div className="flex -space-x-2">
                  <img src="https://picsum.photos/seed/face1/64/64" className="h-8 w-8 rounded-full border-2 border-white object-cover" alt="" />
                  <img src="https://picsum.photos/seed/face2/64/64" className="h-8 w-8 rounded-full border-2 border-white object-cover" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
