# Database Schema - Supabase

Este documento contém a estrutura exata do banco de dados relacional no Supabase. Use este arquivo como referência para todas as queries, inserções e interfaces.

> [!IMPORTANT]
> Use sempre nomes de colunas em **minúsculas**.

> [!TIP]
> Os índices de performance documentados na **Seção 5** são obrigatórios para escalar o sistema. Execute o script SQL sempre que criar um novo ambiente (staging, produção).

## 1. Tabela `perfis`
*Tabela de Usuários/Corretores*

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key (Relacionado com `auth.users.id`) |
| `nome` | `text` | Nome completo do usuário |
| `email` | `text` | E-mail do usuário |
| `avatar_url` | `text` | URL da foto de perfil do usuário (armazenada no bucket 'avatars') |
| `cargo` | `text` | Cargo ou função (ex: corretor, admin, leitor) |
| `primeiro_acesso` | `boolean` | Flag para exibição do popup de boas-vindas (default: true) |
| `created_at` | `timestamptz` | Data de criação do perfil |

---

## 2. Tabela `redacoes`
*Tabela de Ingestão do CSV / Dados da IA*

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `internal_id` | `text` | ID da redação interno (`id_redacao` original) |
| `external_id` | `text` | ID externo |
| `task_id` | `text` | ID da tarefa |
| `question_id` | `text` | ID da questão |
| `answer_id` | `text` | ID da resposta (Único/Indispensável para evitar duplicidade) |
| `nick` | `text` | Apelido do aluno |
| `title` | `text` | Título da redação |
| `essay` | `text` | Texto integral da redação |
| `genre` | `text` | Gênero da redação |
| `statement` | `text` | Enunciado/Proposta da redação |
| `support_text` | `text` | Texto de apoio/coletânea |
| `consumer_init` | `timestamptz` | Início do consumo |
| `consumer_finish` | `timestamptz`| Fim do consumo |
| `evaluated_skills` | `jsonb` | Notas e comentários da IA (Array: {skill_id, score, comment, statement}) |
| `assessed_skills`  | `jsonb` | Habilidades avaliadas, descrições e instruções da IA (Array: {skill_id, statement, description}) |
| `extra_fields` | `jsonb` | Metadados extras (ex: `redacao_tema`, `redacao_ano_serie`, `redacao_zerada`, `tipo_turma`) |
| `created_at` | `timestamptz` | Data de ingestão / Data do registro base (`createdAt`) |
| `updated_at` | `timestamptz` | Data de atualização original (`updatedAt`) |
| `locked_by` | `uuid` | FK para `perfis.id` — corretor que está revisando (Fase D) |
| `locked_at` | `timestamptz` | Timestamp de quando o lock foi adquirido (Fase D) |

---

## 3. Tabela `revisoes`
*Tabela da Mesa do Corretor*

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `data_correcao` | `timestamptz` | Data da revisão manual |
| `redacao_id` | `uuid` | Foreign Key -> `redacoes.id` |
| `corretor_id` | `uuid` | Foreign Key -> `perfis.id` |
| `criterio_1_nota_atribuida` | `numeric` | Nota atribuída manualmente pelo corretor (0 a 10) |
| `criterio_1_tema_1` | `text` | Avaliação: Identificação de pontos positivos |
| `criterio_1_tema_2` | `text` | Avaliação: Identificação do problema |
| `criterio_1_tema_3` | `text` | Avaliação: Sugestão de melhoria |
| `criterio_1_tema_4` | `text` | Avaliação: Adequação da nota IA |
| `criterio_1_observacao` | `text` | Observação livre |
| `criterio_2_nota_atribuida` | `numeric` | Nota atribuída manualmente pelo corretor (0 a 10) |
| `criterio_2_tema_1` | `text` | Avaliação: Identificação de pontos positivos |
| `criterio_2_tema_2` | `text` | Avaliação: Identificação do problema |
| `criterio_2_tema_3` | `text` | Avaliação: Sugestão de melhoria |
| `criterio_2_tema_4` | `text` | Avaliação: Adequação da nota IA |
| `criterio_2_observacao` | `text` | Observação livre |
| `criterio_3_nota_atribuida` | `numeric` | Nota atribuída manualmente pelo corretor (0 a 10) |
| `criterio_3_tema_1` | `text` | Avaliação: Identificação de pontos positivos |
| `criterio_3_tema_2` | `text` | Avaliação: Identificação do problema |
| `criterio_3_tema_3` | `text` | Avaliação: Sugestão de melhoria |
| `criterio_3_tema_4` | `text` | Avaliação: Adequação da nota IA |
| `criterio_3_observacao` | `text` | Observação livre |
| `criterio_4_nota_atribuida` | `numeric` | Nota atribuída manualmente pelo corretor (0 a 10) |
| `criterio_4_tema_1` | `text` | Avaliação: Identificação de pontos positivos |
| `criterio_4_tema_2` | `text` | Avaliação: Identificação do problema |
| `criterio_4_tema_3` | `text` | Avaliação: Sugestão de melhoria |
| `criterio_4_tema_4` | `text` | Avaliação: Adequação da nota IA |
| `criterio_4_observacao` | `text` | Observação livre |
| `criterio_5_nota_atribuida` | `numeric` | Nota atribuída manualmente pelo corretor (0 a 10) |
| `criterio_5_tema_1` | `text` | Avaliação: Identificação de pontos positivos |
| `criterio_5_tema_2` | `text` | Avaliação: Identificação do problema |
| `criterio_5_tema_3` | `text` | Avaliação: Sugestão de melhoria |
| `criterio_5_tema_4` | `text` | Avaliação: Adequação da nota IA |
| `criterio_5_observacao` | `text` | Observação livre |
| `comentario_geral`| `text` | Comentário final do corretor humano |
| `favorita` | `boolean` | Indica se a correção foi favoritada pelo corretor |
| `suspeita_ia` | `boolean` | Indica se o corretor suspeita que a redação foi gerada por IA |
| `motivo_suspeita_ia` | `text` | Justificativa/motivos para a suspeita de uso de IA |
| `avaliacoes` | `jsonb` | Armazena as avaliações dinâmicas das competências (Array: {criterio_id, tema_1, tema_2, tema_3, tema_4, observacao}) |


### `revisao_destaques`
Armazena os trechos de texto destacados (marca-texto) durante a revisão, atrelados a um critério.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `revisao_id` | `uuid` | Foreign Key -> `revisoes.id` |
| `criterio_id` | `integer` | ID do critério (1 a 5) associado |
| `cor` | `text` | Cor do destaque (verde, amarelo, vermelho) |
| `start_index` | `integer` | Posição inicial no texto da redação |
| `end_index` | `integer` | Posição final no texto da redação |
| `texto_marcado`| `text` | Trecho de texto que foi destacado |
| `observacao` | `text` | Opcional, observação atrelada ao destaque |
| `created_at` | `timestamptz`| Data de criação |

---

## 4. Tabela `feedbacks`
*Tabela de Sugestões de Melhorias e Bugs reportados pelos usuários*

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `user_id` | `uuid` | Foreign Key -> `perfis.id` (Quem enviou) |
| `tipo` | `text` | 'bug' ou 'sugestao' |
| `mensagem` | `text` | O conteúdo do feedback |
| `status` | `text` | Status atual (novo, em_analise, resolvido) |
| `created_at` | `timestamptz` | Data do envio |

### Script SQL para criar a tabela
```sql
CREATE TABLE public.feedbacks (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    tipo text NOT NULL,
    mensagem text NOT NULL,
    status text NOT NULL DEFAULT 'novo'::text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT feedbacks_pkey PRIMARY KEY (id),
    CONSTRAINT feedbacks_user_id_fkey FOREIGN KEY (user_id) REFERENCES perfis(id) ON DELETE CASCADE
);

-- Habilitar RLS
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Políticas
-- Usuários podem inserir seus próprios feedbacks
CREATE POLICY "Users can insert own feedbacks" ON public.feedbacks FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Admins podem ler todos (assumindo que verificamos cargo no app, ou criando política)
CREATE POLICY "Admins read all feedbacks" ON public.feedbacks FOR SELECT USING (true); -- Simplificado
```

---

## 5. Índices de Performance
*Criados na Fase A do Plano de Performance — Março 2026*

> [!IMPORTANT]
> Execute este script no **SQL Editor do Supabase** sempre que recriar o banco ou provisionar um novo ambiente. Sem esses índices, queries críticas fazem **full-scan** na tabela.

### Por que cada índice importa

| Índice | Tabela | Coluna | Query beneficiada |
| :--- | :--- | :--- | :--- |
| `idx_redacoes_answer_id` | `redacoes` | `answer_id` | Busca de redação ao abrir a Mesa do Corretor |
| `idx_revisoes_corretor_id` | `revisoes` | `corretor_id` | Lista de revisões feitas por um corretor |
| `idx_revisoes_redacao_id` | `revisoes` | `redacao_id` | Verificação se já existe revisão para uma redação |
| `idx_feedbacks_user_id` | `feedbacks` | `user_id` | Busca de chamados do usuário em Configurações |
| `idx_redacoes_tema` | `redacoes` | `extra_fields->>'redacao_tema'` | Contagem de modelos únicos no Dashboard |

### Script SQL (Fase A)

```sql
-- Fase A: Índices de Performance
-- Executar no SQL Editor do Supabase

-- Índice: busca por answer_id (usado na Mesa do Corretor)
CREATE INDEX IF NOT EXISTS idx_redacoes_answer_id ON public.redacoes(answer_id);

-- Índice: revisões por corretor
CREATE INDEX IF NOT EXISTS idx_revisoes_corretor_id ON public.revisoes(corretor_id);

-- Índice: revisões por redação
CREATE INDEX IF NOT EXISTS idx_revisoes_redacao_id ON public.revisoes(redacao_id);

-- Índice: feedbacks por usuário
CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON public.feedbacks(user_id);

-- Índice: busca por tema dentro de extra_fields JSONB
CREATE INDEX IF NOT EXISTS idx_redacoes_tema ON public.redacoes((extra_fields->>'redacao_tema'));
```

### Verificar se os índices foram criados

```sql
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

---

## 6. Views de Performance
*Criadas na Fase B do Plano de Performance — Março 2026*

> [!IMPORTANT]
> As views abaixo **substituem o full-scan** de todas as redações que era feito no Dashboard. Execute o script sempre que recriar o banco. Sem elas, o Dashboard busca todos os dados brutos no cliente.

### `dashboard_stats`
Retorna os 4 agregados globais do Dashboard em uma única linha. Elimina a busca de todas as redações.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `total_redacoes` | `bigint` | Total de redações na base |
| `total_modelos` | `bigint` | Temas distintos em `extra_fields->>'redacao_tema'` |
| `total_revisoes` | `bigint` | Total de revisões feitas por corretores |
| `nota_media_geral` | `numeric` | Média da soma das 5 competências de cada redação |

### `dashboard_stats_por_serie`
Agrupa redações por série escolar e calcula a nota média de cada grupo.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `serie` | `text` | Série (de `extra_fields->>'redacao_ano_serie'`) ou `'Outros'` |
| `total` | `bigint` | Quantidade de redações na série |
| `nota_media` | `numeric` | Média da nota total nessa série |

### `dashboard_ai_eval_matrix_stats`
Consolida as avaliações dos corretores sobre todos os quesitos de todos os critérios da IA.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `criterio` | `text` | Qual o critério (C1, C2, C3, C4, C5) |
| `tema` | `text` | Qual o quesito analisado (tema_1_positivos, tema_2_problema, tema_3_melhoria, tema_4_nota) |
| `avaliacao` | `text` | O valor que foi respondido pelo humano (ex: Satisfatório, Adequada, Alucinação) |
| `total` | `bigint` | Contagem total de vezes que essa avaliação foi dada |

### Script SQL (Fase B)

```sql
-- ============================================================
-- FASE B: Views de Performance para o Dashboard
-- Executar no SQL Editor do Supabase
-- ============================================================

-- View 1: Estatísticas Globais
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT
    COUNT(*) AS total_redacoes,
    COUNT(DISTINCT extra_fields->>'redacao_tema') AS total_modelos,
    (SELECT COUNT(*) FROM public.revisoes) AS total_revisoes,
    ROUND(
        AVG(
            (
                SELECT COALESCE(SUM((skill->>'score')::numeric), 0)
                FROM jsonb_array_elements(
                    CASE jsonb_typeof(r.evaluated_skills)
                        WHEN 'array' THEN r.evaluated_skills
                        ELSE '[]'::jsonb
                    END
                ) AS skill
            )
        )
    ) AS nota_media_geral
FROM public.redacoes r
WHERE evaluated_skills IS NOT NULL
  AND jsonb_typeof(evaluated_skills) = 'array';

-- View 2: Médias por Série
CREATE OR REPLACE VIEW public.dashboard_stats_por_serie AS
SELECT
    COALESCE(TRIM(extra_fields->>'redacao_ano_serie'), 'Outros') AS serie,
    COUNT(*) AS total,
    ROUND(
        AVG(
            (
                SELECT COALESCE(SUM((skill->>'score')::numeric), 0)
                FROM jsonb_array_elements(
                    CASE jsonb_typeof(r.evaluated_skills)
                        WHEN 'array' THEN r.evaluated_skills
                        ELSE '[]'::jsonb
                    END
                ) AS skill
            )
        )
    ) AS nota_media
FROM public.redacoes r
WHERE evaluated_skills IS NOT NULL
  AND jsonb_typeof(evaluated_skills) = 'array'
GROUP BY COALESCE(TRIM(extra_fields->>'redacao_ano_serie'), 'Outros')
ORDER BY nota_media DESC;

-- View 3: Matriz Global de Avaliação da IA
CREATE OR REPLACE VIEW public.dashboard_ai_eval_matrix_stats AS
SELECT 'C1' as criterio, 'tema_1' as tema, criterio_1_tema_1 as avaliacao, COUNT(*) as total FROM public.revisoes WHERE criterio_1_tema_1 IS NOT NULL GROUP BY criterio_1_tema_1
UNION ALL SELECT 'C1', 'tema_2', criterio_1_tema_2, COUNT(*) FROM public.revisoes WHERE criterio_1_tema_2 IS NOT NULL GROUP BY criterio_1_tema_2
UNION ALL SELECT 'C1', 'tema_3', criterio_1_tema_3, COUNT(*) FROM public.revisoes WHERE criterio_1_tema_3 IS NOT NULL GROUP BY criterio_1_tema_3
UNION ALL SELECT 'C1', 'tema_4', criterio_1_tema_4, COUNT(*) FROM public.revisoes WHERE criterio_1_tema_4 IS NOT NULL GROUP BY criterio_1_tema_4
-- C2
UNION ALL SELECT 'C2', 'tema_1', criterio_2_tema_1, COUNT(*) FROM public.revisoes WHERE criterio_2_tema_1 IS NOT NULL GROUP BY criterio_2_tema_1
UNION ALL SELECT 'C2', 'tema_2', criterio_2_tema_2, COUNT(*) FROM public.revisoes WHERE criterio_2_tema_2 IS NOT NULL GROUP BY criterio_2_tema_2
UNION ALL SELECT 'C2', 'tema_3', criterio_2_tema_3, COUNT(*) FROM public.revisoes WHERE criterio_2_tema_3 IS NOT NULL GROUP BY criterio_2_tema_3
UNION ALL SELECT 'C2', 'tema_4', criterio_2_tema_4, COUNT(*) FROM public.revisoes WHERE criterio_2_tema_4 IS NOT NULL GROUP BY criterio_2_tema_4
-- C3
UNION ALL SELECT 'C3', 'tema_1', criterio_3_tema_1, COUNT(*) FROM public.revisoes WHERE criterio_3_tema_1 IS NOT NULL GROUP BY criterio_3_tema_1
UNION ALL SELECT 'C3', 'tema_2', criterio_3_tema_2, COUNT(*) FROM public.revisoes WHERE criterio_3_tema_2 IS NOT NULL GROUP BY criterio_3_tema_2
UNION ALL SELECT 'C3', 'tema_3', criterio_3_tema_3, COUNT(*) FROM public.revisoes WHERE criterio_3_tema_3 IS NOT NULL GROUP BY criterio_3_tema_3
UNION ALL SELECT 'C3', 'tema_4', criterio_3_tema_4, COUNT(*) FROM public.revisoes WHERE criterio_3_tema_4 IS NOT NULL GROUP BY criterio_3_tema_4
-- C4
UNION ALL SELECT 'C4', 'tema_1', criterio_4_tema_1, COUNT(*) FROM public.revisoes WHERE criterio_4_tema_1 IS NOT NULL GROUP BY criterio_4_tema_1
UNION ALL SELECT 'C4', 'tema_2', criterio_4_tema_2, COUNT(*) FROM public.revisoes WHERE criterio_4_tema_2 IS NOT NULL GROUP BY criterio_4_tema_2
UNION ALL SELECT 'C4', 'tema_3', criterio_4_tema_3, COUNT(*) FROM public.revisoes WHERE criterio_4_tema_3 IS NOT NULL GROUP BY criterio_4_tema_3
UNION ALL SELECT 'C4', 'tema_4', criterio_4_tema_4, COUNT(*) FROM public.revisoes WHERE criterio_4_tema_4 IS NOT NULL GROUP BY criterio_4_tema_4
-- C5
UNION ALL SELECT 'C5', 'tema_1', criterio_5_tema_1, COUNT(*) FROM public.revisoes WHERE criterio_5_tema_1 IS NOT NULL GROUP BY criterio_5_tema_1
UNION ALL SELECT 'C5', 'tema_2', criterio_5_tema_2, COUNT(*) FROM public.revisoes WHERE criterio_5_tema_2 IS NOT NULL GROUP BY criterio_5_tema_2
UNION ALL SELECT 'C5', 'tema_3', criterio_5_tema_3, COUNT(*) FROM public.revisoes WHERE criterio_5_tema_3 IS NOT NULL GROUP BY criterio_5_tema_3
UNION ALL SELECT 'C5', 'tema_4', criterio_5_tema_4, COUNT(*) FROM public.revisoes WHERE criterio_5_tema_4 IS NOT NULL GROUP BY criterio_5_tema_4;
```

### Verificar se as views foram criadas

```sql
SELECT * FROM public.dashboard_stats;
SELECT * FROM public.dashboard_stats_por_serie LIMIT 10;
```

---

## 7. Fase D — Sistema de Lock de Redações (Março 2026)

Implementado para evitar que dois corretores revisem a mesma redação simultaneamente.

### Migration SQL (aplicar no Supabase)

```sql
-- Adicionar colunas de lock na tabela redacoes
ALTER TABLE public.redacoes
  ADD COLUMN IF NOT EXISTS locked_by uuid REFERENCES perfis(id),
  ADD COLUMN IF NOT EXISTS locked_at timestamptz;

-- Função para liberar locks expirados (TTL 30 min)
-- Pode ser agendada via pg_cron ou chamada manualmente
CREATE OR REPLACE FUNCTION release_expired_locks()
RETURNS void AS $$
  UPDATE public.redacoes
  SET locked_by = NULL, locked_at = NULL
  WHERE locked_at < NOW() - INTERVAL '30 minutes';
$$ LANGUAGE sql SECURITY DEFINER;
```

### Como funciona

| Evento | Ação |
|---|---|
| Corretor abre uma redação | `POST /api/lock` — adquire lock (ou retorna 409 se bloqueado) |
| Corretor está na mesa (a cada 10 min) | `POST /api/lock` — renova o `locked_at` automaticamente (keepalive) |
| Corretor salva e finaliza | `DELETE /api/lock` — libera o lock |
| Corretor sai da mesa | `DELETE /api/lock` — libera o lock |
| Corretor fecha a aba/browser | `navigator.sendBeacon('/api/lock-release')` — tenta liberar |
| Lock não renovado por 30 min | `release_expired_locks()` — expira automaticamente |

### Lock na lista de redações

- `useRedacoesList` busca `locked_by` e `locked_at` em cada redação
- Calcula `isLocked = locked_by != userId && locked_at + 30min > now()`
- `RedacaoList` exibe badge laranja **"Em uso"** nos itens bloqueados

### Verificar locks ativos

```sql
SELECT r.id, r.title, r.nick, p.nome AS corretor_nome, r.locked_at,
       NOW() - r.locked_at AS tempo_lock
FROM public.redacoes r
JOIN public.perfis p ON p.id = r.locked_by
WHERE r.locked_by IS NOT NULL
  AND r.locked_at > NOW() - INTERVAL '30 minutes'
ORDER BY r.locked_at DESC;
```

---

## 8. Fase E — Performance da Busca Unificada (Março 2026)

Implementado para otimizar a nova interface de busca rápida na **Fila de Revisão**, onde o sistema busca simultaneamente no Título, Tema e Nick usando a operação `.ilike`.

Sem esses índices, a busca combinada em textos realizar full-scan, comprometendo a performance à medida que o banco cresce. A extensão `pg_trgm` permite criar índices trigrama GIN otimizados para consultas `LIKE` / `ILIKE`.

### Script SQL (Fase E)

```sql
-- Habilitar a extensão pg_trgm (necessária para índices de texto ilike)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Índice para busca parcial no título (texto)
CREATE INDEX IF NOT EXISTS idx_redacoes_title_trgm ON public.redacoes USING gin (title gin_trgm_ops);

-- Índice para busca parcial no nick do aluno (texto)
CREATE INDEX IF NOT EXISTS idx_redacoes_nick_trgm ON public.redacoes USING gin (nick gin_trgm_ops);

-- Índice para busca parcial no tema extraído do JSONB (extra_fields)
CREATE INDEX IF NOT EXISTS idx_redacoes_tema_trgm ON public.redacoes USING gin ((extra_fields->>'redacao_tema') gin_trgm_ops);
```

### Por que cada índice importa

| Índice | Tabela | Coluna | Query beneficiada |
| :--- | :--- | :--- | :--- |
| `idx_redacoes_title_trgm` | `redacoes` | `title` | Busca por palavra no título da redação |
| `idx_redacoes_nick_trgm` | `redacoes` | `nick` | Busca por fragmentos do apelido do autor |
| `idx_redacoes_tema_trgm` | `redacoes` | `extra_fields->>'redacao_tema'` | Busca por palavras chave no modelo/tema da redação |

---

## 9. Tabelas Adicionais

### `app_settings`
Armazena configurações globais do sistema.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `text` | Primary Key (Ex: 'global') |
| `hide_ia_score` | `boolean` | Flag que indica se a nota da IA deve ser ocultada para os corretores (padrão: `false`) |
| `updated_at` | `timestamptz` | Data da última atualização |

### Script SQL para criar a tabela e novos campos (Fase F - Ocultar Nota IA)
```sql
-- Criar tabela de configurações globais
CREATE TABLE public.app_settings (
    id text NOT NULL DEFAULT 'global'::text,
    hide_ia_score boolean NOT NULL DEFAULT false,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT app_settings_pkey PRIMARY KEY (id)
);

-- Inserir configuração global inicial
INSERT INTO public.app_settings (id, hide_ia_score) VALUES ('global', false) ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Políticas:
-- Todos podem ler
CREATE POLICY "Qualquer um pode ler app_settings" ON public.app_settings FOR SELECT USING (true);
-- Apenas admin pode modificar (precisa de ALL para upsert)
CREATE POLICY "Admins all" ON public.app_settings FOR ALL USING (
  exists (select 1 from public.perfis where id = auth.uid() and cargo = 'admin')
);

-- Adicionar colunas na tabela revisoes
ALTER TABLE public.revisoes
  ADD COLUMN IF NOT EXISTS criterio_1_nota_atribuida numeric,
  ADD COLUMN IF NOT EXISTS criterio_2_nota_atribuida numeric,
  ADD COLUMN IF NOT EXISTS criterio_3_nota_atribuida numeric,
  ADD COLUMN IF NOT EXISTS criterio_4_nota_atribuida numeric,
  ADD COLUMN IF NOT EXISTS criterio_5_nota_atribuida numeric;
```

---

## 10. Fase G — Sistema de Propostas por Task ID (Março 2026)

Implementado para permitir que administradores classifiquem as redações por **Número de Proposta**, mapeando `task_id`s a propostas de forma reversível, via painel admin ou script de terminal.

### Tabela `propostas`
Armazena os números e descrições de cada proposta.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `numero` | `integer` | Número único da proposta (ex: 1, 2, 3) |
| `descricao` | `text` | Descrição livre (ex: "Turmas regulares 2026") |
| `created_at` | `timestamptz` | Data de criação |
| `updated_at` | `timestamptz` | Data de atualização |

### Tabela `proposta_task_ids`
Mapeamento `task_id` → `proposta`. Um `task_id` só pode pertencer a uma proposta por vez (campo `UNIQUE`).

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `proposta_id` | `uuid` | FK → `propostas.id` (CASCADE DELETE) |
| `task_id` | `text` | ID da tarefa (único — `UNIQUE`) |
| `turma_label` | `text` | Label da turma (ex: `2026_6EFP2`, `2026_7EFP2VOAR`) |
| `created_at` | `timestamptz` | Data de criação |

### Script SQL (Fase G)

```sql
-- ============================================================
-- FASE G: Sistema de Propostas por Task ID
-- Executar no SQL Editor do Supabase
-- ============================================================

-- Tabela de propostas
CREATE TABLE public.propostas (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    numero integer NOT NULL,
    descricao text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT propostas_pkey PRIMARY KEY (id),
    CONSTRAINT propostas_numero_unique UNIQUE (numero)
);

-- Tabela de mapeamento task_id → proposta
CREATE TABLE public.proposta_task_ids (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    proposta_id uuid NOT NULL,
    task_id text NOT NULL,
    turma_label text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT proposta_task_ids_pkey PRIMARY KEY (id),
    CONSTRAINT proposta_task_ids_task_id_unique UNIQUE (task_id),
    CONSTRAINT proposta_task_ids_proposta_id_fkey FOREIGN KEY (proposta_id)
        REFERENCES propostas(id) ON DELETE CASCADE
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_proposta_task_ids_task_id ON public.proposta_task_ids(task_id);
CREATE INDEX IF NOT EXISTS idx_proposta_task_ids_proposta_id ON public.proposta_task_ids(proposta_id);

-- Habilitar RLS
ALTER TABLE public.propostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposta_task_ids ENABLE ROW LEVEL SECURITY;

-- Políticas: todos podem ler, apenas admin pode escrever
CREATE POLICY "Todos leem propostas" ON public.propostas FOR SELECT USING (true);
CREATE POLICY "Admin gerencia propostas" ON public.propostas FOR ALL USING (
  exists (select 1 from public.perfis where id = auth.uid() and cargo = 'admin')
);

CREATE POLICY "Todos leem proposta_task_ids" ON public.proposta_task_ids FOR SELECT USING (true);
CREATE POLICY "Admin gerencia proposta_task_ids" ON public.proposta_task_ids FOR ALL USING (
  exists (select 1 from public.perfis where id = auth.uid() and cargo = 'admin')
);
```

### View `propostas_stats`
Facilita a contagem de redações por proposta e task_id em uma única query.

```sql
CREATE OR REPLACE VIEW public.propostas_stats AS
SELECT
    p.id            AS proposta_id,
    p.numero        AS numero_proposta,
    p.descricao,
    pt.task_id,
    pt.turma_label,
    COUNT(r.id)     AS total_redacoes
FROM public.propostas p
LEFT JOIN public.proposta_task_ids pt ON pt.proposta_id = p.id
LEFT JOIN public.redacoes r ON r.task_id = pt.task_id
GROUP BY p.id, p.numero, p.descricao, pt.task_id, pt.turma_label
ORDER BY p.numero, pt.turma_label;
```

### Índices adicionados (Fase G)

| Índice | Tabela | Coluna | Query beneficiada |
| :--- | :--- | :--- | :--- |
| `idx_proposta_task_ids_task_id` | `proposta_task_ids` | `task_id` | Join com `redacoes.task_id` para contagem |
| `idx_proposta_task_ids_proposta_id` | `proposta_task_ids` | `proposta_id` | Listagem de task_ids por proposta |

### Verificar criação

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('propostas', 'proposta_task_ids');

SELECT * FROM public.propostas_stats LIMIT 10;
```

### Como funciona

| Evento | Ação |
|---|---|
| Admin cria proposta | INSERT em `propostas` com número único |
| Admin adiciona task_id | INSERT em `proposta_task_ids` com FK para a proposta |
| Admin remove task_id | DELETE em `proposta_task_ids` (proposta intacta) |
| Admin deleta proposta | DELETE em `propostas` — task_ids removidos via CASCADE |
| Contagem de redações | JOIN `proposta_task_ids` → `redacoes` via `task_id` |
