import React, { useState, useEffect } from "react";
import { AppSettings, PracticeSession, ErrorLog, UserProfile } from "./types";
import MainScreen from "./components/MainScreen";
import PraticaLivre from "./components/PraticaLivre";
import ModoSombra from "./components/ModoSombra";
import DiarioErros from "./components/DiarioErros";
import Settings from "./components/Settings";
import Help from "./components/Help";
import ProfileModal from "./components/ProfileModal";
import { useDrAiso } from "./hooks/useDrAiso";
import { DrAisoToast } from "./hooks/useDrAiso";
import DrAisoToastContainer from "./components/DrAisoToastContainer";
import { motion, AnimatePresence } from "motion/react";
import { Power, Info, Moon, EyeOff } from "lucide-react";
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

export default function App() {
  // Dr. Aiso periodic automated triggers
  const { toasts, dismissToast } = useDrAiso();

  // Application view route
  const [view, setView] = useState<"main" | "pratica_livre" | "modo_sombra" | "diario_erros">("main");

  // Global overlay modal toggles
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

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

  // States initialized from local storage
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [activeActivity, setActiveActivity] = useState<string>(() => {
    return localStorage.getItem("aiso_active_activity") || "entalho em madeira";
  });

  const [activityProgresses, setActivityProgresses] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem("aiso_activity_progresses");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (_) {}
    return {
      "entalho em madeira": 24,
      "leitura analógica": 45,
      "caligrafia clássica": 12,
      "desenho técnico": 30,
      "jardinagem minuciosa": 5,
      "costura de precisão": 18,
      "miniaturas & maquetes": 35,
      "meditação profunda": 60,
      "manutenção mecânica": 8,
      "escrita criativa": 50
    };
  });

  const handleSetActiveActivity = (act: string) => {
    setActiveActivity(act);
    localStorage.setItem("aiso_active_activity", act);
  };

  const handleUpdateProgress = (activity: string, increment: number) => {
    setActivityProgresses((prev) => {
      const current = prev[activity] !== undefined ? prev[activity] : 10;
      const nextProgress = Math.min(100, Math.max(0, current + increment));
      const updated = { ...prev, [activity]: nextProgress };
      localStorage.setItem("aiso_activity_progresses", JSON.stringify(updated));
      return updated;
    });
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

  // Sincronizador de dados com o Firestore de forma dinâmica
  useEffect(() => {
    if (!isKeysConfigured || !profile.isLoggedIn || !profile.uid) return;

    const pullRemoteAndUpdateCleanly = async () => {
      try {
        // 1. Sincroniza o usuário atual
        await syncUserProfile(profile.uid, profile);

        // 2. Busca sessões remotas e mescla
        const remoteSessions = await fetchRemoteSessions(profile.uid);
        if (remoteSessions && remoteSessions.length > 0) {
          setSessions(remoteSessions as PracticeSession[]);
          localStorage.setItem(STORAGE_SESSIONS, JSON.stringify(remoteSessions));
        } else if (sessions.length > 0) {
          // Se na nuvem estiver vazio, puxa os locais para lá
          for (const sess of sessions) {
            await saveRemoteSession(profile.uid, sess);
          }
        }

        // 3. Busca logs de erro e mescla
        const remoteLogs = await fetchRemoteErrorLogs(profile.uid);
        if (remoteLogs && remoteLogs.length > 0) {
          setErrorLogs(remoteLogs as ErrorLog[]);
          localStorage.setItem(STORAGE_ERROR_LOGS, JSON.stringify(remoteLogs));
        } else if (errorLogs.length > 0) {
          for (const log of errorLogs) {
            await saveRemoteErrorLog(profile.uid, log);
          }
        }

        // 4. Busca configurações remotas
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
    localStorage.removeItem(STORAGE_SESSIONS);
    localStorage.removeItem(STORAGE_ERROR_LOGS);
    localStorage.removeItem(STORAGE_SETTINGS);
    localStorage.removeItem("aiso_user_profile");
    setIsSettingsOpen(false);
    setView("main");
  };

  return (
    <div className="relative min-h-screen bg-surface text-on-surface paper-texture select-none transition-colors duration-500 overflow-x-hidden">
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
                  className="w-16 h-16 border-2 border-primary/20 rounded-full flex items-center justify-center p-2"
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
                  <Power size={14} />
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
                  activityProgresses={activityProgresses}
                  onUpdateProgress={handleUpdateProgress}
                  settings={settings}
                  profile={profile}
                  onOpenProfile={() => setIsProfileOpen(true)}
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
                  onSaveSession={(s) => {
                    handleSaveSession(s);
                    // Automatically reward some progress upon successful focus session completion!
                    if (s.completed) {
                      handleUpdateProgress(activeActivity, 10);
                    } else {
                      handleUpdateProgress(activeActivity, 2); // subtle partial progress
                    }
                  }}
                  onLoggedDistraction={handleAddErrorLog}
                  settings={settings}
                  activeActivity={activeActivity}
                  activityProgress={activityProgresses[activeActivity] !== undefined ? activityProgresses[activeActivity] : 10}
                  onUpdateProgress={handleUpdateProgress}
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

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onUpdateProfile={handleSaveProfile}
        sessions={sessions}
        errorLogs={errorLogs}
      />

      {/* Global random on-screen notifications from Dr. Aiso */}
      <DrAisoToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
