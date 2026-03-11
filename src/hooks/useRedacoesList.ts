import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { RedacaoListItem } from '@/types/dashboard';

const PAGE_SIZE = 50;

export interface ListFilters {
    titulo: string;
    nick: string;
    serie: string;
    favorita: boolean;
}

const INITIAL_FILTERS: ListFilters = { titulo: '', nick: '', serie: '', favorita: false };

export function useRedacoesList(userId: string | undefined) {
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
        if (!userId) return;
        setLoading(true);
        try {
            let query = supabase
                .from('redacoes')
                .select('id, title, nick, extra_fields, answer_id, locked_by, locked_at, revisoes(id, corretor_id, favorita, status)')
                .order('created_at', { ascending: false })
                .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

            // Filtros server-side via .ilike()
            if (debouncedFilters.titulo.trim()) {
                query = query.or(
                    `title.ilike.%${debouncedFilters.titulo}%,extra_fields->>redacao_tema.ilike.%${debouncedFilters.titulo}%`
                );
            }
            if (debouncedFilters.nick.trim()) {
                query = query.ilike('nick', `%${debouncedFilters.nick}%`);
            }
            if (debouncedFilters.serie.trim()) {
                query = query.ilike('extra_fields->>redacao_ano_serie', `%${debouncedFilters.serie}%`);
            }

            const { data: redacoes, error } = await query;
            if (error) throw error;

            if (redacoes) {
                const formatadas: RedacaoListItem[] = redacoes.map((r: any) => {
                    const rev = r.revisoes?.find((rev: any) => rev.corretor_id === userId);
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
                        status: rev ? (rev.status || 'concluida') : 'pendente',
                        revisao_id: rev?.id,
                        favorita: rev?.favorita || false,
                        isLocked: !!isLocked && r.locked_by !== userId,
                    };
                });

                setHasMore(redacoes.length === PAGE_SIZE);
                setLista(prev => append ? [...prev, ...formatadas] : formatadas);
            }
        } catch (err) {
            console.error('Erro ao buscar lista:', err);
        } finally {
            setLoading(false);
        }
    }, [userId, debouncedFilters]);

    useEffect(() => {
        if (userId) fetchLista(0, false);
    }, [fetchLista, userId]);

    const loadMore = useCallback(() => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchLista(nextPage, true);
    }, [page, fetchLista]);

    // Filtro client-side apenas para "favorita" (boolean simples sobre dados já carregados)
    const listaFiltrada = debouncedFilters.favorita
        ? lista.filter(r => r.favorita === true)
        : lista;

    return {
        lista: listaFiltrada,
        loading,
        hasMore: hasMore && !debouncedFilters.favorita,
        filters,
        setFilters,
        loadMore,
    };
}
