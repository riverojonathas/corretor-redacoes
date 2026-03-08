import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Sparkles, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomePopupProps {
    onClose: () => void;
}

export function WelcomePopup({ onClose }: WelcomePopupProps) {
    const { user, setPrimeiroAcesso } = useAuth();
    const [finishing, setFinishing] = React.useState(false);

    const handleDismiss = async () => {
        setFinishing(true);
        try {
            if (user && supabase) {
                // Tenta atualizar no supabase, ignorando erros silenciosamente caso a coluna ainda não exista
                await supabase
                    .from('perfis')
                    .update({ primeiro_acesso: false })
                    .eq('id', user.id);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setPrimeiroAcesso(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95 duration-500 delay-150 fill-mode-both">

                {/* Header Decoration */}
                <div className="h-32 bg-gradient-to-br from-dark-gray via-gray-800 to-black relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
                        <Sparkles className="text-white w-8 h-8" />
                    </div>
                </div>

                <div className="p-8 pb-10">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-dark-gray mb-3">Bem-vindo(a) ao Corretor!</h2>
                        <p className="text-gray-500 leading-relaxed text-sm">
                            Este é um ambiente inteligente para auxílio na revisão e correção de redações.
                            Conheça como a plataforma funciona:
                        </p>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                            <div className="mt-0.5"><CheckCircle2 className="text-green-500" size={20} /></div>
                            <div>
                                <h4 className="font-bold text-dark-gray text-sm mb-1">Análise da IA</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Nossa IA pré-avalia os textos apontando possíveis desvios e sugerindo notas com base nos critérios estabelecidos.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                            <div className="mt-0.5"><CheckCircle2 className="text-blue-500" size={20} /></div>
                            <div>
                                <h4 className="font-bold text-dark-gray text-sm mb-1">Revisão Humana</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Você tem total controle. Valide, altere e faça grifos para orientar o estudante de forma personalizada.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleDismiss}
                        disabled={finishing}
                        className={cn(
                            "w-full py-3.5 px-6 rounded-xl font-bold text-white bg-dark-gray hover:bg-black focus:ring-4 focus:ring-gray-200 transition-all flex items-center justify-center gap-2",
                            finishing && "opacity-70 cursor-wait"
                        )}
                    >
                        Começar agora
                    </button>

                </div>

                {/* Close Button top-right */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
