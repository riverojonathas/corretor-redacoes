# Análise do Onboarding (WelcomePopup)

Este documento registra o estado atual do processo de integração (onboarding) dos corretores, bem como sugestões de evolução e pontos críticos a serem melhorados.

## 1. Estado Atual
O onboarding atual (`WelcomePopup.tsx`) consiste em um modal fixo centralizado com 4 passos estáticos:
1. **Boas-vindas genéricas.**
2. **Explicação da Fila de Revisão** (filtros).
3. **Avaliação Híbrida** (Pré-avaliação da IA + Julgamento humano).
4. **Sistema de Destaques e Grifos.**

Ao ser fechado ou concluído, o sistema altera a flag `primeiro_acesso` para `false` no banco de dados (`tabela perfis`), garantindo que a tela não apareça novamente para aquele usuário.

---

## 2. O que podemos melhorar de imediato?

### 2.1. Personalização (Incluir Nome do Usuário)
✅ **O que fazer:** Atualmente a saudação é "Bem-vindo(a) ao Corretor!". Como a tabela `perfis` possui a coluna `nome`, podemos atualizar o `AuthContext` para buscar essa informação durante o login e cumprimentar de forma pessoal: `"Bem-vindo(a), João da Silva!"`.

### 2.2. Acesso Recorrente ao Tutorial
⚠️ **O que está faltando:** Se o usuário fechar o modal sem querer no botão "X", ele nunca mais verá o tutorial.
💡 **Solução:** Adicionar um botão de "Ajuda" ou "?" no `Topbar` que permite reabrir o tutorial a qualquer momento, ou uma opção em "Configurações".

### 2.3. Modal Fixo vs. Tour Guiado (O que ainda está ruim)
❌ **O Problema:** Um modal com bastante texto e ícones abstratos exige esforço cognitivo para imaginar onde os botões estão na tela real. O usuário tende a apenas "pular tudo".
💡 **A Evolução Padrão-Ouro:** Migrar futuramente de um *WelcomePopup* para um **Tour Guiado** (Product Tour) que escurece a tela e destaca os botões reais do sistema na prática (usando bibliotecas como `react-joyride` ou similar). 

### 2.4. Ações Concretas de Engajamento
⚠️ **O que está faltando:** O onboarding termina com um "Entendi". O ideal em UX é que o onboarding termine com um "Call to Action" (Chamada para ação) direto, como: *"Vamos corrigir sua primeira redação agora!"*, direcionando imediatamente os olhos dele para a primeira redação da lista.

---

## 3. Perguntas Estratégicas (Para entender o escopo do projeto)

Para que possamos desenhar um onboarding perfeito e funcionalidades que realmente atinjam a dor do seu usuário, precisamos entender o contexto de negócios do Corretor de Redações:

1. **Perfil do Usuário:** Quem são esses corretores? Eles já são professores experientes ou são universitários treinados por você? 
2. **Treinamento Externo:** O sistema é a *única* fonte de instrução de uso, ou eles recebem um treinamento via vídeo/PDF antes de conseguir o login?
3. **Momento "Aha!":** Qual é a funcionalidade do sistema que mais impressiona o corretor e economiza o tempo dele? (É o texto já grifado pela IA? É a contagem de pontos automática?). O onboarding deve focar os holofotes nisto!
4. **Configuração de Perfil:** O corretor precisa fazer alguma configuração inicial que ainda não pedimos? (Exemplo: Inserir chave PIX para repasseFinanceiro, colocar uma foto de perfil, escolher quais "séries" ele prefere corrigir?).
