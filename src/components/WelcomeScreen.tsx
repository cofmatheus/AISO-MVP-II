import React, { useState } from "react";
import { UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { LogIn, Sparkles, AlertCircle, HelpCircle, ShieldCheck, ShieldAlert, BookOpen, Palette } from "lucide-react";
import { signInWithGoogleSupabase, isSupabaseConfigured } from "../lib/supabase";

interface WelcomeScreenProps {
  onLogin: (profile: UserProfile) => void;
}

export default function WelcomeScreen({ onLogin }: WelcomeScreenProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleRealGoogleLogin = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        throw new Error("Supabase não configurado. Por favor, adicione as variáveis no seu .env ou nas Configurações da plataforma.");
      }

      const authUrl = await signInWithGoogleSupabase();
      
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
    } catch (err: any) {
      console.error("Erro ao iniciar login Google:", err);
      setErrorMsg(err.message || "Erro desconhecido ao abrir tela de login.");
    } finally {
      setLoading(false);
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
        </div>

        {/* Content Details Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="w-full bg-[#FFFFFF]/90 border border-[#2541B2]/15 p-6 md:p-8 rounded-2xl shadow-xl space-y-6 relative overflow-hidden paper-texture"
        >
          <div className="space-y-6 text-center">
            <div className="text-left space-y-3.5 text-xs text-slate-700 font-sans leading-relaxed">
              {/* Bloco de Destaque Especial: Mixed Media & Artes Manuais */}
              <div className="bg-[#2541B2]/5 border border-[#2541B2]/15 p-5 rounded-xl space-y-2.5 mb-2">
                <div className="flex items-center gap-2.5 text-[#2541B2]">
                  <Palette size={18} className="shrink-0" />
                  <h3 className="font-serif text-xs md:text-sm font-black uppercase tracking-widest">
                    Criação Offline & Mixed Media
                  </h3>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  A verdadeira excelência em design e artes visuais exige o domínio da matéria física. Este santuário digital foi desenhado para estruturar o desenvolvimento de <strong className="text-[#2541B2]">técnicas mistas (mixed media)</strong>, colagens táteis, desenho acadêmico, cadernos de rascunhos livres e artesanato tridimensional. O tempo longe das telas, focado no atrito real do carvão, dos pigmentos e das colas físicas, solidifica a percepção espacial e estética indispensável para qualquer criador.
                </p>
              </div>

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
                  <strong className="text-[#2541B2] font-semibold">Auto-observação na Sombra:</strong> Registre seus desvios de impulso de forma analógica, interceptando a dispersão para solidificar paciência activa.
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

            {/* Real Google OAuth SSO Form */}
            <div className="border-t border-[#2541B2]/10 pt-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-[10px] text-red-700 leading-relaxed text-left flex gap-2 items-start">
                  <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Aviso de Configuração:</span> {errorMsg}
                  </div>
                </div>
              )}

              <button
                id="google-login-welcome-btn"
                onClick={handleRealGoogleLogin}
                disabled={loading}
                className="w-full py-3.5 bg-[#2541B2] hover:bg-[#1E3491] disabled:bg-[#2541B2]/50 text-white text-xs uppercase tracking-widest font-black rounded-xl duration-300 transition-all shadow-md hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white" />
                ) : (
                  <LogIn size={15} />
                )}
                <span>Entrar com o Google</span>
              </button>
            </div>
          </div>
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
