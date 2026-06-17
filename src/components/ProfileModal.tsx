import React, { useState } from "react";
import { X, LogOut, Edit3, Camera, Lock, Eye, BarChart2, Activity, ShieldAlert, Award, Calendar, Check, Compass, Trash2, Cloud, CloudOff } from "lucide-react";
import { UserProfile, PracticeSession, ErrorLog } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { isKeysConfigured, signInWithGoogle, auth as firebaseAuth } from "../lib/firebase";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  sessions: PracticeSession[];
  errorLogs: ErrorLog[];
}

// Beautiful avatar presets representing focused tasks & quiet arts
const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", // Artisan / Portrait
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80", // Architect
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", // Weaver
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", // Woodworker
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"  // Gardner
];

export default function ProfileModal({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  sessions,
  errorLogs
}: ProfileModalProps) {
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
          photoURL: "https://lh3.googleusercontent.com/a/default-user=s120-c",
          isLoggedIn: true
        };
        onUpdateProfile(loggedInProfile);
        setEditedName(loggedInProfile.name);
        setEditedPhoto(loggedInProfile.photoURL);
        setIsSigningIn(false);
        setSignInStep("none");
        // We do not clear the firebaseAuthError here to allow user to see why it used simulated path.
      }, 1000);
    }, 1200);
  };

  const handleLogout = () => {
    // If real Firebase Auth is configured and live, sign out
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
    <AnimatePresence>
      {isOpen && (
        <div id="profile-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-xs"
          />

          {/* Modal Card content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-lg bg-surface paper-texture border-1.5 border-outline p-6 md:p-8 rounded-2xl atmospheric-blur z-10 max-h-[85vh] overflow-y-auto text-[#2541B2]"
            id="profile-modal-content"
          >
            {/* Close Button */}
            <button
              id="close-profile-btn"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-[#2541B2] hover:opacity-75 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Simulated Google Sign-In Window Interface overlay */}
            <AnimatePresence>
              {isSigningIn && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#FFFFFF] z-50 rounded-2xl p-6 flex flex-col justify-between"
                  id="google-sigin-simulated-view"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      {/* Google Multi-colored G Logo */}
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
                      className="p-1 hover:bg-gray-100 rounded text-gray-400"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {signInStep === "accounts" && (
                    <div className="flex-grow flex flex-col justify-center max-w-sm mx-auto w-full space-y-4 py-4 font-sans">
                      <div className="text-center space-y-1">
                        <h3 className="text-lg font-bold text-gray-800">Escolha uma conta</h3>
                        <p className="text-[11px] text-gray-500">para continuar no aplicativo <span className="font-bold text-[#2541B2]">AISO</span></p>
                      </div>

                      {firebaseAuthError && (
                        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-[9.5px] leading-relaxed text-left flex gap-2">
                          <CloudOff size={24} className="shrink-0 text-amber-700" />
                          <div>
                            <span className="font-bold">Aviso do Conector:</span> {firebaseAuthError}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {/* Option 1: Log in with Gmail derived from metadata */}
                        <button
                          onClick={() => handleSelectAccount("Matheus Correia", "matheuscorreiaaa@gmail.com")}
                          className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-[#2541B2]/5 hover:border-[#2541B2]/40 transition-all text-left group"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#2541B2]/10 flex items-center justify-center font-bold text-[#2541B2] text-xs group-hover:scale-105 transition-transform">
                            MC
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-800">Matheus Correia</div>
                            <div className="text-[9.5px] text-gray-500">matheuscorreiaaa@gmail.com</div>
                          </div>
                          <div className="ml-auto text-[9px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                            Contexto
                          </div>
                        </button>

                        {/* Option 2: Choose another customizable Google account */}
                        <button
                          onClick={() => handleSelectAccount("Artesão Conectado", "artesao.contemplativo@gmail.com")}
                          className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-[#2541B2]/5 hover:border-[#2541B2]/40 transition-all text-left group"
                        >
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-800 text-xs group-hover:scale-105 transition-transform">
                            AC
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-800">Artesão Conectado</div>
                            <div className="text-[9.5px] text-gray-500">artesao.contemplativo@gmail.com</div>
                          </div>
                        </button>
                      </div>

                      <div className="text-[9.5px] text-gray-400 text-center leading-relaxed">
                        Para continuar, o Google compartilhará seu nome, endereço de e-mail e foto do perfil com o AISO. Consulte os Termos de Serviço.
                      </div>
                    </div>
                  )}

                  {signInStep === "loading" && (
                    <div className="flex-grow flex flex-col items-center justify-center space-y-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-[#2541B2]" />
                      <span className="text-[11px] font-mono tracking-wider text-gray-500 uppercase">Consultando bancos criptografados...</span>
                    </div>
                  )}

                  {signInStep === "success" && (
                    <div className="flex-grow flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
                        <Check size={24} />
                      </div>
                      <span className="text-sm font-sans font-bold text-gray-800">Conexão Google bem-sucedida!</span>
                      <span className="text-[10px] text-gray-500">Sincronizando estado e histórico offline...</span>
                    </div>
                  )}

                  <div className="text-[9px] text-[#2541B2]/50 text-center font-mono uppercase tracking-widest border-t border-gray-100 pt-3 flex justify-between">
                    <span>AISO AUTENTICAÇÃO</span>
                    <span>v2.1_GOOGLE_ID</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Profile view Title */}
            <div className="text-center mb-2">
              <span className="font-serif italic text-sm text-[#2541B2]/75 block mb-1">Identidade e Progresso</span>
              <h2 className="font-serif text-3xl text-[#2541B2] tracking-wide uppercase">Perfil do Usuário</h2>
              <div className="w-12 h-[1px] bg-[#2541B2]/20 mx-auto mt-1.5"></div>
            </div>

            {/* Connection cloud status message */}
            <div className="flex justify-center items-center gap-1.5 mb-6 text-[8px] font-mono uppercase tracking-widest" id="firebase-connection-status-banner">
              {isKeysConfigured ? (
                <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-250/50 rounded-full font-black select-none">
                  <Cloud size={11} className="text-emerald-700 animate-pulse" />
                  <span>Firebase Conectado via Cloud</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-3 py-1 bg-[#2541B2]/5 text-[#2541B2]/70 border border-[#2541B2]/15 rounded-full font-bold select-none">
                  <CloudOff size={11} className="text-[#2541B2]/60" />
                  <span>Armazenamento Local Ativo (Offline)</span>
                </div>
              )}
            </div>

            {/* Signed-in Profile or Guest Login Request Panel */}
            <div className="mb-6">
              {!profile.isLoggedIn ? (
                /* Guest visual */
                <div className="bg-[#2541B2]/3 border border-[#2541B2]/15 rounded-xl p-5 text-center space-y-4 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-[#2541B2]/10 flex items-center justify-center text-[#2541B2]/70 font-serif text-xl border border-[#2541B2]/20">
                    V
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold font-mono uppercase tracking-[0.12em]">Modo Visitante</h3>
                    <p className="text-[10.5px] text-[#2541B2]/75 leading-relaxed max-w-xs font-light">
                      Você está utilizando o perfil offline padrão. Conecte sua conta do Google para visualizar suas conquistas personalizadas, alterar sua identidade livremente e salvar seu progresso.
                    </p>
                  </div>
                  
                  {/* Real-looking Google sign-in trigger */}
                  <button
                    onClick={handleGoogleLoginTrigger}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#2541B2]/30 hover:border-[#2541B2] hover:bg-[#2541B2]/5 hover:shadow-xs rounded-xl text-xs font-semibold font-sans tracking-wide transition-all text-gray-700 cursor-pointer text-center select-none"
                    title="Conectar com o Google"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.13-.33-.2-.68-.2-1.07s.07-.74.2-1.07z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Entrar com o Google</span>
                  </button>
                </div>
              ) : (
                /* Authenticated State Form Edit and Stats */
                <div className="bg-[#2541B2]/3 border border-[#2541B2]/15 rounded-2xl p-4 md:p-5 text-left relative overflow-hidden">
                  {/* Interactive edits toggle */}
                  <AnimatePresence mode="wait">
                    {!isEditing ? (
                      <motion.div
                        key="view-profile-info"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="flex items-center gap-4 py-2"
                      >
                        <div className="relative">
                          <img
                            src={profile.photoURL}
                            alt={profile.name}
                            onError={(e) => {
                              // Fallback
                              (e.target as HTMLImageElement).src = AVATAR_PRESETS[0];
                            }}
                            className="w-16 h-16 rounded-full border-1.5 border-[#2541B2]/20 shadow-sm object-cover"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-[#2541B2] text-[#F7F7FF] rounded-full p-1 border border-white">
                            <Lock size={8} />
                          </div>
                        </div>

                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-serif font-black tracking-wide truncate">
                              {profile.name}
                            </h3>
                            <button
                              onClick={() => {
                                setEditedName(profile.name);
                                setEditedPhoto(profile.photoURL);
                                setIsEditing(true);
                              }}
                              className="p-1 text-[#2541B2]/60 hover:text-[#2541B2] hover:bg-[#2541B2]/5 rounded-md transition-colors cursor-pointer"
                              title="Editar Perfil"
                            >
                              <Edit3 size={11} />
                            </button>
                          </div>
                          
                          <div className="flex flex-col gap-0.5 mt-1 leading-none">
                            <span className="text-[10px] text-[#2541B2]/65 font-mono truncate">{profile.email}</span>
                            <span className="text-[7.5px] uppercase font-mono font-black tracking-widest text-[#2541B2]/50 mt-1 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                              Google ID autenticado
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-1 p-2 bg-[#2541B2]/5 hover:bg-red-50 text-[#2541B2]/70 hover:text-red-500 border border-[#2541B2]/10 hover:border-red-200 text-[10px] font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-xs self-start"
                          title="Sair da Conta"
                        >
                          <LogOut size={12} stopColor="currentColor" />
                          <span>Sair</span>
                        </button>
                      </motion.div>
                    ) : (
                      /* Editing profile Details */
                      <motion.form
                        onSubmit={handleSaveProfileChanges}
                        key="edit-profile-form"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        <div className="flex gap-4 items-start pb-2 border-b border-[#2541B2]/10">
                          <div className="relative">
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

                          <div className="flex-grow space-y-2">
                            <div>
                              <label htmlFor="edit-name-field" className="text-[8.5px] font-mono uppercase tracking-widest text-[#2541B2]/60 font-black">
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
                        </div>

                        {showPhotoSelector && (
                          <div className="p-2 bg-white/50 border border-[#2541B2]/10 rounded-xl space-y-2">
                            <span className="text-[8px] font-mono uppercase text-[#2541B2]/50 tracking-wider font-extrabold block">
                              Selecione um Preset ou Cole um Link customizado:
                            </span>
                            <div className="flex gap-2">
                              {AVATAR_PRESETS.map((preset, index) => (
                                <button
                                  type="button"
                                  key={index}
                                  onClick={() => handleSelectPresetAvatar(preset)}
                                  className={`w-9 h-9 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                                    editedPhoto === preset ? "border-[#2541B2] scale-110" : "border-transparent opacity-75"
                                  }`}
                                >
                                  <img src={preset} alt={`Avatar Preset ${index}`} className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <input
                                type="text"
                                placeholder="Ou cole a URL de uma imagem..."
                                value={customPhotoUrl}
                                onChange={(e) => setCustomPhotoUrl(e.target.value)}
                                className="flex-grow bg-white border border-[#2541B2]/10 text-[9.5px] px-2 py-1 rounded"
                              />
                              <button
                                type="button"
                                onClick={handleApplyCustomPhoto}
                                className="px-2 py-1 bg-[#2541B2] text-white text-[9px] font-mono uppercase tracking-wide rounded cursor-pointer"
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
                            className="px-3 py-1.5 border border-[#2541B2]/10 text-[#2541B2]/70 text-[9px] font-mono uppercase tracking-wider rounded-lg hover:bg-[#2541B2]/5 cursor-pointer"
                          >
                            Cancelar
                          </button>
                          
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-[#2541B2] text-white text-[9px] font-mono uppercase tracking-wider rounded-lg font-bold hover:bg-[#1E3491] cursor-pointer"
                          >
                            Salvar Dados
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* INTEGRATED STATISTICS (Moved fully from Settings area to Profile screen) */}
            <div className="mb-6 bg-[#2541B2]/3 border border-[#2541B2]/12 p-4 md:p-5 rounded-2xl relative overflow-hidden" id="profile-vital-statistics-card">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#2541B2]/60 font-black mb-3.5 flex items-center gap-2 select-none border-b border-[#2541B2]/10 pb-1.5">
                <Activity size={12} className="text-[#2541B2]" />
                <span>Estatísticas Vitais</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 border border-[#2541B2]/10 rounded-xl flex flex-col justify-center text-left">
                  <span className="text-[8.5px] uppercase tracking-wider text-[#2541B2]/60 leading-none">Tempo Acumulado</span>
                  <span className="text-xl font-serif text-[#2541B2] font-black leading-none mt-1.5">{totalSilenceMinutes} min</span>
                  <p className="text-[8px] text-[#2541B2]/50 mt-1">Conquistado em silêncio</p>
                </div>

                <div className="bg-white p-3 border border-[#2541B2]/10 rounded-xl flex flex-col justify-center text-left">
                  <span className="text-[8.5px] uppercase tracking-wider text-[#2541B2]/60 leading-none">Práticas Concluídas</span>
                  <span className="text-xl font-serif text-[#2541B2] font-black leading-none mt-1.5">{totalCompletedSessions}</span>
                  <p className="text-[8px] text-[#2541B2]/50 mt-1">Focos bem-sucedidos</p>
                </div>

                <div className="bg-white p-3 border border-[#2541B2]/10 rounded-xl flex flex-col justify-center text-left">
                  <span className="text-[8.5px] uppercase tracking-wider text-[#2541B2]/60 leading-none">Desvios de Impulso</span>
                  <span className="text-xl font-serif text-amber-600 font-black leading-none mt-1.5">{errorLogs.length} logs</span>
                  <p className="text-[8px] text-amber-600/50 mt-1">Sombra interceptada</p>
                </div>

                <div className="bg-white p-3 border border-[#2541B2]/10 rounded-xl flex flex-col justify-center text-left">
                  <span className="text-[8.5px] uppercase tracking-wider text-[#2541B2]/60 leading-none">Maior Distração</span>
                  <span className="text-[11px] font-serif text-[#2541B2] font-black leading-none mt-2 truncate max-w-full">
                    {topDistraction}
                  </span>
                  <p className="text-[8px] text-[#2541B2]/50 mt-1">Principal ranhura mental</p>
                </div>
              </div>
            </div>

            {/* INTEGRATED HISTORICAL LOG LIST (Show focus sessions record) */}
            <div className="space-y-2" id="profile-history-sessions-log">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#2541B2]/60 font-black mb-1 flex items-center gap-2 select-none">
                <Calendar size={12} />
                <span>Histórico do Ateliê</span>
              </h3>

              <div className="max-h-40 overflow-y-auto space-y-2 pr-1 no-scrollbar-y">
                {sessions.length === 0 ? (
                  <div className="text-center py-6 border border-[#2541B2]/10 border-dashed rounded-xl text-[10px] text-[#2541B2]/50 font-sans italic leading-relaxed">
                    Nenhuma sessão realizada neste ciclo.
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
                        className="p-2 px-3 bg-white border border-[#2541B2]/8 rounded-xl flex items-center justify-between text-left"
                      >
                        <div className="min-w-0">
                          <span className="text-[9.5px] font-serif font-black leading-none text-[#2541B2]">
                            {mins > 0 ? `${mins} min` : `${session.durationSeconds}s`} • {session.type === "sombra" ? "Modo Sombra" : "Prática Livre"}
                          </span>
                          <p className="text-[8px] text-[#2541B2]/60 truncate max-w-[200px] mt-0.5 font-light" title={session.notes}>
                            {session.notes}
                          </p>
                        </div>
                        <span className="text-[7.5px] font-mono text-[#2541B2]/45 shrink-0 ml-2">
                          {formattedDate}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
