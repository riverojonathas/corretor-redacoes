'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    cargo: string | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    cargo: null,
    loading: true,
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [cargo, setCargo] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const fetchingCargo = React.useRef(false);

    const fetchCargo = async (userId: string) => {
        if (!supabase) return;
        if (fetchingCargo.current) return;
        fetchingCargo.current = true;

        try {
            const { data, error } = await supabase
                .from('perfis')
                .select('cargo')
                .eq('id', userId)
                .single();

            if (!error && data) {
                setCargo(data.cargo?.trim() || null);
            } else if (error && !error.message?.includes('AbortError')) {
                console.error('Erro ao buscar cargo:', error.message);
            }
        } catch (err: any) {
            if (!err.message?.includes('AbortError')) {
                console.error('Exceção ao buscar cargo:', err.message);
            }
        } finally {
            fetchingCargo.current = false;
        }
    };

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        let mounted = true;

        // Failsafe para evitar tela de loading infinita caso o Supabase demore ou trave
        const failsafeTimeout = setTimeout(() => {
            if (mounted) setLoading(false);
        }, 3000);

        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }: { data: { session: Session | null } }) => {
            if (!mounted) return;
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                // Execute fetchCargo but ensure we don't block indefinitely
                await Promise.race([
                    fetchCargo(session.user.id),
                    new Promise(resolve => setTimeout(resolve, 2500))
                ]);
            }
            if (mounted) {
                clearTimeout(failsafeTimeout);
                setLoading(false);
            }
        }).catch((err: any) => {
            console.error('Session error:', err);
            if (mounted) {
                clearTimeout(failsafeTimeout);
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
            if (!mounted) return;

            setSession(session);
            setUser(session?.user ?? null);

            if (event === 'SIGNED_OUT') {
                setCargo(null);
            } else if (session?.user) {
                if (event === 'SIGNED_IN') {
                    await fetchCargo(session.user.id);
                }
                // We purposefully DO NOT set loading=true on TOKEN_REFRESHED to avoid 
                // tearing down the entire component tree while the user is active.
            }
        });

        return () => {
            mounted = false;
            clearTimeout(failsafeTimeout);
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        if (supabase) await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, cargo, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
