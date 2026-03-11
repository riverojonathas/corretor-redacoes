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
| `cargo` | `text` | Cargo ou função (ex: corretor, administrador) |
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
| `answer_id` | `text` | ID da resposta |
| `nick` | `text` | Apelido do aluno |
| `title` | `text` | Título da redação |
| `essay` | `text` | Texto integral da redação |
| `genre` | `text` | Gênero da redação |
| `statement` | `text` | Enunciado/Proposta da redação |
| `support_text` | `text` | Texto de apoio/coletânea |
| `consumer_init` | `timestamptz` | Início do consumo |
| `consumer_finish` | `timestamptz`| Fim do consumo |
| `evaluated_skills` | `jsonb` | Notas e comentários da IA (Array: {score, comment, statement}) |
| `assessed_skills`  | `jsonb` | Habilidades avaliadas, descrições e instruções da IA |
| `extra_fields` | `jsonb` | Metadados extras (ex: `redacao_tema`, `redacao_ano_serie`, `redacao_zerada`) |
| `created_at` | `timestamptz` | Data de ingestão / Data do registro base (`createdAt`) |
| `updated_at` | `timestamptz` | Data de atualização original (`updatedAt`) |

---

## 3. Tabela `revisoes`
*Tabela da Mesa do Corretor*

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `data_correcao` | `timestamptz` | Data da revisão manual |
| `redacao_id` | `uuid` | Foreign Key -> `redacoes.id` |
| `corretor_id` | `uuid` | Foreign Key -> `perfis.id` |
| `criterio_1_tema_1` | `text` | Avaliação: Identificação de pontos positivos |
| `criterio_1_tema_2` | `text` | Avaliação: Identificação do problema |
| `criterio_1_tema_3` | `text` | Avaliação: Sugestão de melhoria |
| `criterio_1_tema_4` | `text` | Avaliação: Adequação da nota IA |
| `criterio_1_observacao` | `text` | Observação livre |
| `criterio_2_tema_1` | `text` | Avaliação: Identificação de pontos positivos |
| `criterio_2_tema_2` | `text` | Avaliação: Identificação do problema |
| `criterio_2_tema_3` | `text` | Avaliação: Sugestão de melhoria |
| `criterio_2_tema_4` | `text` | Avaliação: Adequação da nota IA |
| `criterio_2_observacao` | `text` | Observação livre |
| `criterio_3_tema_1` | `text` | Avaliação: Identificação de pontos positivos |
| `criterio_3_tema_2` | `text` | Avaliação: Identificação do problema |
| `criterio_3_tema_3` | `text` | Avaliação: Sugestão de melhoria |
| `criterio_3_tema_4` | `text` | Avaliação: Adequação da nota IA |
| `criterio_3_observacao` | `text` | Observação livre |
| `criterio_4_tema_1` | `text` | Avaliação: Identificação de pontos positivos |
| `criterio_4_tema_2` | `text` | Avaliação: Identificação do problema |
| `criterio_4_tema_3` | `text` | Avaliação: Sugestão de melhoria |
| `criterio_4_tema_4` | `text` | Avaliação: Adequação da nota IA |
| `criterio_4_observacao` | `text` | Observação livre |
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
```

### Verificar se as views foram criadas

```sql
SELECT * FROM public.dashboard_stats;
SELECT * FROM public.dashboard_stats_por_serie LIMIT 10;
```
