# Database Schema - Supabase

Este documento contém a estrutura exata do banco de dados relacional no Supabase. Use este arquivo como referência para todas as queries, inserções e interfaces.

> [!IMPORTANT]
> Use sempre nomes de colunas em **minúsculas**.

## 1. Tabela `perfis`
*Tabela de Usuários/Corretores*

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key (Relacionado com `auth.users.id`) |
| `nome` | `text` | Nome completo do usuário |
| `email` | `text` | E-mail do usuário |
| `cargo` | `text` | Cargo ou função (ex: corretor, administrador) |
| `created_at` | `timestamptz` | Data de criação do perfil |

---

## 2. Tabela `redacoes`
*Tabela de Ingestão do CSV / Dados da IA*

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `data_base` | `text` | Data base da redação |
| `id_redacao` | `text` | ID da redação |
| `model_id` | `text` | ID do modelo da proposta/tarefa |
| `titulo_modelo`| `text` | Título / Tema da proposta/tarefa |
| `task_id` | `text` | ID da tarefa |
| `answer_id` | `text` | ID da resposta |
| `question_id` | `text` | ID da questão |
| `external_id` | `text` | ID externo |
| `nick` | `text` | apelido do aluno |
| `nr_serie` | `text` | Série/Ano |
| `cd_tipo_ensino`| `text` | Código do tipo de ensino |
| `nm_tipo_ensino`| `text` | Nome do tipo de ensino |
| `titulo` | `text` | Título da redação |
| `texto` | `text` | Texto integral da redação |
| `criterio_1_nota`| `numeric` | Nota do critério 1 |
| `criterio_1_devolutiva`| `text` | Devolutiva do critério 1 |
| `criterio_2_nota`| `numeric` | Nota do critério 2 |
| `criterio_2_devolutiva`| `text` | Devolutiva do critério 2 |
| `criterio_3_nota`| `numeric` | Nota do critério 3 |
| `criterio_3_devolutiva`| `text` | Devolutiva do critério 3 |
| `criterio_4_nota`| `numeric` | Nota do critério 4 |
| `criterio_4_devolutiva`| `text` | Devolutiva do critério 4 |
| `criterio_5_nota`| `numeric` | Nota do critério 5 |
| `criterio_5_devolutiva`| `text` | Devolutiva do critério 5 |
| `nota_geral` | `numeric` | Soma das notas ou média |
| `comentario_geral`| `text` | Comentário geral da IA |
| `created_at` | `timestamptz` | Data de ingestão |

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
| `criterio_1_observacao` | `text` | Observação livre |
| `criterio_2_tema_1` | `text` | Avaliação: Identificação de pontos positivos |
| `criterio_2_tema_2` | `text` | Avaliação: Identificação do problema |
| `criterio_2_tema_3` | `text` | Avaliação: Sugestão de melhoria |
| `criterio_2_observacao` | `text` | Observação livre |
| `criterio_3_tema_1` | `text` | Avaliação: Identificação de pontos positivos |
| `criterio_3_tema_2` | `text` | Avaliação: Identificação do problema |
| `criterio_3_tema_3` | `text` | Avaliação: Sugestão de melhoria |
| `criterio_3_observacao` | `text` | Observação livre |
| `criterio_4_tema_1` | `text` | Avaliação: Identificação de pontos positivos |
| `criterio_4_tema_2` | `text` | Avaliação: Identificação do problema |
| `criterio_4_tema_3` | `text` | Avaliação: Sugestão de melhoria |
| `criterio_4_observacao` | `text` | Observação livre |
| `criterio_5_tema_1` | `text` | Avaliação: Identificação de pontos positivos |
| `criterio_5_tema_2` | `text` | Avaliação: Identificação do problema |
| `criterio_5_tema_3` | `text` | Avaliação: Sugestão de melhoria |
| `criterio_5_observacao` | `text` | Observação livre |
| `comentario_geral`| `text` | Comentário final do corretor humano |
| `favorita` | `boolean` | Indica se a correção foi favoritada pelo corretor |

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
