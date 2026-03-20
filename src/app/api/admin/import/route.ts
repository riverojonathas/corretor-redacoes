import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Client com service_role — nunca expor no frontend!
function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error('Variáveis de ambiente do Supabase ausentes (SUPABASE_SERVICE_ROLE_KEY).');
    }

    return createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

export async function POST(request: NextRequest) {
    try {
        const { rows } = await request.json();

        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ error: 'Nenhuma linha para importar.' }, { status: 400 });
        }

        const supabaseAdmin = getAdminClient();

        const BATCH_SIZE = 100;
        let insertedCount = 0;

        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
            const batch = rows.slice(i, i + BATCH_SIZE);
            const { error } = await supabaseAdmin.from('redacoes').upsert(batch, { onConflict: 'answer_id' });

            if (error) {
                console.error(`Erro no lote ${i / BATCH_SIZE + 1}:`, error);
                return NextResponse.json(
                    { error: `Erro ao inserir lote ${i / BATCH_SIZE + 1}: ${error.message}` },
                    { status: 500 }
                );
            }

            insertedCount += batch.length;
        }

        return NextResponse.json({ success: true, insertedCount });
    } catch (err: any) {
        console.error('Erro geral na importação:', err);
        return NextResponse.json({ error: err.message || 'Erro interno.' }, { status: 500 });
    }
}
