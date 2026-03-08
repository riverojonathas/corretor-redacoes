# Análise Oficial de Funcionalidades (Feature Gap Analysis)
*Status: Março de 2026 - Preparação para o Lançamento (Go-Live)*

Este documento detalha o que o sistema "Corretor de Redações" **precisa ter** para operar comercialmente/oficialmente, o que **pode ser abstraído** (escopo desnecessário) e o que **pode ser melhorado** em fases futuras.

---

## 🚨 1. Funcionalidades Obrigatórias (Blockers para Lançamento)
Estas são as ferramentas que a plataforma *não pode* ir ao ar sem possuir.

### 1.1 Sistema de Relatórios / Histórico do Corretor
- **O status atual:** O corretor entra na fila, corrige, salva e a redação some da fila (concluída). O corretor não tem onde ver o próprio "Holerite" ou Histórico.
- **Por que é essencial:** Na vida real, corretores recebem por prova corrigida. O sistema precisa de uma tela de "Minhas Correções" ou "Dashboard" informando: *Quantas redações corrigi hoje? Nesta semana? Qual o valor estimado a receber?*

### 1.2 Exportação ou Envio da Devolutiva para o Aluno
- **O status atual:** O corretor clica em "Finalizar Correção" e os dados são salvos no banco. 
- **Por que é essencial:** Como o aluno recebe essa nota? O sistema enviará um PDF? Um email? O painel do corretor precisa de uma garantia visual de que "A nota foi processada e enviada para o aluno". Se houver um site do aluno, é preciso garantir a integração.

### 1.3 Perfil de Administrador (Visão Gerencial)
- **O status atual:** Não há uma visão acima do "Corretor".
- **Por que é essencial:** A coordenação da escola ou cursinho precisa ver: *Quantas redações faltam na fila total? Algum corretor está ocioso? Alguma redação estourou o prazo de X dias na fila?*

---

## 🚫 2. Funcionalidades Desnecessárias (Avoid Bloatware)
Evite investir tempo de desenvolvimento nessas áreas para o lançamento primário.

### 2.1 Chat / Mensageria entre Corretores
- **Por que não ter:** Redes de correção de ponta (ex: Redação Nota 1000) não estimulam que corretores debatam provas entre si via sistema. A correção é individual e o chat traria complexidade de moderação e banco de dados inútil no primeiro momento. Recomenda-se uso do WhatsApp ou Slack da equipe para dúvidas gerenciais.

### 2.2 Edição e "Reenvio" da Redação Original pelo Aluno no mesmo ticket
- **Por que não ter:** A redação não deve ser um "Google Docs" colaborativo. O aluno envia, recebe a nota (fechando o ciclo). Se ele refizer o texto com base no feedback, deve abrir **um novo ticket/upload**, contabilizando como uma nova correção.

---

## 🚀 3. Funcionalidades de Melhorias Contínuas (Fase 2 - Pós Lançamento)
Para evoluir o sistema 1 ou 2 meses após o lançamento oficial.

### 3.1 Macros (Respostas Rápidas)
- **O status:** Atualmente, o corretor precisa redigir do zero o campo de *Observação* em todo grifo ou em toda Competência.
- **A Melhoria:** Adicionar um sistema de "Snippets" ou "Macros". Botões como "Inserir texto de Fuga ao Tema" ou "Inserir texto de Erro de Vírgula", poupando digitação robótica e padronizando o feedback da escola.

### 3.2 IA Geradora do Comentário Geral Automático (Drafting)
- **O status:** O corretor precisa escrever o "Comentário Geral" como um resumo da prova.
- **A Melhoria:** Inserir um botão `[ ✨ Gerar Resumo via IA ]` que lê as notas dadas nas 5 competências pelo corretor, lê os grifos, e escreve um parágrafo acolhedor e consolidador para o aluno (Ex: *"Olá, Maria! Sua redação foi muito bem estruturada, mas você perdeu pontos na C1..."*). O corretor apenas lê e aperta "Salvar".

### 3.3 Visualizador de Imagem Padrão Escaneada (Duas Telas)
- **O status:** Atualmente consumimos texto puro (`redacao.texto`).
- **A Melhoria:** Invariavelmente, alunos escrevem à mão. Ter um modal ou gaveta lateral para abrir a foto original do manuscrito (scan) e dar zoom para tirar dúvidas textuais se a transcrição falhou.

---
## Resumo do Escopo Mínimo Viável (Plano de Ação)
Para o lançamento, o foco **DEVE** ser alocar tempo na criação do **Dashboard de Produtividade/Histórico do Corretor** e no alinharmento de **Como/Para Onde o aluno está trafegando as redações**. Todo o resto já possui altíssima maturidade e qualidade profissional.
