# Guia de Ingestão de Dados (CSV)

Este documento centraliza as instruções sobre como importar novas levas de redações (arquivos CSV extraídos da base oficial) para dentro do sistema **Corretor de Redações**.

A partir de Março de 2026, a tabela `redacoes` no banco de dados passou por uma reestruturação para acomodar perfeitamente os cabeçalhos oficiais, abrigando campos mais flexíveis no formato `JSONB` e traduzindo chaves cruciais. 

Desta forma, todo o mapeamento e roteamento é automático. Existem duas vias possíveis para a carga de dados, dependendo do volume.

---

## 💻 1. Ingestão via Terminal (Recomendado para Grandes Lotes)

Para inserir dezenas de milhares de registros, onde o navegador fatalmente travaria por falta de memória, ou caso deseje automatizar uploads nas madrugadas, utilize o script em Node localizado em `scripts/ingest_csv.ts`.

Neste script não há restrição prática de peso de arquivo e ele processa disparando lotes de contenção de payload de 100 linhas por vez para o Supabase.

### Pré-requisitos
O script precisa ler as variáveis de conexão com o banco do arquivo raiz local do projeto chamado `.env.local`
Certifique-se de que nele conste:
```env
NEXT_PUBLIC_SUPABASE_URL="sua_url_supabase"
SUPABASE_SERVICE_ROLE_KEY="sua_service_role"
```

### Como Executar
Basta informar ao script onde está o arquivo CSV na sua máquina (podendo estar na própria raiz do projeto). O terminal se encarrega de parsear as avaliações no modelo dinâmico e empacotar metadados em `extra_fields`.

1. Arraste a nova planilha CSV para a pasta raiz do projeto.
2. Abra o terminal na raiz do projeto e rode:
```bash
npx tsx scripts/ingest_csv.ts nomedo_arquivo.csv
```
3. Acompanhe o log das dezenas de lotes sendo computadas até as estatísticas finais na tela. 

*(Nota: Se você rodar apenas o comando com `npx ts-node scripts/ingest_csv.ts` sem informar o nome extra no final, por precaução, ele tentará usar um arquivo default de fallback `feature139407_090320206 - Sheet1.csv`.)*


---


## 🌐 2. Ingestão via Painel Web (Recomendado para Rotinas de Equipes)

A forma recomendada para lideranças, administradores não-técnicos ou levas cotidianas menores (arquivos até ~20 MB ou aproximadamente 10.000 redações). O fluxo de parseamento, conversão de vírgulas nas notas e batching são realizados de forma nativa pela Engine Web Browser.

### Como Executar
1. Certifique-se de que a conta logada no site possui a função de Administrador (`cargo === 'admin'`).
2. Acesse no Sidebar: **Upload de Textos** (Rota: `/admin/upload`).
3. Clique ou arraste sua planilha para a caixa visível pontilhada no centro da tela.
4. O sistema irá automaticamente ler as colunas de IA (como `evaluated_skills[1].score` e `extra_fields.redacao_tema`), formatá-las em blocos `JSONB` nativos e despachá-las ao servidor Supabase até dar a mensagen de _Upload Concluído_.

---

## 📌 Formato Compatível do CSV

O sistema e os scripts buscarão (mas sem quebrar caso não achem) os seguintes nomes exatos na primeira linha do CSV:

| Coluna | Comportamento na Conversão JSON | Descrição |
|--|--|--|
| `internal_id` / `id_redacao` | Direta | ID originário legados. |
| `task_id` / `answer_id` / `question_id` | Direta | IDs de tarefas de plataformas. |
| `nick` | Direta | Apelido do aluno avaliado. |
| `title` / `titulo` | Direta | Nome do Documento. |
| `essay` / `texto` | Direta | O corpo de texto bruto. |
| `genre` / `statement` | Direta | Metadados do tema de ensino. |
| **`evaluated_skills[0 a 4].score`** | -> `evaluated_skills JSON` | Notas (ex: "7,5") extraídas e convertidas em numérico. |
| **`evaluated_skills[0 a 4].comment`** | -> `evaluated_skills JSON` | Devolutiva e análise textual da IA para aquele critério. |
| **`extra_fields.redacao_ano_serie`** | -> `extra_fields JSON` | O ano do aluno transferido para o container dinâmico. |

(Quaisquer outras colunas geradas no prefixo `extra_fields.*` não cadastradas poderão ser salvas nos containers JSON sem destruir a arquitetura do Supabase).

---

## 📦 3. Formato Consolidado (Novo — Março 2026)

A partir de novas extrações da base oficial, o CSV pode conter as colunas `evaluated_skills`, `assessed_skills` e `extra_fields` como **strings JSON diretas** em vez de colunas achatadas. O sistema detecta o formato automaticamente.

> [!TIP]
> Não é necessário nenhuma intervenção manual. Ambos os formatos (achatado e consolidado) são aceitos pelo script de terminal e pelo painel web.

### Diferença entre os formatos

| Formato | Exemplo de cabeçalho |
|--|--|
| **Achatado (legado)** | `evaluated_skills[0].score`, `evaluated_skills[0].comment`, `extra_fields.redacao_tema`, ... |
| **Consolidado (novo)** | `evaluated_skills`, `assessed_skills`, `extra_fields` (cada coluna contém uma string JSON) |

### Estrutura esperada do JSON consolidado

**`evaluated_skills`** — Array com 5 objetos:
```json
[{"skill_id": "...", "score": 7.5, "comment": "..."}]
```

**`assessed_skills`** — Array com 5 objetos:
```json
[{"skill_id": "...", "statement": "...", "description": "..."}]
```

**`extra_fields`** — Objeto com metadados:
```json
{"redacao_tema": "...", "redacao_ano_serie": "1ª série EM", "redacao_zerada": "..."}
```

### Coluna `tipo_turma`

CSVs novos podem incluir a coluna `tipo_turma` (ex: `REGULAR`). Essa coluna é automaticamente absorvida dentro de `extra_fields.tipo_turma` durante a importação — não requer nenhuma alteração no banco de dados.

---

## 🛡️ 4. Prevenção de Duplicidade

Para garantir que a mesma redação nunca seja importada mais de uma vez, o sistema utiliza a coluna **`answer_id`** como chave de unicidade.

1. **No Banco de Dados**: Foi adicionada uma restrição `UNIQUE` na coluna `answer_id`.
2. **Na Importação**: Tanto o script de terminal quanto o painel web utilizam a operação de `upsert`. Isso significa que, se você importar uma redação cujo `answer_id` já existe, o sistema irá **atualizar** o registro existente com os dados novos em vez de criar uma duplicata.

---

## 🗑️ Como Reverter uma Importação (Undo)

Todas as importações salvam um identificador único dentro do campo `extra_fields->>'import_batch'`.

### 1. Descobrir o ID do lote
Fica registrado no log do terminal (como `Lote identificador gerado: terminal-import-...`) ou você pode listar os últimos lotes inseridos no banco:
```sql
SELECT DISTINCT extra_fields->>'import_batch' as lote, count(*) 
FROM redacoes 
GROUP BY 1 
ORDER BY lote DESC;
```

### 2. Deletar o lote
Substitua o valor abaixo pelo lote desejado:
```sql
DELETE FROM public.redacoes 
WHERE extra_fields->>'import_batch' = 'terminal-import-2026-03-19T00:58:30Z';
```


---

## 🏷️ 5. Gerenciamento de Propostas por Task ID

Após a ingestão dos dados, é possível classificar as redações por **número de proposta** associando os `task_id`s correspondentes. Esse mapeamento é feito via painel admin em **Configurações → Propostas** ou via terminal com o script `scripts/manage_propostas.ts`.

> [!IMPORTANT]
> As tabelas `propostas` e `proposta_task_ids` precisam ser criadas no Supabase antes de usar esse recurso. Consulte a **Seção 10** do `DATABASE_SCHEMA.md` para o SQL de migration.

### Pré-requisitos

As mesmas variáveis de ambiente do script de ingestão:
```env
NEXT_PUBLIC_SUPABASE_URL="sua_url_supabase"
SUPABASE_SERVICE_ROLE_KEY="sua_service_role"
```

### Comandos disponíveis

```bash
# Listar todas as propostas, task_ids vinculados e contagem de redações
npx tsx scripts/manage_propostas.ts list

# Criar uma nova proposta
npx tsx scripts/manage_propostas.ts create --numero 1 --descricao "Turmas regulares 2026"

# Vincular um task_id a uma proposta (com label opcional)
npx tsx scripts/manage_propostas.ts add --proposta 1 --task-id 86145579 --label "2026_6EFP2"

# Remover um task_id de sua proposta (reversível — não apaga a proposta)
npx tsx scripts/manage_propostas.ts remove --task-id 86145579

# Deletar uma proposta inteira e todos os seus task_ids
npx tsx scripts/manage_propostas.ts delete --proposta 1

# Importar múltiplos task_ids de uma vez (bulk)
npx tsx scripts/manage_propostas.ts bulk --proposta 1 \
  --pairs '[{"task_id":"86145579","label":"2026_6EFP2"},{"task_id":"86146814","label":"2026_7EFP2"}]'
```

### Exemplo prático — Turmas 2026

```bash
# Criar propostas
npx tsx scripts/manage_propostas.ts create --numero 1 --descricao "Turmas Regulares 2026"
npx tsx scripts/manage_propostas.ts create --numero 2 --descricao "Projeto Voar 2026"

# Importar task_ids das turmas regulares (bulk)
npx tsx scripts/manage_propostas.ts bulk --proposta 1 \
  --pairs '[
    {"task_id":"86145579","label":"2026_6EFP2"},
    {"task_id":"86146814","label":"2026_7EFP2"},
    {"task_id":"86147892","label":"2026_8EFP2"},
    {"task_id":"86149102","label":"2026_9EFP2"},
    {"task_id":"86150805","label":"2026_1EMP2"},
    {"task_id":"86151170","label":"2026_2EMP2"},
    {"task_id":"86151813","label":"2026_3EMP2"}
  ]'

# Importar task_ids do Projeto Voar (bulk)
npx tsx scripts/manage_propostas.ts bulk --proposta 2 \
  --pairs '[
    {"task_id":"86142132","label":"2026_6EFP2VOAR"},
    {"task_id":"86142588","label":"2026_7EFP2VOAR"},
    {"task_id":"86143006","label":"2026_8EFP2VOAR"},
    {"task_id":"86143422","label":"2026_9EFP2VOAR"}
  ]'

# Ver resultado com contagens de redações
npx tsx scripts/manage_propostas.ts list
```

### Reversibilidade

A operação `remove` desvincula o `task_id` sem deletar a proposta nem as redações. Para reatribuir um `task_id` a outra proposta, basta fazer `remove` e depois `add` novamente.


