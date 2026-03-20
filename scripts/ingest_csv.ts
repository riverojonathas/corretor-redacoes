import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or ANON_KEY if RLS allows)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Use command line argument if provided, otherwise fallback to the default file
const csvFilename = process.argv[2] || 'feature139407_090320206 - Sheet1.csv';
const CSV_FILE_PATH = path.resolve(process.cwd(), csvFilename);

interface RawCsvRow {
    internal_id?: string;
    external_id?: string;
    task_id?: string;
    question_id?: string;
    answer_id?: string;
    nick?: string;
    title?: string;
    essay?: string;
    genre?: string;
    ConsumerInit?: string;
    ConsumerFinish?: string;
    createdAt?: string;
    updatedAt?: string;
    'extra_fields.redacao_tema'?: string;
    'extra_fields.redacao_ano_serie'?: string;
    'extra_fields.cd_tipo_ensino'?: string;
    'extra_fields.nm_tipo_ensino'?: string;
    [key: string]: any; // Allow dynamic skills
}

function parseNota(notaStr?: string): number {
    if (!notaStr) return 0;
    // Convert "7,5" to 7.5
    const normalized = notaStr.replace(',', '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? 0 : num;
}

/** Tenta fazer JSON.parse de uma string, retorna null se falhar. */
function tryParseJson(value?: string): any | null {
    if (!value || typeof value !== 'string') return null;
    try {
        const parsed = JSON.parse(value);
        return (typeof parsed === 'object') ? parsed : null;
    } catch {
        return null;
    }
}

async function ingestCsv() {
    console.log(`Reading CSV file from: ${CSV_FILE_PATH}`);

    if (!fs.existsSync(CSV_FILE_PATH)) {
        console.error("CSV file not found!");
        process.exit(1);
    }

    // Lê o arquivo como buffer para preservar quebras de linha internas nos campos JSON
    const fileContent = fs.readFileSync(CSV_FILE_PATH, 'utf8');


    Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: 'greedy',
        newline: '\n',
        complete: async (results) => {
            const data = results.data as RawCsvRow[];
            const importBatch = `terminal-import-${new Date().toISOString()}`;
            console.log(`Parsed ${data.length} rows. Preparing payload...`);
            console.log(`Lote identificador gerado: ${importBatch}`);

            // Detecta formato: verifica se a primeira linha tem colunas JSON consolidadas
            const firstRow = data[0] || {};
            const isConsolidatedFormat = !!(
                tryParseJson(firstRow['evaluated_skills']) ||
                tryParseJson(firstRow['extra_fields'])
            );
            console.log(`Formato detectado: ${isConsolidatedFormat ? 'JSON Consolidado' : 'Colunas Achatadas (legado)'}`);

            const payload = data.map((row) => {
                // ── evaluated_skills ──
                let evaluated_skills: any[];
                const parsedEs = tryParseJson(row['evaluated_skills']);
                if (parsedEs && Array.isArray(parsedEs)) {
                    evaluated_skills = parsedEs;
                } else {
                    // Formato legado: colunas achatadas
                    evaluated_skills = [];
                    for (let i = 0; i < 5; i++) {
                        evaluated_skills.push({
                            score: parseNota(row[`evaluated_skills[${i}].score`]),
                            comment: row[`evaluated_skills[${i}].comment`] || '',
                            statement: row[`evaluated_skills[${i}].statement`] || ''
                        });
                    }
                }

                // ── assessed_skills ──
                let assessed_skills: any[];
                const parsedAs = tryParseJson(row['assessed_skills']);
                if (parsedAs && Array.isArray(parsedAs)) {
                    assessed_skills = parsedAs;
                } else {
                    // Formato legado: colunas achatadas
                    assessed_skills = [];
                    for (let i = 0; i < 5; i++) {
                        if (row[`assessed_skills[${i}].statement`] || row[`assessed_skills[${i}].description`]) {
                            assessed_skills.push({
                                statement: row[`assessed_skills[${i}].statement`] || '',
                                description: row[`assessed_skills[${i}].description`] || ''
                            });
                        }
                    }
                }

                // ── extra_fields ──
                let extra_fields: Record<string, any>;
                const parsedEf = tryParseJson(row['extra_fields']);
                if (parsedEf && typeof parsedEf === 'object' && !Array.isArray(parsedEf)) {
                    extra_fields = parsedEf;
                } else {
                    // Formato legado: colunas achatadas
                    extra_fields = {
                        redacao_tema: row['extra_fields.redacao_tema'] || '',
                        redacao_ano_serie: row['extra_fields.redacao_ano_serie'] || '',
                        redacao_zerada: row['extra_fields.redacao_zerada'] || '',
                        cd_tipo_ensino: row['extra_fields.cd_tipo_ensino'] || '',
                        nm_tipo_ensino: row['extra_fields.nm_tipo_ensino'] || ''
                    };
                }

                // Absorve tipo_turma no extra_fields, se presente
                if (row['tipo_turma']) {
                    extra_fields.tipo_turma = row['tipo_turma'];
                }

                // Adiciona o identificador do lote para reversão fácil
                extra_fields.import_batch = importBatch;

                return {
                    internal_id: row.internal_id,
                    external_id: row.external_id,
                    task_id: row.task_id,
                    question_id: row.question_id,
                    answer_id: row.answer_id,
                    nick: row.nick,
                    title: row.title,
                    essay: row.essay,
                    genre: row.genre,
                    statement: row.statement || (evaluated_skills[0]?.statement) || '',
                    support_text: row.support_text || '',
                    consumer_init: row.ConsumerInit ? new Date(row.ConsumerInit).toISOString() : null,
                    consumer_finish: row.ConsumerFinish ? new Date(row.ConsumerFinish).toISOString() : null,
                    created_at: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
                    updated_at: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
                    evaluated_skills,
                    assessed_skills,
                    extra_fields
                };
            });

            console.log(`Ready to insert ${payload.length} rows into 'redacoes' table.`);

            // Deduplica por answer_id (mantém o último em caso de duplicata no CSV)
            const seen = new Map<string, typeof payload[0]>();
            let dupCount = 0;
            for (const row of payload) {
                const key = row.answer_id || '';
                if (key && seen.has(key)) dupCount++;
                seen.set(key, row);
            }
            const deduped = Array.from(seen.values());
            if (dupCount > 0) {
                console.warn(`⚠️  ${dupCount} duplicatas por answer_id encontradas no CSV e ignoradas.`);
            }
            console.log(`Inserindo ${deduped.length} linhas únicas...`);

            // Batch insert logic (Supabase limits to ~1000 per request)
            const BATCH_SIZE = 100;
            let insertedCount = 0;
            let errorCount = 0;

            for (let i = 0; i < deduped.length; i += BATCH_SIZE) {
                const batch = deduped.slice(i, i + BATCH_SIZE);
                console.log(`Inserting batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(deduped.length / BATCH_SIZE)}...`);

                const { error } = await supabase.from('redacoes').upsert(batch, { onConflict: 'answer_id' });

                if (error) {
                    console.error(`Error inserting batch:`, error);
                    errorCount++;
                } else {
                    insertedCount += batch.length;
                }
            }

            console.log(`Done! Inserted/Updated: ${insertedCount}. Errors: ${errorCount}.`);
        },
        error: (err: any) => {
            console.error("Error parsing CSV:", err);
        }
    });
}

ingestCsv();
