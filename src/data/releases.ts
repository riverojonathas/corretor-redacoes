export type ReleaseCategory = 'nova-feature' | 'melhoria' | 'bugfix';

export interface ReleaseChange {
    section: string;
    items: string[];
}

export interface ReleaseNote {
    id: string;
    version: string;
    date: string;
    title: string;
    description: string;
    category: ReleaseCategory;
    changes?: ReleaseChange[]; // Detalhes completos por seção
}

export interface FeaturePill {
    id: string;
    title: string;
    shortDescription: string;
    fullDescription: string;
    steps: string[];
    icon: string;
    colorClass: string;
}

export const EXAMPLES_FEATURES: FeaturePill[] = [
    {
        id: 'ai-assessment',
        title: 'IA Avaliadora (Beta)',
        shortDescription: 'Avaliações baseadas em critérios do ENEM com precisão.',
        fullDescription: 'Nossa Inteligência Artificial sugere correções com base nas 5 competências do ENEM. Como corretor, seu papel é revisar, validar e garantir que as notas estejam corretas — inclusive indicando se discorda e em quanto.',
        steps: [
            'Abra uma redação na Mesa do Corretor.',
            'No painel direito, clique na aba do critério que deseja revisar (ex: C1 - Norma Culta).',
            'Leia o comentário e a nota sugerida pela IA.',
            'Na seção "Avaliação da nota atribuída pela IA", indique se está "Adequada" ou selecione o desvio (1pt acima/abaixo etc.).',
            'Ao finalizar todos os critérios, clique em "Finalizar Revisão".',
        ],
        icon: 'Sparkles',
        colorClass: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    {
        id: 'highlight',
        title: 'Marca-texto & Comentários',
        shortDescription: 'Destaque trechos e atrele correções facilmente.',
        fullDescription: 'Ao corrigir uma redação, selecione qualquer trecho do texto para criar um destaque visual e adicionar um balão de observação atrelado àquele trecho específico.',
        steps: [
            'Na Mesa do Corretor, ative uma ferramenta de destaque no cabeçalho (verde, amarelo ou vermelho).',
            'Selecione com o mouse o trecho do texto que deseja marcar.',
            'O trecho será colorido na cor da ferramenta ativa.',
            'Para adicionar uma observação, clique no trecho destacado e um balão de texto aparecerá.',
            'Para remover um destaque, clique nele com a borracha ativa.',
        ],
        icon: 'Pencil',
        colorClass: 'bg-accent-red/10 text-accent-red border-accent-red/20',
    },
    {
        id: 'smart-filters',
        title: 'Filtros Dinâmicos',
        shortDescription: 'Ache a redação que você quer corrigir em segundos.',
        fullDescription: 'O painel de filtros na Mesa de Revisão permite encontrar textos pendentes, em revisão ou finalizados de forma precisa. Use filtros combinados para organizar o seu fluxo.',
        steps: [
            'Acesse a "Mesa de Revisão" pelo menu lateral.',
            'Use a barra de busca para pesquisar pelo Nick ou Tema da redação.',
            'Use os filtros de "Status" e "Série" para refinar a lista.',
            'Clique em uma redação da lista para abri-la na Mesa do Corretor.',
        ],
        icon: 'Search',
        colorClass: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
        id: 'reading-mode',
        title: 'Modo Leitura e Interface Unificada',
        shortDescription: 'Ambiente imersivo e interface de linha única.',
        fullDescription: 'Criamos um ambiente de distração zero onde Sidebar e Topbar são ocultados. Todos os controles estão unificados em uma única linha no topo, maximizando o espaço para leitura e correção.',
        steps: [
            'Na Mesa do Corretor, localize o ícone de tela cheia no cabeçalho.',
            'Clique no ícone para ativar o Modo Leitura.',
            'A Sidebar e o Topbar desaparecerão, expandindo a área de trabalho.',
            'Todas as ferramentas de correção permanecem acessíveis no cabeçalho.',
            'Clique no ícone novamente para sair do Modo Leitura.',
        ],
        icon: 'Maximize',
        colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    }
];

export const EXAMPLES_RELEASES: ReleaseNote[] = [
    {
        id: 'v1.2',
        version: 'v1.2',
        date: 'Março 2026',
        title: 'Interface Unificada, Auditoria de IA e Correções Gerais',
        description: 'Interface all-in-one com cabeçalho compacto, auditoria de nota por critério, métricas do dashboard corrigidas e correções de estabilidade.',
        category: 'melhoria',
        changes: [
            {
                section: '📏 Interface Unificada (Single Row Layout)',
                items: [
                    'Cabeçalho All-in-One: todos os controles (Sair, Critérios, Ferramentas, Salvar/Finalizar) em uma única linha.',
                    'Cabeçalho de Critérios Compacto: nome e descrição em uma linha (ex: C1 - Norma Culta), reduzindo a ocupação vertical.',
                    'Tipografia Otimizada: fonte da redação e margens ajustadas para mais conteúdo visível.',
                    'Bloco de IA Aproximado: distância reduzida entre o texto e o switch de "Suspeita de IA".',
                    'Ícones sem Poluição: rótulos de texto substituídos por ícones elegantes com Tooltips.',
                    'Eliminação do Rodapé: barra inferior removida; ações migradas para o topo.',
                ],
            },
            {
                section: '📊 Avaliação de Adequação da Nota IA',
                items: [
                    'Validação por Critério: o revisor agora valida a nota da IA em cada um dos 5 critérios.',
                    'Escala de Desvio: opções de "Adequada" ou desvios específicos (+/- 1pt, 2pts, >2pts).',
                    'Fluxo Rigoroso: conclusão do critério exige preenchimento dos 4 campos de avaliação.',
                ],
            },
            {
                section: '📚 Modo Leitura Focado',
                items: [
                    'Ocultação Global: Sidebar e Topbar desaparecem ao ativar o modo leitura.',
                    'Expansão de Conteúdo: área de trabalho ocupa 100% da largura.',
                    'Persistência de Ferramentas: votação, comentários e grifos permanecem acessíveis.',
                ],
            },
            {
                section: '🛡️ Segurança e Integridade',
                items: [
                    'Flag de Suspeita de IA: botão dedicado com campo de justificativa.',
                    'Proteção contra Alterações Não Salvas: confirmação antes de sair da mesa.',
                    'Fluxo de Navegação Corrigido: botão "Sair da Mesa" retorna corretamente para a fila.',
                ],
            },
            {
                section: '🎨 Conforto Visual e Limpeza de Dados',
                items: [
                    'Tema Sépia Global: fundo #fdfaf2 extendido para todas as páginas do sistema.',
                    'Sanitização Inteligente de Texto: remoção de sequências literais de escape (\\n, \\t) que poluíam os textos.',
                    'Preservação de Grifos: índices de destaques ajustados automaticamente após limpeza do texto.',
                    'Métricas do Dashboard Corrigidas: "Modelos Disponíveis" usa redacao_tema; "Nota Média Geral" calcula a soma real das competências.',
                ],
            },
            {
                section: '🏗️ Refatoração e Performance',
                items: [
                    'Componentização: lógica modularizada em RedacaoList, CorrectionHeader e HighlightTools.',
                    'Performance do IDE: redução drástica no tamanho do arquivo principal.',
                    'Correção de Turbopack: erros de sintaxe na Topbar que causavam crash na tela de Upload resolvidos.',
                ],
            },
            {
                section: '✨ Nova Seção de Avaliação Final (Acordeão)',
                items: [
                    'Sanfona Automática: abre o próximo campo a ser preenchido e minimiza os completos.',
                    'Botões de Opção (Pills): dropdowns substituídos por botões de clique único.',
                    'Feedback Visual Inteligente: tons de verde para correto, vermelho/laranja para incorreto.',
                    'Indicadores de Status em tempo real para cada bloco.',
                ],
            },
            {
                section: '🎫 Central de Ajuda — Acompanhamento de Chamados',
                items: [
                    'Chamados Registrados: ao enviar uma sugestão ou reporte de erro, o chamado é registrado e acompanhável.',
                    'Modal de Sucesso: após o envio, o modal exibe confirmação e link direto para Ver Meus Chamados.',
                    'Aba "Meus Chamados" em Configurações: listagem de todos os chamados do usuário com status colorido (Aguardando análise, Em análise, Resolvido).',
                    'Changelog Completo por Release: cada versão na Central do Corretor agora exibe o histórico detalhado em modal fullscreen.',
                ],
            },
            {
                section: '🔒 Sistema de Lock — Sem Mais Trabalho Duplicado',
                items: [
                    'Proteção de Revisão: ao abrir uma redação, o sistema registra que você está revisando — outros corretores são avisados e direcionados para outra redação.',
                    'Renovação Automática: o lock é renovado a cada 10 minutos enquanto você estiver na mesa, sem nenhuma ação necessária.',
                    'Expiração Inteligente: se você fechar o navegador ou ficar inativo por 30 minutos, o lock é liberado automaticamente para a fila.',
                    'Badge "Em uso" na Fila: redações sendo revisadas no momento aparecem com um indicador laranja na lista.',
                    'Tela de Bloqueio Graciosa: ao tentar abrir uma redação em uso, uma tela informativa orienta a escolher outra.',
                ],
            },
            {
                section: '⚡ Performance — Filtros e Carregamento',
                items: [
                    'Filtros Server-side: buscas por Tema, Nick e Série agora são executadas diretamente no banco — zero travamento, mesmo com milhares de redações.',
                    'Debounce de 300ms: o banco só é consultado quando você para de digitar, economizando requisições.',
                    'Paginação na Fila: a lista carrega 50 redações por vez com botão "Carregar mais", eliminando longos tempos de carregamento inicial.',
                    'Dashboard Otimizado: métricas calculadas por Views SQL no banco — carregamento em menos de 50ms independente do volume de redações.',
                    '5 Índices no Banco: criados índices nas colunas críticas (answer_id, corretor_id, redacao_id, tema) — queries entre 5× e 200× mais rápidas.',
                ],
            },
            {
                section: '🏗️ Refatoração e Performance do MesaCorretor',
                items: [
                    'Arquivo Principal -49%: MesaCorretor.tsx reduzido de 1.376 para 706 linhas, eliminando travamentos de build no Turbopack.',
                    'CriterioPanel: painel de avaliação extraído para componente dedicado, com re-renders mais precisos.',
                    'Hook useCorrectionState: estado de formulário, destaques e dirty tracking isolados em hook reutilizável.',
                    'Modais Independentes: CriterioInfoModal e ExitConfirmModal agora são componentes autônomos.',
                    'sanitizeTextWithHighlights migrado para lib/textUtils (utilitário compartilhado).',
                ],
            },
            {
                section: '📈 Capacidade do Sistema — Antes e Depois da v1.2',
                items: [
                    'Redações na base: de ~5.000 redações suportadas para mais de 500.000 — um crescimento de 100× na capacidade real do banco.',
                    'Dashboard sem travar: antes quebrava com 10.000 redações; agora carrega em menos de 50ms com qualquer volume.',
                    'Fila de revisão: antes travava com 5.000+ itens na lista; agora responde em menos de 50ms mesmo com 100.000 redações.',
                    'Corretores simultâneos sem colisão: de 1–5 corretores para até 50 trabalhando em paralelo sem conflito, graças ao sistema de lock.',
                    'Queries no banco: até 200× mais rápidas nas operações críticas (abertura de mesa, busca por answer_id, listagem de revisões).',
                ],
            },
        ],
    },


    {
        id: 'v1.1',
        version: 'v1.1',
        date: 'Março 2026',
        title: 'Modo Leitura Imersivo e Interface Unificada',
        description: 'Modo Leitura com ocultação de menus, controles unificados no cabeçalho, cabeçalho de critérios compactado e tipografia otimizada.',
        category: 'melhoria',
        changes: [
            {
                section: '📖 Central de Ajuda e Critérios',
                items: [
                    'Modal de Explicação: tooltips substituídos por modal centralizado em fonte serifada sobre fundo sépia.',
                    'Sanitização de Descrições: limpeza automática de caracteres de formatação.',
                    'Nomes Dinâmicos: nomes e enunciados reais carregados das propostas.',
                ],
            },
            {
                section: '📋 Critérios Dinâmicos',
                items: [
                    'Nomes Personalizados: enunciado real do critério exibido abaixo de "Competência X".',
                    'Suporte a N Competências: interface se adapta a qualquer número de critérios.',
                ],
            },
        ],
    },
    {
        id: 'v1.0',
        version: 'v1.0',
        date: 'Março 2026',
        title: 'Lançamento do sistema de revisão de redações',
        description: 'Lançamento com marca-texto e comentários, filtros dinâmicos e modo foco.',
        category: 'nova-feature',
        changes: [
            {
                section: '🚀 Funcionalidades Iniciais',
                items: [
                    'Mesa do Corretor com painel dual (redação + formulário de avaliação).',
                    'Marca-texto com 3 cores (verde, amarelo, vermelho) e balões de observação.',
                    'Filtros por Status, Nick e Tema na Mesa de Correção.',
                    'Modo Foco para leitura imersiva.',
                    'Salvar Rascunho e Finalizar Revisão.',
                ],
            },
        ],
    }
];
