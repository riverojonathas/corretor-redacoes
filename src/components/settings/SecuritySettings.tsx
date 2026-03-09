import React, { useState } from 'react';
import { Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export function SecuritySettings() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('As senhas não coincidem.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                toast.error('Erro ao atualizar senha', { description: error.message });
            } else {
                toast.success('Senha atualizada com sucesso!');
                setPassword('');
                setConfirmPassword('');
            }
        } catch (err: any) {
            console.error('Exception on password update:', err);
            toast.error('Falha inesperada ao tentar atualizar a senha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-dark-gray mb-1">Segurança e Acesso</h3>
                <p className="text-sm text-gray-500">Mantenha sua conta protegida com uma senha forte.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Nova Senha
                        </label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-dark-gray focus:ring-2 focus:ring-accent-red/20 focus:border-accent-red outline-none transition-all placeholder:text-gray-400"
                                placeholder={"••••••••"}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Confirmar Nova Senha
                        </label>
                        <div className="relative">
                            <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-dark-gray focus:ring-2 focus:ring-accent-red/20 focus:border-accent-red outline-none transition-all placeholder:text-gray-400"
                                placeholder={"••••••••"}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || !password || !confirmPassword}
                            className="bg-dark-gray text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-dark-gray/20 hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 w-full sm:w-auto"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            Atualizar Senha
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
