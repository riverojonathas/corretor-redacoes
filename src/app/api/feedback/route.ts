import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const getAdminSupabase = () => {
    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, tipo, mensagem } = body;

        if (!userId || !tipo || !mensagem) {
            return NextResponse.json({ error: 'Dados incompletos (userId, tipo, mensagem).' }, { status: 400 });
        }

        const supabaseAdmin = getAdminSupabase();

        const { data, error } = await supabaseAdmin
            .from('feedbacks')
            .insert({
                user_id: userId,
                tipo: tipo,
                mensagem: mensagem,
                status: 'novo'
            })
            .select('*')
            .single();

        if (error) {
            console.error('Database Error:', error);
            throw error;
        }

        return NextResponse.json({ message: 'Feedback enviado com sucesso.', feedback: data }, { status: 201 });

    } catch (error: any) {
        console.error('Erro na criação do feedback (API):', error);
        return NextResponse.json({ error: error.message || 'Erro Desconhecido' }, { status: 500 });
    }
}

// GET — retorna todos os feedbacks do usuário autenticado
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId é obrigatório.' }, { status: 400 });
        }

        const supabaseAdmin = getAdminSupabase();

        const { data, error } = await supabaseAdmin
            .from('feedbacks')
            .select('id, tipo, mensagem, status, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ feedbacks: data ?? [] }, { status: 200 });

    } catch (error: any) {
        console.error('Erro ao buscar feedbacks (API):', error);
        return NextResponse.json({ error: error.message || 'Erro Desconhecido' }, { status: 500 });
    }
}
