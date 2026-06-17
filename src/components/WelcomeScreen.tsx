import React, { useState } from "react";
import { UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { LogIn, Sparkles, AlertCircle, HelpCircle, ShieldCheck } from "lucide-react";

interface WelcomeScreenProps {
  onLogin: (profile: UserProfile) => void;
}

export default function WelcomeScreen({ onLogin }: WelcomeScreenProps) {
  const [showAccounts, setShowAccounts] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>("");
  const [customEmail, setCustomEmail] = useState<string>("");
  const [showCustomForm, setShowCustomForm] = useState<boolean>(false);

  const handleSelectAccount = (name: string, email: string, photoURL: string = "") => {
    const avatar = photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
    const mockProfile: UserProfile = {
      uid: "google_" + Math.random().toString(36).substring(2, 11),
      name,
      email,
      photoURL: avatar,
      isLoggedIn: true
    };
    onLogin(mockProfile);
  };

  const handleCustomLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customName.trim() && customEmail.trim()) {
      handleSelectAccount(customName.trim(), customEmail.trim());
    }
  };

  return (
    <div className="w-full min-h-[95vh] flex items-center justify-center py-12 px-4 text-[#2541B2]" id="aiso-welcome-screen">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 via-[#2541B2] to-[#1E3491]" />
      
      <div className="max-w-xl w-full flex flex-col items-center space-y-8">
        
        {/* Abstract Logo Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-20 h-20 rounded-2xl overflow-hidden border border-[#2541B2]/20 shadow-md flex items-center justify-center p-1.5"
        >
          <img 
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&h=160&fit=crop&q=80" 
            alt="AISO Minimalist Brush" 
            className="w-full h-full object-cover filter saturate-125 select-none pointer-events-none"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-[#F7F7FF]/20" />
          <span className="absolute text-3xl font-serif font-black tracking-widest text-[#2541B2] bg-white/70 px-2 py-0.5 rounded border border-[#2541B2]/10 shadow-xs">
            愛想
          </span>
        </motion.div>

        {/* Hero Wording */}
        <div className="text-center space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl tracking-[0.25em] font-black uppercase text-[#2541B2] select-none text-center"
          >
            AISO
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="inline-block px-4 py-1 border border-[#2541B2]/25 bg-[#2541B2]/5 rounded-full select-none"
          >
            <span className="font-serif text-sm tracking-[0.3em] font-semibold text-[#2541B2]">
              愛想 — ATELIÊ CONTEMPLATIVO
            </span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="font-serif italic text-sm md:text-base text-[#2541B2]/75 max-w-md mx-auto leading-relaxed pt-2"
          >
            "A pressa nos fragmenta no digital; o silêncio tátil reconstrói quem somos."
          </motion.p>
        </div>

        {/* Content Details Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="w-full bg-[#FFFFFF]/90 border border-[#2541B2]/15 p-6 md:p-8 rounded-2xl shadow-xl space-y-6 relative overflow-hidden paper-texture"
        >
          {!showAccounts ? (
            <div className="space-y-6 text-center">
              <div className="text-left space-y-3.5 text-xs text-slate-700 font-sans leading-relaxed">
                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-[#2541B2]/10 border border-[#2541B2]/25 flex items-center justify-center shrink-0 mt-0.5 text-[#2541B2]">
                    <Sparkles size={11} />
                  </div>
                  <p>
                    <strong className="text-[#2541B2] font-semibold">Desintoxicação Dopaminérgica:</strong> Um refúgio projetado para ser esquecido enquanto você foca todo o seu olhar no mundo manual e intelectual físico.
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-[#2541B2]/10 border border-[#2541B2]/25 flex items-center justify-center shrink-0 mt-0.5 text-[#2541B2]">
                    <ShieldCheck size={11} />
                  </div>
                  <p>
                    <strong className="text-[#2541B2] font-semibold">Auto-observação na Sombra:</strong> Registre seus desvios de impulso de forma analógica, interceptando a dispersão para solidificar paciência ativa.
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-[#2541B2]/10 border border-[#2541B2]/25 flex items-center justify-center shrink-0 mt-0.5 text-[#2541B2]">
                    <HelpCircle size={11} />
                  </div>
                  <p>
                    <strong className="text-[#2541B2] font-semibold">Maestria Progressiva:</strong> Trace suas horas de foco real em cada atividade e veja seu nível de maestria evoluir dinamicamente com cada ciclo finalizado.
                  </p>
                </div>
              </div>

              <div className="border-t border-[#2541B2]/10 pt-6">
                <button
                  id="google-login-welcome-btn"
                  onClick={() => setShowAccounts(true)}
                  className="w-full py-3.5 bg-[#2541B2] hover:bg-[#1E3491] text-white text-xs uppercase tracking-widest font-black rounded-xl duration-300 transition-all shadow-md hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <LogIn size={15} />
                  <span>Entrar com o Google</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#2541B2] uppercase tracking-wide">Escolha uma Conta</h3>
                <p className="text-[11px] text-[#2541B2]/70 leading-normal">Escolha abaixo para continuar no seu ateliê do silêncio</p>
              </div>

              <div className="space-y-3">
                {/* Account Item 1: Matheus Correia */}
                <button
                  id="sign-in-profile-main-user"
                  onClick={() => handleSelectAccount("Matheus Correia", "matheuscorreiaaa@gmail.com")}
                  className="w-full flex items-center gap-3 p-3.5 border border-[#2541B2]/15 bg-[#F7F7FF]/80 rounded-xl hover:bg-[#2541B2]/5 hover:border-[#2541B2]/40 transition-all text-left group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[#2541B2] text-white flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                    MC
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2541B2]">Matheus Correia</div>
                    <div className="text-[9.5px] text-[#2541B2]/60 font-mono">matheuscorreiaaa@gmail.com</div>
                  </div>
                  <div className="ml-auto text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-150 rounded px-1.5 py-0.5 uppercase tracking-wide font-mono font-black">
                    Perfil Ativo
                  </div>
                </button>

                {/* Account Item 2: Artesao Contemplativo */}
                <button
                  id="sign-in-profile-option-2"
                  onClick={() => handleSelectAccount("Artesão Contemplativo", "artesao.contemplativo@gmail.com")}
                  className="w-full flex items-center gap-3 p-3.5 border border-[#2541B2]/10 bg-white/70 rounded-xl hover:bg-[#2541B2]/5 hover:border-[#2541B2]/30 transition-all text-left group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1E3491]/15 text-[#1E3491] flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                    AC
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Artesão Contemplativo</div>
                    <div className="text-[9.5px] text-slate-500 font-mono">artesao.contemplativo@gmail.com</div>
                  </div>
                </button>

                {/* Account Item 3: Custom Login Form toggler */}
                {!showCustomForm ? (
                  <button
                    onClick={() => setShowCustomForm(true)}
                    className="w-full text-center py-2 text-[10.5px] font-mono uppercase tracking-wider text-[#2541B2]/70 hover:text-[#2541B2] transition'colors max-w-fit mx-auto block hover:underline"
                  >
                    + Usar outra conta Google
                  </button>
                ) : (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    onSubmit={handleCustomLoginSubmit}
                    className="border-t border-[#2541B2]/10 pt-4 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Seu Nome</label>
                        <input
                          required
                          type="text"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="Ex: Clara Mendes"
                          className="w-full bg-white border border-[#2541B2]/15 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#2541B2]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Email Google</label>
                        <input
                          required
                          type="email"
                          value={customEmail}
                          onChange={(e) => setCustomEmail(e.target.value)}
                          placeholder="clara@gmail.com"
                          className="w-full bg-white border border-[#2541B2]/15 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#2541B2]"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#2541B2] hover:bg-[#1E3491] text-white text-[10px] uppercase font-bold tracking-widest rounded-lg"
                    >
                      Acessar com esta Conta
                    </button>
                  </motion.form>
                )}
              </div>

              <div className="flex gap-3 justify-between border-t border-[#2541B2]/10 pt-4">
                <button
                  onClick={() => setShowAccounts(false)}
                  className="text-[10px] font-mono uppercase text-[#2541B2]/60 hover:text-[#2541B2] py-1 cursor-pointer"
                >
                  ← Voltar
                </button>
                <div className="text-[9px] text-[#2541B2]/40 font-mono tracking-widest uppercase flex items-center gap-1">
                  <AlertCircle size={9} />
                  <span>Google SSO Sandboxed Integration</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
        
        {/* Footnote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center font-mono text-[8px] uppercase tracking-widest text-[#2541B2]/50"
        >
          AISO CONTEMPLATIVO • AMBIENTE SEGURO DE FOCO OFFLINE
        </motion.div>

      </div>
    </div>
  );
}
