import React, { useState } from 'react';
import { RefreshCcw, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export function WorkspaceSettings() {
    const { user, setPrimeiroAcesso } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleResetTutorial = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Limpa o local storage
            localStorage.removeItem(`onboarding_dismissed_${user.id}`);

            // Atualiza o banco de dados via RPC ou update direto
            const { error } = await supabase
                .from('perfis')
                .update({ primeiro_acesso: true })
                .eq('id', user.id);

            if (error) throw error;

            setPrimeiroAcesso(true);
            toast.success('Tutorial reiniciado!', {
                description: 'Clique em Ajuda ou vá para a Fila de Revisão para rever o tutorial inicial.'
            });
        } catch (e: any) {
            console.error(e);
            toast.error('Erro ao reiniciar tutorial', {
                description: 'Tente novamente mais tarde.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-dark-gray mb-1">Preferências da Mesa de Correção</h3>
                <p className="text-sm text-gray-500">Configure o comportamento padrão do seu ambiente de trabalho.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6">

                {/* Reset Onboarding */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h4 className="font-bold text-dark-gray flex items-center gap-2">
                            Tutorial de Boas-vindas
                        </h4>
                        <p className="text-sm text-gray-500 mt-1 max-w-sm">
                            Apaga a marcação de tutorial concluído, forçando a mensagem inicial a aparecer novamente.
                        </p>
                    </div>
                    <button
                        onClick={handleResetTutorial}
                        disabled={loading}
                        className="bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-dark-gray border border-gray-200 font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                        Reiniciar Dicas
                    </button>
                </div>

                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex gap-3 text-sm text-blue-800">
                    <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                    <div>
                        <strong>Mais preferências em breve:</strong> Modos de leitura padrão e barra de ferramentas fixa/flutuante serão adicionados aqui no futuro.
                    </div>
                </div>

            </div>
        </div>
    );
}
