'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    cargo: string | null;
    nome: string | null;
    avatarUrl: string | null;
    primeiroAcesso: boolean;
    setPrimeiroAcesso: (val: boolean) => void;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    cargo: null,
    nome: null,
    avatarUrl: null,
    primeiroAcesso: false,
    setPrimeiroAcesso: () => { },
    loading: true,
    signOut: async () => { },
    refreshProfile: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [cargo, setCargo] = useState<string | null>(null);
    const [nome, setNome] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
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
                .select('cargo, primeiro_acesso, nome, avatar_url')
                .eq('id', userId)
                .single();

            if (!error && data) {
                setCargo(data.cargo?.trim() || null);
                setNome(data.nome?.trim() || null);
                setAvatarUrl(data.avatar_url?.trim() || null);

                // Fallback: se o DB falhou em salvar (ex: erro silencioso de RLS), conferimos o lock local
                const hasSeenLocal = typeof window !== 'undefined' ? localStorage.getItem(`onboarding_dismissed_${userId}`) : null;
                setPrimeiroAcesso(data.primeiro_acesso === true && !hasSeenLocal);
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

    const refreshProfile = async () => {
        if (user) {
            await fetchCargo(user.id);
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
                setNome(null);
                setAvatarUrl(null);
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
        <AuthContext.Provider value={{ session, user, cargo, nome, avatarUrl, primeiroAcesso, setPrimeiroAcesso, loading, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
