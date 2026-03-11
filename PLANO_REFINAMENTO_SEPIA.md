# Plano de Refinamento do Tema Sépia

Após revisar as capturas de tela, o sistema ganhou uma estética muito mais premium e confortável ("modo papel"). No entanto, identifiquei alguns pontos onde a usabilidade e a harmonia visual podem ser melhoradas.

## 1. Contraste e Acessibilidade
- [ ] **Labels Secundários**: O uso de `text-gray-400` sobre o fundo `#fdfaf2` (sépia) resulta em um contraste baixo (aprox. 2.5:1), o que dificulta a leitura para alguns usuários.
    - **Proposta**: Escurecer esses textos para `text-gray-500` ou `text-dark-gray/60` em todo o sistema.
- [ ] **Sidebar**: Os ícones inativos na barra lateral podem ter seu contraste levemente aumentado.

## 2. Consistência da Mesa de Correção
- [ ] **Rodapé (Footer)**: A barra inferior onde ficam os botões "Salvar" e "Finalizar" parece estar com fundo branco puro.
    - **Proposta**: Aplicar `bg-[#fdfaf2]/80` com `backdrop-blur` e uma borda superior `#eee9df` para manter a continuidade visual do tema.
- [ ] **Abas de Critérios**: As cores de status (verde para concluído, âmbar para selecionado) estão um pouco vibrantes demais para o tom terroso do sistema.
    - **Proposta**: Suavizar esses tons para versões mais "pastéis/terrosas" que harmonizem com o sépia.

## 3. Hierarquia Visual e Feedback
- [ ] **Cards do Dashboard**: As "Ações Rápidas" poderiam ter um feedback de hover mais claro (ex: uma borda `#cc6666/30` ou uma sombra mais profunda).
- [ ] **Card de Suspeita de IA**: Atualmente ele está no final da redação. Podemos dar a ele uma borda sutil ou um fundo `white/20` para que ele pareça um bloco de informação bem definido, e não apenas um texto solto.

## 4. Tipografia
- [ ] **Espaçamento**: O texto da redação está excelente na fonte serifada, mas podemos aumentar o `line-height` (leading) para `leading-relaxed` ou `leading-[1.8]` para tornar a leitura ainda mais fluida, simulando livros de alta qualidade.

---
> [!NOTE]
> Este plano visa apenas ajustes finos de polimento. O coração do tema está sólido e muito bonito.
