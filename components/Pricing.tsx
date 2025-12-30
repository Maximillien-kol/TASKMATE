
import React from 'react';

const Pricing: React.FC = () => {
    return (
        <section id="pricing" className="py-24 sm:py-32 bg-white border-t border-slate-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                        Simple, transparent pricing
                    </h2>
                    <p className="mt-6 text-xl text-slate-600 leading-relaxed">
                        Start for free, upgrade when you need to. No credit card required.
                    </p>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 z-10 bg-white backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center p-8 text-center border border-slate-100">
                        <div className="bg-slate-900 text-white px-4 py-2 rounded-full font-bold text-sm mb-3 ">
                            Coming Soon
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Pricing Plans available in Future</h3>
                        <p className="mt-2 text-slate-500 max-w-sm">We are currently in beta. All features are free to use during this period but with limit.</p>
                    </div>

                    <div className="grid max-w-lg mx-auto lg:max-w-none lg:grid-cols-2 gap-8 items-center opacity-50 pointer-events-none select-none grayscale-[0.5]">
                        {/* Free Tier */}
                        <div className="flex flex-col rounded-3xl bg-slate-50 p-8 xl:p-10 border border-slate-200">
                            <div className="flex items-center justify-between gap-x-4">
                                <h3 id="tier-freelancer" className="text-xl font-bold leading-8 text-slate-900">Free</h3>
                            </div>
                            <p className="mt-4 text-sm leading-6 text-slate-600">Perfect for individuals just getting started.</p>
                            <p className="mt-6 flex items-baseline gap-x-1">
                                <span className="text-4xl font-bold tracking-tight text-slate-900">$0</span>
                                <span className="text-sm font-semibold leading-6 text-slate-600">/month</span>
                            </p>
                            <a href="/signup" className="mt-6 block rounded-xl py-3 px-3 text-center text-sm font-bold leading-6 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors">
                                Get started for free
                            </a>
                            <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-600">
                                {['Up to 5 projects', 'Basic task management', 'Collaborate with 1 person', '24-hour support response time'].map((feature) => (
                                    <li key={feature} className="flex gap-x-3 items-center">
                                        <span className="material-symbols-outlined text-indigo-600 text-lg">check</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Pro Tier */}
                        <div className="flex flex-col rounded-3xl bg-slate-900 p-8 xl:p-10 border border-slate-900  relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>

                            <div className="flex items-center justify-between gap-x-4 relative">
                                <h3 id="tier-startup" className="text-xl font-bold leading-8 text-white">Pro</h3>
                                <div className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-bold leading-5 text-indigo-400 ring-1 ring-inset ring-indigo-500/20">Most popular</div>
                            </div>
                            <p className="mt-4 text-sm leading-6 text-slate-300">For power users who want to do more.</p>
                            <p className="mt-6 flex items-baseline gap-x-1 relative">
                                <span className="text-4xl font-bold tracking-tight text-white">$12</span>
                                <span className="text-sm font-semibold leading-6 text-slate-400">/month</span>
                            </p>
                            <a href="/signup" className="mt-6 block rounded-xl py-3 px-3 text-center text-sm font-bold leading-6 text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-colors">
                                Start 14-day free trial
                            </a>
                            <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-300 relative">
                                {['Unlimited projects', 'Advanced AI insights', 'Unlimited collaborators', 'Priority support', 'Custom workflows'].map((feature) => (
                                    <li key={feature} className="flex gap-x-3 items-center">
                                        <span className="material-symbols-outlined text-indigo-400 text-lg">check</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Pricing;
