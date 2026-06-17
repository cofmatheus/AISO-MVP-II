import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Wind, 
  Compass, 
  EyeOff, 
  Eye, 
  Activity, 
  BookOpen, 
  Moon, 
  Target, 
  Heart, 
  Clock, 
  Sparkles 
} from "lucide-react";
import { DrAisoToast } from "../hooks/useDrAiso";

interface DrAisoToastContainerProps {
  toasts: DrAisoToast[];
  onDismiss: (id: string) => void;
}

// Map categories to symbolic icons with unique themes
const CATEGORY_MAP: Record<string, { icon: React.ReactNode; label: string; color: string; border: string }> = {
  respiracao: {
    icon: <Wind size={16} />,
    label: "Exercício Respiratório",
    color: "bg-teal-50 text-teal-800",
    border: "border-teal-200"
  },
  contemplacao: {
    icon: <Compass size={16} />,
    label: "Mentalidade Zen",
    color: "bg-[#2541B2]/5 text-[#2541B2]",
    border: "border-[#2541B2]/20"
  },
  desconexao: {
    icon: <EyeOff size={16} />,
    label: "Desconexão Digital",
    color: "bg-red-50 text-red-800",
    border: "border-red-150"
  },
  olhar: {
    icon: <Eye size={16} />,
    label: "Foco Ocular",
    color: "bg-blue-50 text-blue-800",
    border: "border-blue-200"
  },
  presenca: {
    icon: <Sparkles size={16} />,
    label: "Presença Plena",
    color: "bg-amber-50 text-amber-800",
    border: "border-amber-200"
  },
  filosofia: {
    icon: <BookOpen size={16} />,
    label: "Provérbio Contemplativo",
    color: "bg-purple-50 text-purple-800",
    border: "border-purple-200"
  },
  descanso: {
    icon: <Moon size={16} />,
    label: "Descanso Ativo",
    color: "bg-slate-100 text-slate-800",
    border: "border-slate-300"
  },
  foco: {
    icon: <Target size={16} />,
    label: "Direção de Energia",
    color: "bg-emerald-50 text-emerald-800",
    border: "border-emerald-200"
  },
  corpo: {
    icon: <Heart size={16} />,
    label: "Consciência Corporal",
    color: "bg-[#2541B2]/5 text-[#2541B2]",
    border: "border-[#2541B2]/20"
  },
  tempo: {
    icon: <Clock size={16} />,
    label: "Ritmo e Tempo",
    color: "bg-amber-50 text-amber-800",
    border: "border-amber-300"
  }
};

export default function DrAisoToastContainer({ toasts, onDismiss }: DrAisoToastContainerProps) {
  return (
    <div 
      id="dr-aiso-toasts-viewport"
      className="fixed bottom-6 right-6 z-55 flex flex-col gap-3 max-w-sm w-[90vw] sm:w-[350px] pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = CATEGORY_MAP[toast.category] || {
            icon: <Activity size={16} />,
            label: "Dica do Dr. Aiso",
            color: "bg-[#2541B2]/5 text-[#2541B2]",
            border: "border-[#2541B2]/15"
          };

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.35, type: "spring", stiffness: 350, damping: 25 }}
              className={`bg-white border-1.5 ${config.border} p-4 rounded-xl shadow-xl hover:shadow-2xl flex gap-3 text-left pointer-events-auto relative overflow-hidden`}
              role="alert"
            >
              {/* Symbolic Icon Tag */}
              <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                {config.icon}
              </div>

              {/* Toast Messages content */}
              <div className="flex-grow min-w-0 pr-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-mono uppercase tracking-widest font-extrabold text-[#2541B2]/55">
                    {config.label}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="font-serif italic font-semibold text-xs text-[#2541B2] mt-1 leading-relaxed">
                  "{toast.quote}"
                </p>
                <div className="flex items-center gap-1 mt-2.5">
                  <span className="text-[7px] font-mono text-emerald-600 uppercase font-black tracking-wider">
                    Dr. Aiso • Orientador Contemplativo
                  </span>
                </div>
              </div>

              {/* Manual Close handle */}
              <button
                onClick={() => onDismiss(toast.id)}
                className="absolute top-3 right-3 text-[#2541B2]/40 hover:text-[#2541B2] p-1 rounded-md transition-colors cursor-pointer"
                title="Ignorar conselho"
              >
                <X size={12} />
              </button>

              {/* Animated bottom progress bar reflecting increased lifespan */}
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 15, ease: "linear" }}
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-500/30"
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
