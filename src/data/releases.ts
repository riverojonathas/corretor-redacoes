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
    icon: string; // The name of a lucide-react icon
    colorClass: string;
}

export const EXAMPLES_FEATURES: FeaturePill[] = [
    {
        id: 'ai-assessment',
        title: 'IA Avaliadora (Beta)',
        shortDescription: 'Avaliações baseadas em critérios do ENEM com precisão.',
        fullDescription: 'Nossa Inteligência Artificial sugere correções avançadas com base nas 5 competências do ENEM, ela é constantemente treinada para melhorar a cada dia. Ela atualmente é capaz de avaliar estrutura, aprofundamento sociológico e desvios gramaticais. Como corretor, seu papel é revisar e garantir que nossas correções estejam de acordo com a qualidade da correção. Caso discorde de algum ponto, sinta-se livre destacar trechos e inserir observações. Através do seu trabalho será possível evoluir nossa Inteligência do jeito certo.',
        icon: 'Sparkles',
        colorClass: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    {
        id: 'highlight',
        title: 'Marca-texto & Comentários',
        shortDescription: 'Destaque trechos e atrele correções facilmente.',
        fullDescription: 'Ao corrigir uma redação, basta selecionar um trecho do texto do aluno para criar um destaque visual (Highlight) e adicionar um "balão" flutuante de observação atrelado exatamente àquele trecho.',
        icon: 'Pencil',
        colorClass: 'bg-accent-red/10 text-accent-red border-accent-red/20',
    },
    {
        id: 'smart-filters',
        title: 'Filtros Dinâmicos',
        shortDescription: 'Ache a redação que você quer corrigir em segundos.',
        fullDescription: 'O botão "Filtros e Busca" na Mesa do Corretor permite que você encontre textos pendentes (Corrigir Agora), em revisão. Excelente para organizar seu fluxo de trabalho.',
        icon: 'Search',
        colorClass: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
        id: 'reading-mode',
        title: 'Modo Leitura e Interface Unificada',
        shortDescription: 'Ambiente imersivo e interface de linha única.',
        fullDescription: 'Criamos um ambiente de distração zero onde Sidebar e Topbar são ocultados automaticamente. Além disso, unificamos todos os controles em uma única linha premium no topo, maximizando o espaço vertical para a leitura.',
        icon: 'Maximize',
        colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    }
];

export const EXAMPLES_RELEASES: ReleaseNote[] = [
    {
        id: 'v1.1',
        version: 'v1.1',
        date: 'Março 2026',
        title: 'Modo Leitura Imersivo e Interface Unificada',
        description: 'Implementação do Modo Leitura com ocultação de menus, unificação dos controles no cabeçalho (Single Row), cabeçalho de critérios compactado e melhorias na seção de avaliação final.',
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
