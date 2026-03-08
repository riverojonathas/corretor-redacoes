# Guia de Deploy e Produção (Corretor de Redações)

Este documento detalha a estratégia de hospedagem, o processo de deploy contínuo (automático) e manual, bem como os procedimentos de *rollback* em caso de falhas.

## 1. Análise de Prontidão (Production Readiness)
A aplicação foi construída utilizando **Next.js** e **Supabase**.
- **Performance e UX:** A interface foi otimizada para leitura prolongada, possui feedback visual (Toasts, Skeletons) e não apresenta gargalos na renderização.
- **Banco de Dados:** O Supabase já está hospedado na nuvem e configurado.
- **Recomendação:** Estamos prontos para o lançamento da primeira versão em produção (v1.0.0). As pendências restantes de UX (Fila Mobile e Popover) não são bloqueantes para o lançamento oficial.

## 2. Escolha da Hospedagem (Hosting)
Para uma aplicação Next.js, a melhor plataforma gratuita e escalável do mercado é a **Vercel** (criadora do Next.js).
**Por que a Vercel?**
- **Gratuita (Hobby Tier):** Suporta até 100GB de banda por mês e 1.000 horas de execução de funções serverless, o que é mais do que suficiente para a demanda inicial de corretores analisando redações.
- **Performance Máxima:** A Vercel distribui a aplicação globalmente (Edge Network), garantindo carregamento rápido.
- **Deploys Automáticos:** Integração nativa com o GitHub. A cada *push* na branch `main`, a Vercel compila e coloca a nova versão no ar automaticamente.
- **Rollbacks Instantâneos:** Se uma versão com erro for ao ar, é possível reverter para a versão anterior com um único clique (ou comando).

## 3. Processos de Deploy

### 3.1. Deploy Automático (Recomendado via GitHub)
Esta é a maneira ideal de manter a aplicação em produção.
1. Acesse [vercel.com](https://vercel.com/) e crie uma conta usando seu GitHub.
2. Clique em **"Add New..." > "Project"**.
3. Importe o repositório `corretor-redacoes`.
4. Em **Environment Variables**, adicione as chaves do Supabase (as mesmas que estão no `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Clique em **Deploy**.

A partir desse momento, **qualquer `git push`** que fizermos para a branch `main` irá disparar um deploy automático!

### 3.2. Deploy Manual via Terminal (Comandos "por aqui")
Se prefirir gerenciar os deploys diretamente do terminal sem depender de um *push* no GitHub, usamos a ferramenta de linha de comando oficial da Vercel.

**Comando para testar um deploy (Preview):**
```bash
npx vercel
```
*Ele pedirá login na primeira vez. Ele gera um link temporário para você testar as mudanças.*

**Comando para mandar direto para Produção:**
```bash
npx vercel --prod
```

## 4. Gestão de Versões e Rollbacks

### O que é um Rollback?
Se uma nova versão (`v1.1.0`) for para produção e apresentar um erro crítico (ex: a tela de correção ficar branca), o rollback consiste em voltar o tráfego de usuários imediatamente para a versão anterior que estava funcionando (`v1.0.0`), enquanto os desenvolvedores resolvem o problema nos bastidores.

### Como fazer Rollback Instantâneo

**Opção A: Pelo Terminal (Vercel CLI)**
1. Liste os deploys antigos:
```bash
npx vercel ls
```
2. Escolha a URL do deploy que estava funcionando e execute o rollback:
```bash
npx vercel rollback <url-do-deploy-antigo>
```
*Exemplo: `npx vercel rollback corretor-redacoes-8x9y0z.vercel.app`*

**Opção B: Pelo Painel da Vercel (Mais Fácil)**
1. Acesse seu painel na Vercel e vá no projeto `corretor-redacoes`.
2. Vá na aba **Deployments**.
3. Encontre o último deploy que estava bem, clique nos três pontinhos (`...`) e selecione **"Promote to Production"** ou **"Rollback"**. 
Em questão de 1 segundo, o site antigo volta pro ar, sem tempo de inatividade para os corretores.

## 5. Próximos Passos Iniciais
1. Rodar `npm run build` localmente para garantir que não há erros de tipagem impedindo o empacotamento.
2. Criar a conta na Vercel e conectar este repositório.
3. Configurar as variáveis de ambiente na Vercel na criação do projeto.

---

## 6. Prevenção de Falhas: Como NÃO subir código quebrado para Produção

Para evitar que funcionalidades incompletas (como uma tela de popover sendo desenvolvida pela metade) sejam enviadas aos usuários finais, vamos adotar o padrão básico do **Git Flow** combinado com os **Preview Deployments** (Deploys de Homologação) da Vercel.

### A Estratégia de Branches
Você não deve codificar funcionalidades novas diretamente na branch `main`.
A `main` é o que chamamos de **A Verdade Absoluta**. Se o código está lá, ele está no ar.

**O Fluxo de Trabalho (Workflow):**
1. **Nova Funcionalidade:** Quando for criar algo novo (ex: "Tooltips"), crie uma nova *branch* a partir da `main`:
   ```bash
   git checkout -b feature/tooltip-acessibilidade
   ```
2. **Desenvolva e Comite:** Salve seu trabalho normalmente nessa branch nova.
   ```bash
   git add .
   git commit -m "feat: in progress tooltip"
   ```
3. **Mande para a Vercel (Homologação / Staging):** Quando você mandar essa branch para o GitHub (`git push origin feature/tooltip-acessibilidade`), a Vercel é inteligente. Por padrão, ela **não** vai enviar isso para produção. Em vez disso, ela vai criar uma URL temporária secreta (ex: `corretor-redacoes-git-feature-tooltip-seuusuario.vercel.app`) para você testar como ficou "em produção".
4. **Validação:** Você entra nesse link temporário, testa tudo. Se tiver algo errado, ninguém viu, pois a produção (`main`) intacta.
5. **Merge e Lançamento:** Apenas quando a funcionalidade estiver 100% testada e garantida, você volta para a `main` e puxa as alterações (ou cria um *Pull Request* no GitHub).
   ```bash
   git checkout main
   git merge feature/tooltip-acessibilidade
   git push origin main
   ```
   *E *agora sim*, o push na `main` dispara o deploy real que vai para os seus usuários finais.*
