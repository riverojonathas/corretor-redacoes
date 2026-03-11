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

### 🎨 Conforto Visual e Limpeza de Dados
A interface e o processamento de texto foram elevados para um padrão premium.
- **Tema Sépia (Modo Papel)**: Implementamos um fundo levemente amarelado (`#fdfaf2`) e fontes serifadas para o texto da redação, reduzindo a fadiga visual durante revisões extensas.
- **Sanitização Inteligente de Texto**: O sistema agora remove sequências literais de escape (`\n`, `\t`, `\r`) que poluíam o texto original e os comentários da IA.
- **Preservação de Grifos**: Nossa tecnologia exclusiva ajusta automaticamente os índices dos destaques (marca-texto) após a limpeza do texto, garantindo que nenhum grifo saia do lugar.
- **Título Realista**: O título da redação agora aparece centralizado e destacado no topo do texto, simulando a folha de redação oficial.

### 🛡️ Segurança e Integridade da Revisão
Novas ferramentas para proteger o trabalho do corretor e garantir a qualidade da avaliação.
- **Flag de Suspeita de IA**: Botão dedicado para marcar redações possivelmente geradas por inteligência artificial, com campo opcional para justificar a suspeita.
- **Proteção contra Alterações Não Salvas**: O sistema detecta edições pendentes e solicita confirmação antes de sair da mesa, evitando a perda acidental de progresso.
- **Fluxo de Navegação Corrigido**: O botão "Sair da Mesa" agora funciona de forma preditiva, retornando corretamente para a fila de revisão ou dashboard principal.

---
*Alimentado automaticamente para a página /ajuda*
