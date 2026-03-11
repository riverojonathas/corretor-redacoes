import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const LOCK_TTL_MINUTES = 30;

const getAdminSupabase = () =>
    createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

// POST — adquirir lock em uma redação
export async function POST(req: NextRequest) {
    try {
        const { redacaoId, userId } = await req.json();
        if (!redacaoId || !userId) {
            return NextResponse.json({ error: 'redacaoId e userId são obrigatórios.' }, { status: 400 });
        }

        const supabase = getAdminSupabase();

        // Busca o estado atual do lock
        const { data: redacao, error: fetchError } = await supabase
            .from('redacoes')
            .select('locked_by, locked_at')
            .eq('id', redacaoId)
            .single();

        if (fetchError || !redacao) {
            return NextResponse.json({ error: 'Redação não encontrada.' }, { status: 404 });
        }

        const now = new Date();
        const ttlMs = LOCK_TTL_MINUTES * 60 * 1000;
        const lockExpired =
            !redacao.locked_at ||
            new Date(redacao.locked_at).getTime() + ttlMs < now.getTime();
        const lockedBySomeoneElse =
            redacao.locked_by && redacao.locked_by !== userId && !lockExpired;

        if (lockedBySomeoneElse) {
            return NextResponse.json(
                { success: false, locked: true, message: 'Redação sendo revisada por outro corretor.' },
                { status: 409 }
            );
        }

        // Adquirir (ou renovar) o lock
        const { error: updateError } = await supabase
            .from('redacoes')
            .update({ locked_by: userId, locked_at: now.toISOString() })
            .eq('id', redacaoId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error('Erro ao adquirir lock:', error);
        return NextResponse.json({ error: error.message || 'Erro desconhecido.' }, { status: 500 });
    }
}

// DELETE — liberar lock de uma redação
export async function DELETE(req: NextRequest) {
    try {
        const { redacaoId, userId } = await req.json();
        if (!redacaoId || !userId) {
            return NextResponse.json({ error: 'redacaoId e userId são obrigatórios.' }, { status: 400 });
        }

        const supabase = getAdminSupabase();

        // Só libera o lock se for o dono
        const { error } = await supabase
            .from('redacoes')
            .update({ locked_by: null, locked_at: null })
            .eq('id', redacaoId)
            .eq('locked_by', userId);

        if (error) throw error;

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error('Erro ao liberar lock:', error);
        return NextResponse.json({ error: error.message || 'Erro desconhecido.' }, { status: 500 });
    }
}
