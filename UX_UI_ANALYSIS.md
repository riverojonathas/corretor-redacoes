# Análise de UX/UI e Oportunidades de Melhoria
Data da Análise: Março de 2026

Este documento contém uma auditoria profunda de Experiência do Usuário (UX) e Interface do Usuário (UI) do sistema *Corretor de Redações*, com focos em usabilidade, escalabilidade visual, acessibilidade e fluidez.

---

## 1. Pontos Críticos de UX (Experiência do Usuário)

### 1.1 Fila de Revisão em Dispositivos Móveis (Mobile Responsiveness)
**O Problema:** A lista de redações (`view === 'list'`) é atualmente uma tabela (`<tr>`, `<td>`) densa. Usuários acessando por tablets menores ou celulares terão a tela "quebrada" ou precisarão de muito *scroll* horizontal.
**A Solução:** Implementar um design híbrido. Em telas `md` ou maiores, mantém a tabela. Em telas menores (`sm` e `mobile`), renderizar a lista em um formato de **Cards** (onde cada card mostra o Nick no topo, o Status numa tag ao lado, e o tema na linha de baixo).

### 1.2 Feedback Visual e *Toasts* de Notificação
**O Problema:** As mensagens de sucesso/erro (ao salvar rascunho ou finalizar a revisão) utilizam um estado simples de `message` que aparece em uma barra. Pode passar despercebido se a tela estiver rolada (embora já utilize posição fixa).
**A Solução:** Migrar para um sistema moderno de Toast Notifications (ex: `sonner` ou `react-hot-toast`). Trazem animações mais ricas, empilhamento de múltiplas notificações e ícones sem esforço, dando um aspecto *Premium* à ferramenta.

### 1.3 Loading States (Estados de Carregamento)
**O Problema:** Durante buscas no Supabase, vemos um *spinner* ou bolinha girando. Uma tela branca com um *spinner* central causa a sensação psicológica de maior lentidão.
**A Solução:** Implementar **Skeleton Loaders** (barras cinzas pulsantes com o formato do conteúdo que vai carregar). Ao abrir uma redação, mostrar falsas linhas de texto piscando até o texto real chegar.

### 1.4 Empty States (Estados Vazios)
**O Problema:** Se o corretor pesquisar um apelido e não achar nada (filtros ativos), ou se a fila de redação estiver zerada.
**A Solução:** Criar componentes visuais de *Empty State*: uma ilustração bonita ou ícone amigável (ex: uma pasta vazia da biblioteca `lucide-react`) com a frase "Nenhuma redação encontrada" e um botão "Limpar Filtros".

---

## 2. Pontos Críticos de UI (Interface do Usuário / Visual)

### 2.1 Leitura Prolongada (Readability) e Fadiga Ocular ✅ Resolvido
**O Problema:** Corretores leem redações o dia todo. O texto da redação está ocupando uma grande área branca.
**A Solução Documentada:** 
- Limitar a largura máxima da coluna de texto (`max-w-[70ch]`) da redação para o padrão ouro de leitura (cerca de 60-75 caracteres por linha). Linhas muito compridas geram fadiga visual.
- Aumentar dinamicamente o `line-height` (entalrelinhas) para 1.6 ou 1.8 no corpo da redação.
- Como "Wooooow Factor": Oferecer um botão rápido de *Modo Leitura / Modo Escuro (Dark Mode)* focado apenas na folha de redação para descansar a vista a noite.
*(Implementado em MesaCorretor.tsx: Max-width 70ch + Botão "Modo Leitura" adicionado)*

### 2.2 Popover de Grifos (Anotações)
**O Problema:** O corretor anota os grifos (amarelo, verde, vermelho) numa pequena caixa flutuante (`absolute`). Se o texto da observação for muito longo, a caixinha pode ficar desconfortável.
**A Solução:** Transformar a área de "Observação" (`textarea`) do popover em um campo com auto-resize (que aumenta conforme digita) e testar a prevenção de saída da tela (Collision Detection) para que a caixinha float não vaze para fora do monitor em monitores menores.

### 2.3 Acessibilidade (A11y)
**O Problema:** A maioria dos usuários usa mouse, mas para acessibilidade (e Power Users) a navegação via teclado importa. Além disso, botões que têm apenas ícone (ex. Configurações, Pin, Mover) nem sempre deixam óbvio para o que servem para um novato.
**A Solução:** 
- Adicionar `aria-labels` nos botões de ícone da `Topbar`.
- Implementar **Tooltips nativos ou via Radix UI**. Ao pairar o mouse em um ícone de `Pin`, mostrar a dica ("Fixar barra").

---

## 💡 Próximos Passos Imediatos de Alto Impacto
Dentre todos os itens, os 3 capazes de gerar mais impacto *UAU* e conforto com menor esforço são:
1. **Limitar a largura da linha e melhorar o line-height** da área do texto do estudante.
2. **Implementar os Tooltips** nos botões com ícones.
3. Adicionar **Skeleton Loaders** ou **Empty States** estéticos.
