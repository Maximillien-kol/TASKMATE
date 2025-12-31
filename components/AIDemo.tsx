
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
        <form onSubmit={handleSuggest} className="space-y-4 mr-4 sm:mr-0">
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Try it yourself</label>
          <div className="bg-white rounded-2xl border border-slate-200 p-1 focus-within:border-primary transition-colors">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="type anything messy..."
                className="flex-1 w-full h-full bg-transparent px-4 py-3 text-slate-900 placeholder:text-slate-400 font-normal text-xs sm:text-sm border-none focus:outline-none focus:ring-0"
              />
              <button
                disabled={loading || !input.trim()}
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${input.trim() ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-200 text-slate-400'
                  }`}
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
                ) : (
                  <span className="material-symbols-outlined">auto_awesome</span>
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium">Tip: Type anything messy, and we'll clean it up.</p>
        </form>

        {result && (
          <div className="mt-8 pt-8 border-t border-slate-100">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium text-slate-400 uppercase">Suggested Task</h4>
                  <p className="text-xl font-bold text-slate-900">{result.title}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${result.priority === 'High' ? 'bg-red-100 text-red-600' :
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
