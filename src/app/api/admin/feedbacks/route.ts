import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const getAdminSupabase = () => {
    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
};

// GET: Puxar todos os feedbacks com os perfis atrelados (joins)
export async function GET(req: NextRequest) {
    try {
        const supabaseAdmin = getAdminSupabase();

        // Fazemos um JOIN com a tabela perfis para pegar o Nome e Cargo de quem enviou
        const { data, error } = await supabaseAdmin
            .from('feedbacks')
            .select(`
                *,
                perfis (
                    nome,
                    email,
                    avatar_url,
                    cargo
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ feedbacks: data || [] });
    } catch (error: any) {
        console.error('Erro ao buscar feedbacks:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: Atualizar o status de um feedback
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Faltam dados (id, status).' }, { status: 400 });
        }

        const supabaseAdmin = getAdminSupabase();
        const { error } = await supabaseAdmin
            .from('feedbacks')
            .update({ status })
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: 'Status atualizado com sucesso.' });
    } catch (error: any) {
        console.error('Erro ao atualizar feedback:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
