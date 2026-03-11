import React, { useState } from 'react';
import { X, Send, Loader2, Lightbulb, Bug } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export type FeedbackType = 'sugestao' | 'bug' | null;

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialType?: FeedbackType;
}

export function FeedbackModal({ isOpen, onClose, initialType = 'sugestao' }: FeedbackModalProps) {
    const { user } = useAuth();

    const [tipo, setTipo] = useState<FeedbackType>(initialType);
    const [mensagem, setMensagem] = useState('');
    const [loading, setLoading] = useState(false);

    // Reseta form quando abre passando novo tipo
    React.useEffect(() => {
        if (isOpen) {
            setTipo(initialType || 'sugestao');
            setMensagem('');
        }
    }, [isOpen, initialType]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mensagem.trim()) {
            toast.error('Por favor, escreva uma mensagem.');
            return;
        }

        if (!user) {
            toast.error('Você precisa estar logado para enviar feedback.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    tipo,
                    mensagem
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Erro ao enviar feedback.');
            }

            toast.success(tipo === 'bug' ? 'Relatório de erro enviado. Obrigado!' : 'Sugestão enviada com sucesso! Obrigado!');
            onClose();

        } catch (error: any) {
            toast.error('Ocorreu um erro.', { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-extrabold text-dark-gray">Deixe seu Feedback</h2>
                        <p className="text-sm text-gray-500 font-medium">Sua opinião constrói a nossa plataforma.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-dark-gray hover:bg-gray-100 rounded-full transition-colors self-start"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">

                    {/* Toggle Tipo */}
                    <div className="flex bg-gray-50 p-1 rounded-2xl mb-6">
                        <button
                            type="button"
                            onClick={() => setTipo('sugestao')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all",
                                tipo === 'sugestao'
                                    ? "bg-white text-emerald-600 shadow-sm border border-gray-100"
                                    : "text-gray-500 hover:text-dark-gray"
                            )}
                        >
                            <Lightbulb size={16} />
                            Sugerir Melhoria
                        </button>
                        <button
                            type="button"
                            onClick={() => setTipo('bug')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all",
                                tipo === 'bug'
                                    ? "bg-white text-accent-red shadow-sm border border-gray-100"
                                    : "text-gray-500 hover:text-dark-gray"
                            )}
                        >
                            <Bug size={16} />
                            Reportar Erro
                        </button>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-dark-gray mb-2">
                            {tipo === 'bug' ? 'Descreva o problema que você encontrou:' : 'Compartilhe sua ideia ou sugestão:'}
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={mensagem}
                            onChange={e => setMensagem(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-dark-gray focus:ring-2 focus:ring-accent-red/20 focus:border-accent-red outline-none transition-all resize-none shadow-inner"
                            placeholder={tipo === 'bug' ? "Onde ocorreu o erro? O que você tentou fazer?" : "Como podemos facilitar sua vida na hora de corrigir redações?"}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "px-6 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm shadow-lg",
                                tipo === 'bug' ? "bg-accent-red hover:bg-red-700 shadow-accent-red/20" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                            )}
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            {tipo === 'bug' ? 'Enviar Reporte' : 'Enviar Sugestão'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
