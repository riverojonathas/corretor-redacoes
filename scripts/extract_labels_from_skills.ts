/**
 * extract_labels_from_skills.ts
 *
 * Extract potential labels (group/class codes) from assessed_skills mapping.
 */

import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

const assignedIds = [
  '86145579', '86146814', '86147892', '86149102', '86150805',
  '86151170', '86151813', '86142132', '86142588', '86143006', '86143422'
];

async function main() {
    console.log('🔍 Extraindo labels de assessed_skills para redações não atribuídas...');

    const { data: rows, error } = await supabase
        .from('redacoes')
        .select("task_id, assessed_skills, extra_fields->>redacao_ano_serie")
        .not('task_id', 'in', `(${assignedIds.join(',')})`);

    if (error) {
        console.error('❌ Erro:', error.message);
        return;
    }

    if (!rows || rows.length === 0) {
        console.log('✅ Nenhum task_id extra encontrado.');
        return;
    }

    const taskLabels = new Map<string, string>();

    rows.forEach(row => {
        if (!row.task_id || taskLabels.has(row.task_id)) return;

        const skills = row.assessed_skills as any[];
        if (!skills || !Array.isArray(skills)) return;

        // Tenta encontrar um código no statement (ex: 2EMP2, P1, P2)
        // Padrão comum: "Adequação ao tema 2EMP2" ou "Coerência P1"
        let label = '';
        for (const skill of skills) {
            const statement = skill.statement || '';
            // Regex para pegar códigos como 6EFP2, 1EMP2, P1, P2, etc.
            const match = statement.match(/([0-9]?[A-Z]{1,3}[0-9](?:VOAR)?|P[0-9])/i);
            if (match) {
                label = match[0].toUpperCase();
                break;
            }
        }

        if (!label) {
            // Fallback para o ano_serie se não achar código
            label = row.redacao_ano_serie || 'Sem Label';
        }

        // Adiciona o prefixo do ano "2026_" se for um código de turma (ex: 6EFP2)
        if (label.match(/^[0-9][A-Z]/)) {
            label = `2026_${label}`;
        }

        taskLabels.set(row.task_id, label);
    });

    const payload = Array.from(taskLabels.entries()).map(([tid, lbl]) => ({
        task_id: tid,
        label: lbl
    }));

    console.log(`\n📋 Mapeamento gerado para Proposta 1 (${payload.length} IDs):`);
    console.log(JSON.stringify(payload, null, 2));
}

main();
