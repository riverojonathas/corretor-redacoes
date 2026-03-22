'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
    CheckCircle2,
    AlertCircle,
    BookOpen,
    ArrowLeft,
    X,
    Highlighter,
    HelpCircle,
    Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Redacao, RedacaoListItem, Highlight, Criterio } from '@/types/dashboard';
import { sanitizeTextWithHighlights } from '@/lib/textUtils';
import { useCorrectionState } from '@/hooks/useCorrectionState';
import { useRedacoesList } from '@/hooks/useRedacoesList';
import { useLock } from '@/hooks/useLock';
import { RedacaoList } from './RedacaoList';
import { CorrectionHeader } from './CorrectionHeader';
import { FloatingToolbar, FixedToolbar } from './HighlightTools';
import { CriterioPanel } from './CriterioPanel';
import { CriterioInfoModal } from './CriterioInfoModal';
import { ExitConfirmModal } from './ExitConfirmModal';
import { MesaCorretorSkeleton } from './MesaCorretorSkeleton';

const defaultCriterios: Criterio[] = [
    { id: 1, name: 'Critério 1', desc: 'Domínio da norma culta', full_desc: '' },
    { id: 2, name: 'Critério 2', desc: 'Compreender a proposta', full_desc: '' },
    { id: 3, name: 'Critério 3', desc: 'Selecionar e organizar info', full_desc: '' },
    { id: 4, name: 'Critério 4', desc: 'Conhecimento linguístico', full_desc: '' },
    { id: 5, name: 'Critério 5', desc: 'Proposta de intervenção', full_desc: '' },
];

export function MesaCorretor({ initialAnswerId }: { initialAnswerId?: string }) {
    const { user, cargo } = useAuth();
    const router = useRouter();
    const isViewer = cargo === 'leitor';

    // ── View State ──────────────────────────────────────────
    const [view, setView] = useState<'list' | 'correction'>(initialAnswerId ? 'correction' : 'list');

    // ── Lista com filtros server-side (hook) ────────────────
    const {
        lista: listaRedacoes,
        loading: loadingLista,
        hasMore,
        filters,
        setFilters,
        loadMore,
    } = useRedacoesList(user?.id, view === 'list');

    // ── Correction State ────────────────────────────────────
    const [redacao, setRedacao] = useState<Redacao | null>(null);
    const [loadingRedacao, setLoadingRedacao] = useState(!!initialAnswerId);
    const [notFoundError, setNotFoundError] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [pendingRoute, setPendingRoute] = useState<string | null>(null);
    // Status da revisão carregada ('rascunho' | 'concluida' | null)
    const [revisaoStatus, setRevisaoStatus] = useState<'rascunho' | 'concluida' | null>(null);
    // Controla se o usuário confirmou editar uma revisão concluída
    const [reEditConfirmed, setReEditConfirmed] = useState(false);
    const [showReEditConfirm, setShowReEditConfirm] = useState(false);

    // ── Extracted hook ─────────────────────────────────────
    const {
        formData, setFormData: _setFormData,
        highlights, setHighlights: _setHighlights,
        showExitConfirm, setShowExitConfirm,
        isDirty, resetForm, syncPristine,
    } = useCorrectionState();

    // Intercepta mudanças de form/highlights: se revisão está concluída e ainda não
    // confirmou reedição, exibe o modal de aviso em vez de aplicar a mudança.
    const pendingFormChange = React.useRef<any>(null);
    const pendingHighlightsChange = React.useRef<any>(null);

    const setFormData = React.useCallback((val: any) => {
        if (isViewer) return;
        if (revisaoStatus === 'concluida' && !reEditConfirmed) {
            pendingFormChange.current = val;
            setShowReEditConfirm(true);
            return;
        }
        _setFormData(val);
    }, [revisaoStatus, reEditConfirmed, _setFormData, isViewer]);

    const setHighlights = React.useCallback((val: any) => {
        if (isViewer) return;
        if (revisaoStatus === 'concluida' && !reEditConfirmed) {
            pendingHighlightsChange.current = val;
            setShowReEditConfirm(true);
            return;
        }
        _setHighlights(val);
    }, [revisaoStatus, reEditConfirmed, _setHighlights, isViewer]);

    // Confirmar reedição: aplica a mudança pendente e libera edição
    const handleConfirmReEdit = React.useCallback(() => {
        setReEditConfirmed(true);
        setShowReEditConfirm(false);
        if (pendingFormChange.current !== null) {
            _setFormData(pendingFormChange.current);
            pendingFormChange.current = null;
        }
        if (pendingHighlightsChange.current !== null) {
            _setHighlights(pendingHighlightsChange.current);
            pendingHighlightsChange.current = null;
        }
    }, [_setFormData, _setHighlights]);

    // ── Lock / Atribuição (Fase D) ─────────────────────────
    const { acquireLock, releaseLock } = useLock(user?.id);
    const [lockBlocked, setLockBlocked] = useState(false);

    // ── Highlight Popup State ──────────────────────────────
    const [highlightPopup, setHighlightPopup] = useState<{
        visible: boolean; x: number; y: number;
        start: number; end: number; text: string;
        target: 'texto' | 'devolutiva'; targetId?: number; editIndex?: number;
    } | null>(null);
    const [highlightFormData, setHighlightFormData] = useState({ criterio_id: 1, cor: 'amarelo', observacao: '' });
    const [filterHighlightCriterio, setFilterHighlightCriterio] = useState<number | 'all'>('all');

    // ── Toolbar / UI State ──────────────────────────────────
    const [toolbarMode, setToolbarMode] = useState<'fixed' | 'floating'>('floating');
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const textContainerRef = React.useRef<HTMLDivElement>(null);

    // ── Accordion / Info Modal State ────────────────────────
    const [activeCriterio, setActiveCriterio] = useState<number>(1);
    const [readMode, setReadMode] = useState<boolean>(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
    const [openTema, setOpenTema] = useState<Record<number, number | null>>({});

    // ── Global Config State ─────────────────────────────────
    const [globalHideIaScore, setGlobalHideIaScore] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            if (!supabase) return;
            try {
                const { data } = await supabase.from('app_settings').select('hide_ia_score').eq('id', 'global').single();
                if (data) setGlobalHideIaScore(data.hide_ia_score);
            } catch (err) {
                console.error('Error fetching settings', err);
            }
        };
        fetchSettings();
    }, []);

    // ── Criterios (memoized) ────────────────────────────────
    const criterios = React.useMemo(() => {
        if (redacao?.assessed_skills && redacao.assessed_skills.length > 0) {
            return redacao.assessed_skills.map((s, idx) => ({
                id: idx + 1,
                name: `Critério ${idx + 1}`,
                desc: s.statement,
                full_desc: s.description
            }));
        }
        return defaultCriterios.map(c => ({ ...c, full_desc: '' }));
    }, [redacao]);

    const getCriterioStatus = (criterioId: number) => {
        const vals = [1, 2, 3, 4].map(t => (formData as any)[`criterio_${criterioId}_tema_${t}`]);
        const answered = vals.filter(v => v && v.toString().trim() !== '').length;
        if (answered === 4) return 'complete';
        if (answered > 0) return 'partial';
        return 'empty';
    };

    const isAllComplete = criterios.every(c => getCriterioStatus(c.id) === 'complete');

    // ── Exit Handler ────────────────────────────────────────
    const handleExitMesa = useCallback(async (force = false) => {
        if (!force && isDirty()) { setShowExitConfirm(true); return; }
        setShowExitConfirm(false);
        // Libera o lock ao sair
        if (redacao) await releaseLock(redacao.id);
        setLockBlocked(false);
        
        if (pendingRoute) {
            window.location.href = pendingRoute;
            return;
        }

        if (initialAnswerId) {
            router.push('/dashboard/revisao');
        } else {
            setView('list');
            setHighlightPopup(null);
            setRedacao(null);
            if (window.location.pathname.includes('/dashboard/revisao')) router.push('/dashboard/revisao');
        }
    }, [isDirty, initialAnswerId, router, redacao, releaseLock, pendingRoute]);

    // ── Intercept Navigation & BeforeUnload ──────────────────
    useEffect(() => {
        if (view !== 'correction' || lockBlocked) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty()) {
                e.preventDefault();
                e.returnValue = ''; // Required for most modern browsers
            }
        };

        const handleGlobalClick = (e: MouseEvent) => {
            if (!isDirty()) return;

            // Find the closest anchor tag
            let target = e.target as HTMLElement | null;
            while (target && target.tagName !== 'A') {
                target = target.parentElement;
            }

            if (target && target.tagName === 'A') {
                const href = target.getAttribute('href');
                // Intercept navigation if it's leaving the current mesa context
                if (href && !href.startsWith(window.location.pathname) && !target.getAttribute('target')) {
                    e.preventDefault();
                    setPendingRoute(href);
                    setShowExitConfirm(true);
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('click', handleGlobalClick, { capture: true });

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('click', handleGlobalClick, { capture: true });
        };
    }, [view, isDirty, lockBlocked]);

    // ── Inicialização: se tem answer_id direto, vai pra correção ─
    const hasLoadedRef = React.useRef(false);
    useEffect(() => {
        if (!user?.id || hasLoadedRef.current) return;
        if (initialAnswerId) {
            hasLoadedRef.current = true;
            setView('correction');
            loadInitialAnswer(initialAnswerId);
        }
    }, [initialAnswerId, user?.id]);

    const loadInitialAnswer = async (answerId: string) => {
        setLoadingRedacao(true);
        setNotFoundError(false);
        try {
            const { data: redacaoData, error: redacaoError } = await supabase
                .from('redacoes')
                .select('*, revisoes(*, revisao_destaques(*))')
                .eq('answer_id', answerId)
                .single();
                
            if (redacaoError || !redacaoData) { setNotFoundError(true); return; }
            
            const revData = Array.isArray(redacaoData.revisoes) ? redacaoData.revisoes[0] : redacaoData.revisoes;
            await handleSelectRedacao(redacaoData.id, revData?.id, redacaoData, revData);
        } catch (err) {
            console.error('Erro ao buscar redação por answer_id:', err);
            setNotFoundError(true);
        } finally {
            setLoadingRedacao(false);
        }
    };

    const handleSelectRedacao = async (id: string, revisaoId?: string, prefetchedRedacao?: any, prefetchedRev?: any) => {
        if (!user) return;
        setLoadingRedacao(true);

        try {
            // ── Tentar adquirir o lock ─────────────────
            const lockResult = await acquireLock(id);
            if (lockResult.status === 'blocked') {
                setLockBlocked(true);
                setView('correction');
                toast.warning('⚠️ Esta redação está sendo revisada por outro corretor no momento.');
                return;
            }
            if (lockResult.status === 'error') {
                console.warn('Lock não adquirido:', lockResult.message);
            }

            setLockBlocked(false);
            setView('correction');

            let redacaoData = prefetchedRedacao;
            let revData = prefetchedRev;

            if (!redacaoData) {
                const { data, error } = await supabase
                    .from('redacoes')
                    .select('*, revisoes(*, revisao_destaques(*))')
                    .eq('id', id)
                    .single();
                if (error) throw error;
                redacaoData = data;
                if (!revData && data.revisoes) {
                    revData = Array.isArray(data.revisoes) ? data.revisoes[0] : data.revisoes;
                }
            }

            const { text: essayCleaned } = sanitizeTextWithHighlights(redacaoData.essay || '', []);
            let finalSkills = (redacaoData.evaluated_skills || []).map((s: any) => {
                if (!s.comment) return s;
                const { text: cleanComment } = sanitizeTextWithHighlights(s.comment, []);
                return { ...s, comment: cleanComment };
            });

            const processedRedacao = { ...redacaoData, essay: essayCleaned, evaluated_skills: finalSkills };
            setRedacao(processedRedacao);

            if (revData) {
                setRevisaoStatus(null); // reset enquanto carrega
                const baseForm: Record<string, any> = {
                    criterio_1_tema_1: revData.criterio_1_tema_1 || '', criterio_1_tema_2: revData.criterio_1_tema_2 || '',
                    criterio_1_tema_3: revData.criterio_1_tema_3 || '', criterio_1_tema_4: revData.criterio_1_tema_4 || '',
                    criterio_1_observacao: revData.criterio_1_observacao || '',
                    criterio_2_tema_1: revData.criterio_2_tema_1 || '', criterio_2_tema_2: revData.criterio_2_tema_2 || '',
                    criterio_2_tema_3: revData.criterio_2_tema_3 || '', criterio_2_tema_4: revData.criterio_2_tema_4 || '',
                    criterio_2_observacao: revData.criterio_2_observacao || '',
                    criterio_3_tema_1: revData.criterio_3_tema_1 || '', criterio_3_tema_2: revData.criterio_3_tema_2 || '',
                    criterio_3_tema_3: revData.criterio_3_tema_3 || '', criterio_3_tema_4: revData.criterio_3_tema_4 || '',
                    criterio_3_observacao: revData.criterio_3_observacao || '',
                    criterio_4_tema_1: revData.criterio_4_tema_1 || '', criterio_4_tema_2: revData.criterio_4_tema_2 || '',
                    criterio_4_tema_3: revData.criterio_4_tema_3 || '', criterio_4_tema_4: revData.criterio_4_tema_4 || '',
                    criterio_4_observacao: revData.criterio_4_observacao || '',
                    criterio_5_tema_1: revData.criterio_5_tema_1 || '', criterio_5_tema_2: revData.criterio_5_tema_2 || '',
                    criterio_5_tema_3: revData.criterio_5_tema_3 || '', criterio_5_tema_4: revData.criterio_5_tema_4 || '',
                    criterio_5_observacao: revData.criterio_5_observacao || '',
                    comentario_geral: revData.comentario_geral || '',
                    favorita: revData.favorita || false,
                    suspeita_ia: revData.suspeita_ia || false,
                    motivo_suspeita_ia: revData.motivo_suspeita_ia || ''
                };
                let dynamicData: any = {};
                if (revData.avaliacoes && Array.isArray(revData.avaliacoes)) {
                    revData.avaliacoes.forEach((av: any) => {
                        dynamicData[`criterio_${av.criterio_id}_tema_1`] = av.tema_1 || '';
                        dynamicData[`criterio_${av.criterio_id}_tema_2`] = av.tema_2 || '';
                        dynamicData[`criterio_${av.criterio_id}_tema_3`] = av.tema_3 || '';
                        dynamicData[`criterio_${av.criterio_id}_observacao`] = av.observacao || '';
                    });
                }
                const mergedForm = { ...baseForm, ...dynamicData };
                setFormData(mergedForm as any);

                const { text: cleanEssay, highlights: cleanHighlights } = sanitizeTextWithHighlights(
                    redacaoData.essay,
                    revData.revisao_destaques?.filter((h: any) => !h.target || h.target === 'texto') || []
                );
                const devHighlightsRaw = revData.revisao_destaques?.filter((h: any) => h.target === 'devolutiva') || [];
                let cleanDevHighlights: Highlight[] = [];
                const cleanSkills = (redacaoData.evaluated_skills || []).map((s: any, idx: number) => {
                    if (!s.comment) return s;
                    const skillHls = devHighlightsRaw.filter((h: any) => h.criterio_id === idx + 1);
                    const { text: cleanComment, highlights: processedSkillHls } = sanitizeTextWithHighlights(s.comment, skillHls);
                    cleanDevHighlights = [...cleanDevHighlights, ...processedSkillHls];
                    return { ...s, comment: cleanComment };
                });
                setRedacao({ ...processedRedacao, essay: cleanEssay, evaluated_skills: cleanSkills });
                const allHls = [...cleanHighlights, ...cleanDevHighlights];
                _setHighlights(allHls);
                syncPristine(mergedForm as any, allHls);
                // Armazenar o status da revisão carregada
                setRevisaoStatus((revData.status === 'concluida' ? 'concluida' : 'rascunho'));
                setReEditConfirmed(false);
            } else {
                resetForm();
                setRevisaoStatus(null);
                setReEditConfirmed(false);
            }
        } catch (err) {
            console.error('Erro ao buscar redação:', err);
            toast.error('Erro ao carregar dados da redação.');
        } finally {
            setLoadingRedacao(false);
        }
    };

    const handleSaveRevisao = async (e: React.FormEvent, isDraft: boolean) => {
        e.preventDefault();
        if (!redacao || !user || isViewer) return;
        if (!isDraft && !isAllComplete) {
            toast.error('Preencha todos os campos obrigatórios para finalizar a revisão.');
            return;
        }
        setSubmitting(true);
        try {
            const { data: revData } = await supabase
                .from('revisoes').select('id')
                .eq('redacao_id', redacao.id).single();
            let finalRevisaoId = revData?.id;
            const avaliacoes = criterios.map(c => ({
                criterio_id: c.id,
                tema_1: (formData as any)[`criterio_${c.id}_tema_1`],
                tema_2: (formData as any)[`criterio_${c.id}_tema_2`],
                tema_3: (formData as any)[`criterio_${c.id}_tema_3`],
                tema_4: (formData as any)[`criterio_${c.id}_tema_4`],
                observacao: (formData as any)[`criterio_${c.id}_observacao`]
            }));
            if (revData?.id) {
                const { error } = await supabase.from('revisoes').update({
                    ...formData, avaliacoes, status: isDraft ? 'rascunho' : 'concluida',
                    data_correcao: new Date().toISOString()
                }).eq('id', revData.id);
                if (error) throw error;
            } else {
                const { data: insertResult, error } = await supabase.from('revisoes').insert([{
                    redacao_id: redacao.id, corretor_id: user.id,
                    ...formData, avaliacoes, status: isDraft ? 'rascunho' : 'concluida',
                    data_correcao: new Date().toISOString()
                }]).select('id').single();
                if (error) throw error;
                finalRevisaoId = insertResult.id;
            }
            if (finalRevisaoId) {
                await supabase.from('revisao_destaques').delete().eq('revisao_id', finalRevisaoId);
                if (highlights.length > 0) {
                    const toInsert = highlights.map(h => ({
                        revisao_id: finalRevisaoId, criterio_id: h.criterio_id, cor: h.cor,
                        start_index: h.start_index, end_index: h.end_index,
                        texto_marcado: h.texto_marcado, observacao: h.observacao || ''
                    }));
                    const { error: insertError } = await supabase.from('revisao_destaques').insert(toInsert);
                    if (insertError) throw new Error('As avaliações foram salvas, mas os grifos falharam: ' + insertError.message);
                }
            }
            toast.success(isDraft ? 'Rascunho salvo com sucesso!' : 'Revisão finalizada com sucesso!');
            syncPristine(formData as any, highlights);
            // Atualizar status local após salvar
            setRevisaoStatus(isDraft ? 'rascunho' : 'concluida');
            setReEditConfirmed(false);
            if (!isDraft) {
                // Libera o lock ao finalizar
                if (redacao) await releaseLock(redacao.id);
                // Passa force=true para não acionar o guard de "alterações não salvas",
                // já que a revisão foi finalizada e salva com sucesso.
                setTimeout(() => handleExitMesa(true), 2000);
            }
        } catch (error: any) {
            console.error('Erro ao salvar:', error);
            toast.error('Erro ao salvar revisão: ' + (error?.message || 'Erro desconhecido.'));
        } finally {
            setSubmitting(false);
        }
    };

    // ── Highlight Handlers ──────────────────────────────────
    const handleTextSelection = (e: React.MouseEvent) => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !textContainerRef.current) {
            if (highlightPopup?.visible && !e.defaultPrevented) setHighlightPopup(null);
            return;
        }
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
        const rootContainer = isDevolutivaText ? containerNode! : textContainerRef.current;
        preSelectionRange.selectNodeContents(rootContainer);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;
        const text = range.toString();
        const end = start + text.length;
        const rect = range.getBoundingClientRect();
        setHighlightPopup(prev => {
            if (prev?.visible && toolbarMode === 'floating') {
                return { ...prev, start, end, text, target: isDevolutivaText ? 'devolutiva' : 'texto', targetId: isDevolutivaText ? devolutivaCriterioId : undefined };
            }
            return { visible: true, x: rect.left + (rect.width / 2) - 160, y: rect.top - 250, start, end, text, target: isDevolutivaText ? 'devolutiva' : 'texto', targetId: isDevolutivaText ? devolutivaCriterioId : undefined };
        });
    };

    const handleAddHighlight = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!highlightPopup) return;
        const newH: Highlight = {
            criterio_id: highlightPopup.target === 'devolutiva' ? highlightPopup.targetId! : highlightFormData.criterio_id,
            cor: highlightFormData.cor,
            start_index: highlightPopup.start,
            end_index: highlightPopup.end,
            texto_marcado: highlightPopup.text,
            observacao: highlightFormData.observacao,
            target: highlightPopup.target
        };
        if (highlightPopup.editIndex !== undefined) {
            const newHList = [...highlights];
            newHList[highlightPopup.editIndex] = newH;
            setHighlights(newHList);
        } else {
            setHighlights([...highlights, newH]);
        }
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

    const handleEditHighlight = (e: React.MouseEvent, index: number, h: Highlight) => {
        e.stopPropagation();
        setHighlightFormData({ criterio_id: h.criterio_id, cor: h.cor, observacao: h.observacao || '' });
        setHighlightPopup({
            visible: true, x: e.clientX, y: e.clientY,
            start: h.start_index, end: h.end_index, text: h.texto_marcado,
            target: h.target || 'texto', targetId: h.target === 'devolutiva' ? h.criterio_id : undefined, editIndex: index
        });
    };

    // ── Drag (floating toolbar) ─────────────────────────────
    const handleDragStart = (e: React.MouseEvent) => {
        if (!highlightPopup) return;
        setIsDragging(true);
        setDragOffset({ x: e.clientX - highlightPopup.x, y: e.clientY - highlightPopup.y });
    };
    const handleDragMove = (e: React.MouseEvent) => {
        if (!isDragging || !highlightPopup) return;
        setHighlightPopup({ ...highlightPopup, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    };
    const handleDragEnd = () => setIsDragging(false);
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

    // ── Render Text With Highlights ─────────────────────────
    const renderTextWithHighlights = (text: string, isDevolutiva: boolean = false, devolutivaCriterioId: number = 0) => {
        if (!text) return null;
        let applicableHighlights = highlights;
        if (isDevolutiva) {
            applicableHighlights = highlights.filter(h => h.criterio_id === devolutivaCriterioId && h.target === 'devolutiva');
        } else {
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
            if (h.start_index > lastIndex) elements.push(<span key={`text-${i}`}>{text.substring(lastIndex, h.start_index)}</span>);
            const colorClass = h.cor === 'verde' ? 'bg-green-200 text-green-900 group-hover:bg-green-300' :
                h.cor === 'vermelho' ? 'bg-red-200 text-red-900 group-hover:bg-red-300' :
                    'bg-yellow-200 text-yellow-900 group-hover:bg-yellow-300';
            const actualStart = Math.max(lastIndex, h.start_index);
            if (actualStart < h.end_index) {
                elements.push(
                    <mark key={`mark-${i}`} className={cn('relative group cursor-pointer rounded px-0.5 transition-colors', colorClass)}
                        onClick={(e) => { e.stopPropagation(); if (!isDevolutiva) setFilterHighlightCriterio(h.criterio_id); }}>
                        {text.substring(actualStart, h.end_index)}
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col w-64 bg-gray-800 text-white text-xs rounded-xl p-3.5 z-10 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                            <span className="flex items-center justify-between mb-2 pb-2 border-b border-gray-700">
                                <span className="font-bold flex items-center gap-1.5"><BookOpen size={12} /> Critério {h.criterio_id}</span>
                                <div className="flex gap-1 z-50">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button type="button" onClick={(e) => handleEditHighlight(e, highlights.indexOf(h), h)} className="text-gray-500 hover:text-blue-400 p-1 bg-gray-700/50 rounded hover:bg-blue-500/20" aria-label="Editar Destaque">
                                                <Highlighter size={12} />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">Editar Destaque</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button type="button" onClick={(e) => handleRemoveHighlight(e, highlights.indexOf(h))} className="text-gray-500 hover:text-red-400 p-1 bg-gray-700/50 rounded hover:bg-red-500/20" aria-label="Remover Destaque">
                                                <X size={12} />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">Remover Destaque</TooltipContent>
                                    </Tooltip>
                                </div>
                            </span>
                            <span className="leading-relaxed font-normal">{h.observacao || <i className="text-gray-500">Sem observação.</i>}</span>
                            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></span>
                        </span>
                    </mark>
                );
                lastIndex = Math.max(lastIndex, h.end_index);
            }
        }
        if (lastIndex < text.length) elements.push(<span key="text-end">{text.substring(lastIndex)}</span>);
        return elements;
    };

    // ── Render: Lista ───────────────────────────────────────
    if (view === 'list') {
        return (
            <RedacaoList
                lista={listaRedacoes}
                loading={loadingLista}
                hasMore={hasMore}
                filters={filters}
                onFilterChange={setFilters}
                onLoadMore={loadMore}
                initialAnswerId={initialAnswerId}
                notFoundError={notFoundError}
                onSelectRedacao={handleSelectRedacao}
                onGoToRevision={(answerId) => router.push(`/dashboard/revisao/${answerId}`)}
                isViewer={isViewer}
            />
        );
    }

    // ── Render: Redação em uso por outro corretor ────────────
    if (lockBlocked) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-[#fdfaf2] text-center px-4">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Lock className="h-10 w-10 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold text-dark-gray mb-2">Redação em uso</h2>
                <p className="text-gray-500 max-w-sm leading-relaxed mb-8">
                    Outro corretor está revisando esta redação no momento. Por favor, escolha outra ou aguarde o lock expirar (30 minutos).
                </p>
                <button
                    onClick={() => { setLockBlocked(false); setView('list'); }}
                    className="flex items-center gap-2 px-6 py-3 bg-dark-gray text-white rounded-xl hover:bg-black transition-all font-semibold"
                >
                    <ArrowLeft size={16} /> Voltar para a Fila
                </button>
            </div>
        );
    }


    // ── Render: Loading skeleton ────────────────────────────
    if (loadingRedacao) {
        return <MesaCorretorSkeleton />;
    }

    // ── Render: Error ───────────────────────────────────────
    if (!redacao) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-white text-center px-4">
                <AlertCircle className="h-12 w-12 text-red-500 mb-6" />
                <h2 className="text-2xl font-bold text-dark-gray mb-2">Erro ao carregar</h2>
                <p className="text-gray-500">Não foi possível encontrar a redação selecionada.</p>
                <button
                    onClick={() => { if (initialAnswerId) { window.location.href = '/dashboard/revisao'; } else { setView('list'); } }}
                    className="mt-6 flex items-center gap-2 px-6 py-2 bg-gray-100 text-dark-gray rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                    <ArrowLeft size={16} /> Voltar para lista
                </button>
            </div>
        );
    }

    // ── Render: Mesa de Correção ────────────────────────────
    const activeCriterioObj = criterios.find(c => c.id === activeCriterio);
    const activeSkill = redacao.evaluated_skills?.[activeCriterio - 1];

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-[#fdfaf2] overflow-hidden">
            <CorrectionHeader
                redacao={redacao}
                criterios={criterios}
                activeCriterio={activeCriterio}
                setActiveCriterio={setActiveCriterio}
                getCriterioStatus={getCriterioStatus}
                filterHighlightCriterio={filterHighlightCriterio}
                setFilterHighlightCriterio={setFilterHighlightCriterio}
                toolbarMode={toolbarMode}
                setToolbarMode={setToolbarMode}
                favorita={formData.favorita}
                setFavorita={(fav) => setFormData({ ...formData, favorita: fav })}
                hasSelection={!!(window.getSelection()?.toString())}
                onResetPopup={() => setHighlightPopup(null)}
                readMode={readMode}
                setReadMode={setReadMode}
                onExitMesa={handleExitMesa}
                onSaveRevisao={handleSaveRevisao}
                submitting={submitting}
                isAllComplete={isAllComplete}
                revisaoStatus={revisaoStatus}
                isDirty={isDirty}
                isViewer={isViewer}
            />

            <div className="flex flex-1 overflow-hidden">
                {/* Coluna da Esquerda: Texto */}
                <div className="w-1/2 flex flex-col border-r border-gray-200/50 bg-[#fdfaf2] relative group/text transition-all duration-300">
                    <div className="px-8 lg:px-12 py-8 overflow-y-auto custom-scrollbar flex-1">
                        {toolbarMode === 'fixed' && !isViewer && (
                            <FixedToolbar
                                visible={!!(window.getSelection()?.toString())}
                                criterios={criterios}
                                formData={highlightFormData}
                                setFormData={setHighlightFormData}
                                onSubmit={handleAddHighlight}
                            />
                        )}
                        <div className="max-w-4xl mx-auto py-8 lg:pt-12 lg:pb-4 px-4 sm:px-8">
                            <h2 className="text-2xl font-serif font-black text-dark-gray mb-6 text-center leading-tight tracking-tight">
                                {redacao.title || 'Sem Título'}
                            </h2>
                            <div className="w-16 h-px bg-accent-red/20 mx-auto mb-8" />
                            <div
                                ref={textContainerRef}
                                onMouseUp={isViewer ? undefined : handleTextSelection}
                                className={cn(
                                    'prose prose-slate max-w-none prose-p:leading-[1.7] prose-p:mb-5',
                                    'text-dark-gray font-serif text-lg sm:text-xl selection:bg-accent-red/10',
                                    readMode ? 'mx-auto' : 'w-full'
                                )}
                                style={{ whiteSpace: 'pre-wrap' }}
                            >
                                {renderTextWithHighlights(redacao.essay)}
                            </div>
                        </div>

                        {!readMode && !isViewer && (
                            <div className="mt-6 pt-6 border-t border-gray-200/50 flex flex-col gap-6 max-w-4xl mx-auto w-full pb-12">
                                <div className="flex items-center justify-between bg-white/20 p-6 rounded-3xl border border-gray-200/50 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300', formData.suspeita_ia ? 'bg-red-100 text-red-600 shadow-inner' : 'bg-gray-100 text-gray-500')}>
                                            <AlertCircle size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-dark-gray">Suspeita de uso de IA</h4>
                                            <p className="text-xs text-gray-500">Marque se você acredita que este texto foi gerado por IA.</p>
                                        </div>
                                    </div>
                                    <button type="button"
                                        onClick={() => setFormData({ ...formData, suspeita_ia: !formData.suspeita_ia })}
                                        className={cn('relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ring-offset-2 focus:ring-2 focus:ring-red-500/20', formData.suspeita_ia ? 'bg-accent-red shadow-lg shadow-accent-red/20' : 'bg-gray-300')}>
                                        <span className={cn('inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform', formData.suspeita_ia ? 'translate-x-6' : 'translate-x-1')} />
                                    </button>
                                </div>
                                {formData.suspeita_ia && (
                                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-[0.15em] mb-3 pl-1">Justificativa da suspeita (Opcional)</label>
                                        <textarea
                                            value={formData.motivo_suspeita_ia}
                                            onChange={(e) => setFormData({ ...formData, motivo_suspeita_ia: e.target.value })}
                                            placeholder="Descreva aqui os padrões ou evidências que indicam o uso de IA..."
                                            rows={4}
                                            className="w-full bg-white/60 border border-gray-200/60 rounded-2xl px-6 py-5 text-base focus:ring-4 focus:ring-red-500/5 focus:border-red-500/30 outline-none transition-all resize-none shadow-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {!isViewer && (
                        <FloatingToolbar
                            visible={!!(highlightPopup?.visible && toolbarMode === 'floating')}
                            x={highlightPopup?.x || 0}
                            y={highlightPopup?.y || 0}
                            target={highlightPopup?.target || 'texto'}
                            targetId={highlightPopup?.targetId}
                            criterios={criterios}
                            formData={highlightFormData}
                            setFormData={setHighlightFormData}
                            onSubmit={handleAddHighlight}
                            onClose={() => setHighlightPopup(null)}
                            isDragging={isDragging}
                            onDragStart={handleDragStart}
                        />
                    )}
                </div>

                {/* Coluna da Direita: Formulário */}
                <div className="w-1/2 overflow-y-auto bg-[#fdfaf2] custom-scrollbar relative border-l border-gray-200/50">
                    <div className="w-full">
                        <form onSubmit={(e) => handleSaveRevisao(e, false)} className="pb-8">
                            {activeCriterioObj && (
                                <CriterioPanel
                                    criterio={activeCriterioObj}
                                    formData={formData as any}
                                    setFormData={setFormData as any}
                                    openTema={openTema}
                                    setOpenTema={setOpenTema}
                                    readMode={readMode}
                                    onOpenInfo={() => setIsInfoModalOpen(true)}
                                    notaIA={activeSkill?.score ?? 0}
                                    devolutivaIA={activeSkill?.comment ?? ''}
                                    renderTextWithHighlights={renderTextWithHighlights}
                                    handleTextSelection={isViewer ? () => {} : handleTextSelection}
                                    hideIaScore={globalHideIaScore}
                                    isViewer={isViewer}
                                />
                            )}
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal: Info do Critério */}
            {isInfoModalOpen && activeCriterioObj && (
                <CriterioInfoModal
                    criterio={activeCriterioObj}
                    onClose={() => setIsInfoModalOpen(false)}
                />
            )}

            {/* Modal: Confirmação de saída */}
            {showExitConfirm && (
                <ExitConfirmModal
                    onSaveAndExit={(e) => { handleSaveRevisao(e, true); setShowExitConfirm(false); }}
                    onExitWithoutSave={() => handleExitMesa(true)}
                    onCancel={() => { setShowExitConfirm(false); setPendingRoute(null); }}
                />
            )}

            {/* Modal: Confirmação de reedição de revisão concluída */}
            {showReEditConfirm && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => { setShowReEditConfirm(false); pendingFormChange.current = null; pendingHighlightsChange.current = null; }}
                    />
                    <div className="bg-[#fdfaf2] border border-[#eee9df] w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-8 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-4 text-amber-500 mb-6">
                            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                                <AlertCircle size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-dark-gray">Revisão já concluída</h3>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed mb-8 text-center px-2">
                            Esta revisão já foi <strong>finalizada e enviada</strong>. Ao editar, você poderá salvar novamente com as alterações realizadas. Deseja continuar?
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleConfirmReEdit}
                                className="w-full py-3.5 bg-amber-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Sim, editar revisão
                            </button>
                            <button
                                onClick={() => { setShowReEditConfirm(false); pendingFormChange.current = null; pendingHighlightsChange.current = null; }}
                                className="w-full py-3.5 bg-white/50 border border-gray-200/60 text-gray-500 font-bold uppercase tracking-wider text-[10px] rounded-xl hover:bg-white hover:text-dark-gray transition-all shadow-sm"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
