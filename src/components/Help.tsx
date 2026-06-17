import { motion, AnimatePresence } from "motion/react";
import { X, HelpCircle, BookOpen, Sparkles, Sliders } from "lucide-react";

interface HelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Help({ isOpen, onClose }: HelpProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div id="help-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-lg bg-surface paper-texture border-1.5 border-outline p-8 rounded-lg atmospheric-blur z-10 max-h-[85vh] overflow-y-auto"
            id="help-modal-content"
          >
            {/* Close Button */}
            <button
              id="close-help-btn"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-primary hover:opacity-75 transition-opacity"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <span className="font-serif italic text-lg text-primary block mb-1">Guia do Praticante</span>
              <h2 className="font-serif text-3xl text-primary tracking-wide uppercase">AISO CORE</h2>
              <div className="w-12 h-[1px] bg-outline mx-auto mt-2"></div>
            </div>

            {/* Content Sections */}
            <div className="space-y-6 text-on-surface text-sm leading-relaxed font-sans font-light">
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-primary uppercase tracking-wider font-semibold text-xs">
                  <BookOpen size={14} />
                  <span>O que é este espaço?</span>
                </div>
                <p>
                  O <strong className="font-medium">AISO</strong> é um convite ao desapego da estimulação digital incessante. Diferente dos aplicativos tradicionais, ele foi projetado para <strong className="font-medium">ser esquecido</strong>. Seu objetivo é ajudar você a silenciar os ruídos eletrônicos e reencontrar o tempo analógico em sua vida quotidiana através de foco direcionado em atividades físicas.
                </p>
              </section>

              <section className="space-y-2">
                <div className="flex items-center gap-2 text-primary uppercase tracking-wider font-semibold text-xs">
                  <Sparkles size={14} />
                  <span>Como praticar?</span>
                </div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    <strong className="font-medium">Prática Livre:</strong> Inicie um cronômetro ou timer e coloque o telefone de lado, preferencialmente de tela para baixo. Sente-se confortavelmente, observe o espaço ou dedique-se a uma tarefa manual. Ao concluir, anote seus insights ou sentimentos.
                  </li>
                  <li>
                    <strong className="font-medium">Modo Sombra:</strong> Uma imersão profunda em silêncio absoluto. A tela escurece e uma âncora de respiração se expande de forma orgânica. Se desejar, ative as <strong className="font-medium">Telas Sonoras</strong> para emitir sinos e tons meditativos baseados em frequências de cura.
                  </li>
                  <li>
                    <strong className="font-medium">Diário de Erros:</strong> Sempre que ceder ao impulso automático de abrir as redes sociais ou checar as notificações sem necessidade, registre o ocorrido aqui. Aprender a mapear e compreender de onde vem sua ansiedade é o primeiro passo para vencê-la.
                  </li>
                </ul>
              </section>

              <section className="space-y-2">
                <div className="flex items-center gap-2 text-primary uppercase tracking-wider font-semibold text-xs">
                  <Sliders size={14} />
                  <span>As Regras do Silêncio</span>
                </div>
                <p className="italic text-xs text-primary bg-primary/5 p-3 rounded-md border-l-2 border-primary">
                  1. O celular deve ser mantido afastado ou intocado durante a prática.<br />
                  2. Não há pressa, metas competitivas ou pontuações de jogo.<br />
                  3. Os limites da sua mente são explorados sem julgamentos. Se falhar, registre em seu diário com bondade e recomece.
                </p>
              </section>
            </div>

            {/* Bottom Quote */}
            <div className="mt-8 pt-6 border-t border-outline/30 text-center">
              <p className="font-serif italic text-primary/80">"Não há pressa no silêncio"</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
