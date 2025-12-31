
import React from 'react';

const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 sm:py-32 bg-white border-y border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 flex flex-col items-center text-center">
          <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Everything you need to stay on track
          </h2>
          <p className="mt-6 max-w-2xl text-xl text-slate-600 leading-relaxed">
            Powerful features designed to help you focus on what matters most, without the clutter.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Card 1: Smart Organization */}
          <div>
            <div className="bg-slate-50 rounded-3xl p-8 h-80 flex items-center justify-center mb-8 relative overflow-hidden group hover:bg-slate-100 transition-colors select-none">
              {/* UI Mockup - Menu */}
              <div className="bg-white rounded-2xl shadow-xl w-64 p-4 transform transition-transform group-hover:scale-102 duration-300">
                <div className="text-xs font-semibold text-slate-400 mb-3 ml-1">WORKSPACE</div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400 text-xl">check_circle</span>
                      <span className="font-semibold text-slate-700 text-sm">My Tasks</span>
                    </div>
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">12</span>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <span className="material-symbols-outlined text-slate-400 text-xl">add_circle</span>
                    <span className="font-semibold text-slate-700 text-sm">New Project</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400 text-xl">flag</span>
                      <span className="font-semibold text-slate-700 text-sm">Priorities</span>
                    </div>
                    <div className="flex -space-x-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-100 cursor-pointer">
                    <div className="w-5 h-5 rounded overflow-hidden flex items-center justify-center bg-indigo-100 text-indigo-600">
                      <span className="material-symbols-outlined text-sm">group</span>
                    </div>
                    <span className="font-semibold text-slate-900 text-sm">Team Alpha</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center px-4">
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Organization</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Keep everything structured with smart lists, project folders, and automated tagging.</p>
            </div>
          </div>

          {/* Card 2: Real-time Updates */}
          <div>
            <div className="bg-slate-50 rounded-3xl p-8 h-80 flex items-center justify-center mb-8 relative group hover:bg-slate-100 transition-colors select-none">
              {/* UI Mockup - Toast */}
              <div className="bg-black text-white rounded-full px-6 py-3 shadow-2xl flex items-center gap-3 transform transition-all duration-300 group-hover:-translate-y-1">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-500 text-base font-bold">check</span>
                </div>
                <span className="font-medium">Task Completed</span>
              </div>

            </div>
            <div className="text-center px-4">
              <h3 className="text-xl font-bold text-slate-900 mb-3">Real-time Updates</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Get instant notifications on task progress, team comments, and deadline changes.</p>
            </div>
          </div>

          {/* Card 3: Seamless Collaboration */}
          <div>
            <div className="bg-slate-50 rounded-3xl p-8 h-80 flex items-center justify-center mb-8 relative group hover:bg-slate-100 transition-colors select-none">
              {/* UI Mockup - Chat Card */}
              <div className="bg-white rounded-2xl shadow-xl w-64 p-4 transform transition-transform group-hover:scale-102 duration-300">
                <div className="flex items-start gap-3 mb-3">
                  <img src="https://picsum.photos/seed/maya/40/40" alt="Kwizera" className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Kwizera</span>
                      <span className="text-slate-400 text-xs">2m ago</span>
                    </div>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                      Updated the project timeline for Q4. Please review the new milestones.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-100 rounded-xl p-2 flex items-center justify-between">
                  <div className="text-slate-800 text-sm font-medium pl-2 border-r-2 border-blue-500 animate-pulse h-5 flex items-center">
                    On it
                  </div>
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-sm font-bold">arrow_upward</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center px-4">
              <h3 className="text-xl font-bold text-slate-900 mb-3">Seamless Collaboration</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Work together in real-time. Share updates, give feedback, and keep everyone aligned.</p>
            </div>
          </div>
        </div>
      </div>
    </section >
  );
};

export default Features;
