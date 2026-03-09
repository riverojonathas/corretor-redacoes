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
npx ts-node scripts/ingest_csv.ts nomedo_arquivo.csv
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
