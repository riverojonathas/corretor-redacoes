'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Brain, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export function AdminSettings() {
    const { user, cargo } = useAuth();
    const [hideIaScore, setHideIaScore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (cargo !== 'admin') return;
        
        const fetchSettings = async () => {
            try {
                const { data, error } = await supabase
                    .from('app_settings')
                    .select('hide_ia_score')
                    .eq('id', 'global')
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error('Erro ao buscar configurações:', error);
                    toast.error('Erro ao carregar configurações globais.');
                } else if (data) {
                    setHideIaScore(data.hide_ia_score);
                }
            } catch (err) {
                console.error('Falha ao buscar config:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [cargo]);

    const handleSave = async () => {
        if (!user || cargo !== 'admin') return;
        
        setSaving(true);
        try {
            const { error } = await supabase
                .from('app_settings')
                .upsert({ 
                    id: 'global', 
                    hide_ia_score: hideIaScore,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            toast.success('Configurações globais salvas com sucesso!');
        } catch (error: any) {
            console.error('Erro ao salvar configurações:', error);
            toast.error('Erro ao salvar as configurações.');
        } finally {
            setSaving(false);
        }
    };

    if (cargo !== 'admin') {
        return (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center justify-center gap-2">
                <AlertCircle size={20} />
                <p className="font-bold">Acesso restrito a administradores.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white/40 rounded-3xl border border-gray-200/50 shadow-sm p-6 sm:p-8 animate-pulse text-dark-gray text-center py-20">
                Carregando configurações...
            </div>
        );
    }

    return (
        <div className="bg-white/40 rounded-3xl border border-gray-200/50 shadow-sm p-6 sm:p-8">
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-dark-gray flex items-center gap-2">
                        <Brain size={20} className="text-accent-red" /> 
                        Inteligência Artificial
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                        Estas configurações afetam todos os corretores da plataforma.
                    </p>
                </div>
            </div>

            <div className="bg-white border border-gray-200/60 rounded-2xl p-6 shadow-sm mb-8">
                <div className="flex items-start gap-4">
                    <button
                        type="button"
                        onClick={() => setHideIaScore(!hideIaScore)}
                        className={cn(
                            'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 mt-1',
                            hideIaScore ? 'bg-accent-red' : 'bg-gray-200'
                        )}
                    >
                        <span className="sr-only">Ocultar nota da IA</span>
                        <span
                            className={cn(
                                'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                                hideIaScore ? 'translate-x-5' : 'translate-x-0'
                            )}
                        />
                    </button>
                    <div>
                        <h3 className="font-bold text-dark-gray">Ocultar Nota da IA (Avaliação Cega)</h3>
                        <p className="text-sm text-gray-500 mt-1 mb-4 leading-relaxed">
                            Quando ativado, os corretores não verão a nota atribuída pela IA na Mesa de Correção até que eles mesmos atribuam uma nota para o critério. O objetivo é evitar vieses durante a correção.
                        </p>
                        
                        <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg flex gap-2">
                            <AlertCircle size={14} className="shrink-0 mt-0.5" />
                            <p>Ao ativar esta opção, o componente de avaliação do corretor passará a exigir a inserção de uma nota numérica de 0 a 10. A avaliação original em níveis será preenchida automaticamente baseada na diferença entre a nota da IA e a nota do corretor.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200/50">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-dark-gray text-white rounded-xl hover:bg-black transition-all font-semibold disabled:opacity-50"
                >
                    {saving ? 'Salvando...' : (
                        <>
                            <Save size={18} />
                            Salvar Configurações Globais
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
