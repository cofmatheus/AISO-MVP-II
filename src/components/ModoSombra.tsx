import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Moon, EyeOff, AlertCircle, Play, X, Zap, HeartCrack, Power, Sparkles, BookOpen, Clock, Award } from "lucide-react";
import { PracticeSession, ErrorLog, AppSettings } from "../types";
import { playSingingBowl, playWindChime, startAmbientSoundscape, stopAmbientSoundscape } from "../utils/synthesizer";

interface ModoSombraProps {
  onBack: () => void;
  onSaveSession: (session: PracticeSession) => void;
  onLoggedDistraction: (errorLog: ErrorLog) => void;
  settings: AppSettings;
  activeActivity: string;
  activityProgress: number;
  onUpdateProgress: (activity: string, increment: number) => void;
}

// Full offline highly polished AI Companion tips database
const OWL_WISDOM_DATABASE: Record<string, { tip: string; errorPrevention: string; projectIdea: string }> = {
  "entalho em madeira": {
    tip: "Mantenha seus formões ultra-afiados. O perigo real não reside na lâmina bem afiada, mas sim na lâmina cega que exige força excessiva e descontrolada da sua musculatura.",
    errorPrevention: "Corte sempre no sentido oposto às suas mãos e corpo. Sinta a resistência das fibras para evitar rachar acidentalmente a madeira entalhada.",
    projectIdea: "Tente esculpir uma colher de bambu rústica ou um pequeno pingente de amuleto geométrico em pinho macio."
  },
  "leitura analógica": {
    tip: "Deixe um lápis à mão. Ler de forma ativa — sublinhando passagens, anotando ideias nas margens descartadas e gerando índices — duplica a neuro-retenção profunda.",
    errorPrevention: "Ao sentir impulsos de reler parágrafos sucessivos por mero cansaço ou devaneio, feche os olhos por cinco segundos e realize duas respirações profundas.",
    projectIdea: "Complete 15 páginas contínuas anotando apenas três conceitos macro em um caderno de rascunhos analógicos."
  },
  "caligrafia clássica": {
    tip: "O ritmo da respiração rege a tensão harmônica do traço. Solte o ar ao desenhar traços descendentes espessos guiando o peso, e expire nos ascendentes leves.",
    errorPrevention: "Mantenha o ângulo da pena constante em 45 graus com o papel. Não rotacione o cabo com os dedos; mova o braço inteiro de forma fluida a partir do cotovelo.",
    projectIdea: "Escreva uma citação que guie sua filosofia de vida em papel textured de algodão usando tinta preta nanquim clássica."
  },
  "desenho técnico": {
    tip: "A exatidão reside na manutenção mecânica de precisão. Limpe seus esquadros e réguas de acúmulo de grafite; ranhuras milimétricas distorcem escalas de compasso.",
    errorPrevention: "Não force a grafite perpendicularmente contra o papel de modo a cavar sulcos permanentes. Ajuste a maciez escolhendo lapiseiras 2H para rascunhos finos.",
    projectIdea: "Desenhe a projeção isométrica tripartida de uma engrenagem ou válvula de fole analógica usando esquadros padrão de 30º e 60º."
  },
  "jardinagem minuciosa": {
    tip: "A poda reconecta você com a paciência molecular das folhagens. Analise a árvore e seus fluxos de luz natural por 5 minutos inteiros antes do primeiro golpe de tesoura.",
    errorPrevention: "Cuidado absoluto na rega e na compactação do solo: substratos excessivamente lavados enfraquecem e apodrecem micro-raízes em vasos rasos.",
    projectIdea: "Efetue a modelagem e treinamento de um galho primário em sua muda favorita de bonsai usando fios de alumínio encapado."
  },
  "costura de precisão": {
    tip: "A agulha deve correr em simetria divina. A cadência uniforme de pontos surge mantendo a tensão do tecido firme no bastidor de costura clássica.",
    errorPrevention: "Evite linhas excessivamente longas para poupar paciência e prevenir nós crônicos. A distância ideal de trabalho é do dedo médio ao cotovelo.",
    projectIdea: "Produza seu próprio mini porta-agulhas de feltro cru ou costure um padrão geométrico circular simétrico de amortecimento."
  },
  "miniaturas & maquetes": {
    tip: "A aplicação de cola é o terror dos ansiosos digitais. Deposite o adesivo cirurgicamente encostando a cabeça de um alfinete ou palito de dentes fino.",
    errorPrevention: "Jamais junte peças úmidas recém-pintadas. O suor e a gordura ácida dos dedos fundem marcas digitais irreversíveis no acabamento fosco.",
    projectIdea: "Construa um diorama em miniatura de um balcão herbanário medieval usando papéis texturizados, caixas pequenas e musgo desidratado."
  },
  "meditação profunda": {
    tip: "O silêncio meditativo definitivo não equivale ao bloqueio de barulhos, mas sim a permitir que os ruídos entrem e saiam sem criar ganchos de julgamento.",
    errorPrevention: "Sempre que uma espiral de preocupações com prazos se insinuar, rotule-a mentalmente como 'pensamento fictício' e retorne o foco tátil à respiração.",
    projectIdea: "Mantenha-se na postura clássica por todo o ciclo meditando unicamente sob as variações de ar frio ou morno nas paredes de suas narinas."
  },
  "manutenção mecânica": {
    tip: "O aperto mecânico respeita o limite elástico de cada liga de metal. Rotacione parafusos de placas de forma intercalada em cruz para estabilizar tensões corporais.",
    errorPrevention: "Nunca force roscas em atrito metálico seco. Borrife micro-gotas de solvente lubrificante e aguarde três minutos para preservar roscas intactas.",
    projectIdea: "Desmonte, remova poeiras de esferas de rolamento, recubra em graxa lubrificante e reagrupe perfeitamente um componente de relógio antigo."
  },
  "escrita criativa": {
    tip: "Foque na tempestade literária livre e deixe a revisão cirúrgica para depois. O editor e o artista interno não podem habitar a mesma sala sensorial.",
    errorPrevention: "Evite o uso preguiçoso de adjetivos excessivos. Descreva estados emocionais demonstrando ações reais e detalhes concretos do ambiente tátil.",
    projectIdea: "Crie uma narrativa curta de exatamente 300 palavras retratando a vida de um mestre artesão que opera nobremente sob sombra absoluta."
  }
};

const DEFAULT_OWL_WISDOM = {
  tip: "Qualquer artesanato ou ofício manual exige consistência mecânica, foco prolongado na matéria tangível e paciência com o aprendizado analógico lento.",
  errorPrevention: "O tédio inicial é o sintoma natural do seu sistema dopaminérgico se desintoxicando da tela. Acolha o vazio; ele é o portão para a criatividade latente.",
  projectIdea: "Inicie um caderno físico cartonado onde você relata com caneta-tinteiro as datas, emoções e durações de cada sessão de silêncio AISO."
};

// Little beautiful interactive minimalist SVG Owl avatar Component
const BeautifulOwlAvatar = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 48 48" 
    className="w-12 h-12 text-[#9AC5F4] animate-pulse"
    fill="currentColor"
  >
    <path d="M24 4C13.52 4 5 12.52 5 23c0 9.07 6.4 16.63 15 18.51V46l4-4 4 4v-4.49c8.6-1.88 15-9.44 15-18.51 0-10.48-8.52-19-19-19zm-7 14c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm14 6c0 4.41-3.59 8-8 8s-8-3.59-8-8c0-.34.02-.68.07-1 .01-.05.02-.11.04-.16V22h15.78v.84c.02.05.04.11.05.16.05.32.07.66.07 1zm0-6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" fill="currentColor" opacity="0.85"/>
    <path d="M24 25l-2-2.5h4z" fill="#FCE22A" />
    <path d="M12 36c4.5 1 15.5 1 24 0" stroke="#9AC5F4" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function ModoSombra({
  onBack,
  onSaveSession,
  onLoggedDistraction,
  settings,
  activeActivity,
  activityProgress,
  onUpdateProgress,
}: ModoSombraProps) {
  // Config state
  const [targetMinutes, setTargetMinutes] = useState<number>(25);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // States for immersive overlay features
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isOwlOpen, setIsOwlOpen] = useState<boolean>(false);

  // Distraction reporting state (when they interrupt early)
  const [isReportingDistraction, setIsReportingDistraction] = useState<boolean>(false);
  const [distractionCategory, setDistractionCategory] = useState<string>("Compulsão Física");
  const [distractionNotes, setDistractionNotes] = useState<string>("");
  const [distractionIntensity, setDistractionIntensity] = useState<number>(3);

  // Running state countdown
  const [secondsRemaining, setSecondsRemaining] = useState<number>(1500); // 25 mins
  const timerRef = useRef<number | null>(null);

  // Quick default goals
  const timerOpts = [10, 15, 25, 30, 45, 60];

  // Fetch Owl wisdom corresponding to selection
  const wisdom = OWL_WISDOM_DATABASE[activeActivity] || DEFAULT_OWL_WISDOM;

  // Real-time Clock effect
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Chronometer elapsed count effect
  useEffect(() => {
    let cronoInterval: number | null = null;
    if (isActive) {
      setElapsedSeconds(0);
      cronoInterval = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (cronoInterval) clearInterval(cronoInterval);
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive) {
      setSecondsRemaining(targetMinutes * 60);
    }
  }, [targetMinutes, isActive]);

  useEffect(() => {
    if (isActive) {
      if (settings.enableAudioSynthesizer) {
        startAmbientSoundscape();
      }

      timerRef.current = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleCompleteSombra();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopAmbientSoundscape();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopAmbientSoundscape();
    };
  }, [isActive]);

  const handleStart = () => {
    if (settings.enableAudioSynthesizer) {
      playSingingBowl(144); // Resonant fundamental frequency on start
    }
    setSecondsRemaining(targetMinutes * 60);
    setElapsedSeconds(0);
    setIsActive(true);
    setIsCompleted(false);
    setIsOwlOpen(false); // keep drawer closed on startup
  };

  const handleCompleteSombra = () => {
    setIsActive(false);
    setIsCompleted(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Sound alert
    if (settings.enableAudioSynthesizer) {
      playSingingBowl(330);
      setTimeout(() => playSingingBowl(440), 900);
    }

    // Save success session
    const session: PracticeSession = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      durationSeconds: targetMinutes * 60,
      notes: `Foco em: ${activeActivity}. Sucesso no Modo Sombra em silêncio imersivo profundo.`,
      type: "sombra",
      completed: true,
    };
    onSaveSession(session);
  };

  // Clicked interruption button
  const handleInterrupt = () => {
    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Sound vibration
    if (settings.enableAudioSynthesizer) {
      playSingingBowl(110); // alert tone
    }
    setIsReportingDistraction(true);
  };

  const handleDiscardNoReport = () => {
    if(window.confirm("Deseja voltar sem registrar o desvio em seu diário? É altamente recomendável documentar seus impulsos para desenvolver resiliência.")) {
      setIsReportingDistraction(false);
      setSecondsRemaining(targetMinutes * 60);
      onBack();
    }
  };

  const handleSaveDistraction = (e: React.FormEvent) => {
    e.preventDefault();

    const actualPracticedSecs = targetMinutes * 60 - secondsRemaining;

    // Log the error
    const loggedError: ErrorLog = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      category: distractionCategory,
      description: distractionNotes.trim() || `Interrompeu o Modo Sombra após ${Math.round(actualPracticedSecs / 60)} min.`,
      intensity: distractionIntensity,
    };
    onLoggedDistraction(loggedError);

    // Save partial success session if practiced at least 30 secs
    if (actualPracticedSecs > 30) {
      const partialSession: PracticeSession = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        durationSeconds: actualPracticedSecs,
        notes: `Modo Sombra interrompido: ${distractionCategory}`,
        type: "sombra",
        completed: false,
      };
      onSaveSession(partialSession);
    }

    // Reset states
    alert("Desvio documentado no Diário de Erros.");
    setDistractionNotes("");
    setIsReportingDistraction(false);
    onBack();
  };

  // Format stopwatch/clock durations
  const formatTimeMinutesSeconds = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const secsRemainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${secsRemainder.toString().padStart(2, "0")}`;
  };

  const formatExactTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 md:px-6 py-6 flex flex-col flex-grow justify-between min-h-[90vh]">
      <AnimatePresence mode="wait">
        {/* State 1: Active immersion overlay */}
        {isActive ? (
          <motion.div
            key="activeSombra"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 bg-[#07090E] text-[#C2D6F5] z-[100] flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden"
          >
            {/* Minimal atmospheric background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,65,178,0.06)_0%,transparent_70%)] pointer-events-none" />

            {/* Immersive Header Indicator */}
            <div className="flex justify-between items-center z-10 w-full">
              <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-[#C2D6F5]/40 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                M O D O &nbsp; S O M B R A &nbsp; I M E R S I V O
              </span>
              
              {/* Floating physical Glassmorphic Power Exit key */}
              <button
                id="quit-sombra-button"
                onClick={handleInterrupt}
                className="p-3 bg-red-950/40 hover:bg-red-950/80 border border-red-500/20 text-red-400 hover:text-red-200 rounded-full transition-all duration-300 shadow-lg cursor-pointer flex items-center justify-center group"
                title="Sair do Modo Sombra / Abortar Imersão"
              >
                <Power size={18} className="transition-transform group-hover:scale-105" />
              </button>
            </div>

            {/* Main Center Area: Huge Clock & Stopwatch */}
            <div className="flex-grow flex flex-col items-center justify-center space-y-8 z-10 relative">
              <div className="text-center space-y-1">
                <span className="font-mono text-[8px] uppercase tracking-[0.35em] text-[#C2D6F5]/40 block">
                  relógio local real
                </span>
                {/* Real-time TICKING clock */}
                <h1 
                  id="sombra-local-clock"
                  className="font-mono text-6xl sm:text-7xl text-[#E8F1FC] font-semibold tracking-widest text-shadow-glow leading-none"
                >
                  {formatExactTime(currentTime)}
                </h1>
              </div>

              {/* Glowing focus core */}
              <div className="relative flex items-center justify-center py-4">
                <motion.div
                  animate={{
                    scale: [0.93, 1.25, 0.93],
                    opacity: [0.12, 0.38, 0.12]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full border border-sky-500/20 bg-sky-500/5 blur-sm"
                />

                <div className="text-center space-y-3 z-10 relative p-8 bg-slate-950/40 rounded-full border border-slate-800/20 min-w-[210px] sm:min-w-[240px]">
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-cyan-400 font-semibold block text-center max-w-[200px] mx-auto truncate">
                    "{activeActivity}"
                  </span>
                  
                  {/* Digital Countdown Timer */}
                  <span className="font-mono text-5xl sm:text-7xl text-cyan-300 tracking-widest font-black block leading-none py-1">
                    {formatTimeMinutesSeconds(secondsRemaining)}
                  </span>
                  
                  {/* Cronômetro (Stopwatch) elapsed */}
                  <span className="font-mono text-[9px] text-slate-400 flex items-center justify-center gap-1.5 uppercase tracking-widest">
                    <Clock size={10} className="text-cyan-400 animate-spin-slow" />
                    Tempo: {formatTimeMinutesSeconds(elapsedSeconds)}
                  </span>
                </div>
              </div>

              {/* Syllabus progression bar */}
              <div className="w-full max-w-xs space-y-2 bg-[#0C121D]/55 border border-sky-500/10 p-3.5 rounded-xl text-center">
                <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                  <span className="text-slate-400 uppercase tracking-wider">MÓDULO DE CURSO</span>
                  <span className="text-cyan-400 font-bold">{activityProgress}% concluído</span>
                </div>
                
                {/* Horizontal progress representation */}
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800/40">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${activityProgress}%` }} 
                  />
                </div>

                {/* Manual incremental button inside shadow mode so users can dynamically interact */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[9px] text-slate-500 font-mono italic">Duolingo Analógico AISO</span>
                  <button
                    onClick={() => onUpdateProgress(activeActivity, 5)}
                    className="px-2 py-0.5 border border-cyan-500/20 hover:border-cyan-500/60 bg-cyan-950/10 rounded text-[8px] font-mono uppercase tracking-wider text-cyan-400 cursor-pointer active:scale-95 transition-all"
                  >
                    +5% Progresso
                  </button>
                </div>
              </div>

              {/* Subtle caption */}
              <p className="text-center opacity-30 text-[9px] uppercase tracking-[0.4em] max-w-xs leading-relaxed">
                tela deliberadamente esbofeteada de fótons.<br />
                não ceda à distração mecânica.
              </p>
            </div>

            {/* Bottom Panel containing little Owl assistant & feedback */}
            <div className="flex flex-col z-10 w-full mt-4">
              <div className="flex items-end justify-between w-full">
                {/* Little Companion Owl button */}
                <button
                  id="coach-owl-toggle"
                  onClick={() => setIsOwlOpen(!isOwlOpen)}
                  className={`p-3 border rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer shadow-md gap-2 ${
                    isOwlOpen 
                      ? "bg-slate-900/90 border-cyan-400 text-cyan-200" 
                      : "bg-[#0B0E14] border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30"
                  }`}
                  title="Conselhos da Coruja Mentora Inteligente"
                >
                  <BeautifulOwlAvatar />
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em] font-semibold pr-1">
                    {isOwlOpen ? "Silenciar Coruja" : "Falar com Coruja"}
                  </span>
                </button>

                <div className="text-right text-[8px] font-mono text-slate-500 select-none">
                  Sombra Ativa // Off-grid Terminal
                </div>
              </div>

              {/* Custom Mentor Comment area inside Sombra Mode */}
              <AnimatePresence>
                {isOwlOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="mt-3 p-4 bg-[#0A0D14]/95 border border-cyan-500/20 rounded-xl space-y-3 shadow-2xl overflow-y-auto max-h-[190px]"
                  >
                    <div className="flex items-center gap-2 border-b border-cyan-500/10 pb-2">
                      <span className="text-xs font-serif font-semibold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wide">
                        🦉 Claridade da Coruja Mentora:
                      </span>
                      <span className="font-mono text-[9px] text-[#2541B2]/60 px-1.5 py-0.5 rounded uppercase font-medium bg-cyan-950/60 text-cyan-300">
                        "{activeActivity}"
                      </span>
                    </div>

                    <div className="space-y-2.5 text-[11.5px] leading-relaxed font-sans text-slate-300 font-light">
                      <div>
                        <strong className="text-cyan-400 font-medium">💡 Dica de Foco:</strong>
                        <p className="mt-0.5 pl-1.5 border-l border-cyan-500/20">{wisdom.tip}</p>
                      </div>
                      <div>
                        <strong className="text-rose-400 font-medium">⚡ Prevenção de Falhas:</strong>
                        <p className="mt-0.5 pl-1.5 border-l border-rose-500/20">{wisdom.errorPrevention}</p>
                      </div>
                      <div>
                        <strong className="text-emerald-400 font-medium">🛠️ Desafio Recomendado:</strong>
                        <p className="mt-0.5 pl-1.5 border-l border-emerald-500/20">{wisdom.projectIdea}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : isReportingDistraction ? (
          /* State 2: Distraction register wizard (Urgent logging) */
          <motion.div
            key="report"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex-grow flex flex-col items-center justify-center max-w-md mx-auto w-full py-6"
          >
            <form onSubmit={handleSaveDistraction} className="w-full bg-[#FFFFFF]/90 border border-red-200/30 p-6 rounded-2xl space-y-6 shadow-md shadow-red-200/5">
              <div className="text-center">
                <span className="font-serif italic text-red-600 text-xs uppercase tracking-widest flex items-center justify-center gap-1">
                  <HeartCrack size={13} /> Sombra Rompida
                </span>
                <h3 className="font-serif text-2xl text-[#2541B2] font-semibold uppercase tracking-wide mt-1">Interrupção Registrada</h3>
                <p className="text-[11px] text-slate-600 mt-1.5 font-light leading-relaxed">
                  Sem julgamentos. Mapear o desvio ajuda você a domesticar a atenção fragmentada sob o impulso dopaminérgico. Documente com integridade.
                </p>
                <div className="w-8 h-[1px] bg-red-200 mx-auto mt-3"></div>
              </div>

              {/* Distraction type */}
              <div className="space-y-2">
                <label htmlFor="distraction-category-selector" className="text-xs uppercase tracking-widest text-[#2541B2] font-semibold block">
                  Qual o gatilho principal?
                </label>
                <select
                  id="distraction-category-selector"
                  value={distractionCategory}
                  onChange={(e) => setDistractionCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none"
                >
                  <option value="Notificações / Chats">Notificações / Aplicativos de Chat</option>
                  <option value="Compulsão Analógico-Digital">Compulsão Física (Pegar o telefone reflexivamente)</option>
                  <option value="Redes Sociais">Redes Sociais (Instagram, TikTok, Twitter, etc)</option>
                  <option value="Ansiedade de Trabalho">Ansiedade / Escapar de tarefas pendentes</option>
                  <option value="Buscador Manual">Pesquisa espontânea no navegador</option>
                  <option value="Monotonia / Tédio">Monotonia / Desejo de micro-estratificações</option>
                  <option value="Outros Desvios">Outro motivo</option>
                </select>
              </div>

              {/* Reflection / Note details */}
              <div className="space-y-2">
                <label htmlFor="distraction-notes-textarea" className="text-xs uppercase tracking-widest text-[#2541B2] font-semibold block">
                  O que você sentiu antes de desviar o foco?
                </label>
                <textarea
                  id="distraction-notes-textarea"
                  rows={3}
                  value={distractionNotes}
                  onChange={(e) => setDistractionNotes(e.target.value)}
                  placeholder="Formigamento, tédio com a lentidão da matéria analógica, ansiedade por mensagens? Escreva aqui..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:outline-none font-light text-slate-800"
                />
              </div>

              {/* Intensity */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-[#2541B2] uppercase tracking-widest">
                  <span>Força do Impulso / Desejo</span>
                  <span className="text-[#2541B2]">{distractionIntensity} / 5</span>
                </div>
                <input
                  type="range"
                  id="distraction-intensity-range"
                  min="1"
                  max="5"
                  value={distractionIntensity}
                  onChange={(e) => setDistractionIntensity(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 accent-[#2541B2] rounded-md"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-light italic">
                  <span>Automático / Sem Esforço</span>
                  <span>Urgente / Irresistível</span>
                </div>
              </div>

              {/* Submit / Cancel buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  id="discard-distraction-btn"
                  onClick={handleDiscardNoReport}
                  className="py-2.5 border border-slate-200 hover:bg-slate-50 text-[#2541B2] text-[11px] uppercase tracking-widest rounded-lg transition-colors cursor-pointer font-semibold"
                >
                  Cancelar sem registrar
                </button>
                <button
                  type="submit"
                  id="save-distraction-btn"
                  className="py-2.5 bg-[#2541B2] text-white hover:bg-[#1E3491] text-[11px] uppercase tracking-widest rounded-lg font-bold flex items-center justify-center gap-1 active:scale-98 cursor-pointer"
                >
                  <Zap size={12} />
                  <span>Registrar no Diário</span>
                </button>
              </div>
            </form>
          </motion.div>
        ) : isCompleted ? (
          /* State 3: Completed congratulatory card */
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-grow flex flex-col items-center justify-center max-w-sm mx-auto text-center space-y-8"
          >
            <div className="w-20 h-20 bg-[#2541B2]/10 rounded-full flex items-center justify-center text-[#2541B2] mx-auto animate-bounce">
              <Award size={36} className="text-[#2541B2]" />
            </div>
            
            <div className="space-y-2">
              <span className="font-serif italic text-[#2541B2] text-sm">Contemplação Máxima</span>
              <h3 className="font-serif text-3xl text-[#2541B2] uppercase tracking-wide">Imersão Realizada!</h3>
              <p className="text-xs text-slate-700 font-light leading-relaxed">
                Você conquistou <strong className="font-medium text-[#2541B2]">{targetMinutes} minutos</strong> lendários de silêncio na sombra sob a atividade <strong className="font-semibold text-[#2541B2]">"{activeActivity}"</strong>.
              </p>
              <div className="pt-2">
                <div className="text-[11px] text-[#2541B2] font-mono uppercase bg-[#2541B2]/15 rounded py-1 px-3 inline-block">
                  🎖️ Nível de Especialidade Subiu (+10% Progresso)!
                </div>
              </div>
            </div>

            <button
              id="congratulations-return-btn"
              onClick={() => {
                setIsCompleted(false);
                onBack();
              }}
              className="px-8 py-3 bg-[#2541B2] text-[#F7F7FF] hover:bg-[#1E3491] text-xs font-semibold uppercase tracking-widest rounded-lg transition-all active:scale-98 cursor-pointer"
            >
              Reabrir Currículo
            </button>
          </motion.div>
        ) : (
          /* State 4: Setup (Idle state) */
          <motion.div
            key="setupSombra"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex-grow flex flex-col justify-center space-y-8 max-w-md mx-auto w-full text-[#2541B2]"
          >
            <div className="text-center space-y-2">
              <button 
                onClick={onBack}
                className="inline-flex items-center gap-1 text-[10px] uppercase font-mono tracking-widest text-[#2541B2]/60 hover:text-[#2541B2] mb-2 cursor-pointer"
              >
                ← Voltar para o Currículo
              </button>
              <h2 className="font-serif text-3xl text-[#2541B2] tracking-wide uppercase font-bold">Modo Sombra</h2>
              <div className="inline-block px-3 py-1 bg-[#2541B2]/10 border border-[#2541B2]/20 rounded-full text-xs font-mono font-medium lowercase">
                foco ativo em: <strong className="text-[#2541B2] font-semibold">"{activeActivity}"</strong>
              </div>
              <p className="font-serif italic text-slate-700 text-xs">
                Entre em um estado radical de zero estímulo luminoso.
              </p>
            </div>

            <div className="bg-[#FFFFFF]/80 border border-[#2541B2]/20 p-5 rounded-2xl space-y-5">
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-widest text-[#2541B2] font-semibold block text-center">
                  Escolha o Alvo da Sombra
                </span>

                <div className="grid grid-cols-3 gap-2">
                  {timerOpts.map((mins) => (
                    <button
                      key={mins}
                      id={`sombra-opt-btn-${mins}`}
                      onClick={() => setTargetMinutes(mins)}
                      className={`py-3 rounded-xl border text-xs tracking-wider transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        targetMinutes === mins
                          ? "bg-[#2541B2] text-[#F7F7FF] border-[#2541B2] font-semibold"
                          : "bg-slate-50 border-slate-200 text-[#2541B2]/70 hover:bg-slate-100"
                      }`}
                    >
                      <Moon size={11} className={targetMinutes === mins ? "text-white" : "text-[#2541B2]/50"} />
                      <span>{mins} minutos</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Explanatory concept of Modo Sombra */}
              <div className="space-y-3 pt-3 text-[11px] text-slate-700 leading-relaxed font-light border-t border-[#2541B2]/10">
                <p className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold shrink-0">▲</span>
                  <span>
                    No <strong className="font-[#2541B2] text-[#2541B2]">Modo Sombra</strong>, sua tela adquire um aspecto profundo, escurecendo todos os estímulos emissivos em um layout puramente escuro.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">▲</span>
                  <span>
                    Se você ceder ao reflexo e tocar na tela para sair indesejadamente, o Mentor exigirá a documentação do desvio no <strong className="font-medium text-red-600">Diário de Erros</strong>. Disciplina analógica voluntária.
                  </span>
                </p>
              </div>
            </div>

            <button
              id="start-sombra-btn"
              onClick={handleStart}
              className="w-full py-3.5 bg-[#2541B2] text-[#F7F7FF] hover:bg-[#1E3491] hover:scale-[1.01] text-xs font-semibold uppercase tracking-[0.2em] rounded-xl transition-all active:scale-98 flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Moon size={13} fill="currentColor" />
              <span>Iniciar Sombra Imersiva</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
