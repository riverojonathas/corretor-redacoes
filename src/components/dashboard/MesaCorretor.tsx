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
    GraduationCap,
    Save,
    Inbox,
    HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Redacao, RedacaoListItem, Highlight, Criterio } from '@/types/dashboard';
import { RedacaoList } from './RedacaoList';
import { CorrectionHeader } from './CorrectionHeader';
import { FloatingToolbar, FixedToolbar } from './HighlightTools';

const defaultCriterios: Criterio[] = [
    { id: 1, name: 'Critério 1', desc: 'Domínio da norma culta', full_desc: '' },
    { id: 2, name: 'Critério 2', desc: 'Compreender a proposta', full_desc: '' },
    { id: 3, name: 'Critério 3', desc: 'Selecionar e organizar info', full_desc: '' },
    { id: 4, name: 'Critério 4', desc: 'Conhecimento linguístico', full_desc: '' },
    { id: 5, name: 'Critério 5', desc: 'Proposta de intervenção', full_desc: '' },
];

function sanitizeTextWithHighlights(text: string, hls: Highlight[]) {
    if (!text) return { text: '', highlights: hls };

    let sanitizedText = text;
    let newHighlights = hls.map(h => ({ ...h }));

    const patterns = [
        { regex: /\\n/g, replacement: '\n' },
        { regex: /\\t/g, replacement: '\t' },
        { regex: /\\r/g, replacement: '\r' }
    ];

    let allMatches: { index: number, length: number, replacement: string }[] = [];

    patterns.forEach(p => {
        let match;
        const re = new RegExp(p.regex);
        while ((match = re.exec(text)) !== null) {
            allMatches.push({
                index: match.index,
                length: match[0].length,
                replacement: p.replacement
            });
        }
    });

    allMatches.sort((a, b) => b.index - a.index);

    allMatches.forEach(m => {
        const diff = m.length - m.replacement.length;
        sanitizedText = sanitizedText.substring(0, m.index) + m.replacement + sanitizedText.substring(m.index + m.length);

        newHighlights.forEach(h => {
            if (m.index < h.start_index) {
                h.start_index -= diff;
                h.end_index -= diff;
            } else if (m.index >= h.start_index && m.index < h.end_index) {
                h.end_index -= diff;
            }
        });
    });

    // Also sanitize highlights text to match updated indices
    newHighlights.forEach(h => {
        let cleanMarked = h.texto_marcado;
        patterns.forEach(p => {
            cleanMarked = cleanMarked.replace(p.regex, p.replacement);
        });
        h.texto_marcado = cleanMarked;
    });

    return { text: sanitizedText, highlights: newHighlights };
}


export function MesaCorretor({ initialAnswerId }: { initialAnswerId?: string }) {
    const { user } = useAuth();
    const router = useRouter();

    // View state
    const [view, setView] = useState<'list' | 'correction'>('list');
    const [listaRedacoes, setListaRedacoes] = useState<RedacaoListItem[]>([]);
    const [loadingLista, setLoadingLista] = useState(true);

    // Correction state
    const [redacao, setRedacao] = useState<Redacao | null>(null);
    const [loadingRedacao, setLoadingRedacao] = useState(false);
    const [notFoundError, setNotFoundError] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [highlightPopup, setHighlightPopup] = useState<{ visible: boolean, x: number, y: number, start: number, end: number, text: string, target: 'texto' | 'devolutiva', targetId?: number, editIndex?: number } | null>(null);
    const [highlightFormData, setHighlightFormData] = useState({ criterio_id: 1, cor: 'amarelo', observacao: '' });
    const [filterHighlightCriterio, setFilterHighlightCriterio] = useState<number | 'all'>('all');

    // Toolbar UX State
    const [toolbarMode, setToolbarMode] = useState<'fixed' | 'floating'>('floating');

    const [formData, setFormData] = useState<Record<string, any>>({
        comentario_geral: '',
        favorita: false,
        suspeita_ia: false,
        motivo_suspeita_ia: ''
    });

    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const textContainerRef = React.useRef<HTMLDivElement>(null);

    // Dirty state tracking
    const [pristineFormData, setPristineFormData] = useState<Record<string, any>>({});
    const [pristineHighlights, setPristineHighlights] = useState<Highlight[]>([]);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    const isDirty = useCallback(() => {
        const currentDataStr = JSON.stringify(formData);
        const pristineDataStr = JSON.stringify(pristineFormData);
        if (currentDataStr !== pristineDataStr) return true;

        if (highlights.length !== pristineHighlights.length) return true;

        // Simple comparison for highlights
        return JSON.stringify(highlights) !== JSON.stringify(pristineHighlights);
    }, [formData, pristineFormData, highlights, pristineHighlights]);

    const handleExitMesa = useCallback((force = false) => {
        if (!force && isDirty()) {
            setShowExitConfirm(true);
            return;
        }

        setShowExitConfirm(false);
        if (initialAnswerId) {
            router.push('/dashboard');
        } else {
            setView('list');
            setHighlightPopup(null);
            setRedacao(null);
            // Se carregou uma redação específica via answer_id, limpa o query param/rota para não re-carregar ao abrir a lista
            if (window.location.pathname.includes('/dashboard/revisao')) {
                router.push('/dashboard');
            }
        }
    }, [isDirty, initialAnswerId, router]);

    // Accordion UI State
    const [activeCriterio, setActiveCriterio] = useState<number>(1);

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

    // Readability State
    const [readMode, setReadMode] = useState<boolean>(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
    const [openTema, setOpenTema] = useState<Record<number, number | null>>({});

    const getCriterioStatus = (criterioId: number) => {
        const t1 = (formData as any)[`criterio_${criterioId}_tema_1`];
        const t2 = (formData as any)[`criterio_${criterioId}_tema_2`];
        const t3 = (formData as any)[`criterio_${criterioId}_tema_3`];
        const t4 = (formData as any)[`criterio_${criterioId}_tema_4`];

        const answeredCount = [t1, t2, t3, t4].filter(val => val && val.toString().trim() !== '').length;

        if (answeredCount === 4) return 'complete';
        if (answeredCount > 0) return 'partial';
        return 'empty';
    };

    const isAllComplete = criterios.every(c => getCriterioStatus(c.id) === 'complete');

    const fetchLista = useCallback(async () => {
        if (!user) return;
        setLoadingLista(true);
        try {
            const { data: redacoes, error } = await supabase
                .from('redacoes')
                .select('id, title, nick, extra_fields, answer_id, revisoes(id, corretor_id, favorita, status)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (redacoes) {
                const formatadas: RedacaoListItem[] = redacoes.map((r: any) => {
                    const rev = r.revisoes?.find((rev: any) => rev.corretor_id === user.id);
                    const extras = r.extra_fields || {};
                    return {
                        id: r.id,
                        titulo: r.title || 'Sem Título',
                        nick: r.nick,
                        nr_serie: extras.redacao_ano_serie,
                        titulo_modelo: extras.redacao_tema,
                        nm_tipo_ensino: extras.nm_tipo_ensino,
                        answer_id: r.answer_id,
                        status: rev ? (rev.status || 'concluida') : 'pendente',
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
        if (!user) return;

        if (initialAnswerId) {
            setView('correction');
            loadInitialAnswer(initialAnswerId);
        } else if (view === 'list') {
            fetchLista();
        }
    }, [view, fetchLista, initialAnswerId, user]);

    const loadInitialAnswer = async (answerId: string) => {
        setLoadingRedacao(true);
        setNotFoundError(false);

        try {
            // First find the redacao by answer_id
            const { data: redacaoData, error: redacaoError } = await supabase
                .from('redacoes')
                .select('id')
                .eq('answer_id', answerId)
                .single();

            if (redacaoError || !redacaoData) {
                setNotFoundError(true);
                return;
            }

            // If found, load it normally by internal ID
            // Check if there is already a revisao for this user
            const { data: revData } = await supabase
                .from('revisoes')
                .select('id')
                .eq('redacao_id', redacaoData.id)
                .eq('corretor_id', user!.id)
                .single();

            await handleSelectRedacao(redacaoData.id, revData?.id);

        } catch (err) {
            console.error('Erro ao buscar redação por answer_id:', err);
            setNotFoundError(true);
        } finally {
            setLoadingRedacao(false);
        }
    };

    const handleSelectRedacao = async (id: string, revisaoId?: string) => {
        if (!user) return;
        setView('correction');
        setLoadingRedacao(true);

        try {
            // Busca os dados da redação
            const { data: redacaoData, error: redacaoError } = await supabase
                .from('redacoes')
                .select('*')
                .eq('id', id)
                .single();

            if (redacaoError) throw redacaoError;

            // Sanitização inicial: buscamos os destaques da redação para alinhar com a limpeza do texto
            // Se ainda não carregamos a revisão, passamos array vazio
            let finalEssay = redacaoData.essay || '';
            let finalSkills = redacaoData.evaluated_skills || [];

            // Limpeza recursiva para todos os comentários da IA
            finalSkills = finalSkills.map((s: any) => {
                if (!s.comment) return s;
                const { text: cleanComment } = sanitizeTextWithHighlights(s.comment, []);
                return { ...s, comment: cleanComment };
            });

            const processedRedacao = {
                ...redacaoData,
                essay: finalEssay,
                evaluated_skills: finalSkills
            };

            setRedacao(processedRedacao);

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
                        criterio_1_tema_4: revData.criterio_1_tema_4 || '',
                        criterio_1_observacao: revData.criterio_1_observacao || '',
                        criterio_2_tema_1: revData.criterio_2_tema_1 || '',
                        criterio_2_tema_2: revData.criterio_2_tema_2 || '',
                        criterio_2_tema_3: revData.criterio_2_tema_3 || '',
                        criterio_2_tema_4: revData.criterio_2_tema_4 || '',
                        criterio_2_observacao: revData.criterio_2_observacao || '',
                        criterio_3_tema_1: revData.criterio_3_tema_1 || '',
                        criterio_3_tema_2: revData.criterio_3_tema_2 || '',
                        criterio_3_tema_3: revData.criterio_3_tema_3 || '',
                        criterio_3_tema_4: revData.criterio_3_tema_4 || '',
                        criterio_3_observacao: revData.criterio_3_observacao || '',
                        criterio_4_tema_1: revData.criterio_4_tema_1 || '',
                        criterio_4_tema_2: revData.criterio_4_tema_2 || '',
                        criterio_4_tema_3: revData.criterio_4_tema_3 || '',
                        criterio_4_tema_4: revData.criterio_4_tema_4 || '',
                        criterio_4_observacao: revData.criterio_4_observacao || '',
                        criterio_5_tema_1: revData.criterio_5_tema_1 || '',
                        criterio_5_tema_2: revData.criterio_5_tema_2 || '',
                        criterio_5_tema_3: revData.criterio_5_tema_3 || '',
                        criterio_5_tema_4: revData.criterio_5_tema_4 || '',
                        criterio_5_observacao: revData.criterio_5_observacao || '',
                        comentario_geral: revData.comentario_geral || '',
                        favorita: revData.favorita || false,
                        suspeita_ia: revData.suspeita_ia || false,
                        motivo_suspeita_ia: revData.motivo_suspeita_ia || ''
                    });

                    // Caso existam avaliações no campo JSONB (novo esquema), popula o form
                    let dynamicData: any = {};
                    if (revData.avaliacoes && Array.isArray(revData.avaliacoes)) {
                        revData.avaliacoes.forEach((av: any) => {
                            dynamicData[`criterio_${av.criterio_id}_tema_1`] = av.tema_1 || '';
                            dynamicData[`criterio_${av.criterio_id}_tema_2`] = av.tema_2 || '';
                            dynamicData[`criterio_${av.criterio_id}_tema_3`] = av.tema_3 || '';
                            dynamicData[`criterio_${av.criterio_id}_observacao`] = av.observacao || '';
                        });
                        setFormData(prev => ({ ...prev, ...dynamicData }));
                    }

                    // Aplicar sanitização no texto da redação E nos destaques simultaneamente
                    const { text: cleanEssay, highlights: cleanHighlights } = sanitizeTextWithHighlights(
                        redacaoData.essay,
                        revData.revisao_destaques?.filter((h: any) => !h.target || h.target === 'texto') || []
                    );

                    const devHighlightsRaw = revData.revisao_destaques?.filter((h: any) => h.target === 'devolutiva') || [];
                    let cleanDevHighlights: Highlight[] = [];

                    // Important: Use original redacaoData.evaluated_skills for alignment, NOT the already sanitized finalSkills
                    const cleanSkills = (redacaoData.evaluated_skills || []).map((s: any, idx: number) => {
                        const critId = idx + 1;
                        if (!s.comment) return s;

                        const skillHls = devHighlightsRaw.filter((h: any) => h.criterio_id === critId);
                        const { text: cleanComment, highlights: processedSkillHls } = sanitizeTextWithHighlights(s.comment, skillHls);

                        cleanDevHighlights = [...cleanDevHighlights, ...processedSkillHls];
                        return { ...s, comment: cleanComment };
                    });

                    setRedacao({
                        ...processedRedacao,
                        essay: cleanEssay,
                        evaluated_skills: cleanSkills
                    });

                    setHighlights([...cleanHighlights, ...cleanDevHighlights]);

                    // Initialize pristine states
                    const loadedForm = {
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
                        favorita: revData.favorita || false,
                        suspeita_ia: revData.suspeita_ia || false,
                        motivo_suspeita_ia: revData.motivo_suspeita_ia || '',
                        ...dynamicData
                    };
                    setPristineFormData(loadedForm);
                    setPristineHighlights([...cleanHighlights, ...cleanDevHighlights]);
                }
            } else {
                // Reset form
                setHighlights([]);
                setHighlightPopup(null);
                const initialForm = {
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
                    favorita: false,
                    suspeita_ia: false,
                    motivo_suspeita_ia: ''
                };
                setFormData(initialForm);
                setPristineFormData(initialForm);
                setPristineHighlights([]);
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
        if (!redacao || !user) return;

        if (!isDraft && !isAllComplete) {
            toast.error('Preencha todos os campos obrigatórios para finalizar a revisão.');
            return;
        }

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

            // Mapeia avaliações dinâmicas para o campo JSONB 'avaliacoes'
            const avaliacoes = criterios.map(c => ({
                criterio_id: c.id,
                tema_1: (formData as any)[`criterio_${c.id}_tema_1`],
                tema_2: (formData as any)[`criterio_${c.id}_tema_2`],
                tema_3: (formData as any)[`criterio_${c.id}_tema_3`],
                tema_4: (formData as any)[`criterio_${c.id}_tema_4`],
                observacao: (formData as any)[`criterio_${c.id}_observacao`]
            }));

            if (revData?.id) {
                // Update
                const { error } = await supabase
                    .from('revisoes')
                    .update({
                        ...formData,
                        avaliacoes,
                        status: isDraft ? 'rascunho' : 'concluida',
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
                        avaliacoes,
                        status: isDraft ? 'rascunho' : 'concluida',
                        data_correcao: new Date().toISOString()
                    }])
                    .select('id').single();
                if (error) throw error;
                finalRevisaoId = insertResult.id;
            }


            if (finalRevisaoId) {
                await supabase.from('revisao_destaques').delete().eq('revisao_id', finalRevisaoId);
                if (highlights.length > 0) {
                    const toInsert = highlights.map(h => {
                        const payload: any = {
                            revisao_id: finalRevisaoId,
                            criterio_id: h.criterio_id,
                            cor: h.cor,
                            start_index: h.start_index,
                            end_index: h.end_index,
                            texto_marcado: h.texto_marcado,
                            observacao: h.observacao || ''
                        };
                        return payload;
                    });

                    const { error: insertError } = await supabase.from('revisao_destaques').insert(toInsert);
                    if (insertError) {
                        console.error('Falha ao salvar destaques:', insertError);
                        throw new Error('As avaliações foram salvas, mas os grifos falharam: ' + insertError.message);
                    }
                }
            }

            toast.success(isDraft ? 'Rascunho salvo com sucesso!' : 'Revisão finalizada com sucesso!');

            // Synchronize pristine state after successful save
            setPristineFormData({ ...formData });
            setPristineHighlights([...highlights]);

            // Voltar pra lista apenas se estiver finalizando a revisão
            if (!isDraft) {
                setTimeout(() => {
                    handleExitMesa();
                }, 2000);
            }

        } catch (error: any) {
            console.error('Erro ao salvar:', JSON.stringify(error, null, 2), error);
            toast.error('Erro ao salvar revisão: ' + (error?.message || 'Erro desconhecido. Verifique o console.'));
        } finally {
            setSubmitting(false);
        }
    };


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
        setHighlightFormData({
            criterio_id: h.criterio_id,
            cor: h.cor,
            observacao: h.observacao || ''
        });
        setHighlightPopup({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            start: h.start_index,
            end: h.end_index,
            text: h.texto_marcado,
            target: h.target || 'texto',
            targetId: h.target === 'devolutiva' ? h.criterio_id : undefined,
            editIndex: index
        });
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

        if (lastIndex < text.length) {
            elements.push(<span key={`text-end`}>{text.substring(lastIndex)}</span>);
        }

        return elements;
    };

    if (view === 'list') {
        return (
            <RedacaoList
                listaRedacoes={listaRedacoes}
                loadingLista={loadingLista}
                initialAnswerId={initialAnswerId}
                notFoundError={notFoundError}
                onSelectRedacao={handleSelectRedacao}
                onGoToRevision={(answerId) => router.push(`/dashboard/revisao/${answerId}`)}
            />
        );
    }


    if (loadingRedacao) {
        return (
            <div className="flex flex-col h-[calc(100vh-64px)] bg-white overflow-hidden animate-pulse">
                {/* Fake header */}
                <div className="bg-white border-b border-gray-100 flex items-center justify-between px-8 py-5 shadow-sm z-10">
                    <div className="flex flex-col gap-3">
                        <div className="h-7 w-64 bg-gray-100 rounded"></div>
                        <div className="h-4 w-40 bg-gray-100 rounded"></div>
                    </div>
                    <div className="flex gap-3">
                        <div className="h-10 w-28 bg-gray-100 rounded-xl"></div>
                        <div className="h-10 w-32 bg-gray-100 rounded-xl"></div>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Fake left column - essay text */}
                    <div className="w-1/2 border-r border-gray-100 p-8 lg:px-12 bg-[#fdfcf8]">
                        <div className="w-full flex justify-end mb-8">
                            <div className="h-8 w-32 bg-gray-100 rounded-full border border-gray-200"></div>
                        </div>
                        <div className="space-y-5 max-w-[70ch] mx-auto opacity-60">
                            {[1, 2, 3, 4, 5, 6, 7].map(line => (
                                <div key={line} className={`h-6 bg-gray-200 rounded-sm w-${[
                                    'full', '11/12', 'full', '4/5', 'full', '10/12', '9/12'
                                ][line - 1]}`}></div>
                            ))}
                            <div className="h-6 bg-transparent w-full"></div> {/* break */}
                            {[8, 9, 10, 11, 12].map(line => (
                                <div key={line} className={`h-6 bg-gray-200 rounded-sm w-${[
                                    'full', '10/12', 'full', '11/12', '3/4'
                                ][line - 8]}`}></div>
                            ))}
                        </div>
                    </div>

                    {/* Fake right column - corrections */}
                    <div className="w-1/2 p-8 lg:px-12 bg-gray-50/50">
                        {/* Fake Criterios bar */}
                        <div className="flex bg-gray-100 p-1.5 rounded-lg space-x-2 mb-10 h-12 w-full"></div>

                        <div className="h-8 w-56 bg-gray-100 rounded mb-3"></div>
                        <div className="h-4 w-72 bg-gray-100 rounded mb-10"></div>

                        {/* Fake Devolutiva IA */}
                        <div className="h-4 w-60 bg-gray-100 rounded mb-5"></div>
                        <div className="h-48 bg-gray-100 rounded-2xl w-full mb-12 border border-gray-200"></div>

                        {/* Fake select inputs */}
                        <div className="space-y-8">
                            {[1, 2, 3].map(i => (
                                <div key={i}>
                                    <div className="h-4 w-48 bg-gray-100 rounded mb-3"></div>
                                    <div className="h-14 bg-gray-100 rounded-xl w-full border border-gray-200"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
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
                    onClick={() => {
                        if (initialAnswerId) {
                            window.location.href = '/dashboard/revisao';
                        } else {
                            setView('list');
                        }
                    }}
                    className="mt-6 flex items-center gap-2 px-6 py-2 bg-gray-100 text-dark-gray rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                    <ArrowLeft size={16} />
                    Voltar para lista
                </button>
            </div>
        );
    }

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
            />

            <div className="flex flex-1 overflow-hidden">
                {/* Coluna da Esquerda: Texto */}
                <div className="w-1/2 flex flex-col border-r border-gray-200/50 bg-[#fdfaf2] relative group/text transition-all duration-300">
                    <div className="px-8 lg:px-12 py-8 overflow-y-auto custom-scrollbar flex-1">
                        {toolbarMode === 'fixed' && (
                            <FixedToolbar
                                visible={!!(window.getSelection()?.toString())}
                                criterios={criterios}
                                formData={highlightFormData}
                                setFormData={setHighlightFormData}
                                onSubmit={handleAddHighlight}
                            />
                        )}

                        {/* Título da Redação */}
                        <div className="max-w-4xl mx-auto py-8 lg:pt-12 lg:pb-4 px-4 sm:px-8">
                            <h2 className="text-2xl font-serif font-black text-dark-gray mb-6 text-center leading-tight tracking-tight">
                                {redacao.title || 'Sem Título'}
                            </h2>
                            <div className="w-16 h-px bg-accent-red/20 mx-auto mb-8" />

                            <div
                                ref={textContainerRef}
                                onMouseUp={handleTextSelection}
                                className={cn(
                                    "prose prose-slate max-w-none prose-p:leading-[1.7] prose-p:mb-5",
                                    "text-dark-gray font-serif text-lg sm:text-xl selection:bg-accent-red/10",
                                    readMode ? "mx-auto" : "w-full"
                                )}
                                style={{ whiteSpace: 'pre-wrap' }}
                            >
                                {renderTextWithHighlights(redacao.essay)}
                            </div>
                        </div>

                        {!readMode && (
                            <div className="mt-6 pt-6 border-t border-gray-200/50 flex flex-col gap-6 max-w-4xl mx-auto w-full pb-12">
                                <div className="flex items-center justify-between bg-white/20 p-6 rounded-3xl border border-gray-200/50 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                                            formData.suspeita_ia ? "bg-red-100 text-red-600 shadow-inner" : "bg-gray-100 text-gray-500"
                                        )}>
                                            <AlertCircle size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-dark-gray">Suspeita de uso de IA</h4>
                                            <p className="text-xs text-gray-500">Marque se você acredita que este texto foi gerado por IA.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, suspeita_ia: !formData.suspeita_ia })}
                                        className={cn(
                                            "relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ring-offset-2 focus:ring-2 focus:ring-red-500/20",
                                            formData.suspeita_ia ? "bg-accent-red shadow-lg shadow-accent-red/20" : "bg-gray-300"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform",
                                                formData.suspeita_ia ? "translate-x-6" : "translate-x-1"
                                            )}
                                        />
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
                </div>

                {/* Coluna da Direita: Formulário */}
                <div className="w-1/2 overflow-y-auto bg-[#fdfaf2] custom-scrollbar relative border-l border-gray-200/50">
                    <div className="w-full">
                        <form onSubmit={(e) => handleSaveRevisao(e, false)} className="pb-8">
                            {/* Conteúdo da Competência Ativa */}
                            {(() => {
                                const c = criterios.find(crit => crit.id === activeCriterio);
                                if (!c) return null;

                                const skill = redacao.evaluated_skills?.[c.id - 1];
                                const notasIA = skill?.score ?? 0;
                                const devolutivaIA = skill?.comment ?? '';

                                return (
                                    <div key={`content-${c.id}`} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <div className={cn(
                                            "sticky top-0 z-10 border-b border-gray-200 flex items-center justify-between px-8 lg:px-12 py-3 transition-all",
                                            readMode ? "bg-transparent opacity-40 hover:opacity-100" : "bg-[#fdfaf2]/95 backdrop-blur-sm shadow-sm"
                                        )}>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-dark-gray text-lg flex items-center gap-2">
                                                    <span className="bg-dark-gray text-white text-[10px] px-1.5 py-0.5 rounded leading-none">C{c.id}</span>
                                                    <span className="uppercase tracking-wide">{c.desc}</span>
                                                </h3>
                                                {c.full_desc && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsInfoModalOpen(true)}
                                                        className="text-gray-400 hover:text-dark-gray focus:outline-none transition-colors"
                                                    >
                                                        <HelpCircle size={16} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="bg-accent-red/5 px-4 py-1.5 rounded-full border border-accent-red/10 shrink-0">
                                                <span className="text-[11px] font-black text-accent-red uppercase tracking-wider">Nota IA: {notasIA}</span>
                                            </div>
                                        </div>

                                        <div className="px-8 lg:px-12 mt-8">
                                            {/* Bloco da IA */}
                                            <div className="mb-10">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-accent-red" />
                                                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Devolutiva Inteligente</h4>
                                                </div>
                                                <div
                                                    data-devolutiva="true"
                                                    data-criterio-id={c.id}
                                                    onMouseUp={handleTextSelection}
                                                    className="p-4 lg:p-6 text-[15px] text-gray-700 leading-relaxed font-medium relative group"
                                                >
                                                    {renderTextWithHighlights(devolutivaIA, true, c.id)}
                                                </div>
                                            </div>

                                            {/* Bloco do Corretor */}
                                            {!readMode && (
                                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-dark-gray" />
                                                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Avaliação Final</h4>
                                                    </div>

                                                    {/* Sanfona Automática de Avaliação */}
                                                    {(() => {
                                                        const temas = [
                                                            { id: 1, label: "Identificação de pontos positivos" },
                                                            { id: 2, label: "Identificação do problema que levou à perda de nota" },
                                                            { id: 3, label: "Sugestão de melhoria ao estudante" },
                                                            { id: 4, label: "Avaliação da nota atribuída pela IA" }
                                                        ];
                                                        const correctOptions = ["Satisfatório", "Vago", "Incompleto", "Com erros"];
                                                        const incorrectOptions = ["Identificou incorretamente", "Não identificou", "Alucinação"];

                                                        // Determine qual tema está aberto para este critério
                                                        const currentOpenTema = openTema[c.id] !== undefined
                                                            ? openTema[c.id]
                                                            : temas.find(t => !(formData as any)[`criterio_${c.id}_tema_${t.id}`])?.id ?? null;

                                                        const isNegative = (val: string) => incorrectOptions.includes(val);

                                                        return (
                                                            <div className="flex flex-col gap-2">
                                                                {temas.map((tema, idx) => {
                                                                    const fieldName = `criterio_${c.id}_tema_${tema.id}`;
                                                                    const currentValue = (formData as any)[fieldName];
                                                                    const isOpen = currentOpenTema === tema.id;
                                                                    const isDone = !!currentValue;

                                                                    const handleSelect = (opt: string) => {
                                                                        const newFormData = { ...formData, [fieldName]: opt };
                                                                        setFormData(newFormData);
                                                                        // auto-advance para o próximo não preenchido
                                                                        const nextTema = temas.find(t => t.id > tema.id && !newFormData[`criterio_${c.id}_tema_${t.id}`]);
                                                                        setOpenTema(prev => ({ ...prev, [c.id]: nextTema?.id ?? null }));
                                                                    };

                                                                    // Determine as opções com base no ID do tema
                                                                    const isScoreTheme = tema.id === 4;
                                                                    const currentCorrectOptions = isScoreTheme ? ["Adequada"] : correctOptions;
                                                                    const currentIncorrectOptions = isScoreTheme
                                                                        ? [
                                                                            "1 ponto abaixo", "2 pontos abaixo", "mais de dois pontos abaixo",
                                                                            "1 ponto acima", "2 pontos acima", "mais de dois pontos acima"
                                                                        ]
                                                                        : incorrectOptions;

                                                                    return (
                                                                        <div key={tema.id} className={cn(
                                                                            "rounded-2xl border transition-all duration-300 overflow-hidden",
                                                                            isOpen
                                                                                ? "border-[#eee9df] bg-white/30"
                                                                                : isDone
                                                                                    ? "border-transparent bg-transparent"
                                                                                    : "border-dashed border-[#eee9df]"
                                                                        )}>
                                                                            {/* Header do Item */}
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setOpenTema(prev => ({ ...prev, [c.id]: isOpen ? null : tema.id }))}
                                                                                className={cn(
                                                                                    "w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors",
                                                                                    isOpen ? "" : isDone ? "hover:bg-black/5" : "hover:bg-black/5"
                                                                                )}
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    <span className={cn(
                                                                                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition-all",
                                                                                        isDone
                                                                                            ? isNegative(currentValue) || (isScoreTheme && currentValue !== "Adequada")
                                                                                                ? "bg-rose-100 text-rose-600"
                                                                                                : "bg-emerald-100 text-emerald-600"
                                                                                            : "bg-black/10 text-gray-400"
                                                                                    )}>
                                                                                        {isDone
                                                                                            ? isNegative(currentValue) || (isScoreTheme && currentValue !== "Adequada") ? "✕" : "✓"
                                                                                            : idx + 1
                                                                                        }
                                                                                    </span>
                                                                                    <span className={cn(
                                                                                        "text-[12px] font-bold uppercase tracking-wide transition-colors",
                                                                                        isOpen ? "text-dark-gray" : isDone ? "text-gray-500" : "text-gray-400"
                                                                                    )}>
                                                                                        {tema.label}
                                                                                    </span>
                                                                                </div>
                                                                                {isDone && !isOpen && (
                                                                                    <span className={cn(
                                                                                        "text-[12px] font-bold px-3 py-1 rounded-full border transition-all",
                                                                                        isNegative(currentValue) || (isScoreTheme && currentValue !== "Adequada")
                                                                                            ? "text-rose-700 bg-rose-50 border-rose-200"
                                                                                            : "text-emerald-700 bg-emerald-50 border-emerald-200"
                                                                                    )}>
                                                                                        {currentValue}
                                                                                    </span>
                                                                                )}
                                                                            </button>

                                                                            {/* Corpo expansível */}
                                                                            {isOpen && (
                                                                                <div className="px-5 pb-5 flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                                                    {currentCorrectOptions.map(opt => (
                                                                                        <button
                                                                                            key={opt}
                                                                                            type="button"
                                                                                            onClick={() => handleSelect(opt)}
                                                                                            className={cn(
                                                                                                "px-3 py-1.5 rounded-full text-[12px] font-bold transition-all border",
                                                                                                currentValue === opt
                                                                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                                                                                                    : "bg-transparent text-gray-500 border-[#eee9df] hover:border-emerald-200 hover:text-emerald-600"
                                                                                            )}
                                                                                        >
                                                                                            {opt}
                                                                                        </button>
                                                                                    ))}
                                                                                    <div className="w-px h-4 bg-[#eee9df] mx-1" />
                                                                                    {currentIncorrectOptions.map(opt => (
                                                                                        <button
                                                                                            key={opt}
                                                                                            type="button"
                                                                                            onClick={() => handleSelect(opt)}
                                                                                            className={cn(
                                                                                                "px-3 py-1.5 rounded-full text-[12px] font-bold transition-all border",
                                                                                                currentValue === opt
                                                                                                    ? "bg-rose-50 text-rose-700 border-rose-200 shadow-sm"
                                                                                                    : "bg-transparent text-gray-500 border-[#eee9df] hover:border-rose-200 hover:text-rose-600"
                                                                                            )}
                                                                                        >
                                                                                            {opt}
                                                                                        </button>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                    })()}

                                                    <div className="space-y-4 pt-4 border-t border-[#eee9df]">
                                                        <div className="flex items-center justify-between px-1">
                                                            <label className="block text-[11px] font-black text-gray-500 uppercase tracking-[0.15em]">
                                                                Observação do Critério
                                                            </label>
                                                            {(formData as any)[`criterio_${c.id}_observacao`] && (
                                                                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                                                                    <CheckCircle2 size={12} />
                                                                    Preenchido
                                                                </span>
                                                            )}
                                                        </div>
                                                        <textarea
                                                            rows={4}
                                                            value={(formData as any)[`criterio_${c.id}_observacao`]}
                                                            onChange={(e) => setFormData({ ...formData, [`criterio_${c.id}_observacao`]: e.target.value })}
                                                            placeholder="Descreva pontos positivos e negativos observados neste critério..."
                                                            className="w-full bg-white/40 border border-[#eee9df] rounded-2xl px-5 py-4 text-[15px] focus:ring-4 focus:ring-accent-red/5 focus:border-accent-red/30 outline-none transition-all resize-none min-h-[140px] text-dark-gray placeholder:text-gray-400"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal de Informação do Critério */}
            {isInfoModalOpen && criterios.find(crit => crit.id === activeCriterio) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsInfoModalOpen(false)}
                    />
                    <div className="bg-[#fdfaf2] w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-dark-gray">{criterios.find(crit => crit.id === activeCriterio)?.name}</h3>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">Definição e Critérios de Avaliação</p>
                            </div>
                            <button
                                onClick={() => setIsInfoModalOpen(false)}
                                className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-500 hover:text-dark-gray"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                            <div className="prose prose-slate max-w-none">
                                <div className="text-gray-700 leading-relaxed font-serif text-lg space-y-6" style={{ whiteSpace: 'pre-wrap' }}>
                                    {(() => {
                                        const desc = criterios.find(crit => crit.id === activeCriterio)?.full_desc || '';
                                        const { text: cleanDesc } = sanitizeTextWithHighlights(desc, []);
                                        return cleanDesc;
                                    })()}
                                </div>
                            </div>
                        </div>
                        <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
                            <button
                                onClick={() => setIsInfoModalOpen(false)}
                                className="px-6 py-2.5 bg-dark-gray text-white text-sm font-bold rounded-xl hover:bg-black transition-all"
                            >
                                Entendi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmação de Saída (Unsaved Changes) */}
            {showExitConfirm && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setShowExitConfirm(false)}
                    />
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-8 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-4 text-accent-red mb-6">
                            <div className="w-12 h-12 rounded-full bg-accent-red/10 flex items-center justify-center">
                                <AlertCircle size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-dark-gray text-center">Alterações não salvas!</h3>
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed mb-8 text-center">
                            Você possui alterações que ainda não foram salvas como rascunho. Se sair agora, o progresso desta sessão será perdido.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={(e) => {
                                    handleSaveRevisao(e, true);
                                    setShowExitConfirm(false);
                                }}
                                className="w-full py-3.5 bg-dark-gray text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg"
                            >
                                Salvar Rascunho e Sair
                            </button>
                            <button
                                onClick={() => handleExitMesa(true)}
                                className="w-full py-3.5 bg-gray-50 text-gray-500 font-bold rounded-xl hover:bg-gray-100 hover:text-dark-gray transition-all text-sm"
                            >
                                Sair sem salvar
                            </button>
                            <button
                                onClick={() => setShowExitConfirm(false)}
                                className="w-full py-3.5 text-gray-500 font-bold hover:text-dark-gray transition-all text-xs"
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

