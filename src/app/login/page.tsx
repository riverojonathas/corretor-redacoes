'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!supabase) {
            setError('Configuração do Supabase ausente. Verifique o arquivo .env.local.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                setLoading(false);
            } else if (data.session) {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Erro inesperado ao conectar. Verifique o console.');
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/60">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-accent-red/10 flex items-center justify-center rounded-2xl mb-4">
                        <svg className="w-8 h-8 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-center text-3xl font-bold tracking-tight text-dark-gray">
                        Acesso Restrito
                    </h2>
                    <p className="mt-2 text-center text-sm font-medium text-gray-400">
                        Plataforma de Correção de Redações
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {error && (
                        <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-100 flex items-center gap-3">
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                E-mail
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                autoFocus
                                className="block w-full rounded-xl border border-gray-200 px-4 py-3.5 text-dark-gray placeholder-gray-400 focus:border-accent-red focus:outline-none focus:ring-4 focus:ring-accent-red/10 transition-all text-sm font-medium bg-gray-50/50"
                                placeholder="exemplo@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" title="password" className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Senha
                                </label>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="block w-full rounded-xl border border-gray-200 px-4 py-3.5 text-dark-gray placeholder-gray-400 focus:border-accent-red focus:outline-none focus:ring-4 focus:ring-accent-red/10 transition-all text-sm font-medium bg-gray-50/50"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-dark-gray px-4 py-3.5 text-sm font-bold text-white hover:bg-black focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-70 transition-all active:scale-[0.98] shadow-md"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Acessando...
                                </>
                            ) : (
                                'Entrar no Sistema'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
