import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Square, Compass, Clock, RotateCcw, Save, MessageSquare, ArrowLeft, Heart } from "lucide-react";
import { PracticeSession, AppSettings } from "../types";
import { playSingingBowl, playWindChime, startAmbientSoundscape, stopAmbientSoundscape } from "../utils/synthesizer";

interface PraticaLivreProps {
  onBack: () => void;
  onSaveSession: (session: PracticeSession) => void;
  settings: AppSettings;
  activeActivity: string;
}

type PracticeMode = "stopwatch" | "timer";

export default function PraticaLivre({ onBack, onSaveSession, settings, activeActivity }: PraticaLivreProps) {
  // Session setup state
  const [mode, setMode] = useState<PracticeMode>("timer");
  const [targetMinutes, setTargetMinutes] = useState<number>(10);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFinishing, setIsFinishing] = useState<boolean>(false); // showing reflection form
  const [showStopConfirm, setShowStopConfirm] = useState<boolean>(false);

  // Timer run state
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(600); // 10 mins

  // Breathing guide state
  const [breathPhase, setBreathPhase] = useState<"Inalar" | "Reter (Cheio)" | "Exalar" | "Reter (Vazio)">("Inalar");
  const [breathProgress, setBreathProgress] = useState<number>(0);

  // Notes/Journaling state
  const [reflectionText, setReflectionText] = useState<string>("");
  const [calmScore, setCalmScore] = useState<number>(3); // 1-5 scale

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Durations in minutes options helper
  const durationOptions = [5, 10, 15, 20, 30, 45, 60];

  // Sync remaining seconds if target Minutes change
  useEffect(() => {
    if (!isActive) {
      setTimeRemaining(targetMinutes * 60);
    }
  }, [targetMinutes, isActive]);

  // Breathing guide phase cycles (each phase 4 seconds in box-breathing)
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setBreathPhase((prev) => {
        if (prev === "Inalar") return "Reter (Cheio)";
        if (prev === "Reter (Cheio)") return "Exalar";
        if (prev === "Exalar") return "Reter (Vazio)";
        return "Inalar";
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isActive]);

  // Handle active session timer countdown / countup
  useEffect(() => {
    if (isActive) {
      if (settings.enableAudioSynthesizer) {
        startAmbientSoundscape();
      }

      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);

        if (mode === "timer") {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              // Timer expired! Trigger finish
              handleCompleteSession();
              return 0;
            }
            return prev - 1;
          });
        }
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
  }, [isActive, mode]);

  const handleStart = () => {
    // Attempt sound bowl triggers
    if (settings.enableAudioSynthesizer) {
      playSingingBowl(220); // Resonate A bowl
    }
    setIsActive(true);
    setElapsedSeconds(0);
    if (mode === "timer") {
      setTimeRemaining(targetMinutes * 60);
    }
  };

  const handleStopAndDiscard = () => {
    setShowStopConfirm(true);
  };

  const confirmStopAndDiscard = () => {
    setIsActive(false);
    setElapsedSeconds(0);
    setTimeRemaining(targetMinutes * 60);
    setShowStopConfirm(false);
  };

  const handleManualComplete = () => {
    handleCompleteSession();
  };

  const handleCompleteSession = () => {
    setIsActive(false);
    if (settings.enableAudioSynthesizer) {
      playSingingBowl(330); // Higher, tranquil completed chime E bowl
    }
    setIsFinishing(true);
  };

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();

    const actualDuration = mode === "timer" 
      ? (targetMinutes * 60 - timeRemaining) 
      : elapsedSeconds;

    const completed = mode === "timer" ? timeRemaining === 0 : actualDuration > 10;

    const session: PracticeSession = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      durationSeconds: Math.max(1, actualDuration),
      notes: reflectionText.trim() || `Foco em: ${activeActivity}. Prática silenciosa concluída.`,
      type: "livre",
      completed: true,
    };

    onSaveSession(session);

    // Reset states
    setReflectionText("");
    setCalmScore(3);
    setIsFinishing(false);
    setElapsedSeconds(0);
    onBack();
  };

  // Human readable time formatter
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-8 flex flex-col flex-grow justify-between min-h-[80vh]">
      {/* Upper Navigation Heading */}
      <div className="flex items-center justify-between border-b border-outline/20 pb-4 mb-8">
        <button
          id="pratica-livre-back-btn"
          onClick={onBack}
          disabled={isActive}
          className="flex items-center gap-2 text-primary hover:opacity-75 transition-opacity disabled:opacity-30 text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} />
          <span>Voltar ao Ateliê</span>
        </button>
        <span className="font-serif italic text-sm text-primary opacity-80">
          {isActive ? "Ativo" : "Estúdio de Prática"}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {/* State 1: Reflection / Save Form */}
        {isFinishing ? (
          <motion.div
            key="reflection"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex-grow flex flex-col items-center justify-center max-w-md mx-auto w-full py-6"
          >
            <form onSubmit={handleSaveReflection} className="w-full bg-surface-container-low border border-outline/30 p-6 rounded-lg atmospheric-blur space-y-6">
              <div className="text-center">
                <span className="font-serif italic text-primary text-sm">Prática Concluída</span>
                <h3 className="font-serif text-2xl text-primary uppercase tracking-wide mt-1">Selo do Silêncio</h3>
                <p className="text-xs text-outline tracking-wider mt-1">
                  Tempo silenciado: <strong className="text-on-surface">{formatTime(mode === "timer" ? targetMinutes * 60 - timeRemaining : elapsedSeconds)}</strong>
                </p>
                <div className="w-8 h-[1px] bg-outline mx-auto mt-3"></div>
              </div>

              {/* Reflection Input */}
              <div className="space-y-2">
                <label htmlFor="reflection-textarea" className="text-xs uppercase tracking-widest text-[#0F5132] font-semibold flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-emerald-700" />
                  <span>Diário de Insights</span>
                </label>
                <textarea
                  id="reflection-textarea"
                  rows={4}
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="Quais pensamentos flutuaram? Sentiu impulsividade mecânica em tocar no AISO? Registre suas notas de quietude..."
                  className="w-full bg-emerald-50/70 border-2 border-emerald-500/30 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-600 transition-colors focus:ring-2 focus:ring-emerald-500/20 placeholder-emerald-900/40 font-light text-emerald-950"
                />
              </div>

              {/* Serenity Scale */}
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-widest text-outline font-semibold flex items-center gap-1.5">
                  <Heart size={13} />
                  <span>Índice de Serenidade</span>
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((level) => {
                    const label = ["Ansioso", "Inquieto", "Neutro", "Sereno", "Profundo"][level - 1];
                    return (
                      <button
                        type="button"
                        key={level}
                        id={`serenity-btn-${level}`}
                        onClick={() => setCalmScore(level)}
                        className={`flex flex-col items-center p-2 rounded-md border text-center transition-all ${
                          calmScore === level
                            ? "border-primary bg-primary/10 text-primary-container font-medium"
                            : "border-outline/10 hover:bg-surface text-outline"
                        }`}
                      >
                        <span className="text-sm font-serif">{level}</span>
                        <span className="text-[9px] mt-1 scale-90 truncate w-full">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action */}
              <button
                type="submit"
                id="submit-reflection-btn"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-sans tracking-widest uppercase text-xs rounded-lg font-bold flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md shadow-emerald-700/10 hover:shadow-emerald-700/20"
              >
                <Save size={15} />
                <span>Salvar Registro</span>
              </button>
            </form>
          </motion.div>
        ) : isActive ? (
          /* State 2: Active practice timer screen */
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex-grow flex flex-col items-center justify-center space-y-12 py-10"
          >
            {/* Main Visual Pulse circle */}
            <div className="relative flex items-center justify-center">
              {/* Breath pulsing outer bloom ring */}
              <motion.div
                animate={{
                  scale: breathPhase === "Inalar" ? 1.25 : breathPhase === "Reter (Cheio)" ? 1.25 : breathPhase === "Exalar" ? 0.95 : 0.95,
                  opacity: breathPhase === "Inalar" ? 0.4 : breathPhase === "Reter (Cheio)" ? 0.5 : breathPhase === "Exalar" ? 0.25 : 0.2,
                }}
                transition={{ duration: 4, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-primary/5 border border-primary/25 w-72 h-72 md:w-88 md:h-88 pointer-events-none"
              />

              {/* Beautiful central timer circle */}
              <div 
                id="active-practice-circle"
                className="w-64 h-64 md:w-80 md:h-80 hand-drawn-circle flex flex-col items-center justify-center bg-surface-container-lowest/80 atmospheric-blur z-10 p-4"
              >
                <span className="font-mono text-[9px] tracking-[0.2em] text-primary/60 uppercase mb-2 text-center max-w-[160px] truncate">
                  {activeActivity}
                </span>
                <motion.span 
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="font-serif text-6xl md:text-8xl text-primary tracking-wider font-semibold leading-none py-1.5"
                >
                  {mode === "timer" ? formatTime(timeRemaining) : formatTime(elapsedSeconds)}
                </motion.span>
                <span className="font-serif italic text-xs text-primary/60 mt-1">
                  {mode === "timer" ? "tempo restante" : "decorrido"}
                </span>
                
                {/* Breathing anchor prompt */}
                <div className="absolute bottom-12 text-center h-8 flex flex-col justify-center">
                  <motion.span
                    key={breathPhase}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 1 }}
                    className="text-[10px] uppercase tracking-[0.4em] text-outline font-semibold"
                  >
                    {breathPhase}
                  </motion.span>
                </div>
              </div>
            </div>

            {/* Instruction caption */}
            <div className="text-center max-w-sm px-4">
              <p className="font-serif italic text-primary/80 text-sm">
                "Não há pressa no silêncio. Deixe o AISO, olhe ao seu redor, ouça as texturas ocultas no ambiente analógico."
              </p>
            </div>

            {/* Stop Actions */}
            <div className="flex gap-4">
              <button
                id="cancel-practice-btn"
                onClick={handleStopAndDiscard}
                className="px-6 py-2.5 border border-error/50 hover:bg-error/5 text-error text-xs uppercase tracking-widest rounded-md transition-colors"
                title="Descartar atual sessão"
              >
                Descartar
              </button>
              
              <button
                id="complete-practice-btn"
                onClick={handleManualComplete}
                className="px-8 py-2.5 bg-primary text-on-primary hover:bg-primary/95 text-xs uppercase tracking-widest rounded-md font-medium shadow-sm"
              >
                Finalizar e Registrar
              </button>
            </div>
          </motion.div>
        ) : (
          /* State 3: Setup screen (Idle) */
          <motion.div
            key="setup"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex-grow flex flex-col justify-center space-y-10 py-4 max-w-xl mx-auto w-full"
          >
            {/* Header branding */}
            <div className="text-center space-y-2">
              <h2 className="font-serif text-3xl text-primary tracking-wide uppercase">Prática Livre</h2>
              <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-mono font-medium lowercase">
                foco em: <strong className="text-primary font-semibold">"{activeActivity}"</strong>
              </div>
              <p className="font-serif italic text-on-surface/75 text-sm pt-1">
                Determine seu espaço de silêncio meditativo sem metas compulsivas.
              </p>
            </div>

            {/* Selection modes */}
            <div className="grid grid-cols-2 gap-4 border border-outline/20 p-1.5 rounded-lg bg-surface-container-low">
              <button
                id="select-timer-mode-btn"
                onClick={() => setMode("timer")}
                className={`py-3 flex flex-col items-center gap-1.5 rounded-md duration-300 transition-all ${
                  mode === "timer"
                    ? "bg-surface text-primary border border-outline/20 font-medium"
                    : "text-outline hover:text-on-surface"
                }`}
              >
                <Clock size={16} />
                <span className="text-[10px] uppercase tracking-widest font-semibold">Sessão Temporizada</span>
              </button>
              
              <button
                id="select-stopwatch-mode-btn"
                onClick={() => setMode("stopwatch")}
                className={`py-3 flex flex-col items-center gap-1.5 rounded-md duration-300 transition-all ${
                  mode === "stopwatch"
                    ? "bg-surface text-primary border border-outline/20 font-medium"
                    : "text-outline hover:text-on-surface"
                }`}
              >
                <Compass size={16} />
                <span className="text-[10px] uppercase tracking-widest font-semibold">Cronômetro Aberto</span>
              </button>
            </div>

            {/* Details configuration section */}
            <div className="bg-surface-container-lowest border border-outline/10 p-6 rounded-lg space-y-6">
              {mode === "timer" ? (
                <div className="space-y-4">
                  <span className="text-xs uppercase tracking-widest text-outline font-semibold block text-center">
                    Escolha o Silêncio Alvo
                  </span>
                  
                  {/* Grid durations */}
                  <div className="grid grid-cols-4 gap-2">
                    {durationOptions.map((mins) => (
                      <button
                        key={mins}
                        id={`duration-opt-btn-${mins}`}
                        onClick={() => setTargetMinutes(mins)}
                        className={`py-2 rounded-md border text-xs tracking-wider transition-all ${
                          targetMinutes === mins
                            ? "bg-primary text-on-primary border-primary font-semibold"
                            : "bg-surface border-outline/15 text-outline hover:bg-surface-container-low"
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-on-surface/80 text-sm italic font-light space-y-2">
                  <p>
                    No modo <strong className="font-medium text-primary">Cronômetro Aberto</strong>, o silêncio flui no seu próprio ritmo. Sente-se confortavelmente, feche os olhos e dedique-se ao seu eu analógico.
                  </p>
                  <p className="text-xs text-outline tracking-wide">
                    O relógio registrará o silêncio total até que você decida finalizar.
                  </p>
                </div>
              )}

              {/* Informative advice */}
              <div className="bg-primary/5 p-4 rounded-md border-l-2 border-primary text-[11px] text-primary-container leading-relaxed">
                <strong>Ritual recomendado:</strong> Posicione o smartphone invertido (tela para baixo). Durante as sessões, use o áudio de fones se desejar chimes aleatórios analógicos e sinalizadores táticos de respiração.
              </div>
            </div>

            {/* Launch trigger button */}
            <button
              id="start-practice-btn"
              onClick={handleStart}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-[0.3em] rounded-lg transition-all active:scale-98 flex items-center justify-center gap-2 shadow-md shadow-emerald-700/10 hover:shadow-emerald-700/20"
            >
              <Play size={14} className="fill-current" />
              <span>Entrar no Silêncio</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Discard Session Custom Confirmation Overlay */}
      <AnimatePresence>
        {showStopConfirm && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStopConfirm(false)}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-sm bg-surface paper-texture border-1.5 border-outline p-6 rounded-lg atmospheric-blur z-10 text-center space-y-6"
              id="pratica-stop-confirmation-modal"
            >
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto text-error">
                <Square size={20} className="fill-current" />
              </div>
              <div className="space-y-2">
                <h4 className="font-serif text-lg text-primary font-bold uppercase tracking-wide">Descartar Prática?</h4>
                <p className="text-xs text-on-surface/75 font-sans leading-relaxed">
                  Deseja realmente interromper esta prática de silêncio contemplativo? O tempo decorrido será descartado e não será salvo em seu histórico de sessões.
                </p>
              </div>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => setShowStopConfirm(false)}
                  className="px-4 py-2 border border-outline/35 bg-surface hover:bg-surface-dim/80 text-on-surface text-xs uppercase tracking-widest font-semibold rounded-md duration-200"
                >
                  Continuar Prática
                </button>
                <button
                  onClick={confirmStopAndDiscard}
                  className="px-4 py-2 bg-error hover:bg-error/95 text-white text-xs uppercase tracking-widest font-bold rounded-md duration-200"
                >
                  Sim, Descartar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
