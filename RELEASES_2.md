# RELEASES_2.md - Março 2026

## 🚀 Melhorias na Fila de Revisão e Mesa do Corretor

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
- **Eliminação do Rodapé**: Com a migração das ações para o topo, removemos a barra inferior, garantindo 100% de aproveitamento vertical da tela para o conteúdo.
- **Ícones sem Poluição**: Substituímos rótulos de texto por ícones elegantes e explicativos (Tooltips) para as ferramentas de edição.

---
*Alimentado automaticamente para a página /ajuda*
