'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function AccountPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form stats
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        timezone: 'UTC',
        avatarUrl: ''
    });

    // Collaborators Data
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'Viewer' });
    const [collaborators, setCollaborators] = useState<any[]>([]);

    // Fetch collaborators
    const fetchCollaborators = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('collaborators')
                .select('*')
                .eq('user_id', user.id) // Explicitly filter by parental user ID
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Format for display
            const formatted = (data || []).map((c: any) => ({
                ...c,
                initials: c.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
                color: 'bg-emerald-100 text-emerald-600' // You could randomize this or hash from name
            }));

            setCollaborators(formatted);
        } catch (error) {
            // Silently fail or warn for network/fetch errors to avoid disrupting UI
            console.warn('Unable to fetch collaborators (network or permission issue).');
        }
    };

    useEffect(() => {
        if (user) {
            fetchCollaborators();
        }
    }, [user]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteForm.name || !inviteForm.email) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!user) return;

        try {
            const newCollaborator = {
                user_id: user.id,
                name: inviteForm.name,
                email: inviteForm.email,
                role: inviteForm.role,
                status: 'Pending'
            };

            const { error } = await supabase
                .from('collaborators')
                .insert([newCollaborator]);

            if (error) throw error;

            // Send Email Invitation
            try {
                const response = await fetch('/api/invite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: inviteForm.email,
                        name: inviteForm.name,
                        inviterName: user.user_metadata?.full_name || 'A user',
                        role: inviteForm.role
                    })
                });

                if (!response.ok) {
                    console.warn('Failed to send email invite, but database record created.');
                    toast.error('Collaborator added, but email failed to send.');
                } else {
                    toast.success(`Invitation sent to ${inviteForm.email}!`);
                }
            } catch (emailError) {
                console.error('Error invoking invite API:', emailError);
                toast.error('Collaborator added, but email failed to send.');
            }

            setInviteModalOpen(false);
            setInviteForm({ name: '', email: '', role: 'Viewer' });
            fetchCollaborators(); // Refresh list

        } catch (error: any) {
            console.error('Error adding collaborator:', error);
            toast.error(error.message || 'Failed to send invite');
        }
    };

    const removeCollaborator = async (id: string) => {
        if (!confirm('Are you sure you want to remove this collaborator?')) return;

        try {
            const { error } = await supabase
                .from('collaborators')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Collaborator removed');
            fetchCollaborators(); // Refresh list
        } catch (error: any) {
            console.error('Error removing collaborator:', error);
            toast.error('Failed to remove collaborator');
        }
    };

    useEffect(() => {
        if (user) {
            const fullName = user.user_metadata?.full_name || '';
            const [first, ...last] = fullName.split(' ');
            setFormData({
                firstName: first || '',
                lastName: last.join(' ') || '',
                phone: user.user_metadata?.phone || user.phone || '',
                timezone: user.user_metadata?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                avatarUrl: user.user_metadata?.avatar_url || ''
            });
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: `${formData.firstName} ${formData.lastName}`.trim(),
                    timezone: formData.timezone,
                    phone: formData.phone,
                    avatar_url: formData.avatarUrl
                }
            });

            if (error) throw error;
            toast.success('Settings updated successfully!');
        } catch (error: any) {
            console.error('Error updating settings:', error);
            toast.error(error.message || 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    // Avatar upload handler
    // Avatar upload handler
    // Avatar upload handler
    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!navigator.onLine) {
            toast.error('You are offline. Please check your internet connection.');
            return;
        }

        try {
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }
            if (!user) return;

            const originalFile = event.target.files[0];
            const MAX_WIDTH = 500;
            const MAX_HEIGHT = 500;

            setLoading(true);
            const uploadToast = toast.loading('Uploading...');

            // Resize Helper
            const resizeImage = (file: File): Promise<Blob> => {
                return new Promise((resolve, reject) => {
                    const img = document.createElement('img');
                    img.src = URL.createObjectURL(file);
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                            }
                        } else {
                            if (height > MAX_HEIGHT) {
                                width *= MAX_HEIGHT / height;
                                height = MAX_HEIGHT;
                            }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(img, 0, 0, width, height);

                        canvas.toBlob((blob) => {
                            if (blob) resolve(blob);
                            else reject(new Error('Canvas compression failed'));
                        }, 'image/jpeg', 0.8); // 80% quality
                    };
                    img.onerror = (err) => reject(err);
                });
            };

            const resizedBlob = await resizeImage(originalFile);
            const filePath = `${user.id}-${Math.random()}.jpg`;
            const fileToUpload = new File([resizedBlob], filePath, { type: 'image/jpeg' });

            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, fileToUpload, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Update Local State Only
            setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));

            toast.success('Profile image updated!', { id: uploadToast });

        } catch (error: any) {
            console.error('Error uploading profile image:', error);
            const msg = error.message || '';
            if (msg.includes('Failed to fetch') || msg.includes('Network request failed')) {
                toast.error('Upload failed. Please check your internet connection.');
            } else {
                toast.error('Failed: ' + (error.message || 'Unknown error'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Profile Header */}
            <div className="flex items-center gap-6">
                <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-sm bg-slate-200">
                    {formData.avatarUrl ? (
                        <img
                            src={formData.avatarUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                            <i className="fas fa-user text-5xl"></i>
                        </div>
                    )}

                    {/* Overlay Input */}
                    <label className="absolute bottom-0 left-0 right-0 h-10 bg-black/60 flex items-center justify-center cursor-pointer transition-colors hover:bg-black/70 z-10">
                        <i className="fas fa-camera text-white text-base"></i>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={uploadAvatar}
                            disabled={loading}
                        />
                    </label>
                </div>
            </div>

            {/* Contact Details Card */}
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">Contact Details</h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">First Name</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold text-slate-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Last Name</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold text-slate-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
                            <div className="flex">
                                <div className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl flex items-center gap-2">
                                    <i className="fas fa-globe-americas text-slate-500 text-xs"></i>
                                </div>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="flex-1 px-4 py-2.5 rounded-r-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold text-slate-900"
                                    placeholder="+xxxx xxx xxx xxx"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Timezone</label>
                            <select
                                value={formData.timezone}
                                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold text-slate-900"
                            >
                                <option>{formData.timezone}</option>
                                <option value="UTC">UTC</option>
                                <option value="America/New_York">Eastern Time (US & Canada)</option>
                                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                                <option value="Europe/London">London</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                        >
                            {loading && <i className="fas fa-spinner fa-spin"></i>}
                            Save Changes
                        </button>
                    </div>
                </div>
            </section>

            {/* Collaborators */}
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900">Collaborators</h2>
                    <button
                        onClick={() => setInviteModalOpen(true)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                        <i className="fas fa-plus"></i> Add Collaborator
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">User</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Role</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {collaborators.map(collaborator => (
                                <tr key={collaborator.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${collaborator.color}`}>
                                                {collaborator.initials}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{collaborator.name}</p>
                                                <p className="text-xs text-slate-500">{collaborator.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{collaborator.role}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${collaborator.status === 'Active'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : 'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}>
                                            {collaborator.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => removeCollaborator(collaborator.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {collaborators.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">
                                        No collaborators yet. Invite someone to verify!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Invite Modal */}
            {inviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900">Invite Collaborator</h3>
                            <button
                                onClick={() => setInviteModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <form onSubmit={handleInvite} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Jane Doe"
                                    value={inviteForm.name}
                                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold text-slate-900 placeholder:font-normal"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="e.g. jane@company.com"
                                    value={inviteForm.email}
                                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold text-slate-900 placeholder:font-normal"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Role</label>
                                <select
                                    required
                                    value={inviteForm.role}
                                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold text-slate-900"
                                >
                                    <option value="Viewer">Viewer - Can only view tasks</option>
                                    <option value="Editor">Editor - Can create & edit tasks</option>
                                    <option value="Admin">Admin - Full access</option>
                                </select>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setInviteModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm text-sm"
                                >
                                    Send Invite
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Account */}
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">Delete Account</h2>
                </div>
                <div className="p-6">
                    <p className="text-sm text-slate-600 mb-4">
                        This action is permanent and cannot be undone. All your tasks and data will be permanently removed.
                    </p>
                    <button className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 text-sm font-bold rounded-xl transition-colors">
                        Delete Account
                    </button>
                </div>
            </section>
        </>
    );
}
