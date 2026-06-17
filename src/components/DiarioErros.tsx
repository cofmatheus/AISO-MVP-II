import React, { useState } from "react";
import { ErrorLog } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, Plus, Trash2, SlidersHorizontal, Info, FileText, ArrowLeft, Lightbulb, X } from "lucide-react";

interface DiarioErrosProps {
  onBack: () => void;
  errorLogs: ErrorLog[];
  onAddErrorLog: (log: ErrorLog) => void;
  onDeleteLog: (id: string) => void;
}

export default function DiarioErros({
  onBack,
  errorLogs,
  onAddErrorLog,
  onDeleteLog,
}: DiarioErrosProps) {
  // Log entry form visibility
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // Form states
  const [category, setCategory] = useState<string>("Compulsão Física");
  const [description, setDescription] = useState<string>("");
  const [intensity, setIntensity] = useState<number>(3);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<string>("Todos");
  
  // Inline deletion verification ID
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categories = [
    "Notificações / Chats",
    "Compulsão Física",
    "Redes Sociais",
    "Ansiedade de Trabalho",
    "Buscador Manual",
    "Monotonia / Tédio",
    "Outros Desvios",
  ];

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();

    const newLog: ErrorLog = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      category,
      description: description.trim() || `Impulso de desvio registrado em ambiente silencioso.`,
      intensity,
    };

    onAddErrorLog(newLog);

    // Reset states
    setDescription("");
    setIntensity(3);
    setIsAddingNew(false);
  };

  // Compute category stats
  const categoryCounts: { [key: string]: number } = {};
  errorLogs.forEach((log) => {
    categoryCounts[log.category] = (categoryCounts[log.category] || 0) + 1;
  });

  const topCategory =
    Object.keys(categoryCounts).length > 0
      ? Object.entries(categoryCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
      : "Nenhum";

  // Contextual smart suggestions helper
  const getContextualAdvice = (categoryName: string) => {
    switch (categoryName) {
      case "Compulsão Física":
        return "Para a compulsão física (o ato reflexivo de estender a mão e pegar o telefone de tela para cima), coloque o celular em outra sala ou dentro de uma gaveta fechada. Crie atrito físico premeditado.";
      case "Redes Sociais":
        return "As redes sociais operam com ciclos de recompensa infinita. Desinstale os aplicativos temporariamente nos dias de silêncio profundo, ou coloque senhas difíceis e longas para quebrar a fluidez de acesso.";
      case "Notificações / Chats":
        return "Ative o modo 'Não Perturbe' absoluto. Configure no sistema do telemóvel para permitir chamadas exclusivamente de contatos marcados como emergência, esvaziando alertas de conversas triviais.";
      case "Ansiedade de Trabalho":
        return "Ansiedade ocupacional geralmente nos leva a buscar micro-estímulos rápidos. Se sentir sobrecarregado, feche todas as guias por 3 minutos e foque unicamente nos ciclos básicos de respiração.";
      case "Buscador Manual":
        return "Andamos pesquisando ideias irrelevantes só para saciar a dúvida do agora. Tenha um pequeno caderno de papel por perto. Escreva a sua dúvida de caneta ali, esquecendo a pesquisa online até o término do dia.";
      case "Monotonia / Tédio":
        return "Aprenda a conviver com o ócio criativo. O tédio nada mais é do que o cérebro se re-calibrando ao ritmo analógico natural. Resista por 12 minutos e o tédio florescerá em pura calmaria.";
      default:
        return "Compreender seu hábito desmedido é o primeiro ato de libertação. Documente cada impulso e veja o progresso de sua soberania de atenção.";
    }
  };

  // Filter logs logic
  const filteredLogs = errorLogs.filter((log) => {
    if (activeFilter === "Todos") return true;
    return log.category === activeFilter;
  });

  return (
    <div className="w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-8 flex flex-col flex-grow justify-between min-h-[80vh]">
      {/* Upper Navigation Back Button */}
      <div className="flex items-center justify-between border-b border-outline/20 pb-4 mb-8">
        <button
          id="diario-erros-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 text-primary hover:opacity-75 transition-opacity text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} />
          <span>Voltar ao Ateliê</span>
        </button>
        <span className="font-serif italic text-sm text-[#ba1a1a] opacity-80">
          Clínica do Desvio de Atenção
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Register Form & Stats / Guidance */}
        <div className="lg:col-span-1 space-y-6">
          {/* Section Brand */}
          <div className="space-y-2">
            <h2 className="font-serif text-3xl text-primary tracking-wide uppercase">Diário de Erros</h2>
            <p className="font-serif italic text-on-surface/75 text-sm">
              Um laboratório analítico de honestidade pessoal contra impulsos compulsivos.
            </p>
          </div>

          {/* Quick Stats & Wisdom Generator */}
          <div className="bg-surface-container-low border border-outline/10 p-5 rounded-lg space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-[#ba1a1a]" />
              <span>Diagnóstico de Atenção</span>
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between border-b border-outline/10 pb-1.5 text-xs text-on-surface/75 font-light">
                <span>Total de Quebras:</span>
                <strong className="text-primary font-medium">{errorLogs.length} desvios</strong>
              </div>
              <div className="flex justify-between border-b border-outline/10 pb-1.5 text-xs text-on-surface/75 font-light">
                <span>Gatilho Precoce Principal:</span>
                <strong className="text-primary font-medium truncate max-w-[150px]" title={topCategory}>
                  {topCategory}
                </strong>
              </div>
            </div>

            {/* Wisdom card based on top distraction */}
            {errorLogs.length > 0 && (
              <div className="bg-primary/5 p-4 rounded-md border-l-2 border-primary space-y-2 mt-2">
                <h4 className="text-[10px] uppercase font-bold text-primary flex items-center gap-1">
                  <Lightbulb size={11} />
                  <span>Conselho do Silêncio</span>
                </h4>
                <p className="text-[11px] leading-relaxed text-primary-container font-light">
                  {getContextualAdvice(topCategory)}
                </p>
              </div>
            )}
          </div>

          {/* New Error Form Trigger */}
          <AnimatePresence mode="wait">
            {!isAddingNew ? (
              <button
                id="show-add-error-form-btn"
                onClick={() => setIsAddingNew(true)}
                className="w-full py-3 bg-surface-container-lowest border-1.5 border-dashed border-outline/50 text-xs font-semibold uppercase tracking-wider text-primary hover:bg-surface-container-low transition-all duration-300 rounded-md flex items-center justify-center gap-1"
              >
                <Plus size={15} />
                <span>Registrar Impulso Avulso</span>
              </button>
            ) : (
              <motion.form
                key="errorForm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onSubmit={handleCreateLog}
                className="bg-surface-container-low border border-outline/30 p-5 rounded-lg space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-[#ba1a1a] font-bold">Novo Desvio</span>
                  <button
                    type="button"
                    id="cancel-add-error-btn"
                    onClick={() => setIsAddingNew(false)}
                    className="text-outline hover:text-on-surface p-1 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Form Elements */}
                <div className="space-y-3 font-light text-xs">
                  {/* Category */}
                  <div className="space-y-1">
                    <label htmlFor="avulso-category-selector" className="text-[11px] uppercase tracking-wider text-outline font-semibold">Gatilho de Impulso</label>
                    <select
                      id="avulso-category-selector"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-surface border border-outline/25 rounded-md p-2 text-on-surface focus:outline-none focus:border-primary"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1">
                    <label htmlFor="avulso-notes-textarea" className="text-[11px] uppercase tracking-wider text-outline font-semibold">Ocorrido / Descreva o Momento</label>
                    <textarea
                      id="avulso-notes-textarea"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ex: Peguei o telefone no banheiro para ver feeds / Fiquei com pressa por notícias..."
                      className="w-full bg-surface border border-outline/25 rounded-md p-2 text-on-surface focus:outline-none focus:border-primary placeholder-on-surface/30"
                    />
                  </div>

                  {/* Intensity */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold text-outline text-[11px] uppercase tracking-wider">
                      <span>Urgência Mental</span>
                      <span className="text-primary">{intensity} / 5</span>
                    </div>
                    <input
                      type="range"
                      id="avulso-intensity-range"
                      min="1"
                      max="5"
                      value={intensity}
                      onChange={(e) => setIntensity(parseInt(e.target.value))}
                      className="w-full accent-primary h-1 rounded bg-surface border-0"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="submit-error-avulso-btn"
                  className="w-full py-2.5 bg-primary text-on-primary hover:bg-primary/95 text-xs font-semibold uppercase tracking-widest rounded-md transition-all flex items-center justify-center gap-1"
                >
                  <Plus size={13} />
                  <span>Documentar</span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Filters and Log entries list */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters List */}
          <div className="flex flex-wrap items-center gap-2 border-b border-outline/10 pb-4">
            <span className="text-[10px] uppercase font-bold text-outline tracking-wider flex items-center gap-1 mr-2">
              <SlidersHorizontal size={12} />
              Filtrar Gatilho:
            </span>
            {["Todos", ...categories].map((cat) => (
              <button
                key={cat}
                id={`filter-btn-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setActiveFilter(cat)}
                className={`px-3 py-1 text-[11px] rounded-full border transition-all ${
                  activeFilter === cat
                    ? "bg-primary border-primary text-on-primary font-medium"
                    : "bg-surface border-outline/15 text-outline hover:bg-surface-container-low"
                }`}
              >
                {cat === "Todos" ? "Exibir Todos" : cat}
              </button>
            ))}
          </div>

          {/* Log entries list */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredLogs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-surface-container-low border border-outline/10 p-12 text-center rounded-lg space-y-3"
                >
                  <FileText size={32} className="text-outline/40 mx-auto" />
                  <div className="text-sm font-serif italic text-primary/80">Sem desvios registrados.</div>
                  <p className="text-xs text-outline font-light max-w-sm mx-auto leading-relaxed">
                    Você está mantendo sua mente limpa e protegida de ruídos. Continue respeitando o silêncio intocado.
                  </p>
                </motion.div>
              ) : (
                filteredLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    id={`error-card-${log.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="p-5 border border-outline/15 rounded-lg bg-surface-container-lowest/80 paper-texture shadow-xs hover:border-outline/45 transition-colors flex justify-between items-start gap-4 flex-col sm:flex-row"
                  >
                    <div className="space-y-3 flex-grow">
                      {/* Header log */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-error/10 text-error px-2 py-0.5 rounded-sm text-[10px] uppercase font-bold tracking-wider">
                          {log.category}
                        </span>
                        
                        <span className="text-[10px] font-mono text-outline font-light">
                          {new Date(log.date).toLocaleDateString("pt-BR")} &nbsp;•&nbsp; {new Date(log.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>

                        <span className="flex gap-0.5 items-center ml-2" title={`Intensidade de Urgência: ${log.intensity}/5`}>
                          {[1, 2, 3, 4, 5].map((idx) => (
                            <span
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full ${
                                idx <= log.intensity ? "bg-error" : "bg-outline/20"
                              }`}
                            />
                          ))}
                        </span>
                      </div>

                      {/* Content Description */}
                      <p className="text-sm text-on-surface font-light leading-relaxed font-sans">
                        {log.description}
                      </p>
                    </div>

                     {/* Inline Delete confirmation */}
                     {deletingId === log.id ? (
                       <div className="flex items-center gap-1.5 self-end sm:self-start bg-error/10 px-2 py-1 rounded border border-error/20" id={`delete-confirm-box-${log.id}`}>
                         <span className="text-[10px] text-error font-semibold uppercase tracking-wider">Confirmar?</span>
                         <button
                           onClick={() => {
                             onDeleteLog(log.id);
                             setDeletingId(null);
                           }}
                           className="text-[10px] bg-error text-white font-bold px-1.5 py-0.5 rounded uppercase hover:bg-error/90 duration-200"
                         >
                           Sim
                         </button>
                         <button
                           onClick={() => setDeletingId(null)}
                           className="text-[10px] bg-surface-dim text-on-surface font-semibold px-1.5 py-0.5 rounded border border-outline/30 uppercase hover:bg-surface-container duration-200"
                         >
                           Não
                         </button>
                       </div>
                     ) : (
                       <button
                         id={`delete-log-btn-${log.id}`}
                         onClick={() => setDeletingId(log.id)}
                         className="text-outline/40 hover:text-error p-1.5 rounded-md duration-300 transition-colors shrink-0 hover:bg-error/5 self-end sm:self-start"
                         title="Excluir desvio"
                       >
                         <Trash2 size={14} />
                       </button>
                     )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
