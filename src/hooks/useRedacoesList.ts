import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { RedacaoListItem } from '@/types/dashboard';

const PAGE_SIZE = 50;

export type FilterStatus = 'todas' | 'pendente' | 'rascunho' | 'concluida';

export interface ListFilters {
    busca: string;
    serie: string;
    favorita: boolean;
    status: FilterStatus;
    proposta_id: string; // 'todas' ou UUID
}

const INITIAL_FILTERS: ListFilters = { busca: '', serie: '', favorita: false, status: 'pendente', proposta_id: 'todas' };

export function useRedacoesList(userId: string | undefined, shouldFetch: boolean = true) {
    const [lista, setLista] = useState<RedacaoListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(0);
    const [filters, setFilters] = useState<ListFilters>(INITIAL_FILTERS);
    const [debouncedFilters, setDebouncedFilters] = useState<ListFilters>(INITIAL_FILTERS);

    // ── Debounce 300ms nos filtros de texto ─────────────────
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => setDebouncedFilters(filters), 300);
        return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
    }, [filters]);

    // ── Reset page quando os filtros mudam ─────────────────
    useEffect(() => {
        setPage(0);
        setLista([]);
    }, [debouncedFilters]);

    // ── Fetch com filtros server-side e paginação ──────────
    const fetchLista = useCallback(async (currentPage: number, append = false) => {
        if (!userId || !shouldFetch) return;
        setLoading(true);
        try {
            const selectString = 'id, title, nick, extra_fields, answer_id, created_at, locked_by, locked_at, task_id, proposta_label, proposta_numero, proposta_id, status, favorita, revisao_id';
            
            let query = supabase
                .from('fila_revisao_view')
                .select(selectString)
                .order('created_at', { ascending: false })
                .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

            // Filtro por status real no Banco!
            if (debouncedFilters.status !== 'todas') {
                query = query.eq('status', debouncedFilters.status);
            }

            // Filtro por favoritas nativo no Banco
            if (debouncedFilters.favorita) {
                query = query.eq('favorita', true);
            }

            // Filtros server-side via .ilike()
            if (debouncedFilters.busca.trim()) {
                query = query.or(
                    `title.ilike.%${debouncedFilters.busca}%,extra_fields->>redacao_tema.ilike.%${debouncedFilters.busca}%,nick.ilike.%${debouncedFilters.busca}%`
                );
            }
            if (debouncedFilters.serie.trim()) {
                query = query.ilike('extra_fields->>redacao_ano_serie', `%${debouncedFilters.serie}%`);
            }

            // Filtro por Proposta (via VIEW)
            if (debouncedFilters.proposta_id !== 'todas') {
                query = query.eq('proposta_id', debouncedFilters.proposta_id);
            }

            const { data: redacoes, error } = await query;
            if (error) throw error;

            if (redacoes) {
                const formatadas: RedacaoListItem[] = redacoes.map((r: any) => {
                    const extras = r.extra_fields || {};
                    // Verifica se o lock ainda é válido (TTL 30min)
                    const LOCK_TTL_MS = 30 * 60 * 1000;
                    const isLocked = r.locked_by &&
                        r.locked_at &&
                        (new Date(r.locked_at).getTime() + LOCK_TTL_MS) > Date.now();
                    return {
                        id: r.id,
                        titulo: r.title || 'Sem Título',
                        nick: r.nick || '',
                        nr_serie: extras.redacao_ano_serie || '',
                        titulo_modelo: extras.redacao_tema || '',
                        nm_tipo_ensino: extras.nm_tipo_ensino || '',
                        answer_id: r.answer_id,
                        status: r.status || 'pendente',
                        revisao_id: r.revisao_id,
                        favorita: r.favorita || false,
                        isLocked: !!isLocked && r.locked_by !== userId,
                        proposta_numero: r.proposta_numero,
                        proposta_label: r.proposta_label,
                        created_at: r.created_at,
                    };
                });

                // Filtragem client-side para assegurar Unicidade total pelo ID da Redação
                // Em caso de Redações espelhadas em múltiplas turmas/propostas, será mostrada só a principal.
                const dedupMap = new Map<string, RedacaoListItem>();
                formatadas.forEach(f => {
                    if (!dedupMap.has(f.id)) {
                        dedupMap.set(f.id, f);
                    }
                });
                const formatadasUnicas = Array.from(dedupMap.values());

                setHasMore(redacoes.length === PAGE_SIZE);
                setLista(prev => {
                    if (append) {
                        const prevIds = new Set(prev.map(p => p.id));
                        const absolutelyNew = formatadasUnicas.filter(f => !prevIds.has(f.id));
                        return [...prev, ...absolutelyNew];
                    }
                    return formatadasUnicas;
                });
            }
        } catch (err: any) {
            console.error('Erro ao buscar lista:', err?.message || err);
        } finally {
            setLoading(false);
        }
    }, [userId, debouncedFilters, shouldFetch]);

    useEffect(() => {
        if (userId && shouldFetch) fetchLista(0, false);
    }, [fetchLista, userId, shouldFetch]);

    const loadMore = useCallback(() => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchLista(nextPage, true);
    }, [page, fetchLista]);

    return {
        lista,
        loading,
        hasMore,
        filters,
        setFilters,
        loadMore,
    };
}
