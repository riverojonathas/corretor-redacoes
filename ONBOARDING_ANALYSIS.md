# Estratégia de Onboarding e UX (Corretor de Redações)

Este documento registra o estado atual do processo de integração (onboarding) dos corretores, o contexto de negócios do projeto, bem como sugestões de evolução da interface.

---

## 1. Contexto Estratégico e Perfil do Usuário

O projeto **Redação Paulista** visa auxiliar na correção de redações do ENEM e outras matrizes do currículo paulista, sendo a **curadoria humana** vital para garantir feedbacks satisfatórios aos alunos e aprimorar a IA.

- **Perfil do Usuário:** Professores da rede pública de ensino do estado de São Paulo. Eles são responsáveis por revisar a correção da IA, identificando acertos e erros.
- **Treinamento e Comunicação:** O sistema é a **principal fonte de ensino, comunicação e informação** com os participantes. Um treinamento inicial estruturado (ex: vídeos, guia) acompanha a liberação do acesso, mas o sistema deve guiar o usuário na prática.
- **Momento "Aha!" (Proposta de Valor):** A capacidade de visualizar confortavelmente as redações e **corrigi-las em lote**, trazendo grande eficiência ao processo de curadoria. Anteriormente, o processo manual era demorado e trabalhoso sem um fluxo digital centralizado. O onboarding deve focar diretamente na facilidade e rapidez dessa transição.
- **Simplicidade:** O sistema não é uma rede social, logo, não possui foto de perfil ou configurações supérfluas. Também não há gestão financeira embutida. O foco é ser **simples, direto e funcional**.

---

## 2. Estado Atual do Onboarding

O onboarding inicial (`WelcomePopup.tsx`) consiste em um modal centralizado de boas-vindas com 4 passos estáticos explicando: (1) Boas-vindas, (2) Fila de Revisão, (3) Avaliação Híbrida, (4) Destaques/Grifos. 

O sistema salva localmente (`localStorage`) e no banco de dados (`primeiro_acesso`) quando o usuário conclui o modal.

---

## 3. Evolução Imediata e Status

### 3.1. Personalização (Incluir Nome do Usuário)
✅ **O que fazer:** A saudação foi ou deve ser atualizada para utilizar o nome do usuário oriundo da tabela `perfis`, cumprimentando de forma pessoal: `"Bem-vindo(a), João da Silva!"`.

### 3.2. Acesso Recorrente ao Tutorial
✅ **Concluído:** Foi adicionado um botão de "Ajuda" (ícone de interrogação) fixo no `Topbar`. Se o usuário fechar o modal por engano ou esquecer como funciona o sistema, ele pode reabrir o manual a qualquer momento sem depender da flag de `primeiro_acesso`.

---

## 4. O Futuro do Onboarding (Próximos Passos Estratégicos)

Como sabemos que **o sistema é a principal ferramenta de ensino** e o foco principal é a **Correção em Lote (Velocidade/Eficiência)**, o modal estático rapidamente se torna insuficiente. Para a próxima grande versão da UX de Onboarding do Redação Paulista, focaremos em:

### 4.1. Substituir Modal por "Tour Guiado" (Product Tour)
- **Problema do Modal:** Muito texto teórico. Professores da rede pública têm pouco tempo; eles preferem "aprender fazendo".
- **Evolução:** Utilizar uma biblioteca de Destaque Interativo (ex: `react-joyride`). 
  - *Passo 1:* A tela escurece e destaca a Fila. "Clique aqui para pegar seu primeiro lote de redações".
  - *Passo 2:* Destaca o Editor. "Veja a correção da IA aqui. Você só precisa confirmar ou ajustar as notas".
  - Isso leva o professor diretamente ao "Momento Aha!" na prática, não na teoria.

### 4.2. Empty States Instrutivos (Telas Vazias)
- Se a fila de revisão do corretor estiver vazia, a tela não deve apenas dizer "Sem redações". Ela deve ter uma mensagem instrucional clara, um atalho para um FAQ ou vídeo de treinamento sugerido, usando o sistema como canal ativo de comunicação.

### 4.3. Central de Ajuda / Comunicação Embutida
- Como não teremos "firulas" de perfis, o espaço economizado (na Navbar ou Sidebar) pode hospedar um menu de "Avisos da Coordenação" ou "Guia de Curadoria", facilitando a comunicação do time central com a rede de professores.

---

## 5. Próxima Ação de Desenvolvimento Sugerida
- [ ] Implementar a exibição do **Primeiro Nome** do usuário no `WelcomePopup` (se ainda não implementado através do `AuthContext`).
- [ ] Pesquisar e prototipar a viabilidade técnica do **Tour Guiado iterativo** nas telas do Dashboard.
