
'use client';

import { useState } from 'react';
import { suggestTaskStructure } from '@/services/geminiService';

const AIDemo: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    const suggestion = await suggestTaskStructure(input);
    setResult(suggestion);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden max-w-3xl mx-auto">
      <div className="p-8">
        <form onSubmit={handleSuggest} className="space-y-4">
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Try it yourself</label>
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all p-2 mt-2">
            <div className="flex flex-col">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Anything...."
                className="w-full bg-transparent border-none focus:ring-0 outline-none px-4 py-3 text-md text-slate-800 placeholder-slate-400 font-medium"
                disabled={loading}
              />

              <div className="flex items-center justify-between px-2 pb-1 mt-2">
                <div className="flex items-center gap-1 sm:gap-2">

                  <div className="flex items-center">
                    <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-md mr-2">Beta</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                >
                  {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <i className="fas fa-arrow-right text-sm"></i>}
                </button>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium">Tip: Type anything messy, and we'll clean it up.</p>
        </form>

        {result && (
          <div className="mt-8 pt-8 border-t border-slate-100">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase">Suggested Task</h4>
                  <p className="text-2xl font-black text-slate-900">{result.title}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${result.priority === 'High' ? 'bg-red-100 text-red-600' :
                  result.priority === 'Medium' ? 'bg-orange-100 text-orange-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                  {result.priority}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Duration</p>
                  <p className="text-slate-900 font-bold">{result.duration}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Category</p>
                  <p className="text-slate-900 font-bold">{result.category}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-slate-50 px-8 py-4 flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-xl">info</span>
        <p className="text-xs text-slate-500 font-medium italic">Our Gemini AI understands natural language context, so you don't have to fill out long forms.</p>
      </div>
    </div>
  );
};

export default AIDemo;
