"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function CollaboratorInviteNotification() {
    const [invites, setInvites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkInvites();
    }, []);

    const checkInvites = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) return;

            // Fetch pending invites using the secure RPC function
            const { data, error } = await supabase
                .rpc('get_my_invites');

            if (data && data.length > 0) {
                // Map the RPC result to the structure expected by the UI
                setInvites(data.map((i: any) => ({
                    id: i.id,
                    role: i.role,
                    user_id: i.user_id,
                    profiles: { full_name: i.inviter_name }
                })));
            } else if (data) {
                setInvites([]);
            }

            if (error) throw error;

            // Previous logic
            /* 
            const { data, error } = await supabase
                .from('collaborators')
                .select(`
                    id,
                    role,
                    user_id,
                    profiles:user_id ( full_name )
                `)
                .eq('email', user.email)
                .eq('status', 'Pending');
            */
        } catch (error) {
            console.error('Error checking invites:', JSON.stringify(error, null, 2));
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, accept: boolean) => {
        try {
            if (accept) {
                const { error } = await supabase
                    .from('collaborators')
                    .update({ status: 'Active' })
                    .eq('id', id);

                if (error) throw error;
                toast.success('You have joined the team!');
            } else {
                // If declined, maybe just delete or set to Inactive?
                // For now, let's just delete the invite row or set to Inactive
                const { error } = await supabase
                    .from('collaborators')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                toast.success('Invitation declined');
            }

            // Remove from local state
            setInvites(prev => prev.filter(inv => inv.id !== id));

        } catch (error) {
            console.error('Error handling invite:', error);
            toast.error('Failed to process invitation');
        }
    };

    if (loading || invites.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {invites.map((invite) => (
                <div key={invite.id} className="bg-white p-4 rounded-xl shadow-lg border border-emerald-100 w-80 animate-in slide-in-from-bottom-5 duration-300">
                    <div className="flex items-start gap-3">
                        <div className="bg-emerald-100 text-emerald-600 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                            <i className="fas fa-user-plus"></i>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-900">Collaboration Invite</h4>
                            <p className="text-xs text-slate-600 mt-1">
                                <span className="font-semibold text-emerald-600">
                                    {invite.profiles?.full_name || 'Generic User'}
                                </span>
                                {' '}invited you to join as a <span className="font-semibold">{invite.role}</span>.
                            </p>
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={() => handleAction(invite.id, true)}
                                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => handleAction(invite.id, false)}
                                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition"
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
