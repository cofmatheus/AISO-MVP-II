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
import { supabase, isSupabaseConfigured, signInWithGoogleSupabase } from "./lib/supabase";

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

  const [oauthError, setOauthError] = useState<string>("");
  const [isLoginLoading, setIsLoginLoading] = useState<boolean>(false);

  // Starts the custom Google login redirect inside a browser popup and polls its location
  // to grab the authentication code as soon as it returns same-origin! This bypasses completely
  // any browser third-party iframe cookie/localStorage partition borders!
  const handleStartGoogleLogin = async () => {
    setOauthError("");
    setIsLoginLoading(true);
    try {
      if (!isSupabaseConfigured) {
        throw new Error("Supabase não configurado. Por favor, adicione as variáveis no seu .env ou nas Configurações da plataforma.");
      }

      // Generate a dynamic session synchronization handshake ID
      const syncId = Math.random().toString(36).substring(2, 11) + Date.now().toString(36).substring(5, 9);
      const authUrl = await signInWithGoogleSupabase(syncId);
      
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popupWindow = window.open(
        authUrl,
        "AisoGoogleAuthPopup",
        `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes,scrollbars=yes`
      );

      if (!popupWindow) {
        throw new Error("O bloqueador de popups impediu a abertura da janela. Por favor, libere popups para poder autenticar.");
      }

      let backendPollInterval: any = null;
      let locationIntervalId: any = null;

      const clearAllTimers = () => {
        if (backendPollInterval) clearInterval(backendPollInterval);
        if (locationIntervalId) clearInterval(locationIntervalId);
      };

      // 1. Core coordination polling: matches the authenticated session via the backend
      backendPollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/auth/poll-session?syncId=${syncId}`);
          if (res.ok) {
            const data = await res.json();
            if (data && !data.pending) {
              clearAllTimers();
              if (popupWindow && !popupWindow.closed) {
                popupWindow.close();
              }
              if (data.session) {
                const { error } = await supabase.auth.setSession({
                  access_token: data.session.access_token,
                  refresh_token: data.session.refresh_token
                });
                if (error) console.warn("Supabase session update warning:", error);
              }
              if (data.profile) {
                handleSaveProfile(data.profile);
              }
              setIsLoginLoading(false);
            }
          }
        } catch (pollErr) {
          console.warn("Erro ao buscar sessão autenticada no servidor:", pollErr);
        }
      }, 1000);

      // 2. Direct same-origin location parameter checking fallback
      locationIntervalId = setInterval(async () => {
        if (popupWindow.closed) {
          clearAllTimers();
          setIsLoginLoading(false);
          return;
        }

        try {
          // If we can read popupWindow.location, they are same-origin
          const popupUrl = new URL(popupWindow.location.href);
          const searchParams = new URLSearchParams(popupUrl.search);
          const code = searchParams.get("code");

          if (code) {
            clearAllTimers();
            popupWindow.close();

            // Run direct code-to-session exchange in primary tab!
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) throw error;

            if (data?.user) {
              const u = data.user;
              const loggedProfile: UserProfile = {
                uid: u.id,
                name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "Membro Contemplativo",
                email: u.email || "",
                photoURL: u.user_metadata?.avatar_url || u.user_metadata?.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.id)}`,
                isLoggedIn: true
              };
              handleSaveProfile(loggedProfile);
            }
            setIsLoginLoading(false);
          }
        } catch (e) {
          // Cross-origin access raises security exception when popup is on external / accounts.google.com domain. Ignored safely.
        }
      }, 500);

    } catch (err: any) {
      console.error("Erro ao iniciar login Google:", err);
      setOauthError(err.message || "Erro desconhecido ao abrir tela de login.");
      setIsLoginLoading(false);
    }
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

  // Supabase Google SSO Callback message listener, session restoration and fallback polling
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // 1. Attempt to restore active session from Supabase on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const loggedProfile: UserProfile = {
          uid: u.id,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "Membro Contemplativo",
          email: u.email || "",
          photoURL: u.user_metadata?.avatar_url || u.user_metadata?.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.id)}`,
          isLoggedIn: true
        };
        setProfile(loggedProfile);
        localStorage.setItem("aiso_user_profile", JSON.stringify(loggedProfile));
      }
    });

    // 2. Poll for active session changes on storage/cookies while the user is NOT logged in.
    // This allows the main tab to instantly detect when the user finishes authenticating in the popup ("tela menor")!
    const activeInterval = setInterval(() => {
      if (!profile.isLoggedIn) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            const u = session.user;
            const loggedProfile: UserProfile = {
              uid: u.id,
              name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "Membro Contemplativo",
              email: u.email || "",
              photoURL: u.user_metadata?.avatar_url || u.user_metadata?.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.id)}`,
              isLoggedIn: true
            };
            handleSaveProfile(loggedProfile);
          }
        });
      }
    }, 1500);

    // 3. Listen for auth changes to sync state seamlessly
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        const loggedProfile: UserProfile = {
          uid: u.id,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "Membro Contemplativo",
          email: u.email || "",
          photoURL: u.user_metadata?.avatar_url || u.user_metadata?.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.id)}`,
          isLoggedIn: true
        };
        setProfile(loggedProfile);
        localStorage.setItem("aiso_user_profile", JSON.stringify(loggedProfile));
      } else if (_event === "SIGNED_OUT") {
        setProfile(defaultUserProfile);
        localStorage.removeItem("aiso_user_profile");
      }
    });

    return () => {
      clearInterval(activeInterval);
      subscription.unsubscribe();
    };
  }, [profile.isLoggedIn]);

  // Broadcast session to parent immediately if we are inside the popup and logged in.
  // This allows the parent tab inside the AI Studio iframe to instantly receive the authentication session.
  useEffect(() => {
    if (window.name === "AisoGoogleAuthPopup" && profile.isLoggedIn && window.opener) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          window.opener.postMessage({
            type: "SUPABASE_SESSION_ESTABLISHED",
            session: session,
            profile: profile
          }, window.location.origin);
        }
      });
    }
  }, [profile.isLoggedIn]);

  // PostMessage popup response listener for Supabase authentication callback exchange
  // AND direct window redirect callback check on page load
  useEffect(() => {
    // 1. Immediate URL parameter check on load (fallback when popup redirects parent or is redirected directly)
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get("code");
    const syncId = queryParams.get("syncId");

    if (code) {
      // Remove query parameters from url so they don't linger in address bar
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);

      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error) throw error;
        if (data?.user) {
          const u = data.user;
          const loggedProfile: UserProfile = {
            uid: u.id,
            name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "Membro Contemplativo",
            email: u.email || "",
            photoURL: u.user_metadata?.avatar_url || u.user_metadata?.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.id)}`,
            isLoggedIn: true
          };
          handleSaveProfile(loggedProfile);

          // If there is an active sync state, push this authenticated session details straight to the backend
          if (syncId && data.session) {
            fetch("/api/auth/save-session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ syncId, session: data.session, profile: loggedProfile })
            }).catch(err => console.warn("Erro ao registrar do código no servidor:", err));
          }

          // If this is the callback popup, immediately broadcast session details to opener
          if (window.name === "AisoGoogleAuthPopup" && window.opener && data.session) {
            window.opener.postMessage({
              type: "SUPABASE_SESSION_ESTABLISHED",
              session: data.session,
              profile: loggedProfile
            }, window.location.origin);
          }
        }
      }).catch(err => {
        console.error("Falha ao processar código de login direto:", err);
      });
    }

    // 2. PostMessage listener for popup window login events
    const handleOAuthMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      const isAllowedOrigin = origin === window.location.origin || 
        origin.endsWith('.run.app') || 
        origin.includes('localhost') || 
        origin.includes('127.0.0.1');

      if (!isAllowedOrigin) {
        return;
      }

      // Handle session transmitted directly from popup to opener (e.g. cross-partition scenarios)
      if (event.data?.type === "SUPABASE_SESSION_ESTABLISHED") {
        const { session, profile: remoteProfile } = event.data;
        if (session) {
          try {
            const { error } = await supabase.auth.setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token
            });
            if (error) throw error;
            
            if (remoteProfile) {
              handleSaveProfile(remoteProfile);
            }
          } catch (e) {
            console.error("Erro ao aplicar sessão transmitida via postMessage:", e);
          }
        }
      }

      if (event.data?.type === "SUPABASE_AUTH_CALLBACK") {
        const { search } = event.data;
        const params = new URLSearchParams(search);
        const popupCode = params.get("code");
        const popupSyncId = params.get("syncId");

        if (popupCode) {
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(popupCode);
            if (error) throw error;
            
            if (data?.user) {
              const u = data.user;
              const loggedProfile: UserProfile = {
                uid: u.id,
                name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "Membro Contemplativo",
                email: u.email || "",
                photoURL: u.user_metadata?.avatar_url || u.user_metadata?.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.id)}`,
                isLoggedIn: true
              };
              handleSaveProfile(loggedProfile);

              // Push session details straight to coordination server just in case
              if (popupSyncId && data.session) {
                fetch("/api/auth/save-session", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ syncId: popupSyncId, session: data.session, profile: loggedProfile })
                }).catch(err => console.warn("Erro ao registrar sessão coordenada no servidor:", err));
              }

              // Broadcast it just in case
              if (window.name === "AisoGoogleAuthPopup" && window.opener && data.session) {
                window.opener.postMessage({
                  type: "SUPABASE_SESSION_ESTABLISHED",
                  session: data.session,
                  profile: loggedProfile
                }, window.location.origin);
              }
            }
          } catch (err) {
            console.error("Falha ao processar código de login com o Google:", err);
            alert("Não foi possível autenticar o perfil. Por favor, verifique a habilitação do Google no console Supabase.");
          }
        }
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, []);

  // 3. Multi-instance window/tab synchronization through standard HTML5 Storage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "aiso_user_profile" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.isLoggedIn && !profile.isLoggedIn) {
            setProfile(parsed);
            
            // Re-read local storage supabase session to keep instance client in-sync
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (session) {
                // Done!
              }
            });
          }
        } catch (err) {
          console.error("Error matching storage event for login sync:", err);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [profile.isLoggedIn]);

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

  // If we are currently inside the popup window itself, render a beautiful and simplified login-success closing instruction page.
  // This prevents the heavy full dashboard from launching inside the popup "smaller screen" itself!
  if (window.name === "AisoGoogleAuthPopup") {
    return (
      <div className="relative min-h-screen bg-[#F7F7FF] text-[#2541B2] flex flex-col items-center justify-center p-6 text-center paper-texture select-none">
        {settings.enablePaperGrain && <div className="grain-overlay" />}
        <div className="max-w-xs space-y-6 mx-auto">
          <div className="w-16 h-16 bg-[#2541B2]/5 border border-[#2541B2]/15 rounded-full flex items-center justify-center mx-auto text-[#2541B2] animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-lg uppercase tracking-widest font-black">Conectado com Sucesso!</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sua conta foi vinculada. A tela principal do AISO já foi sincronizada e está pronta para uso!
            </p>
          </div>
          <button
            onClick={() => window.close()}
            className="w-full py-2.5 px-4 bg-[#2541B2] hover:bg-[#1E3491] text-white font-mono uppercase text-xs tracking-wider rounded-lg transition-all duration-300 shadow-md font-bold"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    );
  }

  // If user is not authenticated with Google, show the stunning initial login screen!
  if (!profile.isLoggedIn) {
    return (
      <div className="relative min-h-screen bg-surface text-on-surface paper-texture select-none transition-colors duration-500 overflow-x-hidden font-sans">
        {settings.enablePaperGrain && <div className="grain-overlay" />}
        <WelcomeScreen 
          onLogin={handleSaveProfile} 
          onLoginWithGoogle={handleStartGoogleLogin}
          loading={isLoginLoading}
          errorMsg={oauthError}
        />
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
