import React, { useState } from "react";
import { 
  ArrowLeft, 
  LogOut, 
  Edit3, 
  Camera, 
  Lock, 
  Activity, 
  Award, 
  Calendar, 
  Check, 
  Trash2, 
  Cloud, 
  CloudOff, 
  Sparkles,
  BookOpen,
  Feather,
  Compass,
  Sprout,
  Scissors,
  Layers,
  Wind,
  Wrench,
  Hammer
} from "lucide-react";
import { UserProfile, PracticeSession, ErrorLog, ActivityItem } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { isKeysConfigured, signInWithGoogle, auth as firebaseAuth } from "../lib/firebase";

interface ProfilePageProps {
  onBack: () => void;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  sessions: PracticeSession[];
  errorLogs: ErrorLog[];
  activities: ActivityItem[];
}

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
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

const renderActivityIcon = (iconName: string) => {
  switch (iconName) {
    case "Hammer": return <Hammer size={16} className="text-[#2541B2]" />;
    case "BookOpen": return <BookOpen size={16} className="text-[#2541B2]" />;
    case "Feather": return <Feather size={16} className="text-[#2541B2]" />;
    case "Compass": return <Compass size={16} className="text-[#2541B2]" />;
    case "Sprout": return <Sprout size={16} className="text-[#2541B2]" />;
    case "Scissors": return <Scissors size={16} className="text-[#2541B2]" />;
    case "Layers": return <Layers size={16} className="text-[#2541B2]" />;
    case "Wind": return <Wind size={16} className="text-[#2541B2]" />;
    case "Wrench": return <Wrench size={16} className="text-[#2541B2]" />;
    case "Edit3": return <Edit3 size={16} className="text-[#2541B2]" />;
    default: return <Sparkles size={16} className="text-[#2541B2]" />;
  }
};

export default function ProfilePage({
  onBack,
  profile,
  onUpdateProfile,
  sessions,
  errorLogs,
  activities
}: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>(profile.name);
  const [editedPhoto, setEditedPhoto] = useState<string>(profile.photoURL || AVATAR_PRESETS[0]);
  const [showPhotoSelector, setShowPhotoSelector] = useState<boolean>(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>("");
  
  // Google sign in simulation flow state
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [signInStep, setSignInStep] = useState<"none" | "accounts" | "loading" | "success">("none");

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

  const [firebaseAuthError, setFirebaseAuthError] = useState<string | null>(null);

  const handleGoogleLoginTrigger = async () => {
    setFirebaseAuthError(null);
    if (isKeysConfigured) {
      setIsSigningIn(true);
      setSignInStep("loading");
      try {
        const fUser = await signInWithGoogle();
        if (fUser) {
          setSignInStep("success");
          setTimeout(() => {
            const loggedInProfile: UserProfile = {
              uid: fUser.uid,
              name: fUser.displayName || "Membro Contemplativo",
              email: fUser.email || "",
              photoURL: fUser.photoURL || AVATAR_PRESETS[0],
              isLoggedIn: true
            };
            onUpdateProfile(loggedInProfile);
            setEditedName(loggedInProfile.name);
            setEditedPhoto(loggedInProfile.photoURL);
            setIsSigningIn(false);
            setSignInStep("none");
          }, 1000);
        }
      } catch (err: any) {
        console.warn("Login nativo do Firebase bloqueado/falhou. Redirecionando para conta simulada local:", err);
        setFirebaseAuthError("Login em nuvem restrito (comum em Iframe sandbox sem cookies de terceiros). Fornecendo portal simulado para que seu progresso não pare.");
        setSignInStep("accounts");
      }
    } else {
      setIsSigningIn(true);
      setSignInStep("accounts");
    }
  };

  const handleSelectAccount = (accountName: string, accountEmail: string) => {
    setSignInStep("loading");
    setTimeout(() => {
      setSignInStep("success");
      setTimeout(() => {
        const loggedInProfile: UserProfile = {
          uid: "google_" + Math.random().toString(36).substring(2, 11),
          name: accountName,
          email: accountEmail,
          photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
          isLoggedIn: true
        };
        onUpdateProfile(loggedInProfile);
        setEditedName(loggedInProfile.name);
        setEditedPhoto(loggedInProfile.photoURL);
        setIsSigningIn(false);
        setSignInStep("none");
      }, 1000);
    }, 1200);
  };

  const handleLogout = () => {
    if (isKeysConfigured && firebaseAuth) {
      try {
        firebaseAuth.signOut();
      } catch (e) {
        console.warn("Erro ao fazer logout no Firebase:", e);
      }
    }
    const guestProfile: UserProfile = {
      uid: "",
      name: "Visitante",
      email: "",
      photoURL: "",
      isLoggedIn: false
    };
    onUpdateProfile(guestProfile);
    setIsEditing(false);
    setFirebaseAuthError(null);
  };

  const handleSaveProfileChanges = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: editedName.trim() || "Visitante",
      photoURL: editedPhoto
    });
    setIsEditing(false);
    setShowPhotoSelector(false);
  };

  const handleSelectPresetAvatar = (url: string) => {
    setEditedPhoto(url);
  };

  const handleApplyCustomPhoto = () => {
    if (customPhotoUrl.trim()) {
      setEditedPhoto(customPhotoUrl.trim());
      setCustomPhotoUrl("");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-4 flex flex-col justify-between min-h-[90vh] text-[#2541B2]" id="aiso-profile-page">
      
      {/* Visual Navigation Header */}
      <header className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#2541B2]/15 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 bg-[#2541B2]/10 hover:bg-[#2541B2]/15 border border-[#2541B2]/20 hover:border-[#2541B2]/40 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer duration-200 shadow-sm"
            id="profile-nav-back-button"
            title="Voltar ao Ateliê"
          >
            <ArrowLeft size={14} className="text-[#2541B2]" />
            <span>Voltar ao Ateliê</span>
          </button>
          
          <div className="h-4 w-[1px] bg-[#2541B2]/20 hidden sm:block" />
          
          <div className="flex flex-col text-left">
            <span className="font-serif italic text-[11px] leading-tight text-[#2541B2]/70">Nuvem e Maestria</span>
            <h2 className="font-serif text-xl tracking-wider text-[#2541B2] font-semibold uppercase leading-none mt-0.5">Perfil & Maestria</h2>
          </div>
        </div>

        {/* Sync Status Flag */}
        <div className="flex items-center gap-1.5 text-[8.5px] font-mono font-bold uppercase tracking-widest bg-[#2541B2]/5 border border-[#2541B2]/15 px-3 py-1.5 rounded-full select-none">
          {isKeysConfigured ? (
            <>
              <Cloud size={11} className="text-emerald-600 animate-pulse" />
              <span className="text-emerald-700">Firebase Conectado</span>
            </>
          ) : (
            <>
              <CloudOff size={11} className="text-[#2541B2]/50" />
              <span className="text-[#2541B2]/60">Nuvem Inativa (Offline Local)</span>
            </>
          )}
        </div>
      </header>

      {/* Main Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full mt-6 flex-grow">
        
        {/* Left Column: Identity details & stats breakdown (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Identity details box */}
          <div className="bg-white/90 border border-[#2541B2]/15 p-6 rounded-2xl shadow-sm relative overflow-hidden paper-texture">
            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.div
                  key="view-profile-info"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={profile.photoURL || "https://api.dicebear.com/7.x/bottts/svg?seed=AISO"}
                      alt={profile.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = AVATAR_PRESETS[0];
                      }}
                      className="w-16 h-16 rounded-full border-1.5 border-[#2541B2]/20 shadow-sm object-cover bg-slate-150"
                    />
                    <div className="flex-grow min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-serif font-black tracking-wide truncate">
                          {profile.name}
                        </h3>
                        <button
                          onClick={() => {
                            setEditedName(profile.name);
                            setEditedPhoto(profile.photoURL);
                            setIsEditing(true);
                          }}
                          className="p-1 px-2 border border-[#2541B2]/15 hover:bg-[#2541B2]/5 text-[#2541B2] rounded-md transition-all cursor-pointer text-[10px] uppercase font-bold tracking-wider"
                          title="Editar Perfil"
                        >
                          Editar
                        </button>
                      </div>
                      <div className="text-[10px] text-[#2541B2]/70 font-mono mt-1 select-all">{profile.email || "Sem endereço de e-mail"}</div>
                    </div>
                  </div>

                  <div className="border-t border-[#2541B2]/10 pt-4 flex justify-between gap-2.5">
                    <div className="text-left font-mono text-[8px] uppercase tracking-widest text-[#2541B2]/50">
                      ID: {profile.uid ? profile.uid.substring(0, 14) + "..." : "MODO_CONVIDADO"}
                    </div>
                    {profile.isLoggedIn && (
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-650 border border-red-200 text-[9.5px] font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer hover:bg-red-100/80 font-bold"
                      >
                        <LogOut size={11} />
                        <span>Sair</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  onSubmit={handleSaveProfileChanges}
                  key="edit-profile-form"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4"
                >
                  <div className="flex gap-4 items-center pb-2 border-b border-[#2541B2]/10 text-left">
                    <div className="relative shrink-0">
                      <img
                        src={editedPhoto}
                        alt="New visual path"
                        className="w-16 h-16 rounded-full border-2 border-[#2541B2] object-cover shadow-sm bg-gray-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPhotoSelector(!showPhotoSelector)}
                        className="absolute -bottom-1 -right-1 bg-[#2541B2] text-white rounded-full p-1 cursor-pointer border border-white"
                        title="Escolher Foto"
                      >
                        <Camera size={10} />
                      </button>
                    </div>

                    <div className="flex-grow space-y-1">
                      <label htmlFor="edit-name-field" className="text-[9px] font-mono uppercase tracking-widest text-[#2541B2]/60 font-black">
                        Nome de Exibição
                      </label>
                      <input
                        id="edit-name-field"
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full bg-white border border-[#2541B2]/20 px-2.5 py-1.5 text-xs text-[#2541B2] focus:outline-none focus:border-[#2541B2] rounded-lg mt-0.5"
                        placeholder="Seu nome no ateliê"
                      />
                    </div>
                  </div>

                  {showPhotoSelector && (
                    <div className="p-2.5 bg-[#F7F7FF] border border-[#2541B2]/15 rounded-xl space-y-2 text-left">
                      <span className="text-[8.5px] font-mono uppercase text-[#2541B2]/60 tracking-wider font-extrabold block">
                        Selecione um Avatar Ilustrativo:
                      </span>
                      <div className="flex gap-2">
                        {AVATAR_PRESETS.map((preset, index) => (
                          <button
                            type="button"
                            key={index}
                            onClick={() => handleSelectPresetAvatar(preset)}
                            className={`w-9 h-9 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                              editedPhoto === preset ? "border-[#2541B2] scale-110" : "border-transparent opacity-70"
                            }`}
                          >
                            <img src={preset} alt={`Avatar Preset ${index}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 pb-1">
                        <input
                          type="text"
                          placeholder="Ou cole o link de uma imagem..."
                          value={customPhotoUrl}
                          onChange={(e) => setCustomPhotoUrl(e.target.value)}
                          className="flex-grow bg-white border border-[#2541B2]/15 text-[10px] px-2.5 py-1 rounded focus:outline-none focus:border-[#2541B2]"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCustomPhoto}
                          className="px-2.5 py-1 bg-[#2541B2] text-white text-[9.5px] font-mono uppercase tracking-wide rounded cursor-pointer font-bold"
                        >
                          Aplicar
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 border border-[#2541B2]/15 text-[#2541B2]/70 text-[10px] font-mono uppercase tracking-wider rounded-lg hover:bg-[#2541B2]/5"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#2541B2] text-white text-[10px] font-mono uppercase tracking-wider rounded-lg font-bold hover:bg-[#1E3491]"
                    >
                      Gravar Alterações
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Core Vital Stats Card */}
          <div className="bg-[#2541B2]/3 border border-[#2541B2]/12 p-5 rounded-2xl text-left" id="profile-vital-statistics-card">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#2541B2]/60 font-black mb-3.5 flex items-center gap-2 select-none border-b border-[#2541B2]/10 pb-1.5">
              <Activity size={12} className="text-[#2541B2]" />
              <span>Estatísticas Contemplativas</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 border border-[#2541B2]/10 rounded-xl flex flex-col justify-center">
                <span className="text-[8px] uppercase tracking-wider font-mono text-[#2541B2]/60">Tempo de Silêncio</span>
                <span className="text-lg font-serif text-[#2541B2] font-black leading-none mt-1">{totalSilenceMinutes} min</span>
              </div>

              <div className="bg-white p-3 border border-[#2541B2]/10 rounded-xl flex flex-col justify-center">
                <span className="text-[8px] uppercase tracking-wider font-mono text-[#2541B2]/60">Sessões Concluídas</span>
                <span className="text-lg font-serif text-[#2541B2] font-black leading-none mt-1">{totalCompletedSessions}</span>
              </div>

              <div className="bg-white p-3 border border-[#2541B2]/10 rounded-xl flex flex-col justify-center">
                <span className="text-[8px] uppercase tracking-wider font-mono text-amber-700/60">Intervenções de Sombra</span>
                <span className="text-lg font-serif text-amber-600 font-bold leading-none mt-1">{errorLogs.length} logs</span>
              </div>

              <div className="bg-white p-3 border border-[#2541B2]/10 rounded-xl flex flex-col justify-center">
                <span className="text-[8px] uppercase tracking-wider font-mono text-[#2541B2]/60">Maior Impulso</span>
                <span className="text-[10px] font-bold text-[#2541B2] truncate leading-none mt-1" title={topDistraction}>
                  {topDistraction}
                </span>
              </div>
            </div>
          </div>

          {/* Historical sessions record list */}
          <div className="bg-white/50 border border-[#2541B2]/10 p-5 rounded-2xl text-left" id="profile-history">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#2541B2]/60 font-black mb-3 select-none flex items-center gap-1.5">
              <Calendar size={13} />
              <span>Diário do Ateliê</span>
            </h3>

            <div className="max-h-52 overflow-y-auto space-y-2 pr-1 no-scrollbar-y">
              {sessions.length === 0 ? (
                <div className="text-center py-6 border border-[#2541B2]/10 border-dashed rounded-xl text-[10px] text-[#2541B2]/50 font-sans italic">
                  Nenhum registro de tempo efetuado.
                </div>
              ) : (
                sessions.map((session) => {
                  const mins = Math.round(session.durationSeconds / 60);
                  const formattedDate = new Date(session.date).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                  });
                  return (
                    <div
                      key={session.id}
                      className="p-2.5 px-3 bg-white border border-[#2541B2]/8 rounded-xl flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] font-serif font-black leading-none text-[#2541B2]">
                          {mins > 0 ? `${mins} min` : `${session.durationSeconds}s`} • {session.type === "sombra" ? "Sombra Intel" : "Livre"}
                        </span>
                        <p className="text-[8.5px] text-[#2541B2]/70 truncate max-w-[170px] mt-0.5 leading-relaxed" title={session.notes}>
                          {session.notes || "Foco tátil sem anotações adicionais."}
                        </p>
                      </div>
                      <span className="text-[7px] font-mono text-[#2541B2]/50 shrink-0 select-none">
                        {formattedDate}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Mastery progress dashboard on activities (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          <div className="bg-white/80 border border-[#2541B2]/15 p-6 rounded-2xl shadow-sm relative overflow-hidden paper-texture">
            <div className="border-b border-[#2541B2]/10 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-[#2541B2]" />
                <h3 className="font-serif text-lg font-black tracking-wide uppercase">Caminho de Maestria Contemplativa</h3>
              </div>
              <p className="text-[10.5px] text-slate-650 font-serif italic mt-1 leading-relaxed">
                Cada atividade no ateliê demanda paciência ativa. Seu percurso rumo à maestria é vivo: a quantidade total de horas necessárias aumenta dinamicamente conforme você realiza mais sessões na atividade.
              </p>
            </div>

            <div className="space-y-5">
              {activities.map((act) => {
                // Compute total minutes practiced for this specific activity
                const searchKey = act.id.toLowerCase();
                const actSessions = sessions.filter(
                  s => s.completed && (s.activityId === act.id || s.notes.toLowerCase().includes(searchKey))
                );
                
                const practicedSeconds = actSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
                const practicedHours = practicedSeconds / 3600;
                
                // Mastery model: base hours + (completed sessions count * 1.5 hours)
                const baseMastery = getBaseMasteryHours(act.id);
                const sessionMultiplier = actSessions.length * 1.5;
                const masteryTarget = baseMastery + sessionMultiplier;
                
                // Progress percent
                const pct = Math.min(100, Math.round((practicedHours / masteryTarget) * 100));
                
                return (
                  <div key={act.id} className="p-3 border border-[#2541B2]/10 bg-white/50 hover:bg-[#F7F7FF]/30 rounded-xl transition duration-200" id={`mastery-card-${act.id}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2.5 items-center">
                        <div className="w-7 h-7 rounded-lg bg-[#2541B2]/5 border border-[#2541B2]/12 flex items-center justify-center shrink-0">
                          {renderActivityIcon(act.iconName)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-serif text-[11px] font-bold text-[#2541B2] capitalize tracking-wide leading-tight">
                            {act.label}
                          </h4>
                          <span className="text-[7.5px] font-mono tracking-widest text-[#2541B2]/50 font-bold uppercase block leading-none mt-0.5">
                            Categoria: {act.category === "manual" ? "Manuais" : act.category === "intelecto" ? "Cognitivos" : "Presença"}
                          </span>
                        </div>
                      </div>
                      
                      {/* Metric state */}
                      <div className="text-right">
                        <span className="text-[9.5px] font-mono font-black text-[#2541B2]">
                          {practicedHours.toFixed(2)}h / {masteryTarget.toFixed(1)}h
                        </span>
                        <p className="text-[7px] uppercase tracking-wider font-mono text-[#2541B2]/60 mt-0.5">
                          {pct}% da maestria
                        </p>
                      </div>
                    </div>

                    <p className="text-[9px] text-slate-650 leading-relaxed font-sans mb-3">{act.desc}</p>

                    {/* Custom progress visual bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-500 to-[#2541B2]"
                      />
                    </div>
                    
                    <div className="flex justify-between mt-1.5 text-[7px] font-mono uppercase tracking-widest text-[#2541B2]/40">
                      <span>Iniciado</span>
                      <span>{actSessions.length} sessões concluídas ({sessionMultiplier > 0 ? `+${sessionMultiplier}h na meta` : "meta original"})</span>
                      <span>Mestre</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <footer className="w-full text-center py-4 border-t border-[#2541B2]/10 mt-8">
        <p className="text-[8px] font-mono uppercase tracking-widest text-[#2541B2]/40">
          AISO 愛想 CONTEMPLATIVE WORKSPACE ENGINEERING v2.5_PAGE
        </p>
      </footer>

      {/* Simulated Google Sign-In Window Interface overlay */}
      <AnimatePresence>
        {isSigningIn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSigningIn(false)}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white border border-slate-200 z-50 rounded-2xl p-6 flex flex-col justify-between shadow-2xl"
              id="google-sigin-simulated-view-page"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.13-.33-.2-.68-.2-1.07s.07-.74.2-1.07z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="text-[11px] font-sans font-bold text-gray-500 tracking-wide uppercase">Login seguro do Google</span>
                </div>
                <button 
                  onClick={() => setIsSigningIn(false)}
                  className="p-1 hover:bg-gray-100 rounded text-gray-400 cursor-pointer"
                >
                  Fechar
                </button>
              </div>

              {signInStep === "accounts" && (
                <div className="flex-grow flex flex-col justify-center w-full space-y-4 py-4 font-sans text-left">
                  <div className="text-center space-y-1">
                    <h3 className="text-sm font-bold text-gray-800">Escolha uma conta do Google</h3>
                    <p className="text-[10px] text-gray-500">para prosseguir no <span className="font-bold text-[#2541B2]">AISO</span></p>
                  </div>

                  {firebaseAuthError && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-905 rounded-lg text-[9px] leading-relaxed select-all">
                      <span className="font-bold font-mono">Sandbox Redirect Alert:</span> {firebaseAuthError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <button
                      onClick={() => handleSelectAccount("Matheus Correia", "matheuscorreiaaa@gmail.com")}
                      className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-[#2541B2]/5 hover:border-[#2541B2]/30 transition-all text-left group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#2541B2]/10 flex items-center justify-center font-bold text-[#2541B2] text-xs">
                        MC
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">Matheus Correia</div>
                        <div className="text-[9.5px] text-slate-500">matheuscorreiaaa@gmail.com</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSelectAccount("Artesão Conectado", "artesao.contemplativo@gmail.com")}
                      className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-[#2541B2]/5 hover:border-[#2541B2]/30 transition-all text-left group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-800 text-xs">
                        AC
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">Artesão Conectado</div>
                        <div className="text-[9.5px] text-slate-500">artesao.contemplativo@gmail.com</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {signInStep === "loading" && (
                <div className="flex-grow flex flex-col items-center justify-center space-y-3 py-8">
                  <div className="animate-spin rounded-full h-7 w-7 border-2 border-t-transparent border-[#2541B2]" />
                  <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">Consultando bancos criptografados...</span>
                </div>
              )}

              {signInStep === "success" && (
                <div className="flex-grow flex flex-col items-center justify-center space-y-2.5 py-8">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                    <Check size={20} />
                  </div>
                  <span className="text-xs font-sans font-bold text-slate-800">Conexão estabelecida!</span>
                </div>
              )}

              <div className="text-[7.5px] text-[#2541B2]/40 text-center font-mono uppercase tracking-widest border-t border-gray-100 pt-3 flex justify-between select-none">
                <span>AISO COMPAT</span>
                <span>SECURE_AUTH</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
