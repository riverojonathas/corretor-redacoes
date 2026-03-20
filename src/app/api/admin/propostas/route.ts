import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** GET /api/admin/propostas — lista propostas com task_ids e contagem de redações */
export async function GET() {
    const { data, error } = await supabase
        .from('propostas')
        .select(`
            id,
            numero,
            descricao,
            created_at,
            proposta_task_ids (
                id,
                task_id,
                turma_label,
                created_at
            )
        `)
        .order('numero', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, {
        headers: {
            'Cache-Control': 'no-store',
        },
    });
}

/** POST /api/admin/propostas — cria nova proposta */
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { numero, descricao } = body;

    if (!numero || typeof numero !== 'number') {
        return NextResponse.json({ error: 'numero é obrigatório e deve ser um número inteiro.' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('propostas')
        .insert({ numero, descricao: descricao || null })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            return NextResponse.json({ error: `Já existe uma Proposta ${numero}.` }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}

/** DELETE /api/admin/propostas — deleta proposta e seus task_ids (CASCADE) */
export async function DELETE(req: NextRequest) {
    const body = await req.json();
    const { proposta_id } = body;

    if (!proposta_id) {
        return NextResponse.json({ error: 'proposta_id é obrigatório.' }, { status: 400 });
    }

    const { error } = await supabase
        .from('propostas')
        .delete()
        .eq('id', proposta_id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
