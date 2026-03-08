# Análise de Performance e Melhorias Futuras
Data da Análise: Março de 2026

Este documento registra gargalos teóricos de performance atuais na plataforma e as soluções técnicas necessárias para escalar o sistema da marca de milhares para centenas de milhares (ou milhões) de redações.

## Limites Atuais (Frontend vs Banco de Dados)
O banco de dados (Supabase / PostgreSQL) consegue suportar um grande volume de dados. O atual gargalo encontra-se no Front-end (React/Next.js) durante o carregamento da Mesa do Corretor.
O sistema funcionará liso e responsivo até aproximadamente **1.000 a 2.000 redações**. Acima disso, o carregamento das páginas ficará perceptivelmente lento.

**Causa do Limite:**
A página hoje faz o download (`select`) da tabela completa de `redacoes` de uma só vez, transferindo todos os dados para a RAM do navegador cliente antes de aplicar os filtros (Nick, Série, Tema, etc).

---

## Roteiro de Otimizações Pendentes (Roadmap para Escalonamento)

### 1. Paginação (Frontend & Backend)
**O Problema:** A interface carrega o banco todo.
**Solução:** 
- Limitar a busca (via `supabase.from('redacoes').select(...).range(0, 19)`).
- Implementar **Scroll Infinito** ou **Páginas (1, 2, 3...)** no React para carregar em lotes de 20-50 registros por vez via estado de componente.

### 2. Filtros no Servidor (Server-Side Filtering do Supabase)
**O Problema:** O filtro por Nick, Tema ou Série (`redacoesFiltradas`) ocorre via `.filter(...)` no JavaScript, localmente no cliente.
**Solução:**
- Alterar as consultas de rede (`fetchLista`) para enviarem os termos digitados diretamente para o Supabase usando queries como `.ilike('nick', '%nome%')` e `.eq('nr_serie', '1a serie')`.
- O Supabase filtrará na nuvem de forma instantânea e fará o download da rede APENAS com as linhas resultantes (economia de pacote de dados e RAM do usuário).

### 3. Otimização de Índices (Database Indexes)
**O Problema:** Pesquisar (via SQL Server-Side) em milhões de linhas pode deixar a query lenta (1,5 a 3 segundos de resposta).
**Solução:**
- Acessar o ambiente SQL do Supabase e criar Índices para as colunas mais buscadas, para que os dados fiquem em ordem alfabética "pré-calculada".
- **Queries para o ambiente SQL:**
  ```sql
  CREATE INDEX idx_redacoes_nick ON redacoes (nick);
  CREATE INDEX idx_redacoes_nr_serie ON redacoes (nr_serie);
  CREATE INDEX idx_redacoes_titulo ON redacoes (titulo);
  ```

### 4. Estratégia de Cache da Lista (Estado ou React Query)
**O Problema:** Quando o corretor finaliza a avaliação e volta para a Fila (List View = 'list'), ocorre um recarregamento total dos dados na tela de forma redundante e demorada (`fetchLista` é chamado o tempo todo no botão "Voltar Para Fila").
**Solução:**
- Implementar cache com `React Query (@tanstack/react-query)` ou cache de contexto globais (o `Zustand`) para memoriar instantaneamente os últimos registros baixados. O retorno à tela deixará de ser um recarregamento para ser uma transição instantânea de layout.

---
*Para referência quando a volumetria de dados crescer no projeto.*
