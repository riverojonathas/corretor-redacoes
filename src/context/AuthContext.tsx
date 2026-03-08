'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    cargo: string | null;
    primeiroAcesso: boolean;
    setPrimeiroAcesso: (val: boolean) => void;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    cargo: null,
    primeiroAcesso: false,
    setPrimeiroAcesso: () => { },
    loading: true,
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [cargo, setCargo] = useState<string | null>(null);
    const [primeiroAcesso, setPrimeiroAcesso] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const fetchingCargo = React.useRef(false);

    const fetchCargo = async (userId: string) => {
        if (!supabase) return;
        if (fetchingCargo.current) return;
        fetchingCargo.current = true;

        try {
            const { data, error } = await supabase
                .from('perfis')
                .select('cargo, primeiro_acesso')
                .eq('id', userId)
                .single();

            if (!error && data) {
                setCargo(data.cargo?.trim() || null);
                setPrimeiroAcesso(data.primeiro_acesso === true);
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

        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!mounted) return;

                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    fetchCargo(session.user.id).catch(console.error);
                }
            } catch (err: any) {
                console.error('Session error:', err);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
            if (!mounted) return;

            setSession(session);
            setUser(session?.user ?? null);

            if (event === 'SIGNED_OUT') {
                setCargo(null);
                setPrimeiroAcesso(false);
            } else if (session?.user && event === 'SIGNED_IN') {
                fetchCargo(session.user.id).catch(console.error);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        if (supabase) await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, cargo, primeiroAcesso, setPrimeiroAcesso, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
