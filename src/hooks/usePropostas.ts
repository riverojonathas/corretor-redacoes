import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Proposta {
    id: string;
    numero: number;
    descricao: string;
}

export function usePropostas() {
    const [propostas, setPropostas] = useState<Proposta[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPropostas() {
            try {
                const { data, error } = await supabase
                    .from('propostas')
                    .select('id, numero, descricao')
                    .order('numero', { ascending: true });

                if (error) throw error;
                setPropostas(data || []);
            } catch (err) {
                console.error('Erro ao buscar propostas:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchPropostas();
    }, []);

    return { propostas, loading };
}
