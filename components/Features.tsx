
import React from 'react';

interface Feature {
  title: string;
  description: string;
  icon: string;
}

const FEATURES: Feature[] = [
  {
    title: 'Quick Add',
    description: 'Capture tasks in seconds with our intuitive shortcuts. Never let an idea slip away again.',
    icon: 'bolt'
  },
  {
    title: 'Smart Lists',
    description: "Auto-sort your tasks by priority, due date, and project. Focus on what's due next automatically.",
    icon: 'fact_check'
  },
  {
    title: 'Team Sync',
    description: 'Real-time collaboration without the chaos or confusion. Assign tasks and track progress together.',
    icon: 'group'
  }
];

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 sm:py-32 bg-white border-y border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-20 flex flex-col items-center text-center">
          <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Everything you need to stay on track
          </h2>
          <p className="mt-6 max-w-2xl text-xl text-slate-600 leading-relaxed">
            Powerful features designed to help you focus on what matters most, without the clutter.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {FEATURES.map((feature, idx) => (
            <div key={idx} className="flex flex-col rounded-3xl border border-slate-100 bg-slate-50 p-10">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white">
                <span className="material-symbols-outlined text-3xl font-bold">{feature.icon}</span>
              </div>
              <h3 className="mb-3 text-2xl font-extrabold text-slate-900">{feature.title}</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
