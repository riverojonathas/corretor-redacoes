/**
 * manage_propostas.ts
 *
 * Script de terminal para gerenciar o mapeamento de Task IDs → Número de Proposta.
 *
 * Uso:
 *   npx tsx scripts/manage_propostas.ts list
 *   npx tsx scripts/manage_propostas.ts create --numero 1 --descricao "Turmas regulares 2026"
 *   npx tsx scripts/manage_propostas.ts add --proposta 1 --task-id 86145579 --label "2026_6EFP2"
 *   npx tsx scripts/manage_propostas.ts remove --task-id 86145579
 *   npx tsx scripts/manage_propostas.ts delete --proposta 1
 *   npx tsx scripts/manage_propostas.ts bulk --proposta 1 --pairs '[{"task_id":"86145579","label":"2026_6EFP2"}]'
 */

import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Credenciais Supabase não encontradas em .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Helpers de CLI ─────────────────────────────────────────────────────────

function getArg(name: string): string | undefined {
    const idx = process.argv.indexOf(`--${name}`);
    return idx !== -1 ? process.argv[idx + 1] : undefined;
}

function requireArg(name: string): string {
    const val = getArg(name);
    if (!val) {
        console.error(`❌ Argumento obrigatório ausente: --${name}`);
        process.exit(1);
    }
    return val;
}

// ─── Comandos ────────────────────────────────────────────────────────────────

/** Lista todas as propostas com seus task_ids e contagem de redações */
async function cmdList() {
    console.log('\n📋 Carregando propostas...\n');

    const { data: propostas, error: errP } = await supabase
        .from('propostas')
        .select('id, numero, descricao, created_at')
        .order('numero', { ascending: true });

    if (errP) { console.error('❌ Erro ao buscar propostas:', errP.message); process.exit(1); }
    if (!propostas || propostas.length === 0) {
        console.log('  Nenhuma proposta cadastrada ainda.\n  Use: npx tsx scripts/manage_propostas.ts create --numero 1 --descricao "..."');
        return;
    }

    for (const proposta of propostas) {
        // Busca task_ids vinculados
        const { data: taskIds, error: errT } = await supabase
            .from('proposta_task_ids')
            .select('task_id, turma_label')
            .eq('proposta_id', proposta.id)
            .order('turma_label', { ascending: true });

        if (errT) { console.error(`  ❌ Erro ao buscar task_ids da proposta ${proposta.numero}:`, errT.message); continue; }

        // Contagem de redações por task_id
        const taskIdsStr = (taskIds || []).map(t => t.task_id);

        let totalRedacoes = 0;
        const taskRows: { task_id: string; label: string; count: number }[] = [];

        for (const t of taskIds || []) {
            const { count } = await supabase
                .from('redacoes')
                .select('id', { count: 'exact', head: true })
                .eq('task_id', t.task_id);
            const c = count ?? 0;
            totalRedacoes += c;
            taskRows.push({ task_id: t.task_id, label: t.turma_label || '-', count: c });
        }

        const headerLine = `🟦 Proposta ${proposta.numero} — "${proposta.descricao || 'Sem descrição'}"`;
        const totalLine = `   Total de redações: ${totalRedacoes}`;
        console.log(headerLine);
        console.log(totalLine);

        if (taskRows.length === 0) {
            console.log('   Sem task_ids vinculados.');
        } else {
            for (const row of taskRows) {
                console.log(`   • task_id: ${row.task_id.padEnd(12)} label: ${row.label.padEnd(20)} redações: ${row.count}`);
            }
        }
        console.log();
    }
}

/** Cria uma nova proposta */
async function cmdCreate() {
    const numero = parseInt(requireArg('numero'), 10);
    const descricao = getArg('descricao') || '';

    if (isNaN(numero)) {
        console.error('❌ --numero deve ser um inteiro válido.');
        process.exit(1);
    }

    const { error } = await supabase.from('propostas').insert({ numero, descricao });

    if (error) {
        if (error.code === '23505') {
            console.error(`❌ Já existe uma Proposta ${numero}. Use outro número.`);
        } else {
            console.error('❌ Erro ao criar proposta:', error.message);
        }
        process.exit(1);
    }

    console.log(`✅ Proposta ${numero} criada com sucesso!${descricao ? ` Descrição: "${descricao}"` : ''}`);
}

/** Adiciona um task_id a uma proposta */
async function cmdAdd() {
    const numeroStr = requireArg('proposta');
    const taskId = requireArg('task-id');
    const turmaLabel = getArg('label') || '';

    const numero = parseInt(numeroStr, 10);
    if (isNaN(numero)) {
        console.error('❌ --proposta deve ser o número inteiro da proposta.');
        process.exit(1);
    }

    // Resolve o id da proposta a partir do número
    const { data: proposta, error: errP } = await supabase
        .from('propostas')
        .select('id, descricao')
        .eq('numero', numero)
        .single();

    if (errP || !proposta) {
        console.error(`❌ Proposta ${numero} não encontrada. Crie-a primeiro com o comando 'create'.`);
        process.exit(1);
    }

    const { error } = await supabase.from('proposta_task_ids').insert({
        proposta_id: proposta.id,
        task_id: taskId,
        turma_label: turmaLabel || null,
    });

    if (error) {
        if (error.code === '23505') {
            console.error(`❌ O task_id ${taskId} já está vinculado a outra proposta. Use 'remove' antes de reatribuir.`);
        } else {
            console.error('❌ Erro ao adicionar task_id:', error.message);
        }
        process.exit(1);
    }

    // Conta redações desse task_id para dar feedback
    const { count } = await supabase
        .from('redacoes')
        .select('id', { count: 'exact', head: true })
        .eq('task_id', taskId);

    console.log(`✅ task_id ${taskId}${turmaLabel ? ` (${turmaLabel})` : ''} vinculado à Proposta ${numero} — "${proposta.descricao}"`);
    console.log(`   Redações encontradas com esse task_id: ${count ?? 0}`);
}

/** Remove um task_id de sua proposta (sem apagar a proposta) */
async function cmdRemove() {
    const taskId = requireArg('task-id');

    // Busca para mostrar feedback antes de remover
    const { data: existing, error: errF } = await supabase
        .from('proposta_task_ids')
        .select('id, turma_label, propostas(numero, descricao)')
        .eq('task_id', taskId)
        .single();

    if (errF || !existing) {
        console.error(`❌ task_id ${taskId} não encontrado em nenhuma proposta.`);
        process.exit(1);
    }

    const { error } = await supabase
        .from('proposta_task_ids')
        .delete()
        .eq('task_id', taskId);

    if (error) {
        console.error('❌ Erro ao remover task_id:', error.message);
        process.exit(1);
    }

    const proposta = (existing as any).propostas;
    console.log(`✅ task_id ${taskId}${existing.turma_label ? ` (${existing.turma_label})` : ''} removido da Proposta ${proposta?.numero} — "${proposta?.descricao}"`);
    console.log('   Operação reversível: use o comando "add" para reatribuir.');
}

/** Deleta uma proposta inteira (e seus task_ids via CASCADE) */
async function cmdDelete() {
    const numeroStr = requireArg('proposta');
    const numero = parseInt(numeroStr, 10);

    const { data: proposta, error: errP } = await supabase
        .from('propostas')
        .select('id, descricao')
        .eq('numero', numero)
        .single();

    if (errP || !proposta) {
        console.error(`❌ Proposta ${numero} não encontrada.`);
        process.exit(1);
    }

    const { count: taskCount } = await supabase
        .from('proposta_task_ids')
        .select('id', { count: 'exact', head: true })
        .eq('proposta_id', proposta.id);

    const { error } = await supabase
        .from('propostas')
        .delete()
        .eq('id', proposta.id);

    if (error) {
        console.error('❌ Erro ao deletar proposta:', error.message);
        process.exit(1);
    }

    console.log(`✅ Proposta ${numero} ("${proposta.descricao}") deletada. ${taskCount ?? 0} task_id(s) removidos junto (CASCADE).`);
}

/** Importa múltiplos task_ids para uma proposta via JSON inline */
async function cmdBulk() {
    const numeroStr = requireArg('proposta');
    const pairsStr = requireArg('pairs');
    const numero = parseInt(numeroStr, 10);

    let pairs: { task_id: string; label?: string }[];
    try {
        pairs = JSON.parse(pairsStr);
        if (!Array.isArray(pairs)) throw new Error('pairs deve ser um array JSON');
    } catch (e: any) {
        console.error('❌ --pairs deve ser um array JSON válido. Ex: \'[{"task_id":"123","label":"2026_6EFP2"}]\'');
        process.exit(1);
    }

    const { data: proposta, error: errP } = await supabase
        .from('propostas')
        .select('id, descricao')
        .eq('numero', numero)
        .single();

    if (errP || !proposta) {
        console.error(`❌ Proposta ${numero} não encontrada. Crie-a primeiro com o comando 'create'.`);
        process.exit(1);
    }

    const rows = pairs.map(p => ({
        proposta_id: proposta.id,
        task_id: String(p.task_id),
        turma_label: p.label || null,
    }));

    const { error } = await supabase
        .from('proposta_task_ids')
        .upsert(rows, { onConflict: 'task_id' });

    if (error) {
        console.error('❌ Erro no bulk insert:', error.message);
        process.exit(1);
    }

    console.log(`✅ ${rows.length} task_id(s) vinculados à Proposta ${numero} — "${proposta.descricao}"`);
    for (const r of rows) {
        const { count } = await supabase
            .from('redacoes')
            .select('id', { count: 'exact', head: true })
            .eq('task_id', r.task_id);
        console.log(`   • ${r.task_id.padEnd(12)} ${(r.turma_label || '-').padEnd(20)} → ${count ?? 0} redações`);
    }
}

function showHelp() {
    console.log(`
📚 manage_propostas.ts — Gerenciador de Propostas por Task ID

COMANDOS:
  list                           Lista todas as propostas, task_ids e contagem de redações
  create --numero N [--descricao "..."]
                                 Cria uma nova proposta com número N
  add --proposta N --task-id ID [--label "TURMA"]
                                 Adiciona um task_id à proposta N
  remove --task-id ID            Remove um task_id de sua proposta (reversível)
  delete --proposta N            Deleta a proposta N e todos os seus task_ids
  bulk --proposta N --pairs '[{"task_id":"ID","label":"TURMA"}]'
                                 Importa múltiplos task_ids de uma vez (JSON inline)

EXEMPLOS:
  npx tsx scripts/manage_propostas.ts list
  npx tsx scripts/manage_propostas.ts create --numero 1 --descricao "Turmas regulares 2026"
  npx tsx scripts/manage_propostas.ts add --proposta 1 --task-id 86145579 --label "2026_6EFP2"
  npx tsx scripts/manage_propostas.ts remove --task-id 86145579
  npx tsx scripts/manage_propostas.ts bulk --proposta 1 \\
    --pairs '[{"task_id":"86145579","label":"2026_6EFP2"},{"task_id":"86146814","label":"2026_7EFP2"}]'
`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

const command = process.argv[2];

(async () => {
    switch (command) {
        case 'list':   await cmdList();   break;
        case 'create': await cmdCreate(); break;
        case 'add':    await cmdAdd();    break;
        case 'remove': await cmdRemove(); break;
        case 'delete': await cmdDelete(); break;
        case 'bulk':   await cmdBulk();   break;
        default:
            showHelp();
            break;
    }
})();
