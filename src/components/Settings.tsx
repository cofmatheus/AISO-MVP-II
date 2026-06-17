import React from "react";
import { X, RefreshCw, Trash2, ShieldAlert, Award, Activity } from "lucide-react";
import { AppSettings, PracticeSession, ErrorLog } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onChangeSettings: (settings: AppSettings) => void;
  sessions: PracticeSession[];
  errorLogs: ErrorLog[];
  onClearAllData: () => void;
}

export default function Settings({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
  sessions,
  errorLogs,
  onClearAllData,
}: SettingsProps) {
  // Statistics Computations
  const totalCompletedSessions = sessions.filter((s) => s.completed).length;
  const totalSilenceSeconds = sessions
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.durationSeconds, 0);
  const totalSilenceMinutes = Math.round(totalSilenceSeconds / 60);

  // Distraction Category breakdown
  const categoryCount: { [key: string]: number } = {};
  errorLogs.forEach((log) => {
    categoryCount[log.category] = (categoryCount[log.category] || 0) + 1;
  });

  const topDistraction =
    Object.keys(categoryCount).length > 0
      ? Object.entries(categoryCount).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
      : "Nenhuma registrada";

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    onChangeSettings({ ...settings, dailyGoalMinutes: Math.max(1, val) });
  };

  const handleAudioToggle = () => {
    onChangeSettings({
      ...settings,
      enableAudioSynthesizer: !settings.enableAudioSynthesizer,
    });
  };

  const handleGrainToggle = () => {
    onChangeSettings({
      ...settings,
      enablePaperGrain: !settings.enablePaperGrain,
    });
  };

  const handleThemeToggle = () => {
    onChangeSettings({
      ...settings,
      enableDarkMode: !settings.enableDarkMode,
    });
  };

  const clearDataWithConfirmation = () => {
    if (
      window.confirm(
        "Tem certeza que deseja apagar todos os registros de silêncio e diário de erros? Esta ação é permanente."
      )
    ) {
      onClearAllData();
      alert("Todos os dados foram resetados.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="settings-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-xs"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-lg bg-surface paper-texture border-1.5 border-outline p-8 rounded-lg atmospheric-blur z-10 max-h-[85vh] overflow-y-auto"
            id="settings-modal-content"
          >
            {/* Close Button */}
            <button
              id="close-settings-btn"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-primary hover:opacity-75 transition-opacity"
            >
              <X size={20} />
            </button>

            {/* Title */}
            <div className="text-center mb-8">
              <span className="font-serif italic text-lg text-primary block mb-1">Painel Analítico</span>
              <h2 className="font-serif text-3xl text-primary tracking-wide uppercase">Configurações</h2>
              <div className="w-12 h-[1px] bg-outline mx-auto mt-2"></div>
            </div>

            {/* Settings Fields */}
            <div className="space-y-6">
              {/* Daily Goal Input */}
              <div className="flex flex-col gap-2">
                <label htmlFor="daily-goal-input" className="text-xs uppercase tracking-widest text-outline font-semibold">
                  Meta Diária de Silêncio (minutos)
                </label>
                <input
                  type="number"
                  id="daily-goal-input"
                  min="1"
                  max="480"
                  value={settings.dailyGoalMinutes}
                  onChange={handleGoalChange}
                  className="w-full bg-surface-container border-b-1.5 border-outline px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors focus:ring-1 focus:ring-primary/20 rounded-md"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-widest text-outline font-semibold">Telas Sonoras</span>
                    <span className="text-[11px] text-on-surface/75 font-light">
                      Emitir sinos e tons de cura por sintonia analógica durante o Modo Sombra.
                    </span>
                  </div>
                  <button
                    id="toggle-audio-btn"
                    onClick={handleAudioToggle}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.enableAudioSynthesizer ? "bg-primary" : "bg-surface-dim"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-surface shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.enableAudioSynthesizer ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-widest text-outline font-semibold">Micro-Matriz de Precisão</span>
                    <span className="text-[11px] text-on-surface/75 font-light">
                      Ativar overlay holográfico de micro-pontos para modular o aspecto emissivo da tela.
                    </span>
                  </div>
                  <button
                    id="toggle-grain-btn"
                    onClick={handleGrainToggle}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.enablePaperGrain ? "bg-primary" : "bg-surface-dim"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-surface shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.enablePaperGrain ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-widest text-outline font-semibold">Filtro de Noite (Tema Escuro)</span>
                    <span className="text-[11px] text-on-surface/75 font-light">
                      Alternar para um espectro com baixa taxa de emissão azul para reduzir a fadiga ocular.
                    </span>
                  </div>
                  <button
                    id="toggle-dark-mode-btn"
                    onClick={handleThemeToggle}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.enableDarkMode ? "bg-primary" : "bg-surface-dim"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-surface shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.enableDarkMode ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Dangerous Area */}
              <div className="mt-8 pt-6 border-t border-outline/30 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-error uppercase tracking-wider">Purgatório</span>
                  <span className="text-[11px] text-on-surface/60 font-light">Limpa todos os dados locais permanentemente.</span>
                </div>
                <button
                  id="clear-data-btn"
                  onClick={clearDataWithConfirmation}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-error/40 text-error hover:bg-error/5 text-xs uppercase tracking-widest rounded-md duration-300 transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Limpar Tudo</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
