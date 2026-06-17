import React, { useState } from "react";
import { AppSettings, PracticeSession, ErrorLog, UserProfile } from "../types";
import { 
  Settings, 
  HelpCircle, 
  Power, 
  BookOpen, 
  Play, 
  Check, 
  Clock, 
  Activity,
  Plus,
  Sparkles,
  Hammer, 
  BookOpen as BookOpenIcon, 
  Feather, 
  Compass, 
  Sprout, 
  Scissors, 
  Layers, 
  Wind, 
  Wrench, 
  Edit3,
  Search,
  Award,
  ChevronDown,
  ChevronUp,
  Newspaper,
  BookMarked,
  Lightbulb,
  Cpu,
  Flame,
  CalendarDays,
  Send,
  Bot,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GAZETA_BY_ACTIVITY } from "../data/gazetaData";

import { ActivityItem } from "../types";

interface MainScreenProps {
  onNavigate: (view: "main" | "pratica_livre" | "modo_sombra" | "diario_erros" | "perfil") => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onTriggerShutdown: () => void;
  sessions: PracticeSession[];
  errorLogs: ErrorLog[];
  activeActivity: string;
  onSetActiveActivity: (act: string) => void;
  settings: AppSettings;
  profile: UserProfile;
  activities: ActivityItem[];
  onAddActivity: (act: ActivityItem) => void;
  onDeleteActivity: (id: string) => void;
}

const ACTIVITY_DETAILS = [
  { id: "entalho em madeira", label: "Entalho em Madeira", desc: "Escultura tátil & precisão manual", iconName: "Hammer", category: "manual" },
  { id: "leitura analógica", label: "Leitura Analógica", desc: "Absorção de livros físicos em silêncio", iconName: "BookOpen", category: "intelecto" },
  { id: "caligrafia clássica", label: "Caligrafia Clássica", desc: "Foco no traço harmônico e tinta", iconName: "Feather", category: "manual" },
  { id: "desenho técnico", label: "Desenho Técnico", desc: "Geometria descritiva & lápis preciso", iconName: "Compass", category: "intelecto" },
  { id: "jardinagem minuciosa", label: "Jardinagem Minuciosa", desc: "Poda de bonsais e transplantes", iconName: "Sprout", category: "corpo" },
  { id: "costura de precisão", label: "Costura de Precisão", desc: "Ponto-cruz e costuras em feltro ou couro", iconName: "Scissors", category: "manual" },
  { id: "miniaturas & maquetes", label: "Miniaturas & Maquetes", desc: "Modelismo físico e montagens minuciosas", iconName: "Layers", category: "manual" },
  { id: "meditação profunda", label: "Meditação Profunda", desc: "Treino de presença & ritmo de respiração", iconName: "Wind", category: "corpo" },
  { id: "manutenção mecânica", label: "Manutenção Mecânica", desc: "Ajuste fino de engrenagens e calibração", iconName: "Wrench", category: "corpo" },
  { id: "escrita criativa", label: "Escrita Criativa", desc: "Roteiros, poemas e prosa manual em papel", iconName: "Edit3", category: "intelecto" }
];

const AISO_AI_TIPS: Record<string, string[]> = {
  "entalho em madeira": [
    "No entalho em madeira, experimente manter a lâmina em um ângulo preciso de 15 a 20 graus sobre a fibra para cortes fluídos e limpos.",
    "Para madeiras densas ou rústicas, repouse o metal sob calor leve por alguns minutos antes de efetuar o entalho inicial.",
    "Aplique óleo mineral neutro ou cera fina na empunhadura do formão para estabilizar o controle tátil e reduzir a fadiga do punho."
  ],
  "leitura analógica": [
    "Experimente manter uma fonte de iluminação oblíqua vinda de trás do ombro esquerdo para otimizar o conforto visual das páginas físicas.",
    "A cada 15 folhas de leitura analógica absorvidas, fite um objeto distante por 15 segundos para aliviar a tensão da íris.",
    "Mantenha o polegar estendido como marcador tátil ativo sob a linha em foco para acelarar o engajamento proprioceptivo."
  ],
  "caligrafia clássica": [
    "Tente regular a densidade do nanquim clássico adicionando uma única gota de água destilada se o papel absorver tinta muito rápido.",
    "Utilize uma base suspensa inclinada em exatos 20 graus para regular os traços caligráficos via força gravitacional consistente.",
    "Realize os traços clássicos mais complexos ou descendentes sempre em sincronia com o final da sua expiração nasal natural."
  ],
  "desenho técnico": [
    "Mantenha o grafite 2H afiado de forma oblíqua e execute uma sutil rotação contínua na lapiseira enquanto traça suas retas de apoio.",
    "Fixe fitas crepe de baixa aderência sob o corpo da régua clássica para evitar o arraste do pó de grafite sobre o papel vegetal.",
    "Posicione as palmas de suas mãos esticadas sobre a prancheta de desenho técnico para ancorar o compasso geométrico final."
  ],
  "jardinagem minuciosa": [
    "Ao podar gemas secundárias ou folhas antigas de bonsais, realize o corte em 45 graus para apurar uma cicatrização perfeita.",
    "Fundeirize a terra com os nós dos dedos: se estiver fresca mas sem aderir à pele, é o momento perfeito para realizar a aeração.",
    "Manobre tesouras de aço carbono com molas bem tensionadas para evitar movimentos involuntários ou cortes em excesso."
  ],
  "costura de precisão": [
    "Passe a linha de algodão crú levemente em um cilindro de cera de abelhas para vedá-la e coibir a emersão de nós indesejados.",
    "Regule o bastidor na altura do centro do peito e apoie os cotovelos para neutralizar o cansaço mecânico das articulações.",
    "Controle a tensão dos dedos de guia antes de cada nó, harmonizando a puxada da agulha com a expiração rítmica."
  ],
  "miniaturas & maquetes": [
    "Estabilize micro-partes plásticas com fita adesiva suave de baixa aderência para facilitar o esquadro sem tensioná-las na colagem.",
    "Disperse a cola rápida ou de contato utilizando um fino arame metálico de cobre para alcançar filetes invisíveis de adesão.",
    "Sopre de forma extremamente suave as fendas de fixação para certificar o perfeito encaixe isento de resíduos de madeira balsa."
  ],
  "meditação profunda": [
    "Retraia sutilmente o queixo em direção à laringe por 1 centímetro para alinhar e descomprimir a postura das vértebras cervicais.",
    "Mergulhe sua percepção no calor delicado gerado pela entrada e saída do fluxo de ar na parte superior externa das narinas.",
    "Se pensamentos mundanos reaparecerem, classifique-os apenas como 'vibração em segundo plano' e retorne devagar ao silêncio."
  ],
  "manutenção mecânica": [
    "Gire suavemente os micro-parafusos no sentido anti-horário até receber um estalo tátil de esquadro antes de iniciar o aperto físico.",
    "Friccione as micro-cavidades das engrenagens de bronze utilizando um fino palito de dente de bétula para retirar óleos engordurados.",
    "Prenda um pequeno magneto na lateral do recipiente de trabalho para resguardar pinos, travas e micro-arruelas de fugas reflexas."
  ],
  "escrita criativa": [
    "Comece sua primeira sequência de prosa ou poesia rascunhando de olhos fechados no papel ordinário de modo a desinibir o ego criativo.",
    "Escreva com canetas de fluxo espesso de tinta úmida para alinhar a agilidade mecânica da escrita com a naturalidade das ideias.",
    "Estabeleça um limite de no máximo duas ranhuras ou correções gráficas por folha de forma a priorizar o estado mental livre."
  ]
};

export default function MainScreen({
  onNavigate,
  onOpenSettings,
  onOpenHelp,
  onTriggerShutdown,
  sessions,
  errorLogs,
  activeActivity,
  onSetActiveActivity,
  settings,
  profile,
  activities,
  onAddActivity,
  onDeleteActivity,
}: MainScreenProps) {
  // Compute today's total minutes of focus
  const today = new Date().toDateString();
  const todaySessions = sessions.filter(
    (s) => s.completed && new Date(s.date).toDateString() === today
  );
  
  const todaySeconds = todaySessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const todayMinutes = Math.round(todaySeconds / 60);

  const formatTodayTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  // Calculation of streak & weekly meta:
  const getStreakAndWeeklyData = () => {
    // 1. Group completed sessions duration (in minutes) by toDateString()
    const dailyMinsMap: Record<string, number> = {};
    sessions.forEach(s => {
      if (s.completed && s.durationSeconds) {
        const dateStr = new Date(s.date).toDateString();
        const m = s.durationSeconds / 60;
        dailyMinsMap[dateStr] = (dailyMinsMap[dateStr] || 0) + m;
      }
    });

    const targetGoal = settings?.dailyGoalMinutes || 30;

    // 2. Compute current consecutiveness streak
    let currentStreak = 0;
    let checkDate = new Date();
    
    const todayStr = checkDate.toDateString();
    const metToday = (dailyMinsMap[todayStr] || 0) >= targetGoal;

    if (metToday) {
      currentStreak = 1;
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const prevStr = checkDate.toDateString();
        if ((dailyMinsMap[prevStr] || 0) >= targetGoal) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else {
      // Check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = checkDate.toDateString();
      if ((dailyMinsMap[yesterdayStr] || 0) >= targetGoal) {
        currentStreak = 1;
        while (true) {
          checkDate.setDate(checkDate.getDate() - 1);
          const prevStr = checkDate.toDateString();
          if ((dailyMinsMap[prevStr] || 0) >= targetGoal) {
            currentStreak++;
          } else {
            break;
          }
        }
      } else {
        currentStreak = 0;
      }
    }

    // 3. Compute last 7 days
    const weekDaysInitials = ["D", "S", "T", "Q", "Q", "S", "S"];
    const last7DaysList = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toDateString();
      const minsFocusObj = dailyMinsMap[dStr] || 0;
      const isMet = minsFocusObj >= targetGoal;
      const dayName = weekDaysInitials[d.getDay()];
      const isToday = i === 0;

      last7DaysList.push({
        dateStr: dStr,
        dayName,
        mins: Math.round(minsFocusObj),
        isMet,
        isToday,
        percent: Math.min(100, Math.round((minsFocusObj / targetGoal) * 100))
      });
    }

    const daysMetCount = last7DaysList.filter(day => day.isMet).length;

    return {
      streak: currentStreak,
      last7Days: last7DaysList,
      daysMetCount,
      targetGoal
    };
  };

  const { streak, last7Days, daysMetCount, targetGoal } = getStreakAndWeeklyData();

  // Focus mode toggle on main dashboard (Timer vs Sombra)
  const [sessionMode, setSessionMode] = useState<"livre" | "sombra">("sombra");

  // State to swap/select activities
  const [isSwapping, setIsSwapping] = useState<boolean>(false);

  // Filter track category (all, manual, corpo, intelecto)
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Custom activity entry state
  const [isAddingCustom, setIsAddingCustom] = useState<boolean>(false);
  const [customNameInput, setCustomNameInput] = useState<string>("");
  const [customDescInput, setCustomDescInput] = useState<string>("");
  const [customCategoryInput, setCustomCategoryInput] = useState<"manual" | "intelecto" | "corpo">("manual");
  const [customIconInput, setCustomIconInput] = useState<string>("Hammer");

  // AISO AI Tip Simulator States
  const [currentTip, setCurrentTip] = useState<string>("");
  const [isGeneratingTip, setIsGeneratingTip] = useState<boolean>(false);
  const [tipAnimationKey, setTipAnimationKey] = useState<number>(0);

  // Active news / literature tab for sidebar
  const [activeAsideTab, setActiveAsideTab] = useState<"news" | "artigo">("news");
  const [isOrientadorExpanded, setIsOrientadorExpanded] = useState<boolean>(false);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  const DR_AISO_RANDOM_SPEECHES = [
    "Dr. Aiso diz: Lembre-se de respirar fundo e manter os ombros relaxados enquanto trabalha! 🌿",
    "Dr. Aiso diz: Que tal colocar o telefone em outra sala e focar 100% no analógico agora? 📱",
    "Dr. Aiso diz: O tédio criativo é o espaço onde nascem as maiores ideias tangíveis. Deixe sua mente flutuar.",
    "Dr. Aiso diz: Olhe pela janela por 20 segundos. Seus olhos precisam reajustar o foco no mundo tridimensional.",
    "Dr. Aiso diz: Você está progredindo muito bem em seu ateliê. A pressa é apenas uma ilusão digital! ✨",
    "Dr. Aiso diz: Beber um copo d'água de forma consciente agora vai clarear sua atenção artesanal.",
    "Dr. Aiso diz: Cada ranhura ou desvio contornado com paciência constrói seu mestre interior.",
    "Dr. Aiso diz: Sinta a textura física e o peso dos materiais que está manipulando.",
    "Dr. Aiso diz: As notificações virtuais tentam roubar seu silêncio. Proteja seu ateliê analógico!",
    "Dr. Aiso diz: Desafie-se a completar mais 5 minutos sem olhar em nenhuma outra aba do navegador."
  ];

  // Periodic random speeches/notifications from Dr. Aiso when minimized
  React.useEffect(() => {
    if (isOrientadorExpanded) {
      setActiveNotification(null);
      return;
    }

    let timer: number;
    const scheduleNextNotification = () => {
      // Pick random delay between 120 seconds (2m) and 300 seconds (5m) for peaceful contemplation
      const delay = Math.floor(Math.random() * (300000 - 120000 + 1)) + 120000;
      
      timer = window.setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * DR_AISO_RANDOM_SPEECHES.length);
        setActiveNotification(DR_AISO_RANDOM_SPEECHES[randomIndex]);
        scheduleNextNotification(); // Loop
      }, delay);
    };

    // First trigger after 150 seconds (2.5m)
    const firstTimeout = window.setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * DR_AISO_RANDOM_SPEECHES.length);
      setActiveNotification(DR_AISO_RANDOM_SPEECHES[randomIndex]);
      scheduleNextNotification();
    }, 150000);

    return () => {
      window.clearTimeout(firstTimeout);
      window.clearTimeout(timer);
    };
  }, [isOrientadorExpanded]);

  // Load dynamically mapped Gazeta news, articles based on current activeActivity
  const gazetaData = GAZETA_BY_ACTIVITY[activeActivity.toLowerCase()] || GAZETA_BY_ACTIVITY["entalho em madeira"];

  // AI Mentor Chat States
  interface ChatMessage {
    role: "user" | "assistant";
    content: string;
  }
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userChatInput, setUserChatInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Auto-scroll chat area container ref
  const chatScrollRef = React.useRef<HTMLDivElement>(null);

  // Initialize and load chat welcome/opener whenever activeActivity changes
  React.useEffect(() => {
    const formattedActivity = activeActivity.charAt(0).toUpperCase() + activeActivity.slice(1);
    setChatMessages([
      {
        role: "assistant",
        content: `Olá! Eu sou o **Dr. Aiso**, seu orientador contemplativo. Fico feliz em guiar você no aprendizado de **${formattedActivity}** de forma 100% analógica e desconectada. 🌿\n\nComo posso apoiar você em seu ritual de desaceleração hoje? Diga-me se deseja um **desafio guiado**, **técnicas de movimentos finos**, ou tirar alguma dúvida.`
      }
    ]);
    setChatError(null);
  }, [activeActivity]);

  // Scroll to bottom helper
  React.useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isChatLoading]);

  // Handle send message logic to call our /api/chat Express proxy
  const handleSendChatMessage = async (textToSend?: string) => {
    const rawMsg = textToSend !== undefined ? textToSend : userChatInput;
    const msg = rawMsg.trim();
    if (!msg || isChatLoading) return;

    if (textToSend === undefined) {
      setUserChatInput("");
    }
    setChatError(null);

    // Append user message
    const newUserMessages: ChatMessage[] = [...chatMessages, { role: "user", content: msg }];
    setChatMessages(newUserMessages);
    setIsChatLoading(true);

    try {
      const apiHistory = newUserMessages.slice(1, -1).map(m => ({
        role: m.role,
        content: m.content
      })); 

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          activity: activeActivity,
          history: apiHistory
        })
      });

      if (!response.ok) {
        throw new Error("Não foi possível conectar ao Orientador IA. Verifique se o servidor está ativo.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setChatMessages(prev => [...prev, { role: "assistant", content: data.text || "Sem resposta do Orientador." }]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setChatError(err.message || "Erro de conexão ao servidor de IA.");
    } finally {
      setIsChatLoading(false);
    }
  };

  // Safe client-side markdown to html parsed helper to fit deep design discipline
  const parseMarkdownToHTML = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, lIdx) => {
      let content = line;
      content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      content = content.replace(/\*(.*?)\*/g, "<em>$1</em>");
      
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const cleanText = content.replace(/^[-*]\s*/, "");
        return (
          <li key={lIdx} className="ml-4 list-disc text-left leading-relaxed mt-1 text-[11px]" dangerouslySetInnerHTML={{ __html: cleanText }} />
        );
      }
      
      if (line.trim().startsWith("### ")) {
        const cleanText = content.replace(/^###\s*/, "");
        return (
          <h4 key={lIdx} className="text-[11px] font-bold font-mono uppercase tracking-wider text-[#2541B2] mt-3 mb-1" dangerouslySetInnerHTML={{ __html: cleanText }} />
        );
      }
      
      if (!line.trim()) {
        return <div key={lIdx} className="h-1.5" />;
      }
      
      return (
        <p key={lIdx} className="leading-relaxed mt-1 text-left text-[11px]" dangerouslySetInnerHTML={{ __html: content }} />
      );
    });
  };

  // Initialize and load tip on activity change
  React.useEffect(() => {
    const list = AISO_AI_TIPS[activeActivity] || [
      `Para a sua prática de "${activeActivity}", experimente registrar suas flutuações e tensões musculares no diário a cada fim de ciclo.`,
      `Respire conscientemente pelas narinas e evite reflexos digitais automáticos enquanto se dedica a "${activeActivity}".`,
      `Sinto que focar sensorialmente nos materiais de "${activeActivity}" nos primeiros 30 segundos estabiliza seu ritmo cardíaco.`
    ];
    setCurrentTip(list[0]);
    setTipAnimationKey(prev => prev + 1);
  }, [activeActivity]);

  const handleRegenerateTip = () => {
    if (isGeneratingTip) return;
    setIsGeneratingTip(true);

    setTimeout(() => {
      const list = AISO_AI_TIPS[activeActivity] || [
        `Para a sua prática de "${activeActivity}", experimente registrar suas flutuações e tensões musculares no diário a cada fim de ciclo.`,
        `Respire conscientemente pelas narinas e evite reflexos digitais automáticos enquanto se dedica a "${activeActivity}".`,
        `Sinto que focar sensorialmente nos materiais de "${activeActivity}" nos primeiros 30 segundos estabiliza seu ritmo cardíaco.`
      ];

      const otherTips = list.filter(t => t !== currentTip);
      const chosenPool = otherTips.length > 0 ? otherTips : list;
      const randomTip = chosenPool[Math.floor(Math.random() * chosenPool.length)];

      setCurrentTip(randomTip);
      setIsGeneratingTip(false);
      setTipAnimationKey(prev => prev + 1);
    }, 1100);
  };

  // Helper function to return beautiful Lucide icons
  const getActivityIcon = (name: string) => {
    switch(name) {
      case "Hammer": return <Hammer size={18} className="text-inherit" />;
      case "BookOpen": return <BookOpenIcon size={18} className="text-inherit" />;
      case "Feather": return <Feather size={18} className="text-inherit" />;
      case "Compass": return <Compass size={18} className="text-inherit" />;
      case "Sprout": return <Sprout size={18} className="text-inherit" />;
      case "Scissors": return <Scissors size={18} className="text-inherit" />;
      case "Layers": return <Layers size={18} className="text-inherit" />;
      case "Wind": return <Wind size={18} className="text-inherit" />;
      case "Wrench": return <Wrench size={18} className="text-inherit" />;
      case "Edit3": return <Edit3 size={18} className="text-inherit" />;
      default: return <Sparkles size={18} className="text-inherit" />;
    }
  };

  const categories = [
    { id: "all", label: "Tudo" },
    { id: "manual", label: "Manuais" },
    { id: "intelecto", label: "Cognitivos" },
    { id: "corpo", label: "Presença" }
  ];

  const getBaseMasteryHours = (id: string): number => {
    switch (id) {
      case "entalho em madeira": return 40;
      case "leitura analógica": return 25;
      case "caligrafia clássica": return 30;
      case "desenho técnico": return 35;
      case "jardinagem minuciosa": return 20;
      case "costura de precisão": return 20;
      case "miniaturas & maquetes": return 30;
      case "meditação profunda": return 15;
      case "manutenção mecânica": return 25;
      case "escrita criativa": return 30;
      default: return 20;
    }
  };

  // List of filtered predefined activities
  const filteredActivities = activeCategory === "all" 
    ? activities 
    : activities.filter(act => act.category === activeCategory);

  // Check if activeActivity is active
  const currentActivityDetail = activities.find(act => act.id === activeActivity) || {
    id: activeActivity,
    label: activeActivity.charAt(0).toUpperCase() + activeActivity.slice(1),
    desc: "Programa de aprendizado personalizado",
    iconName: "Sparkles",
    category: "manual"
  };

  const handleStartPracticeDirect = () => {
    if (sessionMode === "livre") {
      onNavigate("pratica_livre");
    } else {
      onNavigate("modo_sombra");
    }
  };

  const handleAddCustomActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (customNameInput.trim()) {
      const sanitizedName = customNameInput.trim();
      const sanitizedId = sanitizedName.toLowerCase();
      
      const newAct: ActivityItem = {
        id: sanitizedId,
        label: sanitizedName,
        desc: customDescInput.trim() || `Sua prática focada de ${sanitizedName}`,
        iconName: customIconInput,
        category: customCategoryInput
      };
      
      onAddActivity(newAct);
      onSetActiveActivity(newAct.id);
      
      setCustomNameInput("");
      setCustomDescInput("");
      setCustomCategoryInput("manual");
      setCustomIconInput("Hammer");
      setIsAddingCustom(false);
      setIsSwapping(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-6 flex flex-col flex-grow justify-between min-h-[92vh] text-[#2541B2]" id="aiso-main">
      {/* Header Panel */}
      <header className="w-full flex justify-between items-center bg-transparent border-b border-[#2541B2]/10 pb-4">
        <div className="flex items-center gap-3" id="aiso-header-logo-group">
          {/* Minimalist Abstract Deep Blue Hand-drawn Logo */}
          <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-xl overflow-hidden border border-[#2541B2]/15 shadow-xs flex-shrink-0" id="aiso-logo-frame">
            <img 
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120&fit=crop&q=80" 
              alt="AISO Minimalist Abstract Brush Stroke Logo" 
              className="w-full h-full object-cover select-none pointer-events-none filter saturate-125 hover:scale-105 duration-300 transition-all"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 border border-inset border-[#2541B2]/10 rounded-xl" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-serif text-2xl md:text-3xl tracking-[0.18em] text-[#2541B2] font-semibold uppercase select-none leading-none">
              AISO
            </h1>
            <span className="text-[12px] font-serif tracking-[0.3em] text-[#2541B2]/95 mt-1 select-none font-black block leading-none">
              愛想
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("diario_erros")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF]/80 hover:bg-[#2541B2]/5 border border-[#2541B2]/20 rounded-lg text-[9.5px] uppercase tracking-wider font-mono font-bold transition-all text-[#2541B2] shadow-sm cursor-pointer"
            title="Diário de Erros"
          >
            <BookOpen size={11} className="text-[#2541B2]/80" />
            <span>Diário de Erros</span>
          </button>

          {/* Perfil Button */}
          <button
            id="open-profile-btn"
            onClick={() => onNavigate("perfil")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FFFFFF]/80 hover:bg-[#2541B2]/5 border border-[#2541B2]/20 rounded-lg text-[9.5px] uppercase tracking-wider font-mono font-bold transition-all text-[#2541B2] shadow-sm cursor-pointer"
            title="Perfil e Estatísticas"
          >
            {profile.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.name}
                className="w-4 h-4 rounded-full object-cover border border-[#2541B2]/20"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-4 h-4 rounded-full bg-[#2541B2] text-white flex items-center justify-center font-mono font-bold text-[9px]">
                {profile.name ? profile.name.substring(0, 2).toUpperCase() : "A"}
              </div>
            )}
            <span className="hidden sm:inline max-w-[80px] truncate">{profile.name || "Perfil"}</span>
          </button>

          <button
            id="open-settings-btn"
            onClick={onOpenSettings}
            className="p-2 text-[#2541B2] hover:bg-[#2541B2]/5 rounded-md transition-all duration-300 cursor-pointer"
            title="Configurações gerais"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Grid Wrapper splits workspace on desktop: Left=Core, Right=Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full mt-6 flex-grow items-start">
        
        {/* LEFT COLUMN: Focus Core & Controls (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-6">
          
          {/* Massive Focused Time Indicator (Main focus of the screen) */}
          <div className="relative flex flex-col items-center py-6 md:py-8" id="main-time-focus">
            {/* Ambient Breath Rings */}
            <motion.div
              animate={{ 
                scale: [1, 1.04, 1],
                opacity: [0.08, 0.24, 0.08]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-72 h-72 md:w-84 md:h-84 rounded-full border border-[#2541B2]/20 pointer-events-none"
            />
            <motion.div
              animate={{ 
                scale: [1.05, 0.98, 1.05],
                opacity: [0.02, 0.12, 0.02]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-80 h-80 md:w-92 md:h-92 rounded-full border border-dashed border-[#2541B2]/25 pointer-events-none"
            />
            
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute w-64 h-64 md:w-76 md:h-76 rounded-full border border-dotted border-[#2541B2]/25 pointer-events-none"
            />

            <motion.div
              className="w-56 h-56 md:w-64 md:h-64 hand-drawn-circle flex flex-col items-center justify-center bg-[#F7F7FF]/95 border border-[#2541B2]/45 shadow-lg shadow-[#2541B2]/8 select-none relative z-10"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <span 
                id="status-indicator" 
                className="font-mono text-5xl md:text-6xl text-[#2541B2] font-black tracking-widest leading-none drop-shadow-sm"
              >
                {formatTodayTime(todaySeconds)}
              </span>
            </motion.div>
          </div>

          {/* Direct Session Launcher Buttons (Broken from the big square card container) */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3" id="direct-immersion-launchers">
            <button
              id="start-livre-btn"
              onClick={() => onNavigate("pratica_livre")}
              className="py-3 px-4 bg-white hover:bg-slate-50 border border-[#2541B2]/15 hover:border-[#2541B2]/30 rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer group text-center"
            >
              <Clock size={14} className="text-[#2541B2]/70 group-hover:scale-110 transition-transform" />
              <span className="text-[10.5px] uppercase tracking-widest font-black text-[#2541B2]">
                Cronômetro Livre
              </span>
              <span className="text-[8px] text-[#2541B2]/60 font-light max-w-[200px] leading-snug">
                Foco livre para marcar tempo corrido
              </span>
            </button>

            <button
              id="start-sombra-btn"
              onClick={() => onNavigate("modo_sombra")}
              className="py-3 px-4 bg-[#2541B2] hover:bg-[#1E3491] text-white rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 shadow-md shadow-[#2541B2]/15 active:scale-[0.98] cursor-pointer group text-center"
            >
              <Activity size={14} className="text-cyan-300 group-hover:scale-110 transition-transform" />
              <span className="text-[10.5px] uppercase tracking-widest font-black text-[#F7F7FF]">
                Iniciar Modo Sombra
              </span>
              <span className="text-[8px] text-[#F7F7FF]/75 font-light max-w-[200px] leading-snug">
                Sessão guiada à noite sob rádio analógica
              </span>
            </button>
          </div>

          {/* META SEMANAL & STREAK TRACKER (Precioso, superenxuto e minimalista) */}
          <div className="w-full bg-[#FFFFFF]/85 border border-[#2541B2]/12 rounded-xl p-2.5 md:p-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-left relative overflow-hidden" id="aiso-weekly-streak-card">
            <div className="flex items-center gap-1.5">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-mono text-[7.5px] tracking-wider text-[#2541B2]/50 uppercase font-black">Meta Semanal</span>
                  <div className="flex items-center gap-0.5 bg-orange-50 px-1 py-0.5 rounded text-[8px] font-bold text-orange-600 font-mono">
                    <Flame size={8} className="fill-orange-500/20" />
                    <span>{streak}d</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-base font-serif italic text-[#2541B2] font-black leading-none">
                    {daysMetCount} / 7
                  </span>
                  <span className="text-[7.5px] text-[#2541B2]/70 font-mono uppercase tracking-wide leading-none font-bold">
                    concluídos
                  </span>
                </div>
              </div>
            </div>

            {/* Mini 7-Day beads timeline (Redimensionado e supercompacto) */}
            <div className="flex items-center gap-1 justify-between sm:justify-end flex-grow">
              {last7Days.map((day) => {
                return (
                  <div key={day.dateStr} className="flex flex-col items-center gap-0.5 select-none relative pb-0">
                    <span className="text-[7px] font-mono font-bold text-[#2541B2]/55 uppercase tracking-tighter leading-none text-center">
                      {day.dayName}
                    </span>
                    
                    <div className="relative mt-0.5">
                      {day.isToday && (
                        <span className="absolute -inset-0.5 rounded-full border border-[#2541B2]/40 animate-ping opacity-35 pointer-events-none" />
                      )}
                      <div
                        title={`${day.mins} min focados`}
                        className={`w-6.5 h-6.5 rounded-full border flex items-center justify-center text-[7.5px] font-mono transition-all duration-300 relative ${
                          day.isMet
                            ? "bg-[#2541B2] border-[#2541B2] text-[#F7F7FF] font-black"
                            : day.isToday
                            ? "bg-transparent border-[#2541B2] border-dashed text-[#2541B2] font-semibold"
                            : "bg-[#2541B2]/5 border-[#2541B2]/10 text-[#2541B2]/40"
                        }`}
                      >
                        {day.isMet ? (
                          <Check size={8} className="text-[#F7F7FF]" />
                        ) : (
                          <span>{day.mins > 0 ? `${day.mins}m` : "-"}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Feature: Selected Activity in Glorious Emphasis or Swapper interface */}
          <div className="w-full">
            <AnimatePresence mode="wait">
              {!isSwapping ? (
                /* HERO UNIT: Selected activity strictly emphasized */
                <motion.div
                  key="hero-focused-activity"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full bg-[#FFFFFF]/85 border border-[#2541B2]/25 rounded-2xl p-5 shadow-sm space-y-4 text-left"
                >
                  <div className="flex items-center justify-between border-b border-[#2541B2]/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#2541B2] animate-pulse" />
                      <span className="font-mono text-[9px] tracking-[0.2em] text-[#2541B2]/60 uppercase">
                        Programa em Foco
                      </span>
                    </div>

                    {/* Small button beside Trocar Atividade */}
                    <button
                      onClick={() => setIsSwapping(true)}
                      className="px-2.5 py-1 bg-[#2541B2]/5 hover:bg-[#2541B2]/10 border border-[#2541B2]/25 rounded text-[9px] font-mono font-bold uppercase tracking-wider text-[#2541B2] transition-[background-color,border] cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <span>Trocar Atividade</span>
                      <ChevronDown size={10} />
                    </button>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#2541B2] text-[#F7F7FF] flex items-center justify-center shrink-0 shadow-inner">
                      {getActivityIcon(currentActivityDetail.iconName || "Sparkles")}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-mono font-semibold tracking-widest text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase inline-block">
                        {currentActivityDetail.category === "manual" ? "Ordem Manual" : currentActivityDetail.category === "intelecto" ? "Intelectual" : "Presença Ativa"}
                      </span>
                      <h3 className="text-lg font-serif italic text-[#2541B2] font-semibold tracking-wide capture-active-activity">
                        "{currentActivityDetail.label}"
                      </h3>
                      <p className="text-xs text-[#2541B2]/85 font-light leading-relaxed">
                        {currentActivityDetail.desc}
                      </p>
                    </div>
                  </div>

                  {/* Curriculo Syllabus progress progress representation bar */}
                  {(() => {
                    const activeSessions = sessions.filter(
                      s => s.completed && (s.activityId === activeActivity || s.notes.toLowerCase().includes(activeActivity.toLowerCase()))
                    );
                    const practicedSeconds = activeSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
                    const practicedHours = practicedSeconds / 3600;
                    const baseMastery = getBaseMasteryHours(activeActivity);
                    const masteryTargetHours = baseMastery + (activeSessions.length * 1.5);
                    const pct = Math.min(100, Math.round((practicedHours / masteryTargetHours) * 100));

                    return (
                      <div className="bg-[#2541B2]/3 border border-[#2541B2]/8 rounded-lg p-2.5 space-y-1.5" id="syllabus-progress-container">
                        <div className="flex justify-between items-center text-[8.5px] font-mono leading-none">
                          <span className="text-[#2541B2]/50 uppercase tracking-wider font-semibold">Horas de Prática & Maestria ({practicedHours.toFixed(1)}h / {masteryTargetHours.toFixed(0)}h)</span>
                          <span className="font-bold text-[#2541B2]">{pct}%</span>
                        </div>
                        {/* Linha de progresso */}
                        <div className="w-full bg-[#2541B2]/10 h-1.5 rounded-full overflow-hidden relative" id="activity-progress-bar-container">
                          <motion.div 
                            key={`${activeActivity}-${pct}`}
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ 
                              width: `${pct}%`,
                              opacity: 1
                            }}
                            transition={{
                              width: { duration: 0.8, ease: "easeOut" },
                              opacity: { duration: 0.5, ease: "easeIn" }
                            }}
                            className="bg-[#2541B2] h-full rounded-full relative" 
                          >
                            <motion.div 
                              animate={{ 
                                opacity: [0.2, 0.65, 0.2],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              className="absolute inset-0 bg-white/30 rounded-full" 
                            />
                          </motion.div>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              ) : (
                /* SWAP MODE: Course options menu */
                <motion.div
                  key="swap-selection-menu"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="w-full bg-[#FFFFFF]/90 border border-[#2541B2] rounded-2xl p-4 md:p-5 shadow-lg space-y-4 text-left"
                >
                  <div className="flex justify-between items-center border-b border-[#2541B2]/10 pb-2">
                    <span className="font-mono text-[9px] tracking-widest text-[#2541B2] font-bold uppercase">
                      Selecione um programa alternativo
                    </span>
                    <button
                      onClick={() => setIsSwapping(false)}
                      className="px-2.5 py-1 bg-[#2541B2] hover:bg-[#1E3491] text-white rounded text-[9px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Fechar
                    </button>
                  </div>

                  {/* Track Tabs Category filter */}
                  <div className="w-full flex justify-start gap-1 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setIsAddingCustom(false);
                        }}
                        className={`px-3 py-1.5 text-[9px] cursor-pointer tracking-wider uppercase rounded-full border transition-all shrink-0 ${
                          activeCategory === cat.id
                            ? "bg-[#2541B2]/10 text-[#2541B2] border-[#2541B2]/40 font-semibold"
                            : "bg-[#FFFFFF]/40 text-[#2541B2]/65 border-[#2541B2]/10 hover:border-[#2541B2]/20 hover:text-[#2541B2]"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Grid layout of other predefined paths */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                    {filteredActivities.map((act) => {
                      const isSelected = activeActivity === act.id;
                      
                      // Calculate practice time and dynamic mastery target for this activity!
                      const actSessions = sessions.filter(
                        s => s.completed && (s.activityId === act.id || s.notes.toLowerCase().includes(act.id.toLowerCase()))
                      );
                      const practicedSeconds = actSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
                      const practicedHours = practicedSeconds / 3600;
                      const baseMastery = getBaseMasteryHours(act.id);
                      const masteryTargetHours = baseMastery + (actSessions.length * 1.5);
                      const pct = Math.min(100, Math.round((practicedHours / masteryTargetHours) * 100));

                      return (
                        <div
                          key={act.id}
                          onClick={() => {
                            onSetActiveActivity(act.id);
                            setIsSwapping(false);
                          }}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-300 relative overflow-hidden select-none flex flex-col justify-between h-[100px] group/card ${
                            isSelected
                              ? "bg-[#2541B2]/5 border-[#2541B2] shadow-sm ring-1 ring-[#2541B2]/10"
                              : "bg-[#FFFFFF]/70 border-[#2541B2]/15 hover:border-[#2541B2]/35 hover:bg-[#FFFFFF]"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors shrink-0 ${
                                isSelected 
                                  ? "bg-[#2541B2] text-[#F7F7FF]" 
                                  : "bg-[#2541B2]/10 text-[#2541B2]"
                              }`}>
                                {getActivityIcon(act.iconName)}
                              </div>
                              <div className="truncate text-left leading-tight">
                                <h4 className="text-[10.5px] font-bold font-sans uppercase tracking-wide text-[#2541B2] truncate max-w-[110px]">
                                  {act.label}
                                </h4>
                                <span className="text-[7.5px] text-[#2541B2]/70 leading-none block truncate max-w-[110px] italic">
                                  {act.desc}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 shrink-0 z-10">
                              {/* Delete activity action button */}
                              {activities.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteActivity(act.id);
                                  }}
                                  className="p-1 hover:bg-rose-50 text-[#2541B2]/40 hover:text-rose-500 rounded transition"
                                  title="Excluir Atividade"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                              
                              {isSelected && (
                                <div className="bg-[#2541B2] text-[#F7F7FF] rounded-full p-0.5">
                                  <Check size={7} />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Dynamic Mastery progress row */}
                          <div className="mt-1">
                            <div className="flex justify-between items-center text-[7px] font-mono mb-0.5">
                              <span className="text-[#2541B2]/50 tracking-wider">Maestria {practicedHours.toFixed(1)}h/{masteryTargetHours.toFixed(0)}h</span>
                              <span className="font-bold text-[#2541B2]">{pct}%</span>
                            </div>
                            <div className="w-full bg-[#2541B2]/10 h-0.5 rounded-full overflow-hidden">
                              <div className="bg-[#2541B2] h-full rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Adding custom activity pathway */}
                    {!isAddingCustom ? (
                      <div
                        onClick={() => setIsAddingCustom(true)}
                        className="p-2.5 rounded-xl border border-dashed border-[#2541B2]/30 hover:border-[#2541B2] bg-transparent hover:bg-[#2541B2]/5 cursor-pointer flex flex-col items-center justify-center text-center transition-all h-[88px] text-[#2541B2]/60 hover:text-[#2541B2]"
                      >
                        <Plus size={16} className="mb-0.5" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider leading-none">Módulo Customizado</span>
                        <span className="text-[8px] font-mono tracking-widest mt-0.5 text-slate-500">Adicionar seu próprio curso</span>
                      </div>
                    ) : (
                      <form
                        onSubmit={handleAddCustomActivity}
                        className="p-3 rounded-xl border border-[#2541B2]/40 bg-[#FFFFFF] flex flex-col gap-2.5"
                      >
                        <div className="space-y-1 text-left">
                          <label className="text-[7.5px] font-mono uppercase tracking-widest text-[#2541B2]/70 block font-black leading-none">Nome do seu Curso</label>
                          <input
                            type="text"
                            autoFocus
                            maxLength={26}
                            required
                            value={customNameInput}
                            onChange={(e) => setCustomNameInput(e.target.value)}
                            placeholder="Marcar tempo em..."
                            className="w-full bg-[#F7F7FF] border border-[#2541B2]/20 rounded px-2.5 py-1 text-[10px] text-[#2541B2] focus:outline-none focus:border-[#2541B2]"
                          />
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-[7.5px] font-mono uppercase tracking-widest text-[#2541B2]/70 block font-black leading-none">Breve Descrição</label>
                          <input
                            type="text"
                            maxLength={40}
                            value={customDescInput}
                            onChange={(e) => setCustomDescInput(e.target.value)}
                            placeholder="Ex. Escultura tátil & sussurros..."
                            className="w-full bg-[#F7F7FF] border border-[#2541B2]/20 rounded px-2.5 py-1 text-[10px] text-[#2541B2] focus:outline-none focus:border-[#2541B2]"
                          />
                        </div>

                        {/* Category selection */}
                        <div className="space-y-1 text-left">
                          <label className="text-[7.5px] font-mono uppercase tracking-widest text-[#2541B2]/70 block font-black leading-none">Foco de Atenção</label>
                          <div className="grid grid-cols-3 gap-1">
                            {(["manual", "intelecto", "corpo"] as const).map((cat) => (
                              <button
                                type="button"
                                key={cat}
                                onClick={() => setCustomCategoryInput(cat)}
                                className={`py-1 text-[8px] uppercase tracking-wider font-mono font-bold rounded-md border transition ${
                                  customCategoryInput === cat
                                    ? "bg-[#2541B2] border-[#2541B2] text-white"
                                    : "bg-transparent border-[#2541B2]/15 hover:bg-slate-50 text-[#2541B2]/80"
                                }`}
                              >
                                {cat === "manual" ? "Manuais" : cat === "intelecto" ? "Intelec." : "Presença"}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Icon choices collection */}
                        <div className="space-y-1 text-left">
                          <label className="text-[7.5px] font-mono uppercase tracking-widest text-[#2541B2]/70 block font-black leading-none">Símbolo Visual</label>
                          <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-50 rounded-lg border border-slate-200">
                            {[
                              "Hammer", "BookOpen", "Feather", "Compass", "Sprout", 
                              "Scissors", "Layers", "Wind", "Wrench", "Edit3"
                            ].map((iconName) => (
                              <button
                                type="button"
                                key={iconName}
                                onClick={() => setCustomIconInput(iconName)}
                                className={`p-1.5 flex items-center justify-center rounded-md border duration-100 ${
                                  customIconInput === iconName
                                    ? "bg-[#2541B2]/15 border-[#2541B2] text-[#2541B2]"
                                    : "border-transparent text-[#2541B2]/60 hover:bg-white"
                                }`}
                                title={iconName}
                              >
                                {getActivityIcon(iconName)}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-1.5 leading-none border-t border-[#2541B2]/5 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsAddingCustom(false)}
                            className="px-3 py-1 border border-[#2541B2]/20 text-[#2541B2]/85 text-[9px] uppercase font-bold rounded-lg"
                          >
                            Voltar
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 bg-[#2541B2] text-[#F7F7FF] text-[9px] uppercase font-bold rounded-lg hover:bg-[#1E3491]"
                          >
                            Confirmar
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar Component for News & Tips (lg:col-span-5) */}
        <aside className="lg:col-span-5 bg-[#FFFFFF]/75 border border-[#2541B2]/15 rounded-2xl p-4 md:p-5 shadow-sm flex flex-col gap-4 text-left h-fit self-start" id="aiso-news-sidebar-panel">
          
          {/* Internal Navigation Tabs for News vs Literature/Long Read */}
          <div className="flex border border-[#2541B2]/15 p-0.5 bg-[#2541B2]/5 rounded-xl font-sans" id="news-tab-navigator">
            <button
              onClick={() => setActiveAsideTab("news")}
              className={`flex-1 py-1.5 text-[9px] uppercase font-black rounded-lg transition-all text-center cursor-pointer ${
                activeAsideTab === "news"
                  ? "bg-[#2541B2] text-[#F7F7FF] shadow-sm"
                  : "text-[#2541B2]/60 hover:text-[#2541B2] hover:bg-[#2541B2]/5"
              }`}
            >
              Gazeta
            </button>
            <button
              onClick={() => setActiveAsideTab("artigo")}
              className={`flex-1 py-1.5 text-[9px] uppercase font-black rounded-lg transition-all text-center cursor-pointer ${
                activeAsideTab === "artigo"
                  ? "bg-[#2541B2] text-[#F7F7FF] shadow-sm"
                  : "text-[#2541B2]/60 hover:text-[#2541B2] hover:bg-[#2541B2]/5"
              }`}
            >
              Ensaios
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeAsideTab === "news" && (
              <motion.div
                key={`tab-news-feed-${activeActivity}`}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 4 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Section 1: Craft News */}
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 text-[10.5px] uppercase font-mono tracking-widest font-black text-[#2541B2] border-b border-[#2541B2]/10 pb-1.5">
                    <Newspaper size={12} className="text-emerald-600 shrink-0" />
                    <span>Gazeta das Artes // Feed Conciso</span>
                  </h4>
                  
                  <div className="space-y-3">
                    {gazetaData.news.map((item, idx) => (
                      <div key={idx} className={`space-y-0.5 border-l-2 ${item.borderColorClass} pl-2`}>
                        <span className={`text-[7px] font-mono uppercase ${item.tagColorClass} px-1 inline-block rounded font-bold`}>
                          {item.tag}
                        </span>
                        <h5 className="text-[11px] font-serif font-bold text-[#2541B2] leading-tight">
                          {item.title}
                        </h5>
                        <p className="text-[9.5px] text-[#2541B2]/75 font-light leading-snug">
                          {item.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Switcher Invitation Promo */}
                <div className="bg-[#2541B2]/5 border border-[#2541B2]/10 p-2.5 rounded-xl flex items-center justify-between gap-2 mt-1">
                  <div className="space-y-0.5">
                    <span className="text-[7px] font-mono uppercase text-[#2541B2]/60 font-black block">Biblioteca AISO</span>
                    <p className="text-[9px] text-[#2541B2]/90 italic font-serif leading-none truncate max-w-[150px]">
                      "{gazetaData.article.title}"
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveAsideTab("artigo")}
                    className="px-2 py-1 bg-[#2541B2] text-[#F7F7FF] text-[8.5px] font-mono uppercase tracking-wider rounded hover:bg-[#1E3491] cursor-pointer transition-colors shadow-sm select-none"
                  >
                    Ler Ensaio →
                  </button>
                </div>
              </motion.div>
            )}

            {activeAsideTab === "artigo" && (
              <motion.div
                key={`tab-long-read-literature-${activeActivity}`}
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.2 }}
                className="space-y-3.5 max-h-[310px] overflow-y-auto pr-1 no-scrollbar-y text-[#2541B2]"
              >
                <div className="border-b border-[#2541B2]/10 pb-1.5">
                  <h4 className="flex items-center gap-1.5 text-[10.5px] uppercase font-mono tracking-widest font-black">
                    <BookOpen size={11} className="text-amber-600 shrink-0" />
                    <span>Estudos Literários Contemplativos</span>
                  </h4>
                </div>

                <div className="space-y-2 text-justify font-serif">
                  <h3 className="text-[13px] font-serif font-black tracking-tight leading-snug text-[#2541B2]">
                    {gazetaData.article.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[7px] font-mono tracking-widest uppercase text-[#2541B2]/50">
                    <span>{gazetaData.article.author}</span>
                    <span>•</span>
                    <span>{gazetaData.article.category}</span>
                  </div>
                  {gazetaData.article.content.map((p, pIdx) => (
                    <p key={pIdx} className="text-[10px] leading-relaxed font-light">
                      {p}
                    </p>
                  ))}
                  <div className="bg-[#2541B2]/5 border-l-2 border-[#2541B2]/30 p-2 text-[#2541B2] rounded-r-lg italic text-[9.5px] my-1">
                    "{gazetaData.article.quote}"
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dicas do AISO (Separado e sempre visível como solicitado) */}
          <div className="bg-[#2541B2]/3 border border-[#2541B2]/10 p-3.5 rounded-xl space-y-3 mt-1" id="news-sidebar-dicas-aiso">
            <h4 className="flex items-center gap-2 text-[10.5px] uppercase font-mono tracking-widest font-black text-[#2541B2]">
              <Lightbulb size={12} className="text-amber-500 shrink-0" />
              <span>Dicas do AISO</span>
            </h4>
            
            <ul className="space-y-2 text-[9.5px] text-[#2541B2]/85 font-light leading-relaxed">
              <li className="flex items-start gap-1">
                <span className="text-amber-500 select-none leading-none mt-0.5">•</span>
                <span>
                  <strong className="font-semibold text-[#2541B2]">Dois Metros de Escudo:</strong> Posicione seu terminal móvel além da distância de alcance das mãos de forma que precise se levantar.
                </span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-amber-500 select-none leading-none mt-0.5">•</span>
                <span>
                  <strong className="font-semibold text-[#2541B2]">Toque Primal:</strong> Ao iniciar, repouse a palma das mãos sobre as ferramentas por um minuto para despertar sua mecânica corporal.
                </span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-amber-500 select-none leading-none mt-0.5">•</span>
                <span>
                  <strong className="font-semibold text-[#2541B2]">Foco Respiratório:</strong> Sincronize a soltura pulmonar com cortes de tesoura, movimentos de formão ou traçados delicados de caneta.
                </span>
              </li>
            </ul>
          </div>
        </aside>

      </div>

      {/* FLOATING ORIENTADOR IA - EM EVIDÊNCIA NO CANTO INFERIOR DA TELA */}
      <div 
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end select-none pointer-events-none" 
        id="aiso-floating-advisor-widget"
      >
        <AnimatePresence>
          {isOrientadorExpanded ? (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-80 sm:w-96 h-[465px] bg-[#FFFFFF]/98 border border-[#2541B2]/30 shadow-2xl rounded-2xl flex flex-col justify-between overflow-hidden pointer-events-auto mb-3"
            >
              {/* Widget Header */}
              <div className="bg-[#2541B2] text-[#F7F7FF] px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-mono uppercase tracking-widest font-black leading-none text-white/90">Dr. Aiso</span>
                    <span className="text-[8px] font-mono text-emerald-300 uppercase leading-none mt-1 font-bold">Orientador Contemplativo</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsOrientadorExpanded(false)}
                  className="p-1 hover:bg-white/10 rounded text-white/80 hover:text-white transition-all cursor-pointer"
                  title="Minimizar Orientador"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              {/* INTEGRATION: SIMULADOR IA AISO (Conselho Heurístico do Dia) */}
              <div className="bg-[#2541B2]/5 border-b border-[#2541B2]/10 p-3 flex items-start gap-2 text-left shrink-0">
                <Lightbulb size={13} className="text-amber-500 mt-0.5 shrink-0" />
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center leading-none mb-1">
                    <span className="text-[7.5px] font-mono tracking-[0.15em] text-[#2541B2]/60 uppercase font-black">Conselheiro Heurístico</span>
                    <button 
                      onClick={handleRegenerateTip}
                      disabled={isGeneratingTip}
                      className="text-[#2541B2] hover:text-[#1E3491] hover:scale-105 active:scale-95 transition-all text-[8px] font-mono uppercase tracking-widest leading-none bg-[#2541B2]/10 px-1.5 py-0.5 rounded cursor-pointer disabled:opacity-50 font-bold"
                    >
                      {isGeneratingTip ? "Sintonizando..." : "Outra Dica"}
                    </button>
                  </div>
                  <p className="text-[10px] text-[#2541B2]/90 leading-relaxed font-sans italic">
                    {isGeneratingTip ? "Buscando insights no infinito..." : `"${currentTip}"`}
                  </p>
                </div>
              </div>

              {/* Chat messages scroll log */}
              <div 
                ref={chatScrollRef}
                className="flex-grow overflow-y-auto p-4 space-y-3.5 scroll-smooth no-scrollbar-y bg-[#F7F7FF]/35"
              >
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div 
                      className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-[11px] relative shadow-sm ${
                        msg.role === "user" 
                          ? "bg-[#2541B2] text-[#F7F7FF] rounded-tr-none font-sans" 
                          : "bg-white border border-[#2541B2]/15 text-[#2541B2] rounded-tl-none font-serif leading-relaxed"
                      }`}
                    >
                      <div className="font-mono text-[7px] uppercase font-bold text-inherit opacity-60 mb-0.5 text-left">
                        {msg.role === "user" ? "Eu" : "Dr. Aiso"}
                      </div>
                      <div className="space-y-1">
                        {msg.role === "assistant" ? parseMarkdownToHTML(msg.content) : msg.content}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing status indicator */}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-[#2541B2]/15 rounded-2xl px-3 py-2.5 text-[10.5px] font-mono italic text-[#2541B2]/70 space-y-1 rounded-tl-none shadow-sm">
                      <div className="font-mono text-[7px] uppercase font-bold opacity-60 mb-0.5 text-left">Dr. Aiso</div>
                      <div className="flex items-center gap-1.5 pb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2541B2] animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2541B2] animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2541B2] animate-bounce [animation-delay:0.4s]" />
                        <span className="ml-1 text-[9px]">Sintonizando frequências...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat errors */}
                {chatError && (
                  <div 
                    className="bg-red-50 text-red-600 border border-red-200 p-2.5 rounded-xl text-[9.5px] cursor-pointer shadow-sm text-left font-mono" 
                    onClick={() => setChatError(null)}
                  >
                    <strong>Erro:</strong> {chatError}. Clique para fechar.
                  </div>
                )}
              </div>

              {/* Bottom Quick pills & chat input bar */}
              <div className="p-3 bg-white border-t border-[#2541B2]/10 space-y-2 shrink-0">
                {/* Suggestions pills */}
                <div className="flex flex-wrap gap-1" id="mentor-suggestions">
                  <button
                    onClick={() => handleSendChatMessage(`Me sugira um desafio prático focado para a atividade de ${activeActivity}.`)}
                    disabled={isChatLoading}
                    className="px-2 py-1 bg-[#2541B2]/5 border border-[#2541B2]/10 hover:border-[#2541B2] text-[#2541B2] text-[8.5px] font-mono uppercase tracking-wide rounded hover:bg-[#2541B2]/10 select-none transition-all disabled:opacity-50 cursor-pointer"
                  >
                    ⚡ Desafio
                  </button>
                  <button
                    onClick={() => handleSendChatMessage(`Quero aprender as principais técnicas manuais para me desenvolver em ${activeActivity}.`)}
                    disabled={isChatLoading}
                    className="px-2 py-1 bg-[#2541B2]/5 border border-[#2541B2]/10 hover:border-[#2541B2] text-[#2541B2] text-[8.5px] font-mono uppercase tracking-wide rounded hover:bg-[#2541B2]/10 select-none transition-all disabled:opacity-50 cursor-pointer"
                  >
                    📘 Técnicas
                  </button>
                  <button
                    onClick={() => handleSendChatMessage(`Como posso relaxar e respirar de forma profunda e consciente enquanto pratico ${activeActivity}?`)}
                    disabled={isChatLoading}
                    className="px-2 py-1 bg-[#2541B2]/5 border border-[#2541B2]/10 hover:border-[#2541B2] text-[#2541B2] text-[8.5px] font-mono uppercase tracking-wide rounded hover:bg-[#2541B2]/10 select-none transition-all disabled:opacity-50 cursor-pointer"
                  >
                    🌿 Respiração
                  </button>
                </div>

                {/* Main Message Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChatMessage();
                  }}
                  className="flex items-center gap-1.5 bg-[#F7F7FF] border border-[#2541B2]/15 rounded-xl p-1 shadow-inner focus-within:border-[#2541B2]"
                >
                  <input
                    type="text"
                    value={userChatInput}
                    onChange={(e) => setUserChatInput(e.target.value)}
                    disabled={isChatLoading}
                    placeholder={`Fale com o Dr. Aiso sobre ${activeActivity}...`}
                    className="flex-grow bg-transparent text-xs text-[#2541B2] px-2 py-1.5 font-sans outline-none focus:ring-0 placeholder-[#2541B2]/40"
                  />
                  <button
                    type="submit"
                    disabled={isChatLoading || !userChatInput.trim()}
                    className="p-1.5 bg-[#2541B2] text-[#F7F7FF] rounded-lg hover:bg-[#1E3491] cursor-pointer disabled:opacity-40 transition-colors select-none shrink-0"
                  >
                    <Send size={12} />
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <div className="relative flex flex-col items-end pointer-events-auto">
              {/* Notification bubble with Dr. Aiso tips */}
              <AnimatePresence>
                {activeNotification && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.9 }}
                    onClick={() => {
                      setIsOrientadorExpanded(true);
                      setActiveNotification(null);
                    }}
                    className="absolute right-0 bottom-full mb-3 w-72 bg-white border-2 border-[#2541B2] p-4 rounded-2xl shadow-2xl text-left text-xs text-[#2541B2] pointer-events-auto cursor-pointer flex flex-col gap-1.5 hover:border-[#1E3491] hover:scale-101 duration-200 transition-all z-50 font-sans"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#2541B2]/60 font-black flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Notificação do Dr. Aiso
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveNotification(null);
                        }}
                        className="text-[#2541B2]/50 hover:text-[#2541B2] p-0.5 rounded transition-all cursor-pointer"
                        title="Fechar Notificação"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <p className="font-serif leading-relaxed italic text-[#2541B2] font-semibold">{activeNotification}</p>
                    <span className="text-[7.5px] font-mono text-[#2541B2]/50 uppercase text-right tracking-wider font-bold">Clique para abrir o chat • 🌿</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                key="collapsed-bubble"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setIsOrientadorExpanded(true)}
                className="px-4 py-2.5 bg-[#2541B2] hover:bg-[#1E3491] text-white rounded-full flex items-center gap-2 shadow-xl hover:shadow-2xl active:scale-95 duration-200 transition-all cursor-pointer pointer-events-auto font-mono text-[9.5px] uppercase tracking-wider font-bold relative group"
              >
                <div className="absolute -inset-1 rounded-full border border-[#2541B2]/60 animate-ping opacity-25 pointer-events-none" />
                <div className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </div>
                <Sparkles size={12} className="text-amber-300" />
                <span>Dr. Aiso</span>
              </motion.button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <footer className="w-full flex justify-between items-center bg-transparent mt-6 border-t border-[#2541B2]/10 pt-4">
        <button
          onClick={onOpenHelp}
          className="p-2 text-[#2541B2] hover:bg-[#2541B2]/5 rounded-md transition-all animate-pulse"
          title="Manual AISO e Filosofia"
        >
          <HelpCircle size={20} />
        </button>

        <span className="font-mono text-[8px] tracking-[0.25em] text-[#2541B2]/40 select-none">
          AISO INSTRUMENTATION // OFF-GRID CORE
        </span>

        <button
          onClick={onTriggerShutdown}
          className="flex items-center gap-1.5 text-[#2541B2]/70 hover:text-[#2541B2] transition-colors group cursor-pointer"
          title="Modo Hibernação profunda"
        >
          <span className="font-mono text-[8px] uppercase tracking-[0.2em] transition-colors duration-300">
            DESLIGAR AISO
          </span>
          <Power size={14} className="group-hover:rotate-12 transition-all duration-300" />
        </button>
      </footer>
    </div>
  );
}
