import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Sparkles, X, CheckCircle2, ChevronRight, ChevronLeft, LayoutDashboard, Highlighter, BookOpen, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomePopupProps {
    onClose: () => void;
}

export function WelcomePopup({ onClose }: WelcomePopupProps) {
    const { user, nome, setPrimeiroAcesso } = useAuth();
    const [finishing, setFinishing] = React.useState(false);
    const [step, setStep] = React.useState(0);
    const totalSteps = 4;

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

                <div className="p-8 pb-10 min-h-[380px] flex flex-col">
                    {step === 0 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1 flex flex-col justify-center">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-dark-gray mb-3">
                                    Bem-vindo(a){nome ? `, ${nome.split(' ')[0]}` : ' ao Corretor'}!
                                </h2>
                                <p className="text-gray-500 leading-relaxed text-sm">
                                    Este é um ambiente inteligente para auxílio na revisão e correção de redações.
                                    Preparamos um rápido tour para você conhecer nossas principais ferramentas.
                                </p>
                            </div>

                            <div className="space-y-4 mb-4">
                                <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 items-center justify-center">
                                    <Sparkles className="text-accent-red" size={24} />
                                    <span className="font-medium text-gray-700">Vamos começar?</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1 flex flex-col justify-center">
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <LayoutDashboard size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-dark-gray mb-2">Fila de Revisão</h2>
                                <p className="text-gray-500 text-sm">Sua central para encontrar e gerenciar correções.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <div className="mt-0.5"><Filter className="text-blue-500" size={18} /></div>
                                    <div>
                                        <h4 className="font-bold text-dark-gray text-sm mb-1">Filtros Inteligentes</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            Use a busca por Nick, Tema ou Ano/Série para localizar redações específicas com facilidade.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1 flex flex-col justify-center">
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BookOpen size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-dark-gray mb-2">Avaliação Híbrida</h2>
                                <p className="text-gray-500 text-sm">Combinando IA e expertise humana.</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <div className="mt-0.5"><Sparkles className="text-purple-500" size={18} /></div>
                                    <div>
                                        <h4 className="font-bold text-dark-gray text-sm mb-1">Pré-Avaliação IA</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            Nossa inteligência artificial analisa o texto e sugere notas de acordo com os critérios definidos.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                    <div className="mt-0.5"><CheckCircle2 className="text-green-500" size={18} /></div>
                                    <div>
                                        <h4 className="font-bold text-dark-gray text-sm mb-1">Seu Julgamento</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            A palavra final é sua. Valide a análise da IA, avalie os pontos do aluno e deixe o comentário final.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex-1 flex flex-col justify-center">
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Highlighter size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-dark-gray mb-2">Destaques e Grifos</h2>
                                <p className="text-gray-500 text-sm">Aponte falhas ou acertos diretamente no texto.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex gap-4 p-4 rounded-full bg-gray-50 border border-gray-100 items-center px-6">
                                    <div className="w-4 h-4 rounded-sm bg-yellow-400"></div>
                                    <div className="w-4 h-4 rounded-sm bg-green-400"></div>
                                    <div className="w-4 h-4 rounded-sm bg-red-400"></div>
                                    <div className="w-px h-6 bg-gray-200 mx-2"></div>
                                    <p className="text-xs text-gray-600 font-medium">Selecione texto para grifar e opcionalmente adicione uma observação.</p>
                                </div>
                                <p className="text-xs text-center text-gray-400 mt-4 leading-relaxed px-4">
                                    Os grifos podem ser feitos tanto no texto original do aluno quanto na devolutiva da IA. Basta selecionar a palavra ou frase na tela de correção.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Footer / Controls */}
                    <div className="mt-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-50">
                        {/* Indicadores de Passo */}
                        <div className="flex items-center gap-1.5 order-2 sm:order-1">
                            {Array.from({ length: totalSteps }).map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-1.5 rounded-full transition-all duration-300",
                                        i === step ? "w-6 bg-accent-red" : "w-1.5 bg-gray-200"
                                    )}
                                />
                            ))}
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
                            {step > 0 && (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                            )}

                            {step < totalSteps - 1 ? (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl font-bold text-white bg-dark-gray hover:bg-black transition-colors flex items-center justify-center gap-2"
                                >
                                    Próximo <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleDismiss}
                                    disabled={finishing}
                                    className={cn(
                                        "flex-1 sm:flex-none py-2.5 px-8 rounded-xl font-bold text-white bg-accent-red hover:bg-red-600 focus:ring-4 focus:ring-red-200 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20",
                                        finishing && "opacity-70 cursor-wait"
                                    )}
                                >
                                    Entendi, vamos lá!
                                </button>
                            )}
                        </div>
                    </div>
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
