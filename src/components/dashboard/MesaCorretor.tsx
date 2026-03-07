'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import {
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    User as UserIcon,
    BookOpen,
    Send,
    Loader2,
    ArrowLeft,
    Clock,
    Check,
    Star,
    X,
    Highlighter,
    Pin,
    PinOff,
    Move,
    ClipboardList,
    GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Redacao {
    id: string;
    nick: string;
    nr_serie: string;
    titulo: string;
    texto: string;
    criterio_1_nota: number;
    criterio_1_devolutiva: string;
    criterio_2_nota: number;
    criterio_2_devolutiva: string;
    criterio_3_nota: number;
    criterio_3_devolutiva: string;
    criterio_4_nota: number;
    criterio_4_devolutiva: string;
    criterio_5_nota: number;
    criterio_5_devolutiva: string;
}

interface RedacaoListItem {
    id: string;
    titulo: string;
    nick: string;
    nr_serie: string;
    status: 'pendente' | 'corrigida';
    revisao_id?: string;
    favorita?: boolean;
    model_id?: string;
    titulo_modelo?: string;
    nm_tipo_ensino?: string;
}

interface Highlight {
    id?: string;
    revisao_id?: string;
    criterio_id: number;
    cor: string;
    start_index: number;
    end_index: number;
    texto_marcado: string;
    observacao: string;
    target?: 'texto' | 'devolutiva';
}

const CRITERIOS = [
    { id: 1, name: 'Competência 1', desc: 'Domínio da norma culta' },
    { id: 2, name: 'Competência 2', desc: 'Compreender a proposta' },
    { id: 3, name: 'Competência 3', desc: 'Selecionar e organizar info' },
    { id: 4, name: 'Competência 4', desc: 'Conhecimento linguístico' },
    { id: 5, name: 'Competência 5', desc: 'Proposta de intervenção' },
];

export function MesaCorretor() {
    const { user } = useAuth();

    // View state
    const [view, setView] = useState<'list' | 'correction'>('list');
    const [listaRedacoes, setListaRedacoes] = useState<RedacaoListItem[]>([]);
    const [loadingLista, setLoadingLista] = useState(true);

    // Correction state
    const [redacao, setRedacao] = useState<Redacao | null>(null);
    const [loadingRedacao, setLoadingRedacao] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [highlightPopup, setHighlightPopup] = useState<{ visible: boolean, x: number, y: number, start: number, end: number, text: string, target: 'texto' | 'devolutiva', targetId?: number } | null>(null);
    const [highlightFormData, setHighlightFormData] = useState({ criterio_id: 1, cor: 'amarelo', observacao: '' });
    const [filterHighlightCriterio, setFilterHighlightCriterio] = useState<number | 'all'>('all');

    // Toolbar UX State
    const [toolbarMode, setToolbarMode] = useState<'fixed' | 'floating'>('floating');
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const textContainerRef = React.useRef<HTMLDivElement>(null);

    // Form state
    const [formData, setFormData] = useState({
        criterio_1_tema_1: '',
        criterio_1_tema_2: '',
        criterio_1_tema_3: '',
        criterio_1_observacao: '',
        criterio_2_tema_1: '',
        criterio_2_tema_2: '',
        criterio_2_tema_3: '',
        criterio_2_observacao: '',
        criterio_3_tema_1: '',
        criterio_3_tema_2: '',
        criterio_3_tema_3: '',
        criterio_3_observacao: '',
        criterio_4_tema_1: '',
        criterio_4_tema_2: '',
        criterio_4_tema_3: '',
        criterio_4_observacao: '',
        criterio_5_tema_1: '',
        criterio_5_tema_2: '',
        criterio_5_tema_3: '',
        criterio_5_observacao: '',
        comentario_geral: '',
        favorita: false
    });

    const [filterNick, setFilterNick] = useState('');
    const [filterSerie, setFilterSerie] = useState('');
    const [filterTitulo, setFilterTitulo] = useState('');
    const [filterFavorita, setFilterFavorita] = useState(false);

    // Accordion UI State
    const [activeCriterio, setActiveCriterio] = useState<number>(1);

    const fetchLista = useCallback(async () => {
        if (!user) return;
        setLoadingLista(true);
        try {
            const { data: redacoes, error } = await supabase
                .from('redacoes')
                .select('id, titulo, nick, nr_serie, model_id, titulo_modelo, nm_tipo_ensino, revisoes(id, corretor_id, favorita)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (redacoes) {
                const formatadas: RedacaoListItem[] = redacoes.map((r: any) => {
                    const rev = r.revisoes?.find((rev: any) => rev.corretor_id === user.id);
                    return {
                        id: r.id,
                        titulo: r.titulo || 'Sem Título',
                        nick: r.nick,
                        nr_serie: r.nr_serie,
                        model_id: r.model_id,
                        titulo_modelo: r.titulo_modelo,
                        nm_tipo_ensino: r.nm_tipo_ensino,
                        status: rev ? 'corrigida' : 'pendente',
                        revisao_id: rev?.id,
                        favorita: rev?.favorita || false
                    };
                });
                setListaRedacoes(formatadas);
            }
        } catch (err) {
            console.error('Erro ao buscar lista:', err);
        } finally {
            setLoadingLista(false);
        }
    }, [user]);

    useEffect(() => {
        if (view === 'list') {
            fetchLista();
        }
    }, [view, fetchLista]);

    const handleSelectRedacao = async (id: string, revisaoId?: string) => {
        if (!user) return;
        setView('correction');
        setLoadingRedacao(true);
        setMessage(null);

        try {
            // Busca os dados da redação
            const { data: redacaoData, error: redacaoError } = await supabase
                .from('redacoes')
                .select('*')
                .eq('id', id)
                .single();

            if (redacaoError) throw redacaoError;
            setRedacao(redacaoData);

            // Se tem revisão feita por esse corretor, popula o form
            if (revisaoId) {
                const { data: revData, error: revError } = await supabase
                    .from('revisoes')
                    .select('*, revisao_destaques(*)')
                    .eq('id', revisaoId)
                    .single();

                if (!revError && revData) {
                    setFormData({
                        criterio_1_tema_1: revData.criterio_1_tema_1 || '',
                        criterio_1_tema_2: revData.criterio_1_tema_2 || '',
                        criterio_1_tema_3: revData.criterio_1_tema_3 || '',
                        criterio_1_observacao: revData.criterio_1_observacao || '',
                        criterio_2_tema_1: revData.criterio_2_tema_1 || '',
                        criterio_2_tema_2: revData.criterio_2_tema_2 || '',
                        criterio_2_tema_3: revData.criterio_2_tema_3 || '',
                        criterio_2_observacao: revData.criterio_2_observacao || '',
                        criterio_3_tema_1: revData.criterio_3_tema_1 || '',
                        criterio_3_tema_2: revData.criterio_3_tema_2 || '',
                        criterio_3_tema_3: revData.criterio_3_tema_3 || '',
                        criterio_3_observacao: revData.criterio_3_observacao || '',
                        criterio_4_tema_1: revData.criterio_4_tema_1 || '',
                        criterio_4_tema_2: revData.criterio_4_tema_2 || '',
                        criterio_4_tema_3: revData.criterio_4_tema_3 || '',
                        criterio_4_observacao: revData.criterio_4_observacao || '',
                        criterio_5_tema_1: revData.criterio_5_tema_1 || '',
                        criterio_5_tema_2: revData.criterio_5_tema_2 || '',
                        criterio_5_tema_3: revData.criterio_5_tema_3 || '',
                        criterio_5_observacao: revData.criterio_5_observacao || '',
                        comentario_geral: revData.comentario_geral || '',
                        favorita: revData.favorita || false
                    });
                    setHighlights(revData.revisao_destaques || []);
                }
            } else {
                // Reset form
                setHighlights([]);
                setHighlightPopup(null);
                setFormData({
                    criterio_1_tema_1: '',
                    criterio_1_tema_2: '',
                    criterio_1_tema_3: '',
                    criterio_1_observacao: '',
                    criterio_2_tema_1: '',
                    criterio_2_tema_2: '',
                    criterio_2_tema_3: '',
                    criterio_2_observacao: '',
                    criterio_3_tema_1: '',
                    criterio_3_tema_2: '',
                    criterio_3_tema_3: '',
                    criterio_3_observacao: '',
                    criterio_4_tema_1: '',
                    criterio_4_tema_2: '',
                    criterio_4_tema_3: '',
                    criterio_4_observacao: '',
                    criterio_5_tema_1: '',
                    criterio_5_tema_2: '',
                    criterio_5_tema_3: '',
                    criterio_5_observacao: '',
                    comentario_geral: '',
                    favorita: false
                });
            }
        } catch (err) {
            console.error('Erro ao buscar redação:', err);
            setMessage({ type: 'error', text: 'Erro ao carregar dados da redação.' });
        } finally {
            setLoadingRedacao(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!redacao || !user) return;

        setSubmitting(true);
        try {
            // Verifica se ja existe revisao desse corretor
            const { data: revData } = await supabase
                .from('revisoes')
                .select('id')
                .eq('redacao_id', redacao.id)
                .eq('corretor_id', user.id)
                .single();

            let finalRevisaoId = revData?.id;

            if (revData?.id) {
                // Update
                const { error } = await supabase
                    .from('revisoes')
                    .update({
                        ...formData,
                        data_correcao: new Date().toISOString()
                    })
                    .eq('id', revData.id);
                if (error) throw error;
            } else {
                // Insert
                const { data: insertResult, error } = await supabase
                    .from('revisoes')
                    .insert([{
                        redacao_id: redacao.id,
                        corretor_id: user.id,
                        ...formData,
                        data_correcao: new Date().toISOString()
                    }])
                    .select('id').single();
                if (error) throw error;
                finalRevisaoId = insertResult.id;
            }

            if (finalRevisaoId) {
                await supabase.from('revisao_destaques').delete().eq('revisao_id', finalRevisaoId);
                if (highlights.length > 0) {
                    const toInsert = highlights.map(h => ({
                        revisao_id: finalRevisaoId,
                        criterio_id: h.criterio_id,
                        cor: h.cor,
                        start_index: h.start_index,
                        end_index: h.end_index,
                        texto_marcado: h.texto_marcado,
                        observacao: h.observacao,
                        target: h.target || 'texto'
                    }));
                    await supabase.from('revisao_destaques').insert(toInsert);
                }
            }

            setMessage({ type: 'success', text: 'Correção salva com sucesso!' });

            // Voltar pra lista após 2 segundos
            setTimeout(() => {
                setView('list');
            }, 2000);

        } catch (error: any) {
            console.error('Erro ao salvar:', error);
            setMessage({ type: 'error', text: 'Erro ao salvar correção: ' + error.message });
        } finally {
            setSubmitting(false);
        }
    };

    const redacoesFiltradas = listaRedacoes.filter((r: any) => {
        const matchNick = r.nick.toLowerCase().includes(filterNick.toLowerCase());
        const matchSerie = r.nr_serie.toLowerCase().includes(filterSerie.toLowerCase());
        const matchTitulo = r.titulo.toLowerCase().includes(filterTitulo.toLowerCase());
        const matchFavorita = filterFavorita ? r.favorita === true : true;
        return matchNick && matchSerie && matchTitulo && matchFavorita;
    });

    const handleTextSelection = (e: React.MouseEvent) => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !textContainerRef.current) {
            if (highlightPopup?.visible && !e.defaultPrevented) setHighlightPopup(null);
            return;
        }

        // Check if selection is inside the main text OR inside a devolutiva box
        const isMainText = textContainerRef.current.contains(sel.anchorNode);

        let containerNode = sel.anchorNode?.parentElement;
        let isDevolutivaText = false;
        let devolutivaCriterioId = 1;

        while (containerNode && containerNode !== document.body) {
            if (containerNode.hasAttribute('data-devolutiva')) {
                isDevolutivaText = true;
                devolutivaCriterioId = Number(containerNode.getAttribute('data-criterio-id'));
                break;
            }
            containerNode = containerNode.parentElement;
        }

        if (!isMainText && !isDevolutivaText) return;

        const range = sel.getRangeAt(0);
        const preSelectionRange = range.cloneRange();

        // Use the correct container for offset calculation
        const rootContainer = isDevolutivaText ? containerNode! : textContainerRef.current;

        preSelectionRange.selectNodeContents(rootContainer);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;
        const text = range.toString();
        const end = start + text.length;

        const rect = range.getBoundingClientRect();

        setHighlightPopup(prev => {
            if (prev?.visible && toolbarMode === 'floating') {
                return {
                    ...prev,
                    start,
                    end,
                    text,
                    target: isDevolutivaText ? 'devolutiva' : 'texto',
                    targetId: isDevolutivaText ? devolutivaCriterioId : undefined
                };
            }
            return {
                visible: true,
                x: rect.left + (rect.width / 2) - 160,
                y: rect.top - 250,
                start,
                end,
                text,
                target: isDevolutivaText ? 'devolutiva' : 'texto',
                targetId: isDevolutivaText ? devolutivaCriterioId : undefined
            };
        });
    };

    const handleAddHighlight = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!highlightPopup) return;

        const newH: Highlight = {
            criterio_id: highlightFormData.criterio_id,
            cor: highlightFormData.cor,
            start_index: highlightPopup.start,
            end_index: highlightPopup.end,
            texto_marcado: highlightPopup.text,
            observacao: highlightFormData.observacao,
            target: highlightPopup.target
        };

        setHighlights([...highlights, newH]);
        setHighlightPopup(null);
        setHighlightFormData({ criterio_id: 1, cor: 'amarelo', observacao: '' });
        window.getSelection()?.removeAllRanges();
    };

    const handleRemoveHighlight = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        const newH = [...highlights];
        newH.splice(index, 1);
        setHighlights(newH);
    };

    // Drag events for floating toolbar
    const handleDragStart = (e: React.MouseEvent) => {
        if (!highlightPopup) return;
        setIsDragging(true);
        // Calculate where inside the popup the user clicked
        setDragOffset({
            x: e.clientX - highlightPopup.x,
            y: e.clientY - highlightPopup.y
        });
    };

    const handleDragMove = (e: React.MouseEvent) => {
        if (!isDragging || !highlightPopup) return;
        setHighlightPopup({
            ...highlightPopup,
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y
        });
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDragMove as any);
            window.addEventListener('mouseup', handleDragEnd);
        } else {
            window.removeEventListener('mousemove', handleDragMove as any);
            window.removeEventListener('mouseup', handleDragEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleDragMove as any);
            window.removeEventListener('mouseup', handleDragEnd);
        };
    }, [isDragging, highlightPopup, dragOffset]);

    const renderTextWithHighlights = (text: string, isDevolutiva: boolean = false, devolutivaCriterioId: number = 0) => {
        if (!text) return null;

        let applicableHighlights = highlights;

        // If it's a devolutiva, only show highlights made inside this specific devolutiva
        if (isDevolutiva) {
            applicableHighlights = highlights.filter(h => h.criterio_id === devolutivaCriterioId && h.target === 'devolutiva');
        } else {
            // If it's the main text, only show highlights made in the main text (target = 'texto' or missing for backwards compatibility)
            applicableHighlights = highlights.filter(h => !h.target || h.target === 'texto');
            if (filterHighlightCriterio !== 'all') {
                applicableHighlights = applicableHighlights.filter(h => h.criterio_id === filterHighlightCriterio);
            }
        }

        if (applicableHighlights.length === 0) return <>{text}</>;

        const sorted = [...applicableHighlights].sort((a, b) => a.start_index - b.start_index);

        let lastIndex = 0;
        const elements = [];

        for (let i = 0; i < sorted.length; i++) {
            const h = sorted[i];
            if (h.start_index > lastIndex) {
                elements.push(<span key={`text-${i}`}>{text.substring(lastIndex, h.start_index)}</span>);
            }

            const colorClass = h.cor === 'verde' ? 'bg-green-200 text-green-900 group-hover:bg-green-300' :
                h.cor === 'vermelho' ? 'bg-red-200 text-red-900 group-hover:bg-red-300' :
                    'bg-yellow-200 text-yellow-900 group-hover:bg-yellow-300';

            const actualStart = Math.max(lastIndex, h.start_index);
            if (actualStart < h.end_index) {
                elements.push(
                    <mark
                        key={`mark-${i}`}
                        className={cn('relative group cursor-pointer rounded px-0.5 transition-colors', colorClass)}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isDevolutiva) setFilterHighlightCriterio(h.criterio_id);
                        }}
                    >
                        {text.substring(actualStart, h.end_index)}

                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col w-64 bg-gray-800 text-white text-xs rounded-xl p-3.5 z-10 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                            <span className="flex items-center justify-between mb-2 pb-2 border-b border-gray-700">
                                <span className="font-bold flex items-center gap-1.5"><BookOpen size={12} /> Critério {h.criterio_id}</span>
                                <button type="button" onClick={(e) => handleRemoveHighlight(e, highlights.indexOf(h))} className="text-gray-400 hover:text-red-400 p-1 bg-gray-700/50 rounded hover:bg-red-500/20"><X size={12} /></button>
                            </span>
                            <span className="leading-relaxed font-normal">{h.observacao || <i className="text-gray-400">Sem observação.</i>}</span>

                            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></span>
                        </span>
                    </mark>
                );
                lastIndex = Math.max(lastIndex, h.end_index);
            }
        }

        if (lastIndex < text.length) {
            elements.push(<span key={`text-end`}>{text.substring(lastIndex)}</span>);
        }

        return elements;
    };

    if (view === 'list') {
        return (
            <div className="p-8 max-w-5xl mx-auto w-full space-y-8 min-h-[calc(100vh-64px)] bg-gray-50/30">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-dark-gray">Fila de Correção</h1>
                        <p className="text-gray-500 mt-2">Selecione uma redação para avaliar ou revisar sua correção.</p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                    <div className="flex items-center gap-4 mb-2">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-dark-gray">
                            <input
                                type="checkbox"
                                checked={filterFavorita}
                                onChange={(e) => setFilterFavorita(e.target.checked)}
                                className="w-4 h-4 text-accent-red rounded border-gray-300 focus:ring-accent-red"
                            />
                            Apenas Favoritas
                        </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tema / Título</label>
                            <input
                                type="text"
                                placeholder="Buscar por tema..."
                                value={filterTitulo}
                                onChange={(e) => setFilterTitulo(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-accent-red/20 focus:border-accent-red outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Autor (Nick)</label>
                            <input
                                type="text"
                                placeholder="Buscar por nick..."
                                value={filterNick}
                                onChange={(e) => setFilterNick(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-accent-red/20 focus:border-accent-red outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Série</label>
                            <input
                                type="text"
                                placeholder="Buscar por série..."
                                value={filterSerie}
                                onChange={(e) => setFilterSerie(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-accent-red/20 focus:border-accent-red outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loadingLista ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-accent-red" />
                        </div>
                    ) : redacoesFiltradas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-16 text-center">
                            <CheckCircle2 className="h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-dark-gray">Nenhum resultado</h3>
                            <p className="text-gray-500">Nenhuma redação encontrada com os filtros atuais.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {redacoesFiltradas.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelectRedacao(item.id, item.revisao_id)}
                                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 hover:pl-8 transition-all text-left group"
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center flex-wrap gap-2 mb-3">
                                            {/* Badge do Modelo da Tarefa/Proposta */}
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-100" title="Modelo da Proposta/Tarefa">
                                                <ClipboardList size={12} />
                                                {item.model_id || 'Modelo Não Informado'}
                                            </span>

                                            {item.status === 'pendente' ? (
                                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-100">
                                                    <Clock size={12} />
                                                    Pendente
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider border border-green-100">
                                                    <Check size={12} />
                                                    Corrigida
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-bold text-dark-gray truncate group-hover:text-accent-red transition-colors mb-2">
                                            {item.titulo_modelo || item.titulo}
                                            {item.favorita && (
                                                <Star size={16} className="inline-block ml-2 text-yellow-400 fill-yellow-400" />
                                            )}
                                        </h3>

                                        <div className="flex items-center flex-wrap gap-3 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5 text-gray-600 font-medium bg-gray-100 px-2 py-0.5 rounded">
                                                <UserIcon size={14} className="text-gray-400" />
                                                {item.nick}
                                            </span>
                                            <span className="text-gray-300">•</span>
                                            <span className="flex items-center gap-1.5 text-gray-600">
                                                <GraduationCap size={14} className="text-gray-400" />
                                                {item.nm_tipo_ensino && `${item.nm_tipo_ensino} - `}{item.nr_serie}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-gray-300 group-hover:text-accent-red transition-colors transform group-hover:translate-x-1 duration-300" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (loadingRedacao) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-white">
                <Loader2 className="h-10 w-10 animate-spin text-accent-red mb-4" />
                <p className="text-gray-500 font-medium">Carregando dados da redação...</p>
            </div>
        );
    }

    if (!redacao) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-white text-center px-4">
                <AlertCircle className="h-12 w-12 text-red-500 mb-6" />
                <h2 className="text-2xl font-bold text-dark-gray mb-2">Erro ao carregar</h2>
                <p className="text-gray-500">Não foi possível encontrar a redação selecionada.</p>
                <button
                    onClick={() => setView('list')}
                    className="mt-6 flex items-center gap-2 px-6 py-2 bg-gray-100 text-dark-gray rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                    <ArrowLeft size={16} />
                    Voltar para lista
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-white">
            {/* Top Toolbar */}
            <div className="h-14 border-b border-gray-100 flex items-center px-8 bg-gray-50/50 shrink-0">
                <button
                    onClick={() => setView('list')}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-dark-gray transition-colors"
                >
                    <ArrowLeft size={16} />
                    Voltar para Fila
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Coluna da Esquerda: Leitura */}
                <div className="w-1/2 overflow-y-auto border-r border-gray-100 p-8 lg:p-12 bg-white custom-scrollbar relative">
                    <div className="w-full">
                        <div className="flex items-center justify-between gap-3 mb-8">
                            <div className="flex items-center gap-3 text-gray-400">
                                <UserIcon size={16} />
                                <span className="text-sm font-medium uppercase tracking-widest">{redacao.nick}</span>
                                <span className="text-gray-200">|</span>
                                <span className="text-sm">{redacao.nr_serie}</span>
                            </div>

                            {/* Filtro de Destaques Visuais */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filtro de Grifos:</span>
                                <select
                                    className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-2 py-1 text-gray-600 outline-none focus:ring-2 focus:ring-accent-red/20"
                                    value={filterHighlightCriterio}
                                    onChange={(e) => setFilterHighlightCriterio(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                >
                                    <option value="all">Ver Todos</option>
                                    {CRITERIOS.map(c => <option key={`fh-${c.id}`} value={c.id}>Critério {c.id}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Toggle de Modo da Toolbar */}
                        <div className="flex items-center justify-between mb-10">
                            <h1 className="text-3xl font-serif font-bold text-dark-gray leading-tight">
                                {redacao.titulo || 'Sem Título'}
                            </h1>
                            <button
                                onClick={() => {
                                    setToolbarMode(prev => prev === 'floating' ? 'fixed' : 'floating');
                                    // if switching to fixed, ensure popup position doesn't matter, but clear visibility if nothing selected
                                    if (!window.getSelection()?.toString() && highlightPopup?.visible) {
                                        setHighlightPopup(null);
                                    }
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                            >
                                {toolbarMode === 'floating' ? (
                                    <><Pin size={14} /> Fixar Barra Marca-Texto</>
                                ) : (
                                    <><PinOff size={14} /> Usar Flutuante</>
                                )}
                            </button>
                        </div>

                        {/* Barra Fixa (Estilo Word) */}
                        {toolbarMode === 'fixed' && (
                            <div className={cn(
                                "mb-6 p-4 rounded-xl border transition-all duration-300",
                                highlightPopup?.visible
                                    ? "bg-white border-accent-red/30 shadow-[0_4px_20px_-5px_rgba(239,68,68,0.15)]"
                                    : "bg-gray-50 border-gray-200 opacity-60 grayscale-[50%] pointer-events-none"
                            )}>
                                <div className="flex items-center gap-2 mb-3">
                                    <Highlighter size={16} className={highlightPopup?.visible ? "text-accent-red" : "text-gray-400"} />
                                    <span className="text-sm font-bold text-dark-gray">
                                        {highlightPopup?.visible ? "Texto Selecionado: Adicionar Destaque" : "Selecione um texto para grifar..."}
                                    </span>
                                </div>
                                <form onSubmit={handleAddHighlight} className="flex gap-3">
                                    <select
                                        required
                                        value={highlightFormData.criterio_id}
                                        onChange={(e) => setHighlightFormData({ ...highlightFormData, criterio_id: Number(e.target.value) })}
                                        className="w-32 bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs text-gray-700 focus:ring-2 focus:ring-accent-red/20 outline-none"
                                    >
                                        {CRITERIOS.map(c => <option key={`hp-f-${c.id}`} value={c.id}>Critério {c.id}</option>)}
                                    </select>
                                    <select
                                        required
                                        value={highlightFormData.cor}
                                        onChange={(e) => setHighlightFormData({ ...highlightFormData, cor: e.target.value })}
                                        className="w-28 bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs text-gray-700 focus:ring-2 focus:ring-accent-red/20 outline-none"
                                    >
                                        <option value="amarelo">Amarelo 🟨</option>
                                        <option value="verde">Verde 🟩</option>
                                        <option value="vermelho">Vermelho 🟥</option>
                                    </select>
                                    <input
                                        required
                                        type="text"
                                        value={highlightFormData.observacao}
                                        onChange={(e) => setHighlightFormData({ ...highlightFormData, observacao: e.target.value })}
                                        placeholder="Observação rápida..."
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:ring-2 focus:ring-accent-red/20 outline-none"
                                    />
                                    <button type="submit" className="bg-dark-gray text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2">
                                        <Check size={14} /> Salvar
                                    </button>
                                </form>
                            </div>
                        )}

                        <div
                            ref={textContainerRef}
                            onMouseUp={handleTextSelection}
                            className="text-lg text-gray-800 font-serif leading-loose whitespace-pre-wrap outline-none selection:bg-gray-200/60"
                        >
                            {renderTextWithHighlights(redacao.texto, false)}
                        </div>
                    </div>

                    {/* Pop-up do Marca-Texto Flutuante */}
                    {highlightPopup?.visible && toolbarMode === 'floating' && (
                        <div
                            className={cn(
                                "fixed z-50 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-gray-100 p-5 w-80 animate-in fade-in zoom-in-95 outline-none transition-shadow",
                                isDragging ? "shadow-2xl opacity-90 duration-0" : "duration-200"
                            )}
                            style={{
                                top: Math.max(20, highlightPopup.y),
                                left: Math.max(20, Math.min(window.innerWidth - 340, highlightPopup.x))
                            }}
                            onMouseUp={(e) => { e.stopPropagation(); setIsDragging(false); }}
                        >
                            <div
                                className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 cursor-move group"
                                onMouseDown={handleDragStart}
                            >
                                <Move size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                                <Highlighter className="text-accent-red" size={16} />
                                <h4 className="text-sm font-bold text-dark-gray">Criar Destaque Visual</h4>
                                <button type="button" onMouseDown={(e) => e.stopPropagation()} onClick={() => { setHighlightPopup(null); setIsDragging(false); }} className="ml-auto text-gray-400 hover:text-gray-600">
                                    <X size={16} />
                                </button>
                            </div>

                            <form onSubmit={handleAddHighlight} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Critério Ref.</label>
                                        <select
                                            required
                                            value={highlightFormData.criterio_id}
                                            onChange={(e) => setHighlightFormData({ ...highlightFormData, criterio_id: Number(e.target.value) })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:ring-2 focus:ring-accent-red/20 outline-none font-medium"
                                        >
                                            {CRITERIOS.map(c => <option key={`hp-${c.id}`} value={c.id}>Critério {c.id}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cor</label>
                                        <select
                                            required
                                            value={highlightFormData.cor}
                                            onChange={(e) => setHighlightFormData({ ...highlightFormData, cor: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:ring-2 focus:ring-accent-red/20 outline-none font-medium"
                                        >
                                            <option value="amarelo">Amarelo 🟨</option>
                                            <option value="verde">Verde 🟩</option>
                                            <option value="vermelho">Vermelho 🟥</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Observação sobre o trecho grifado</label>
                                    <textarea
                                        required
                                        rows={2}
                                        value={highlightFormData.observacao}
                                        onChange={(e) => setHighlightFormData({ ...highlightFormData, observacao: e.target.value })}
                                        placeholder="Ex: Trecho confuso, excelente uso de conjunção..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:ring-2 focus:ring-accent-red/20 outline-none resize-none"
                                    />
                                </div>

                                <button type="submit" className="w-full bg-dark-gray text-white text-xs font-bold py-2.5 rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2">
                                    <Check size={14} /> Salvar Destaque
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Coluna da Direita: Formulário */}
                <div className="w-1/2 overflow-y-auto p-8 lg:p-12 bg-gray-50/50 custom-scrollbar">
                    <div className="w-full">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-bold text-dark-gray flex items-center gap-2">
                                    <BookOpen className="text-accent-red" size={20} />
                                    Avaliação Técnica
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, favorita: !formData.favorita })}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${formData.favorita
                                        ? 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                                        : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-yellow-50 hover:text-yellow-600'
                                        }`}
                                >
                                    <Star size={14} className={formData.favorita ? 'fill-yellow-500 text-yellow-500' : ''} />
                                    {formData.favorita ? 'Favorita' : 'Marcar Favorita'}
                                </button>
                            </div>
                            {message && (
                                <div className={cn(
                                    "text-sm px-4 py-2 rounded-lg transition-all animate-in fade-in slide-in-from-top-2",
                                    message.type === 'success' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                )}>
                                    {message.text}
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {CRITERIOS.map((c) => {
                                const isActive = activeCriterio === c.id;
                                const notasIA = (redacao as any)[`criterio_${c.id}_nota`];
                                const devolutivaIA = (redacao as any)[`criterio_${c.id}_devolutiva`];
                                const hasFormContent = (formData as any)[`criterio_${c.id}_tema_1`] || (formData as any)[`criterio_${c.id}_observacao`];
                                const criterionHighlights = highlights.filter(h => h.criterio_id === c.id && (!h.target || h.target === 'texto'));

                                return (
                                    <div key={c.id} className={cn(
                                        "bg-white rounded-2xl border transition-all duration-300 overflow-hidden",
                                        isActive ? "border-accent-red/30 shadow-[0_8px_30px_-10px_rgba(239,68,68,0.1)] p-6" : "border-gray-100 shadow-sm p-5 hover:border-gray-300 cursor-pointer"
                                    )}>
                                        <div
                                            className="flex items-center justify-between"
                                            onClick={() => !isActive && setActiveCriterio(c.id)}
                                        >
                                            <div>
                                                <h3 className={cn("font-bold transition-colors", isActive ? "text-dark-gray text-xl" : "text-gray-600 text-lg")}>
                                                    {c.name}
                                                </h3>
                                                <p className="text-xs text-gray-400 uppercase tracking-tighter mt-1">{c.desc}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {!isActive && hasFormContent && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md uppercase tracking-wider">
                                                        <Check size={12} /> Avaliado
                                                    </span>
                                                )}
                                                <div className="bg-accent-red/5 px-3 py-1.5 rounded-full border border-accent-red/10">
                                                    <span className="text-sm font-bold text-accent-red">IA: {notasIA} pts</span>
                                                </div>
                                            </div>
                                        </div>

                                        {isActive && (
                                            <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-300">

                                                {/* Bloco da IA */}
                                                <div className="mb-8">
                                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                        <BookOpen size={14} className="text-gray-400" />
                                                        Devolutiva da IA
                                                    </h4>
                                                    <div
                                                        className="text-[15px] text-gray-800 leading-relaxed whitespace-pre-wrap selection:bg-gray-200/60"
                                                        data-devolutiva="true"
                                                        data-criterio-id={c.id}
                                                        onMouseUp={handleTextSelection}
                                                    >
                                                        {renderTextWithHighlights(devolutivaIA, true, c.id)}
                                                    </div>

                                                    {/* Grifos atrelados a este critério */}
                                                    {criterionHighlights.length > 0 && (
                                                        <div className="mt-5 pt-4 border-t border-gray-200">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                                                                Trechos Grifados na Redação ({criterionHighlights.length})
                                                            </p>
                                                            <div className="flex flex-col gap-2">
                                                                {criterionHighlights.map((h, idx) => (
                                                                    <div key={`hc-${idx}`} className="bg-white border border-gray-200 rounded-lg p-3 text-sm flex gap-3 shadow-sm relative group">
                                                                        <div className={cn("w-1.5 rounded-full shrink-0",
                                                                            h.cor === 'verde' ? 'bg-green-400' :
                                                                                h.cor === 'vermelho' ? 'bg-red-400' : 'bg-yellow-400'
                                                                        )}></div>
                                                                        <div>
                                                                            <p className="text-gray-800 italic line-clamp-2">&quot;{h.texto_marcado}&quot;</p>
                                                                            {h.observacao && <p className="text-gray-500 text-xs mt-1 font-medium">{h.observacao}</p>}
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveHighlight({ stopPropagation: () => { } } as any, highlights.indexOf(h))}
                                                                            className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded"
                                                                            title="Remover Destaque"
                                                                        >
                                                                            <X size={14} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Campos de Correção Manual */}
                                                <div className="space-y-5">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                        {/* Tema 1 */}
                                                        <div>
                                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Pts Positivos</label>
                                                            <select
                                                                value={(formData as any)[`criterio_${c.id}_tema_1`]}
                                                                onChange={(e) => setFormData({ ...formData, [`criterio_${c.id}_tema_1`]: e.target.value })}
                                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-red/20 focus:border-accent-red outline-none transition-all shadow-sm"
                                                            >
                                                                <option value="">Selecione...</option>
                                                                <optgroup label="Correto">
                                                                    <option value="Satisfatório">Satisfatório</option>
                                                                    <option value="Vago">Vago</option>
                                                                    <option value="Incompleto">Incompleto</option>
                                                                    <option value="Com erros">Com erros</option>
                                                                </optgroup>
                                                                <optgroup label="Incorreto">
                                                                    <option value="Identificou incorretamente">Identificou incorretamente</option>
                                                                    <option value="Não identificou">Não identificou</option>
                                                                    <option value="Alucinação">Alucinação</option>
                                                                </optgroup>
                                                            </select>
                                                        </div>

                                                        {/* Tema 2 */}
                                                        <div>
                                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Prob. de Perda</label>
                                                            <select
                                                                value={(formData as any)[`criterio_${c.id}_tema_2`]}
                                                                onChange={(e) => setFormData({ ...formData, [`criterio_${c.id}_tema_2`]: e.target.value })}
                                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-red/20 focus:border-accent-red outline-none transition-all shadow-sm"
                                                            >
                                                                <option value="">Selecione...</option>
                                                                <optgroup label="Correto">
                                                                    <option value="Satisfatório">Satisfatório</option>
                                                                    <option value="Vago">Vago</option>
                                                                    <option value="Incompleto">Incompleto</option>
                                                                    <option value="Com erros">Com erros</option>
                                                                </optgroup>
                                                                <optgroup label="Incorreto">
                                                                    <option value="Identificou incorretamente">Identificou incorretamente</option>
                                                                    <option value="Não identificou">Não identificou</option>
                                                                    <option value="Alucinação">Alucinação</option>
                                                                </optgroup>
                                                            </select>
                                                        </div>

                                                        {/* Tema 3 */}
                                                        <div>
                                                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Sug. de Melhoria</label>
                                                            <select
                                                                value={(formData as any)[`criterio_${c.id}_tema_3`]}
                                                                onChange={(e) => setFormData({ ...formData, [`criterio_${c.id}_tema_3`]: e.target.value })}
                                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-red/20 focus:border-accent-red outline-none transition-all shadow-sm"
                                                            >
                                                                <option value="">Selecione...</option>
                                                                <optgroup label="Correto">
                                                                    <option value="Satisfatório">Satisfatório</option>
                                                                    <option value="Vago">Vago</option>
                                                                    <option value="Incompleto">Incompleto</option>
                                                                    <option value="Com erros">Com erros</option>
                                                                </optgroup>
                                                                <optgroup label="Incorreto">
                                                                    <option value="Identificou incorretamente">Identificou incorretamente</option>
                                                                    <option value="Não identificou">Não identificou</option>
                                                                    <option value="Alucinação">Alucinação</option>
                                                                </optgroup>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* Observação */}
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 mt-4 text-left">Observações sobre a avaliação (opcional)</label>
                                                        <textarea
                                                            rows={2}
                                                            value={(formData as any)[`criterio_${c.id}_observacao`]}
                                                            onChange={(e) => setFormData({ ...formData, [`criterio_${c.id}_observacao`]: e.target.value })}
                                                            placeholder="Detalhe o contexto das avaliações acima se achar necessário..."
                                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent-red/20 focus:border-accent-red outline-none transition-all resize-none shadow-sm"
                                                        />
                                                    </div>

                                                    {/* Navigation Button */}
                                                    {c.id < 5 && (
                                                        <div className="pt-4 flex justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => setActiveCriterio(c.id + 1)}
                                                                className="flex items-center gap-2 text-sm font-bold text-accent-red hover:text-red-700 bg-accent-red/5 hover:bg-accent-red/10 px-5 py-2.5 rounded-xl transition-colors"
                                                            >
                                                                Próxima Competência <ChevronRight size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm mt-8">
                                <label className="block text-lg font-bold text-dark-gray mb-1">Comentário Final do Corretor</label>
                                <p className="text-sm font-medium text-gray-400 mb-4">Revisão geral e fechamento (opcional).</p>
                                <textarea
                                    rows={4}
                                    value={formData.comentario_geral}
                                    onChange={(e) => setFormData({ ...formData, comentario_geral: e.target.value })}
                                    placeholder="Escreva aqui suas observações gerais sobre a avaliação da IA..."
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent-red/20 focus:border-accent-red outline-none transition-all resize-none shadow-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-dark-gray text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-70"
                            >
                                {submitting ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <span>Salvar Correção</span>
                                        <Send size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
