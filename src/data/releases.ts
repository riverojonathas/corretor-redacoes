export type ReleaseCategory = 'nova-feature' | 'melhoria' | 'bugfix';

export interface ReleaseNote {
    id: string;
    version: string;
    date: string;
    title: string;
    description: string;
    category: ReleaseCategory;
}

export interface FeaturePill {
    id: string;
    title: string;
    shortDescription: string;
    fullDescription: string;
    steps: string[];
    icon: string; // The name of a lucide-react icon
    colorClass: string;
}

export const EXAMPLES_FEATURES: FeaturePill[] = [
    {
        id: 'ai-assessment',
        title: 'IA Avaliadora (Beta)',
        shortDescription: 'Avaliações baseadas em critérios do ENEM com precisão.',
        fullDescription: 'Nossa Inteligência Artificial sugere correções avançadas com base nas 5 competências do ENEM, ela é constantemente treinada para melhorar a cada dia. Como corretor, seu papel é revisar, validar e garantir que nossas correções estejam de acordo com a qualidade da avaliação.',
        steps: [
            'Abra uma redação na Mesa do Corretor.',
            'No painel direito, clique na aba do critério que deseja revisar (ex: C1 - Norma Culta).',
            'Leia o comentário e a nota sugerida pela IA.',
            'Na seção "Avaliação da nota atribuída pela IA", indique se a nota está "Adequada" ou selecione o desvio (1pt acima/abaixo etc.).',
            'Ao finalizar todos os critérios, clique em "Finalizar Revisão".',
        ],
        icon: 'Sparkles',
        colorClass: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    {
        id: 'highlight',
        title: 'Marca-texto & Comentários',
        shortDescription: 'Destaque trechos e atrele correções facilmente.',
        fullDescription: 'Ao corrigir uma redação, basta selecionar um trecho do texto do aluno para criar um destaque visual (Highlight) e adicionar um "balão" flutuante de observação atrelado exatamente àquele trecho.',
        steps: [
            'Na Mesa do Corretor, certifique-se de que uma ferramenta de destaque está ativa no cabeçalho (verde, amarelo ou vermelho).',
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
        fullDescription: 'O painel de filtros na Mesa do Corretor permite que você encontre textos pendentes, em revisão ou finalizados. Excelente para organizar seu fluxo de trabalho e garantir que nenhuma redação fique sem revisão.',
        steps: [
            'Acesse o "Birô de Revisão" pelo menu lateral.',
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
        fullDescription: 'Criamos um ambiente de distração zero onde Sidebar e Topbar são ocultados automaticamente. Todos os controles estão unificados em uma única linha no topo, maximizando o espaço vertical para a leitura e correção.',
        steps: [
            'Na Mesa do Corretor, localize o ícone de tela cheia no cabeçalho.',
            'Clique no ícone para ativar o Modo Leitura.',
            'A Sidebar e o Topbar desaparecerão, expandindo a área de trabalho.',
            'Todas as ferramentas de correção permanecem acessíveis no cabeçalho superior.',
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
        description: 'Interface all-in-one com cabeçalho compacto de critérios, avaliação de adequação de nota por critério (C1-C5), métricas de dashboard corrigidas, bloco de suspeita de IA aproximado e correções de estabilidade do Turbopack.',
        category: 'melhoria'
    },
    {
        id: 'v1.1',
        version: 'v1.1',
        date: 'Março 2026',
        title: 'Modo Leitura Imersivo e Interface Unificada',
        description: 'Implementação do Modo Leitura com ocultação de menus, unificação dos controles no cabeçalho (Single Row), cabeçalho de critérios compactado, tipografia otimizada e nova avaliação de adequação da nota da IA.',
        category: 'melhoria'
    },
    {
        id: 'v1.0',
        version: 'v1.0',
        date: 'Março 2026',
        title: 'Lançamento do sistema de revisão de redações',
        description: 'Lançamento do sistema de revisão de redações com marca-texto e comentários, filtros dinâmicos e modo foco.',
        category: 'nova-feature'
    }
];
