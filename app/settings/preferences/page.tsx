'use client';

export default function PreferencesPage() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <i className="fas fa-tools text-2xl"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Preferences</h2>
            <p className="text-slate-500">
                Performance and display settings coming soon.
            </p>
        </div>
    );
}
