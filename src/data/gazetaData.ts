export interface GazetaNewsItem {
  tag: string;
  tagColorClass: string;
  borderColorClass: string;
  title: string;
  snippet: string;
}

export interface GazetaArticle {
  title: string;
  author: string;
  category: string;
  content: string[];
  quote: string;
}

export interface GazetaData {
  news: GazetaNewsItem[];
  article: GazetaArticle;
}

export const GAZETA_BY_ACTIVITY: Record<string, GazetaData> = {
  "entalho em madeira": {
    news: [
      {
        tag: "Resiliência",
        tagColorClass: "text-emerald-600 bg-emerald-50",
        borderColorClass: "border-emerald-500",
        title: "Oficinas de Entalho Preservadas",
        snippet: "Grupos de artesãos resistem à industrialização ensinando a paciência das goivas e o respeito à direção das ranhuras naturais da madeira."
      },
      {
        tag: "Cardiofoco",
        tagColorClass: "text-[#2541B2] bg-[#2541B2]/5",
        borderColorClass: "border-[#2541B2]",
        title: "Redução da Pulsação Cardíaca",
        snippet: "Estudo revela queda de 15% em indícios de ansiedade motora ao regular a força do formão contra nós de freixo e pinho."
      },
      {
        tag: "Neurocraft",
        tagColorClass: "text-teal-600 bg-teal-50",
        borderColorClass: "border-teal-500",
        title: "Heurística Tridimensional",
        snippet: "Pesquisas mapeiam como decisões ágeis tomadas ao encontrar fendas ou imperfeições na madeira treinam o raciocínio geométrico."
      }
    ],
    article: {
      title: "A Poética do Formão e a Resistência da Fibra",
      author: "Alberto Caeiro da Silva",
      category: "Escultura Contemplativa",
      content: [
        "Entalhar a madeira é entrar em acordo solene com as florestas do passado. Cada veio é uma testemunha do tempo, cada nó, um obstáculo orgânico que exige reverência, astúcia e cuidado constante, e não força bruta.",
        "Ao contrário das telas líquidas que se dobram e fluem à menor pressão de nossos dedos, a madeira sólida reage. Ela impõe limites firmes e exige do formão uma angulação milimétrica acompanhada por um ritmo estável de respiração."
      ],
      quote: "O corte perfeito não nasce do braço que empurra, mas dos olhos dedicados a ouvir a fibra."
    }
  },
  "leitura analógica": {
    news: [
      {
        tag: "Bibliocraft",
        tagColorClass: "text-emerald-600 bg-emerald-50",
        borderColorClass: "border-emerald-500",
        title: "O Peso Sólido do Papel",
        snippet: "Leitores redescobrem o magnetismo sensorial do papel de alta gramatura e encadernações costuradas como refúgio definitivo contra telas."
      },
      {
        tag: "Foco",
        tagColorClass: "text-[#2541B2] bg-[#2541B2]/5",
        borderColorClass: "border-[#2541B2]",
        title: "Fixação Cognitiva no Papel",
        snippet: "Neurologistas confirmam que a retenção cerebral de conceitos detalhados e tramas é até 3 vezes superior em edições físicas."
      },
      {
        tag: "Ritual",
        tagColorClass: "text-teal-600 bg-teal-50",
        borderColorClass: "border-teal-500",
        title: "Clubes de Silêncio Absoluto",
        snippet: "Metrópoles registram aumento na demanda por cafés livres de Wi-Fi, dedicados exclusivamente à leitura profunda compartilhada."
      }
    ],
    article: {
      title: "O Sagrado Peso da Palavra Impressa",
      author: "Inês de Castro",
      category: "Filosofia Literária",
      content: [
        "Na rapidez da informação digital, lemos em diagonal, dispersos sob uma cascata de hiperlinks e alertas. A página física, pelo contrário, atua como uma âncora; seu peso nas mãos limita nossa velocidade, convidando ao mistério do recolhimento.",
        "O cheiro das fibras antigas e o relevo tátil dos grafemas na folha acalmam o córtex pré-frontal, criando um templo impenetrável onde o pensamento pode, finalmente, reinar com dignidade."
      ],
      quote: "Fechar e silenciar o ecrã para abrir um livro físico é o maior ato político de autocracia mental."
    }
  },
  "caligrafia clássica": {
    news: [
      {
        tag: "Estética",
        tagColorClass: "text-emerald-600 bg-emerald-50",
        borderColorClass: "border-emerald-500",
        title: "Resgate dos Papéis de Algodão",
        snippet: "Artesãos calígrafos voltam a utilizar prensas tradicionais para fabricar suportes idênticos aos códices de séculos passados."
      },
      {
        tag: "Sinapses",
        tagColorClass: "text-[#2541B2] bg-[#2541B2]/5",
        borderColorClass: "border-[#2541B2]",
        title: "Fisiologia da Tinta Nanquim",
        snippet: "Ajustar ritmicamente a densidade do nanquim induz o cérebro a frequências teta de relaxamento profundo e harmonia motora."
      },
      {
        tag: "Grafia",
        tagColorClass: "text-teal-600 bg-teal-50",
        borderColorClass: "border-teal-500",
        title: "Retorno dos Bicos de Pena",
        snippet: "Fundições tradicionais em Birmingham registram recordes na fabricação de penas de ponta de metal flexível para artesãos."
      }
    ],
    article: {
      title: "O Caminho do Traço Humilde",
      author: "Wang Xizhi (Trad.)",
      category: "Escrita da Presença",
      content: [
        "Cada caractere desenhado à mão com pena ou pincel é um autorretrato do instante corrente. A pressão exercida contra a folha, o ângulo de ataque e a suspensão da respiração no início do traço espelham a alma do calígrafo.",
        "Diferente daquilo que é digitado sob um teclado comum — onde cada caractere é padronizado e frio —, a caligrafia clássica abraça e estiliza o erro, glorificando a singularidade incorruptível do mililitro de tinta."
      ],
      quote: "Governar as curvas da caneta-tinteiro é guiar os cavalos selvagens do intelecto disperso."
    }
  },
  "desenho técnico": {
    news: [
      {
        tag: "Geometria",
        tagColorClass: "text-emerald-600 bg-emerald-50",
        borderColorClass: "border-emerald-500",
        title: "Grafites de Alta Pureza",
        snippet: "Profissionais de projeto redescobrem a nitidez e o prazer tátil do chumbo mineral sobre folhas translúcidas de papel vegetal."
      },
      {
        tag: "Precisão",
        tagColorClass: "text-[#2541B2] bg-[#2541B2]/5",
        borderColorClass: "border-[#2541B2]",
        title: "O Silêncio dos Milímetros",
        snippet: "Ergonomistas cognitivos indicam que manipular escalas e compassos físicos atua como excelente terapia preventiva contra estresse visual."
      },
      {
        tag: "Escala",
        tagColorClass: "text-teal-600 bg-teal-50",
        borderColorClass: "border-teal-500",
        title: "Ateliês Clássicos Reinstituídos",
        snippet: "Escolas europeias voltam a exigir pranchetas mecânicas nos primeiros semestres para fixar conceitos de proporção e espacialidade."
      }
    ],
    article: {
      title: "As Linhas Limpíssimas da Perspectiva Real",
      author: "Leon-Battista Alberti",
      category: "Geometria Contemplativa",
      content: [
        "A integridade de uma reta desenhada a lápis sobre a prancheta de desenho técnico está intimamente relacionada à virtude de quem a traça. Não há retificações automáticas ou truques ópticos; a geometria é implacável e nobre.",
        "Ao governar os escudos de apagamento, as réguas paralelas e o compasso pesado de latão, o desenhista físico reaprende a focar o olhar em zonas restritas de precisão milimétrica absoluta."
      ],
      quote: "O desenho técnico à mão é o matrimônio perfeito entre o rigor da matemática e a cadência humana."
    }
  },
  "jardinagem minuciosa": {
    news: [
      {
        tag: "Botânica",
        tagColorClass: "text-emerald-600 bg-emerald-50",
        borderColorClass: "border-emerald-500",
        title: "O Vazio dos Bonsais",
        snippet: "Estudo confirma que o exame visual atento de apenas 10 minutos sobre a ramificação de um bonsai acalma batimentos cardíacos."
      },
      {
        tag: "Matéria",
        tagColorClass: "text-[#2541B2] bg-[#2541B2]/5",
        borderColorClass: "border-[#2541B2]",
        title: "Benefício Microbiano do Solo",
        snippet: "O contato manual periódico com compostos orgânicos e argila estimula neurotransmissores ligados ao bem-estar e autoestima."
      },
      {
        tag: "Estações",
        tagColorClass: "text-teal-600 bg-teal-50",
        borderColorClass: "border-teal-500",
        title: "O Tempo da Seiva Lenta",
        snippet: "Especialistas defendem a jardinagem meticulosa como antídoto ao cansaço provocado pelo ritmo frenético de atualizações de redes."
      }
    ],
    article: {
      title: "O Foco Verde sob a Poda Silenciosa",
      author: "Yukio Mishima",
      category: "Paciência Botânica",
      content: [
        "Sentar-se de frente a um pequeno arbusto silvestre e examinar com precisão os ângulos da folhagem para o corte de sol é penetrar no próprio fluxo do tempo cósmico. No reino botânico, a impaciência de um segundo é tola.",
        "Ao moldar delicadamente os finos galhos com fios metálicos de cobre, o arborista passa a escutar com profundo respeito os caminhos naturais e os nós estruturais da própria vida da planta."
      ],
      quote: "A jardinagem minuciosa não molda apenas o galho vegetal; ela arruma as dobras de nossa própria paciência."
    }
  },
  "costura de precisão": {
    news: [
      {
        tag: "Alfaiataria",
        tagColorClass: "text-emerald-600 bg-emerald-50",
        borderColorClass: "border-emerald-500",
        title: "Valor do Ponto Invisível",
        snippet: "Salas de alfaiataria em Milão iniciam protestos poéticos em prol do resgate de costuras de acabamentos e casas feitas à mão."
      },
      {
        tag: "Tátil",
        tagColorClass: "text-[#2541B2] bg-[#2541B2]/5",
        borderColorClass: "border-[#2541B2]",
        title: "Ancoragem pela Ponta dos Dedos",
        snippet: "A manipulação constante de agulhas e tecidos rugosos como linho e lã diminui níveis de tremores neurológicos causados por estresse."
      },
      {
        tag: "Trama",
        tagColorClass: "text-teal-600 bg-teal-50",
        borderColorClass: "border-teal-500",
        title: "O Magnetismo do Fio de Seda",
        snippet: "Artesãos defendem as horas silenciosas passadas fiando ou tecendo fibras tradicionais como reabilitação para foco de estudantes."
      }
    ],
    article: {
      title: "A Trama das Horas Costurada pela Calma",
      author: "Gabrielle de Chalon",
      category: "Arte dos Tecidos",
      content: [
        "A agulha de aço cirúrgico que penetra e atravessa o pano guia um caminho meditativo sutil. Cada ponto dado deve manter simetria perfeita com o anterior; afinal, a pressa de um único nó pode deforma o caimento.",
        "Quem se debruça sobre retalhos de algodão ou linho natural reconstrói seu próprio tempo de consumo. O ritmo lento do dedal previne o espírito contra o consumo estéril do efêmero urbano."
      ],
      quote: "Tecidos costurados com carinho manual costuram também as brechas de nossas almas fragmentadas."
    }
  },
  "miniaturas & maquetes": {
    news: [
      {
        tag: "Escala",
        tagColorClass: "text-emerald-600 bg-emerald-50",
        borderColorClass: "border-emerald-500",
        title: "Casas de Bonecas Microscópicas",
        snippet: "Marceneiros aplicam conhecimentos de micro-esculpimento para restaurar e recriar interiores históricos sobre escalas de 1:120."
      },
      {
        tag: "Habilidade",
        tagColorClass: "text-[#2541B2] bg-[#2541B2]/5",
        borderColorClass: "border-[#2541B2]",
        title: "Concentração com Lente de Relógio",
        snippet: "Arquitetos miniaturistas apontam o foco em telhas de madeira balsa de 1 milímetro como excelente exercício de respiração contida."
      },
      {
        tag: "Arte",
        tagColorClass: "text-teal-600 bg-teal-50",
        borderColorClass: "border-teal-500",
        title: "Maquetes de Algodão Puro",
        snippet: "Pesquisadores explicam que planejar e esculpir pequenos volumes tridimensionais ativa o córtex motor responsável pelo equilíbrio."
      }
    ],
    article: {
      title: "O Universo Inteiro no Vão Dun Milímetro",
      author: "Gaston Bachelard",
      category: "Espaço Contemplativo",
      content: [
        "Ao encolher o mundo em direção à delicadeza do infinitamente menor, o miniaturista é compelido ao respeito supremo pelo limite. Cada vento brusco pode desalinhar as treliças de balsa; cada gota de cola excessiva borra o vidro.",
        "Nesta futilidade de escala microscópica, as notificações urgentes dos dispositivos eletrônicos desaparecem por completo. O foco inteiro se volta ao alinhamento perfeito do leme de um pequenino barco."
      ],
      quote: "A pequeneza do objeto real exige a maior amplificação e solenidade de nossa mente atenta."
    }
  },
  "meditação profunda": {
    news: [
      {
        tag: "Mapeamento",
        tagColorClass: "text-emerald-600 bg-emerald-50",
        borderColorClass: "border-emerald-500",
        title: "O Vazio Magnético",
        snippet: "Ressonâncias indicam que suspender do smartphone por 1 hora pré-meditação expande em até 25% o vigor cognitivo imediato."
      },
      {
        tag: "Fisiologia",
        tagColorClass: "text-[#2541B2] bg-[#2541B2]/5",
        borderColorClass: "border-[#2541B2]",
        title: "Coerência Cardíaco-Pulmonar",
        snippet: "Ciclos de expiração contínua induzem reflexos autonômicos profundos, estabilizando e restaurando as barreiras celulares."
      },
      {
        tag: "Retiros",
        tagColorClass: "text-teal-600 bg-teal-50",
        borderColorClass: "border-teal-500",
        title: "O Retorno ao Silêncio Puro",
        snippet: "Praticantes relatam suspensão quase completa da fadiga visual decorrente de excessos de luminosidade em retiros sem energia elétrica."
      }
    ],
    article: {
      title: "A Sagrada Ciência de Sentar e Não-Fazer",
      author: "Mestre Dōgen (Trad.)",
      category: "Teologia do Silêncio",
      content: [
        "A meditação verdadeira não se reduz a pensar ou conter ideias; trata-se de experimentar de forma incontestável a força do respirar. Sob o bombardeio comunicativo diário, esquecemos o simples peso de nossas próprias pálpebras.",
        "Sentar-se em recolhimento absoluto, observando a passagem das fumaças de incenso ou o arfante peito, representa a descolonização silenciosa de nossas escolhas e de nossa vitalidade."
      ],
      quote: "Quem possui o refúgio do silêncio mental reina imperturbável no meio do barulho das tempestades urbanas."
    }
  },
  "manutenção mecânica": {
    news: [
      {
        tag: "Metalurgia",
        tagColorClass: "text-emerald-600 bg-emerald-50",
        borderColorClass: "border-emerald-500",
        title: "Restauro de Engrenagens de Latão",
        snippet: "Mestres relojoeiros realizam simpósios em defesa da manutenção mecânica inteiramente manual de cronógrafos e eixos antigos."
      },
      {
        tag: "Fricção",
        tagColorClass: "text-[#2541B2] bg-[#2541B2]/5",
        borderColorClass: "border-[#2541B2]",
        title: "O Som e Alinhamento das Peças",
        snippet: "Relatos indicam que limpar e alinhar engrenagens mecânicas lubrificadas manualmente reduz distúrbios de desatenção motora."
      },
      {
        tag: "Química",
        tagColorClass: "text-teal-600 bg-teal-50",
        borderColorClass: "border-teal-500",
        title: "Lentidão das Folgas Milimétricas",
        snippet: "Oficinas clássicas de trens ensinam jovens engenheiros a calibrar pistões no tato e fita para evitar desvios estruturais."
      }
    ],
    article: {
      title: "O Rigor do Aço e a Nobreza das Máquinas",
      author: "Robert M. Pirsig",
      category: "Metodologia Mecânica",
      content: [
        "Ajustar um carburador de latão ou as roscas finas de um aparelho micrométrico antigo é um exercício de ética prática. O metal polido não aceita simulações ou discursos pomposos: ou o encaixe está calibrado ou emperra.",
        "A firmeza com que os dedos sentem as resistências dos filetes de rosca educa o artesão a compreender limites. Nessa barreira sutil de força e rotação, reside uma rara e solene poesia da matéria pura."
      ],
      quote: "Uma engrenagem mecânica calibrada perfeitamente é a analogia visível de uma mente em perfeito equilíbrio."
    }
  },
  "escrita criativa": {
    news: [
      {
        tag: "Estilo",
        tagColorClass: "text-emerald-600 bg-emerald-50",
        borderColorClass: "border-emerald-500",
        title: "O Brilho das Máquinas de Escrever",
        snippet: "Clubes literários resgatam antigas prensas e máquinas mecânicas Olivetti para isolar completamente o escritor de conexões web."
      },
      {
        tag: "Estudos",
        tagColorClass: "text-[#2541B2] bg-[#2541B2]/5",
        borderColorClass: "border-[#2541B2]",
        title: "Obstáculo Físico do Manuscrito",
        snippet: "Pesquisas de neurofocalização indicam que a impossibilidade de deletar rapidamente força um pensamento mais denso e poético."
      },
      {
        tag: "Linguagem",
        tagColorClass: "text-teal-600 bg-teal-50",
        borderColorClass: "border-teal-500",
        title: "A Velocidade da Caneta-Tinteiro",
        snippet: "Críticos explicam como a lentidão mecânica da pena de escrita clássica favorece a construção de parágrafos dotados de cadência."
      }
    ],
    article: {
      title: "O Peso Sólido do Verbo sob o Rastro de Tinta",
      author: "Clarice Lispector",
      category: "Ontologia da Escrita",
      content: [
        "Escrever manualmente, sentindo o atrito do grafite sobre as rugosidades do linho do suporte de papel, é dar carne e peso à palavra. O erro permanece gravado como testemunha eterna de nossa fragilidade conceitual.",
        "A fricção tátil obriga e desacelera o escritor, forçando-o a conjurar toda a arquitetura antes mesmo de tocar o bico-de-pena orvalhado na folha. Isso impede a proliferação vazia comum nas redes contemporâneas."
      ],
      quote: "Escrever devagar é morder a própria língua analógica para que as palavras fiquem impregnadas de verdade."
    }
  }
};
