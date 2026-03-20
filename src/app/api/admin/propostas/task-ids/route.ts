import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** POST /api/admin/propostas/task-ids — adiciona task_id(s) a uma proposta */
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { proposta_id, task_id, turma_label } = body;

    if (!proposta_id || !task_id) {
        return NextResponse.json({ error: 'proposta_id e task_id são obrigatórios.' }, { status: 400 });
    }

    // Suporta inserção de múltiplos (array) ou único
    const rows = Array.isArray(task_id)
        ? task_id.map((tid: string, i: number) => ({
            proposta_id,
            task_id: String(tid),
            turma_label: Array.isArray(turma_label) ? (turma_label[i] || null) : (turma_label || null),
        }))
        : [{ proposta_id, task_id: String(task_id), turma_label: turma_label || null }];

    const { data, error } = await supabase
        .from('proposta_task_ids')
        .upsert(rows, { onConflict: 'task_id' })
        .select();

    if (error) {
        if (error.code === '23505') {
            return NextResponse.json(
                { error: 'Um ou mais task_ids já estão vinculados a outra proposta.' },
                { status: 409 }
            );
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}

/** DELETE /api/admin/propostas/task-ids — remove um task_id de sua proposta */
export async function DELETE(req: NextRequest) {
    const body = await req.json();
    const { task_id } = body;

    if (!task_id) {
        return NextResponse.json({ error: 'task_id é obrigatório.' }, { status: 400 });
    }

    const { error } = await supabase
        .from('proposta_task_ids')
        .delete()
        .eq('task_id', String(task_id));

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

/** GET /api/admin/propostas/task-ids/counts — retorna contagem de redações por task_id */
export async function GET() {
    // Busca todos os task_ids mapeados
    const { data: taskIds, error } = await supabase
        .from('proposta_task_ids')
        .select('task_id, proposta_id');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Agrega contagens usando a view pré-existente quando possível
    // Para cada task_id retorna quantas redações existem
    const results: Record<string, number> = {};

    // Batch: pega todas as contagens de uma vez com group by
    const taskIdList = (taskIds || []).map(t => t.task_id);

    if (taskIdList.length > 0) {
        // Faz uma query única buscando redações cujo task_id está na lista
        // e conta por task_id usando a função RPC se disponível, ou fallback inline
        const { data: countData, error: countError } = await supabase
            .from('redacoes')
            .select('task_id')
            .in('task_id', taskIdList);

        if (!countError && countData) {
            for (const row of countData) {
                results[row.task_id] = (results[row.task_id] || 0) + 1;
            }
        }
    }

    return NextResponse.json(results);
}
