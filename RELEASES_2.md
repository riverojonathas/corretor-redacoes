# RELEASES_2.md - Histórico

## [v1.4] - Março 2026

### 🎫 Gestão de Propostas por Task ID
- **Nova funcionalidade**: Administradores podem criar Propostas numeradas e vincular Task IDs a elas, classificando as redações por número de proposta.
- **Reversível**: Remover um Task ID de uma proposta não apaga a proposta nem as redações — basta `remove` e `add` para reatribuir.
- **Unicidade garantida**: Um Task ID só pode pertencer a uma proposta por vez (`UNIQUE` no banco), evitando duplo vínculo.

### 📋 Fila de Revisão e Mesa do Corretor
- **Busca por Proposta**: Novo seletor na barra de filtros para filtrar redações por Número de Proposta.
- **Tags Visuais**: Badges coloridos (P1, P2) identificam a qual proposta a redação pertence diretamente na lista.
- **Identificação de Turma**: Tooltip nas tags mostram o label descritivo da turma (ex: `2026_6EFP2`).
- **Prevenção de Perda de Dados (Hotfix)**: A Mesa do Corretor agora blinda o formulário contra validações de Window Focus. Mudar de aba no navegador ou perder e ganhar foco não fará mais o sistema limpar dados digitados não-salvos para re-baixar informações do BD.
- **Performance**: Consultas otimizadas via JOIN no banco de dados, sem impacto na latência da fila.

### ⚙️ Painel Admin — Aba "Propostas"
- **Nova aba** em Configurações → Propostas (visível apenas para Administradores).
- Criar propostas com número inteiro (ex: Proposta 1, Proposta 2) e descrição livre.
- Adicionar Task IDs com label de turma (ex: `2026_6EFP2`).
- Contagem de redações por Task ID exibida em tempo real.
- Remoção individual de Task IDs e exclusão completa de propostas com confirmação.

### 🖥️ Script de Terminal `manage_propostas.ts`
- Novo script `scripts/manage_propostas.ts` com 6 comandos: `list`, `create`, `add`, `remove`, `delete`, `bulk`.
- O comando `bulk` importa múltiplos Task IDs em uma única chamada JSON, ideal para configuração inicial das turmas.
- Exibe contagem de redações ao listar ou adicionar Task IDs.
- Documentado em `INGESTAO_CSV.md` com exemplos reais das turmas regulares e Projeto Voar 2026.

### 📊 Dashboard e Matriz da IA
- **Card de Totalizadores**: Incluído card informando o total de Propostas disponíveis no sistema e o montante de redações agrupadas nelas.
- **Matriz da IA Filtrável**: A Matriz de Qualidade da IA agora possui menus interativos para explorar acertos da Inteligência Artificial por:
  - Número da Proposta
  - Label da Turma
  - Task ID Específico
- **Zero Full-Scans**: A Matriz reagrupa e soma avaliações localmente a partir de relatórios parciais baixados em cache do Supabase, evitando travar bancos massivos.

### ⚡ Performance e Banco de Dados
- **Novas tabelas**: `propostas` e `proposta_task_ids` com RLS e políticas por cargo.
- **Views Consolidadas**: `propostas_stats`, `dashboard_propostas_resumo` e `dashboard_ai_eval_matrix_stats` redesenhadas para abstrair joins pesados para relatórios.
- **Pagination Server-Side (Overfetching resolvido)**: Criação da `fila_revisao_view`, delegando todo o filtro de status ("Pendente") e limite de página ao Supabase, impedindo travamento de React sob alto uso.
- **2 novos índices**: `idx_proposta_task_ids_task_id` e `idx_proposta_task_ids_proposta_id` para queries rápidas.
- Relacionamento via JOIN em `task_id` — sem migration na tabela `redacoes`.

---

## [v1.3] - Abril 2026

### 👀 Avaliação IA Oculta (Correção Cega)
- **Primeiro Critério**: A avaliação da nota IA foi movida para ser o primeiro item de cada competência, garantindo que seja a primeira decisão do corretor.
- **Flag Global**: Nova configuração ativável por Administradores para ocultar a nota sugerida pela IA, evitando vieses durante a correção.
- **Auto-preenchimento**: Ao invés de opções, o corretor informa manualmente a nota (de 0 a 10). O avaliador ajusta "Adequada", "1 nível abaixo", etc., calculando automaticamente o desvio (Diferença = Nota IA - Nota Corretor).

### 🛡️ Administração e Banco de Dados
- **Painel Admin**: Adicionada uma aba "Administração" nas configurações do sistema (acesso garantido a `cargo === 'admin'`).
- **Tabela de Configurações**: Criação de `app_settings` no Supabase para controlar o estado global de opções.
- **Auditoria Fiel**: Novos campos em `revisoes` que guardam exatamente o número atribuído nos critérios do revisor.

### 👥 Novo Cargo: Leitor (Visualizador)
- **Perfil Restrito**: Implementação do cargo `leitor` (viewer) destinado a usuários que precisam auditar ou consultar correções sem permissão de alteração.
- **Modo Somente Leitura**: Ao acessar a mesa, o leitor visualiza os grifos e notas da IA/Corretor, mas todos os botões de ação, inputs e ferramentas de marca-texto ficam desabilitados.
- **Badge de Identificação**: Exibição do status "Modo Visualização" no cabeçalho para diferenciar o acesso de consulta do acesso de trabalho.
- **Gestão Admin**: Administradores agora podem atribuir a função "Leitor (Visualização)" através do Painel de Usuários.

### 📑 Fila de Revisão Otimizada
- **Foco Padrão**: A visualização padrão agora lista primeiramente as redações na guia de "Pendentes", economizando carregamentos e pulando de cara para o trabalho disponível.
- **Ordem das Abas**: A guia "Todas" com as centenas ou milhares de redações foi empedida do início para o final das opções, garantindo que o corretor não esbarre nelas a todo tempo.

### ⚡ Performance Geral e Estabilidade
- **Zero-Delay na Correção**: Implementado modelo de `Suspense` nativo pro Next.js (`loading.tsx`). O esqueleto de correção (Skeleton) agora aparece instantaneamente ao invés de exibir uma tela morta.
- **Fim da Retenção de Estado**: A tela não mostra mais listas duplicadas piscando no instante de troca da tela (State leak/Memory leak resolvido com as keys do React).
- **Fim da Carga Desnecessária na API (Lazy Fetching)**: A mesa do revisor agora não faz mais requisições ocultas para baixar redações adicionais da Fila nos momentos impertinentes.
- **Busca Unificada no DB (Theca-Join 80% mais rápida)**: Remoção de 5 consultas em cascata que ficavam retendo a CPU e Banco de Dados (Waterfall Queries). Quando uma redação carrega, uma grande e robusta Query do Supabase (`select('*, revisoes(*, revisao_destaques(*))')`) puxa os detalhes todos em *uma única requisição HTML*.

---

## [v1.2] - Março 2026

### 🚀 Melhorias na Fila de Revisão e Mesa do Corretor

### 📋 Critérios Dinâmicos (Competências)
Agora o sistema não está restrito às 5 competências fixas. Os critérios são carregados dinamicamente a partir dos dados da redação (`assessed_skills`).
- **Nomes Personalizados**: Abaixo do título "Competência X", agora é exibido o enunciado real do critério definido na proposta.
- **Suporte a N Competências**: A interface se adapta automaticamente se uma proposta contiver mais ou menos de 5 critérios.

### 📖 Central de Ajuda e Critérios
Adicionado um botão de ajuda (`?`) ao lado de cada critério na Mesa do Corretor, agora com uma experiência de leitura superior.
- **Modal de Explicação**: Substituímos os tooltips por um Modal centralizado e espaçoso. As descrições agora são exibidas em fonte serifada sobre fundo sépia, ideal para textos longos e técnicos.
- **Sanitização de Descrições**: Todos os critérios passam por uma limpeza automática de caracteres de formatação (`\n`, `\t`), garantindo clareza total.
- **Nomes Dinâmicos**: O sistema carrega nomes e enunciados reais das propostas, exibindo "Critério X" nas abas superiores.

### 🏗️ Refatoração Arquitetural e de Performance
O componente central da Mesa do Corretor foi completamente reestruturado para garantir estabilidade e fluidez.
- **Componentização**: A lógica foi modularizada em componentes menores (`RedacaoList`, `CorrectionHeader`, `HighlightTools`), facilitando a manutenção futura.
- **Performance do IDE**: Redução drástica no tamanho do arquivo principal, eliminando travamentos durante o desenvolvimento.
- **Builds Otimizados**: A nova estrutura modular contribui para tempos de build mais previsíveis e menor carga de processamento.

### ✨ Nova Seção de Avaliação Final (Acordeão)
Implementamos um novo fluxo de preenchimento para as 3 perguntas de avaliação de cada critério, focado em agilidade e foco.
- **Sanfona Automática**: O sistema abre automaticamente o próximo campo a ser preenchido e minimiza os já completados em um resumo compacto.
- **Botões de Opção (Pills)**: Substituímos listas suspensas (dropdowns) por botões de clique único, divididos entre categorias "Correto" e "Incorreto".
- **Feedback Visual Inteligente**: 
    - Opções positivas ganham tons de verde (`Emerald`).
    - Opções negativas ganham tons de vermelho/laranja (`Rose`).
    - Ícones de check (`✓`/`✕`) e badges coloridos aparecem no modo minimizado para rápida revisão.
- **Indicadores de Status**: Adicionado selos de "Preenchido" em tempo real para cada bloco, incluindo a área de Observação do Critério.

### 🎨 Conforto Visual e Limpeza de Dados (Global)
A interface e o processamento de texto foram elevados para um padrão premium em todo o sistema.
- **Tema Sépia Global**: Extendemos o tom amarelado confortável (`#fdfaf2`) para todas as páginas do sistema, incluindo Dashboard, Sidebar, Topbar, Configurações e toda a área administrativa.
- **Camadas de Profundidade**: Utilizamos cartões semi-transparentes sobre o fundo sépia para criar uma interface moderna, limpa e que foca no que importa: a leitura.
- **Sanitização Inteligente de Texto**: O sistema agora remove sequências literais de escape (`\n`, `\t`, `\r`) que poluíam o texto original e os comentários da IA.
- **Preservação de Grifos**: Nossa tecnologia exclusiva ajusta automaticamente os índices dos destaques (marca-texto) após a limpeza do texto, garantindo que nenhum grifo saia do lugar.
- **Título Realista**: O título da redação agora aparece centralizado e destacado no topo do texto, simulando a folha de redação oficial.

### 🛡️ Segurança e Integridade da Revisão
Novas ferramentas para proteger o trabalho do corretor e garantir a qualidade da avaliação.
- **Flag de Suspeita de IA**: Botão dedicado para marcar redações possivelmente geradas por inteligência artificial, com campo opcional para justificar a suspeita.
- **Proteção contra Alterações Não Salvas**: O sistema detecta edições pendentes e solicita confirmação antes de sair da mesa, evitando a perda acidental de progresso.
- **Fluxo de Navegação Corrigido**: O botão "Sair da Mesa" agora funciona de forma preditiva, retornando corretamente para a fila de revisão ou dashboard principal.

### 📚 Modo Leitura Focado (Foco Imersivo)
Criamos um ambiente de distração zero para que o corretor possa mergulhar no texto da redação.
- **Ocultação Global**: Ao ativar o modo leitura, a Sidebar e o Topbar do sistema desaparecem instantaneamente via CSS.
- **Expansão de Conteúdo**: A área de trabalho se expande para ocupar 100% da largura da tela, minimizando o ruído visual.
- **Persistência de Ferramentas**: Mesmo no modo leitura, todas as funções de votação, comentários e edição de grifos permanecem totalmente acessíveis.

### 📏 Interface Unificada (Single Row Layout)
Redesenhamos os componentes de controle para maximizar a área visível da redação e da devolutiva.
- **Cabeçalho All-in-One**: O topo da mesa agora centraliza absolutamente todos os controles. Sair da mesa, Identificação do Aluno, Critérios de Avaliação, Ferramentas de Edição e as ações de Salvar/Finalizar coexistem em uma única linha premium.
- **Cabeçalho de Critérios Compacto**: Unificamos o nome e a descrição do critério em uma única linha (ex: C1 - Norma Culta), reduzindo drásticamente a ocupação vertical da área de trabalho.
- **Tipografia Otimizada**: Ajustamos o tamanho da fonte da redação e reduzimos margens/paddings excessivos para garantir que mais conteúdo seja visível sem rolagens desnecessárias.
- **Bloco de IA Aproximado**: Reduzimos o distanciamento entre a redação e o switch de "Suspeita de IA", garantindo que ele não fique "escondido" em textos mais longos.
- **Métricas do Dashboard Corrigidas**: Ajustamos o cálculo de "Modelos Disponíveis" para refletir temas únicos e corrigimos a "Nota Média Geral" para processar corretamente as pontuações da IA.
- **Eliminação do Rodapé**: Com a migração das ações para o topo, removemos a barra inferior, garantindo 100% de aproveitamento vertical da tela para o conteúdo.
- **Ícones sem Poluição**: Substituímos rótulos de texto por ícones elegantes e explicativos (Tooltips) para as ferramentas de edição.

### 📊 Avaliação da Adequação da Nota IA
Implementamos um novo nível de auditoria para as notas atribuídas pela inteligência artificial.
- **Validação por Critério**: Agora, além dos 3 temas de feedback, o revisor deve validar a nota da IA em cada um dos 5 critérios.
- **Escala de Desvio**: Possibilidade de marcar a nota como "Adequada" ou indicar desvios específicos (1pt, 2pts ou >2pts) acima ou abaixo do esperado.
- **Fluxo de Trabalho Rigoroso**: A conclusão de um critério agora exige o preenchimento dos 4 campos de avaliação, garantindo uma auditoria completa.

> [!IMPORTANT]
> **Ação Necessária**: Esta atualização requer a execução do script SQL abaixo no editor do Supabase para adicionar as novas colunas de avaliação (`tema_4`) na tabela `revisoes`.


---
*Alimentado automaticamente para a página /ajuda*
