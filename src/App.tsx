import React, { useState, useEffect } from "react";
import { AppSettings, PracticeSession, ErrorLog, UserProfile, ActivityItem } from "./types";
import MainScreen from "./components/MainScreen";
import PraticaLivre from "./components/PraticaLivre";
import ModoSombra from "./components/ModoSombra";
import DiarioErros from "./components/DiarioErros";
import Settings from "./components/Settings";
import Help from "./components/Help";
import ProfilePage from "./components/ProfilePage";
import WelcomeScreen from "./components/WelcomeScreen";
import { useDrAiso } from "./hooks/useDrAiso";
import DrAisoToastContainer from "./components/DrAisoToastContainer";
import { motion, AnimatePresence } from "motion/react";
import { Power, Moon } from "lucide-react";
import { 
  isKeysConfigured, 
  syncUserProfile, 
  saveRemoteSession, 
  fetchRemoteSessions, 
  saveRemoteErrorLog, 
  deleteRemoteErrorLog, 
  fetchRemoteErrorLogs, 
  saveRemoteSettings, 
  fetchRemoteSettings 
} from "./lib/firebase";

// Local storage key names
const STORAGE_SESSIONS = "desmame_sessions";
const STORAGE_ERROR_LOGS = "desmame_error_logs";
const STORAGE_SETTINGS = "desmame_settings";
const STORAGE_ACTIVITIES = "aiso_activities";

const defaultSettings: AppSettings = {
  dailyGoalMinutes: 30,
  enableAudioSynthesizer: true,
  enablePaperGrain: true,
  activeLanguage: "pt-br",
  enableDarkMode: false,
};

const defaultUserProfile: UserProfile = {
  uid: "",
  name: "Visitante",
  email: "",
  photoURL: "",
  isLoggedIn: false
};

const DEFAULT_ACTIVITIES: ActivityItem[] = [
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

export default function App() {
  // Dr. Aiso periodic automated triggers
  const { toasts, dismissToast } = useDrAiso();

  // Application view route
  const [view, setView] = useState<"main" | "pratica_livre" | "modo_sombra" | "diario_erros" | "perfil">("main");

  // Global overlay modal toggles
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Deep hibernation shade (Desligar) State
  const [isShutDown, setIsShutDown] = useState<boolean>(false);

  // States initialized from local storage
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem("aiso_user_profile");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (_) {}
    return defaultUserProfile;
  });

  // Dynamic user activities list state
  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ACTIVITIES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (_) {}
    return DEFAULT_ACTIVITIES;
  });

  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [activeActivity, setActiveActivity] = useState<string>(() => {
    return localStorage.getItem("aiso_active_activity") || "entalho em madeira";
  });

  const handleSetActiveActivity = (act: string) => {
    setActiveActivity(act);
    localStorage.setItem("aiso_active_activity", act);
  };

  // Load from localStorage on initialization
  useEffect(() => {
    try {
      const storedSecs = localStorage.getItem(STORAGE_SESSIONS);
      if (storedSecs) {
        setSessions(JSON.parse(storedSecs));
      }

      const storedErrors = localStorage.getItem(STORAGE_ERROR_LOGS);
      if (storedErrors) {
        setErrorLogs(JSON.parse(storedErrors));
      }

      const storedSettings = localStorage.getItem(STORAGE_SETTINGS);
      if (storedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(storedSettings) });
      }
    } catch (e) {
      console.warn("Failed to retrieve state parameters from localStorage", e);
    }
  }, []);

  // Save activities to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  const handleAddActivity = (newAct: ActivityItem) => {
    setActivities((prev) => {
      // Avoid duplication
      if (prev.some((a) => a.id === newAct.id)) return prev;
      return [...prev, newAct];
    });
  };

  const handleDeleteActivity = (id: string) => {
    setActivities((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      // If we deleted the currently active activity, switch activeActivity to the first remaining activity
      if (activeActivity === id && filtered.length > 0) {
        handleSetActiveActivity(filtered[0].id);
      }
      return filtered;
    });
  };

  // Sincronizador de dados com o Firestore de forma dinâmica
  useEffect(() => {
    if (!isKeysConfigured || !profile.isLoggedIn || !profile.uid) return;

    const pullRemoteAndUpdateCleanly = async () => {
      try {
        await syncUserProfile(profile.uid, profile);

        const remoteSessions = await fetchRemoteSessions(profile.uid);
        if (remoteSessions && remoteSessions.length > 0) {
          setSessions(remoteSessions as PracticeSession[]);
          localStorage.setItem(STORAGE_SESSIONS, JSON.stringify(remoteSessions));
        } else if (sessions.length > 0) {
          for (const sess of sessions) {
            await saveRemoteSession(profile.uid, sess);
          }
        }

        const remoteLogs = await fetchRemoteErrorLogs(profile.uid);
        if (remoteLogs && remoteLogs.length > 0) {
          setErrorLogs(remoteLogs as ErrorLog[]);
          localStorage.setItem(STORAGE_ERROR_LOGS, JSON.stringify(remoteLogs));
        } else if (errorLogs.length > 0) {
          for (const log of errorLogs) {
            await saveRemoteErrorLog(profile.uid, log);
          }
        }

        const remoteSettings = await fetchRemoteSettings(profile.uid);
        if (remoteSettings) {
          setSettings((prev) => {
            const next = { ...prev, ...remoteSettings };
            localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(next));
            return next;
          });
        } else {
          await saveRemoteSettings(profile.uid, settings);
        }
      } catch (err) {
        console.warn("Falha síncrona ao sincronizar com Firestore:", err);
      }
    };

    pullRemoteAndUpdateCleanly();
  }, [profile.isLoggedIn, profile.uid]);

  // Synchronize theme with class on root element
  useEffect(() => {
    if (settings.enableDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.enableDarkMode]);

  // Save changes helper functions
  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem("aiso_user_profile", JSON.stringify(newProfile));
    if (isKeysConfigured && newProfile.isLoggedIn && newProfile.uid) {
      syncUserProfile(newProfile.uid, newProfile);
    }
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(newSettings));
    if (isKeysConfigured && profile.isLoggedIn && profile.uid) {
      saveRemoteSettings(profile.uid, newSettings);
    }
  };

  const handleSaveSession = (newSession: PracticeSession) => {
    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem(STORAGE_SESSIONS, JSON.stringify(updated));
    if (isKeysConfigured && profile.isLoggedIn && profile.uid) {
      saveRemoteSession(profile.uid, newSession);
    }
  };

  const handleAddErrorLog = (newLog: ErrorLog) => {
    const updated = [newLog, ...errorLogs];
    setErrorLogs(updated);
    localStorage.setItem(STORAGE_ERROR_LOGS, JSON.stringify(updated));
    if (isKeysConfigured && profile.isLoggedIn && profile.uid) {
      saveRemoteErrorLog(profile.uid, newLog);
    }
  };

  const handleDeleteErrorLog = (id: string) => {
    const updated = errorLogs.filter((log) => log.id !== id);
    setErrorLogs(updated);
    localStorage.setItem(STORAGE_ERROR_LOGS, JSON.stringify(updated));
    if (isKeysConfigured && profile.isLoggedIn && profile.uid) {
      deleteRemoteErrorLog(profile.uid, id);
    }
  };

  const handleClearAllData = () => {
    setSessions([]);
    setErrorLogs([]);
    setSettings(defaultSettings);
    setProfile(defaultUserProfile);
    setActivities(DEFAULT_ACTIVITIES);
    localStorage.removeItem(STORAGE_SESSIONS);
    localStorage.removeItem(STORAGE_ERROR_LOGS);
    localStorage.removeItem(STORAGE_SETTINGS);
    localStorage.removeItem(STORAGE_ACTIVITIES);
    localStorage.removeItem("aiso_user_profile");
    localStorage.removeItem("aiso_active_activity");
    setIsSettingsOpen(false);
    setView("main");
  };

  // If user is not authenticated with Google, show the stunning initial login screen!
  if (!profile.isLoggedIn) {
    return (
      <div className="relative min-h-screen bg-surface text-on-surface paper-texture select-none transition-colors duration-500 overflow-x-hidden">
        {settings.enablePaperGrain && <div className="grain-overlay" />}
        <WelcomeScreen onLogin={handleSaveProfile} />
      </div>
    );
  }

  // Calculate current active activity parameters for ModoSombra
  const activeSessions = sessions.filter(
    s => s.completed && (s.activityId === activeActivity || s.notes.toLowerCase().includes(activeActivity.toLowerCase()))
  );
  const practicedSeconds = activeSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const practicedHours = practicedSeconds / 3600;
  const baseMastery = getBaseMasteryHours(activeActivity);
  const masteryTarget = baseMastery + (activeSessions.length * 1.5);
  const currentProgressPercent = Math.min(100, Math.round((practicedHours / masteryTarget) * 100));

  return (
    <div className="relative min-h-screen bg-surface text-on-surface paper-texture select-none transition-colors duration-500 overflow-x-hidden animate-fade-in">
      {/* Paper grain visual noise overlay */}
      {settings.enablePaperGrain && <div className="grain-overlay" />}

      {/* Main Container Views Wrapper */}
      <div className="flex flex-col min-h-screen p-4 sm:p-6 md:p-8">
        <AnimatePresence mode="wait">
          {isShutDown ? (
            /* Shut down state visual curtain */
            <motion.div
              key="shutdown"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="fixed inset-0 bg-[#070b10] z-50 flex flex-col justify-between p-12 text-[#eceef1] paper-texture"
            >
              <div className="absolute top-12 left-12 text-[#7ab2d3]/20 font-serif italic text-xs tracking-widest">
                A I S O &nbsp; C O N T E M P L A T I V O
              </div>

              <div className="flex-grow flex flex-col items-center justify-center text-center space-y-12">
                <motion.div
                  animate={{
                    scale: [0.98, 1.05, 0.98],
                    opacity: [0.2, 0.6, 0.2]
                  }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 border-2 border-[#7ab2d3]/20 rounded-full flex items-center justify-center p-2"
                >
                  <Moon className="text-[#7ab2d3] fill-[#7ab2d3]/10" size={24} />
                </motion.div>

                <div className="space-y-4 max-w-sm">
                  <h2 className="font-serif text-2xl text-tertiary-container tracking-widest uppercase">
                    Silêncio Físico
                  </h2>
                  <p className="font-serif italic text-[#eceef1]/60 text-sm leading-relaxed">
                    Sua tela está desativada. Permita que seus olhos pousem sobre o ambiente real. Veja a luz solar refletida, respire fundo, toque em algum objeto tangível ao seu redor.
                  </p>
                </div>
              </div>

              {/* Wake button */}
              <div className="flex justify-center">
                <button
                  id="wake-system-btn"
                  onClick={() => setIsShutDown(false)}
                  className="px-8 py-3 border border-[#7ab2d3]/25 hover:bg-[#7ab2d3]/10 text-[#7ab2d3] text-xs uppercase tracking-widest rounded-md duration-500 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Ativar AISO</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* Operating Screen views router */
            <motion.div
              key={view}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex-grow flex flex-col justify-between"
            >
              {view === "main" && (
                <MainScreen
                  onNavigate={(v) => setView(v)}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onOpenHelp={() => setIsHelpOpen(true)}
                  onTriggerShutdown={() => setIsShutDown(true)}
                  sessions={sessions}
                  errorLogs={errorLogs}
                  activeActivity={activeActivity}
                  onSetActiveActivity={handleSetActiveActivity}
                  settings={settings}
                  profile={profile}
                  activities={activities}
                  onAddActivity={handleAddActivity}
                  onDeleteActivity={handleDeleteActivity}
                />
              )}

              {view === "pratica_livre" && (
                <PraticaLivre
                  onBack={() => setView("main")}
                  onSaveSession={handleSaveSession}
                  settings={settings}
                  activeActivity={activeActivity}
                />
              )}

              {view === "modo_sombra" && (
                <ModoSombra
                  onBack={() => setView("main")}
                  onSaveSession={handleSaveSession}
                  onLoggedDistraction={handleAddErrorLog}
                  settings={settings}
                  activeActivity={activeActivity}
                  activityProgress={currentProgressPercent}
                />
              )}

              {view === "diario_erros" && (
                <DiarioErros
                  onBack={() => setView("main")}
                  errorLogs={errorLogs}
                  onAddErrorLog={handleAddErrorLog}
                  onDeleteLog={handleDeleteErrorLog}
                />
              )}

              {view === "perfil" && (
                <ProfilePage
                  onBack={() => setView("main")}
                  profile={profile}
                  onUpdateProfile={handleSaveProfile}
                  sessions={sessions}
                  errorLogs={errorLogs}
                  activities={activities}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Modals overlay containers */}
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onChangeSettings={handleSaveSettings}
        sessions={sessions}
        errorLogs={errorLogs}
        onClearAllData={handleClearAllData}
      />

      <Help isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Global random on-screen notifications from Dr. Aiso */}
      <DrAisoToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
