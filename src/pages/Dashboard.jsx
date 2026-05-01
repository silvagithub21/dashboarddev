import { useState, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { db } from "../firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { BugVsFeatureChart, CompletionRateChart, SprintVelocityChart } from "../components/ProductivityChart";
import NotesPanel from "../components/NotesPanel";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import StatsPanel from "../components/StatsPanel";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { 
  RiListCheck2, 
  RiLightbulbLine, 
  RiTimerFlashLine, 
  RiTimerLine, 
  RiFlag2Line, 
  RiLayoutGridLine, 
  RiFocus2Line, 
  RiCalendarCheckLine,
  RiAddLine,
  RiFilter3Line,
  RiInboxLine,
  RiCheckboxCircleLine,
  RiFlagLine
} from "react-icons/ri";

const TIPS = [
  {
    id: "duck",
    icon: <RiLightbulbLine />,
    title: "Rubber Duck Debugging",
    desc: "Explique seu código para um patinho.",
    detail: "Quando travar em um bug, tente explicar o problema em voz alta para um objeto inanimado (ou um patinho de borracha). O ato de organizar o pensamento para explicar o erro força seu cérebro a ver lacunas na lógica que você ignorou ao apenas ler o código. É uma técnica clássica que economiza horas de frustração."
  },
  {
    id: "kiss",
    icon: <RiFocus2Line />,
    title: "Princípio KISS",
    desc: "Keep It Simple, Stupid.",
    detail: "A maioria dos sistemas funciona melhor se forem mantidos simples do que se forem complicados. Evite a super-engenharia. Se uma solução simples resolve o problema de forma robusta, não há necessidade de introduzir padrões de projeto complexos ou abstrações desnecessárias que dificultam a manutenção futura."
  },
  {
    id: "yagni",
    icon: <RiFlag2Line />,
    title: "Princípio YAGNI",
    desc: "You Ain't Gonna Need It.",
    detail: "Não implemente funcionalidades até que elas sejam realmente necessárias. Frequentemente, os desenvolvedores adicionam complexidade prevendo necessidades futuras que nunca se concretizam. Isso cria código morto e aumenta a carga de manutenção. Foque no que o ticket pede agora."
  },
  {
    id: "solid",
    icon: <RiLayoutGridLine />,
    title: "Princípios SOLID",
    desc: "Código Limpo e Escalável.",
    detail: "SOLID é um acrônimo para cinco princípios de design de software que visam tornar os projetos mais compreensíveis, flexíveis e fáceis de manter. Ao seguir o SOLID (Single Responsibility, Open/Closed, etc), você reduz o acoplamento e torna seu sistema muito mais fácil de testar e evoluir."
  },
  {
    id: "pomodev",
    icon: <RiTimerLine />,
    title: "Foco por Sprints",
    desc: "Use o Pomodoro para Codar.",
    detail: "Programar exige um estado de fluxo profundo. Use o Timer Pomodoro integrado para blocos de 25-50 minutos de codificação sem interrupções (Slack fechado, celular longe). As pausas curtas ajudam a prevenir o 'code fatigue' e mantêm sua mente fresca para resolver problemas complexos ao longo do dia."
  }
];

const PomodoroTimer = () => {
  const [mode, setMode] = useState(25); // 25, 45, 60
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  // Persist focus data
  const [focusStats, setFocusStats] = useLocalStorage("devengine-focus-stats", {
    sessionsCompleted: 0,
    totalMinutes: 0,
    lastActiveDate: new Date().toISOString().split('T')[0]
  });

  // Reset daily stats if it's a new day
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (focusStats.lastActiveDate !== today) {
      setFocusStats(prev => ({ ...prev, sessionsCompleted: 0, lastActiveDate: today }));
    }
  }, [focusStats.lastActiveDate, setFocusStats]);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Session completed!
          setIsActive(false);
          new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg").play().catch(() => {});
          
          setFocusStats(prev => ({
            ...prev,
            sessionsCompleted: prev.sessionsCompleted + 1,
            totalMinutes: prev.totalMinutes + mode
          }));
          setMinutes(mode); // reset to current mode
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, mode, setFocusStats]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setMinutes(mode);
    setSeconds(0);
  };
  
  const changeMode = (newMode) => {
    setIsActive(false);
    setMode(newMode);
    setMinutes(newMode);
    setSeconds(0);
  };

  return (
    <div className="pomodoro-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
         <span className="stat-label">Foco Profundo</span>
         <div style={{ display: 'flex', gap: 4 }}>
           {[25, 45, 60].map(m => (
             <button 
               key={m} 
               onClick={() => changeMode(m)}
               style={{ 
                 background: mode === m ? 'var(--accent-primary)' : 'var(--bg-elevated)', 
                 color: mode === m ? '#fff' : 'var(--text-muted)',
                 border: 'none', borderRadius: 4, padding: '2px 6px', fontSize: 10, cursor: 'pointer'
               }}
             >
               {m}m
             </button>
           ))}
         </div>
      </div>
      
      <div className="timer-display">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      
      <div className="timer-controls" style={{ marginBottom: 16 }}>
        <button className="add-task-btn" onClick={toggle} style={{ height: 36, padding: '0 16px' }}>
          {isActive ? "Pausar" : "Iniciar Sprint"}
        </button>
        <button className="btn-secondary" onClick={reset} style={{ height: 36, padding: '0 12px' }}>Reset</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: 11, color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
         <span>🎯 {focusStats.sessionsCompleted} sessões hoje</span>
         <span>⏱️ {Math.floor(focusStats.totalMinutes / 60)}h {focusStats.totalMinutes % 60}m total</span>
      </div>
    </div>
  );
};

export default function Dashboard({ activeTab, onTabChange }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useLocalStorage("flowboard-tasks", []);
  const [googleCalendarId, setGoogleCalendarId] = useLocalStorage("flowboard-gcal-id", "");
  const [tempCalendarId, setTempCalendarId] = useState(googleCalendarId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Kanban Filters
  const [filterType, setFilterType] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [savedProjects] = useLocalStorage("devengine-projects", ["Geral", "Frontend", "Backend", "Infra"]);

  const [showSaved, setShowSaved] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null);
  const lastDeletedTask = useRef(null);

  const [isUpdatingFromCloud, setIsUpdatingFromCloud] = useState(false);

  // Sincronização com Firestore
  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists() && docSnap.data().tasks) {
        // Evitar loop: só atualiza se for diferente do estado local
        const cloudTasks = docSnap.data().tasks;
        if (JSON.stringify(cloudTasks) !== JSON.stringify(tasks)) {
          setTasks(cloudTasks);
        }
      }
    });
    return () => unsub();
  }, [user, tasks]);

  // Salvar no Firestore sempre que as tarefas mudarem localmente
  useEffect(() => {
    if (!user) return;
    
    const saveToCloud = async () => {
      try {
        await setDoc(doc(db, "users", user.uid), { tasks }, { merge: true });
      } catch (err) {
        console.error("Erro ao sincronizar com a nuvem:", err);
      }
    };

    // Debounce para não sobrecarregar o Firebase
    const timeoutId = setTimeout(saveToCloud, 2000);
    return () => clearTimeout(timeoutId);
  }, [tasks, user]);

  function handleSaveCalendar() {
    setGoogleCalendarId(tempCalendarId);
    setShowSaved(true);
    setTimeout(() => {
      setShowSaved(false);
      onTabChange("calendario");
    }, 1500);
  }

  function viewTip(tipId) {
    const tip = TIPS.find(t => t.id === tipId);
    setSelectedTip(tip);
    onTabChange("tips");
  }

  // ── CRUD ──────────────────────────────────────────────────────
  function addTask(taskData) {
    const newTask = {
      ...taskData,
      id: Date.now(),
      status: 'todo',
      done: false,
      createdAt: new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
    showToast("Ticket enviado para o Backlog!");
  }

  function updateTaskStatus(id, newStatus) {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus, done: newStatus === 'done' } : t));
  }

  function toggleTask(id) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function deleteTask(id) {
    const taskToDelete = tasks.find(t => t.id === id);
    lastDeletedTask.current = taskToDelete;
    
    setTasks(tasks.filter((t) => t.id !== id));
    
    showToast("Tarefa removida.", "info", {
      label: "Desfazer",
      onClick: () => {
        if (lastDeletedTask.current) {
          setTasks(prev => [...prev, lastDeletedTask.current]);
          lastDeletedTask.current = null;
        }
      }
    });
  }

  function clearCompleted() {
    const activeTasks = tasks.filter(t => t.status !== 'done');
    if (activeTasks.length === tasks.length) {
      showToast("Não há tarefas concluídas para limpar.", "info");
      return;
    }
    setTasks(activeTasks);
    showToast("Tarefas concluídas removidas.");
  }

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    
    // Se mudou de coluna
    if (destination.droppableId !== source.droppableId) {
      updateTaskStatus(Number(draggableId), destination.droppableId);
      showToast(`Status atualizado: ${destination.droppableId}`);
      return;
    }

    // Se mudou de posição na mesma coluna
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);
    
    setTasks(items);
  };

  // ── Filter ────────────────────────────────────────────────────
  const filteredTasks = tasks.filter((t) => {
    const matchType = filterType === "all" || t.type === filterType;
    const matchProject = filterProject === "all" || t.project === filterProject;
    const matchPriority = filterPriority === "all" || t.priority === filterPriority;
    return matchType && matchProject && matchPriority;
  });

  // ── Render Views ──────────────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case "tips":
        const tip = selectedTip || TIPS[0];
        return (
          <div className="tip-detail-view chart-card">
            <button 
              className="task-btn" 
              style={{ marginBottom: 16, width: 'auto', padding: '8px 12px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', gap: 8 }}
              onClick={() => onTabChange("dashboard")}
            >
               ← Voltar ao Dashboard
            </button>
            <div style={{ fontSize: 48, marginBottom: 16, color: 'var(--accent-primary)' }}>{tip.icon}</div>
            <div className="chart-card-title" style={{ fontSize: 24 }}>{tip.title}</div>
            <div className="chart-card-sub" style={{ fontSize: 16, marginTop: 8, color: 'var(--accent-primary)' }}>{tip.desc}</div>
            <div style={{ marginTop: 24, lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: 16, background: 'var(--bg-elevated)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
              {tip.detail}
            </div>
            <div style={{ marginTop: 32 }}>
               <div className="chart-card-title" style={{ fontSize: 14 }}>Outras Técnicas</div>
               <div className="tips-list" style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {TIPS.filter(t => t.id !== tip.id).map(t => (
                    <div key={t.id} className="tip-item" style={{ flex: 1, minWidth: 200, cursor: 'pointer' }} onClick={() => setSelectedTip(t)}>
                       <span className="tip-icon" style={{ color: 'var(--accent-primary)' }}>{t.icon}</span>
                       <div className="tip-title">{t.title}</div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        );

      case "stats":
        return (
          <div className="stats-view">
            <StatsPanel tasks={tasks} />
            <div className="bottom-grid" style={{ marginTop: 24 }}>
              <div className="chart-card confidence-card" style={{ gridColumn: 'span 2' }}>
                <SprintVelocityChart tasks={tasks} />
              </div>
              <div className="chart-card">
                <BugVsFeatureChart tasks={tasks} />
              </div>
              <div className="chart-card">
                <CompletionRateChart tasks={tasks} />
              </div>
            </div>
          </div>
        );

        case "notas":
          return (
            <motion.div
              key="notas"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="section-header">
                <h2 className="section-title">Rascunho de Desenvolvimento</h2>
              </div>
              <NotesPanel />
            </motion.div>
          );
        case "calendario":
        return (
          <div className="calendar-view chart-card" style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
            <div className="chart-card-title">Google Agenda</div>
            <div className="chart-card-sub">Seus compromissos integrados</div>
            
            {googleCalendarId ? (
              <div className="calendar-iframe-container" style={{ flex: 1, marginTop: 16, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <iframe
                  src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(googleCalendarId)}&ctz=America%2FSao_Paulo&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&showTz=0&mode=WEEK`}
                  style={{ border: 0, width: '100%', height: '100%' }}
                  frameBorder="0"
                  scrolling="no"
                ></iframe>
              </div>
            ) : (
              <div className="empty-state" style={{ flex: 1, marginTop: 16 }}>
                <div className="empty-state-icon">📅</div>
                <div className="empty-state-text">Nenhuma agenda vinculada</div>
                <div className="empty-state-sub">Vá em Configurações para vincular seu e-mail do Google.</div>
                <button 
                  className="add-task-btn" 
                  style={{ marginTop: 16 }}
                  onClick={() => onTabChange("settings")}
                >
                  Configurar Agora
                </button>
              </div>
            )}
          </div>
        );

      case "settings":
        return (
          <div className="settings-view chart-card">
            <div className="chart-card-title">Configurações Avançadas</div>
            <div className="chart-card-sub">Gerencie integrações e dados do seu ambiente de trabalho</div>
            
            <div className="settings-section" style={{ marginTop: 24, padding: '20px', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <RiCalendarCheckLine style={{ color: 'var(--accent-primary)', fontSize: 20 }} />
                <h3 style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>Sincronização com Google Agenda</h3>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                Integre seus eventos e compromissos diretamente no dashboard. Insira o endereço de e-mail associado à sua agenda.
              </p>
              
              <div className="task-input-wrapper" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
                <label style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>Endereço da Agenda Pública:</label>
                <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                  <input 
                    type="text" 
                    className="task-input" 
                    placeholder="ex: seunome@gmail.com"
                    value={tempCalendarId}
                    onChange={(e) => setTempCalendarId(e.target.value)}
                    style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}
                  />
                  <button 
                    className="add-task-btn" 
                    onClick={handleSaveCalendar}
                    disabled={showSaved}
                    style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 600 }}
                  >
                    {showSaved ? "Configuração Salva ✅" : "Vincular Agenda"}
                  </button>
                </div>
                {showSaved && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: 13, color: 'var(--accent-green)', fontWeight: 500 }}
                  >
                    Integração atualizada com sucesso! Redirecionando...
                  </motion.p>
                )}
                
                <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px', borderLeft: '4px solid var(--accent-primary)' }}>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Requisito obrigatório:</strong> Para habilitar a visualização, acesse seu Google Agenda pelo navegador, vá em <em>Configurações &gt; Compartilhar com pessoas específicas ou publicamente</em> e selecione a opção <strong>"Disponibilizar publicamente"</strong>.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="settings-section" style={{ marginTop: 24, padding: '20px', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <RiInboxLine style={{ color: '#ef4444', fontSize: 20 }} />
                <h3 style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>Gerenciamento de Dados Locais</h3>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                Atenção: Ao limpar os dados locais, todas as tarefas registradas no seu dispositivo serão removidas permanentemente. Esta ação não pode ser desfeita.
              </p>
              <button 
                className="task-btn delete" 
                style={{ width: 'auto', padding: '10px 20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', fontWeight: 600 }}
                onClick={() => {
                  if(confirm("Operação irreversível. Tem certeza que deseja excluir permanentemente todas as suas tarefas locais?")) {
                    setTasks([]);
                    showToast("Dados locais apagados com sucesso.", "info");
                  }
                }}
              >
                Limpar Todos os Dados
              </button>
            </div>
          </div>
        );

      case "tarefas":
      case "dashboard":
      default:
        return (
          <>
            {activeTab === "dashboard" && <StatsPanel tasks={tasks} />}
            
            <div className="action-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16 }}>
               <button className="add-task-btn" onClick={() => setIsModalOpen(true)} style={{ width: 'auto', padding: '0 24px', height: 48 }}>
                 <RiAddLine style={{ marginRight: 8, fontSize: 20 }} /> Nova Tarefa
               </button>

               <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <select className="task-input" style={{ width: 130, padding: '6px 12px', height: 40 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="all">Tipos (Todos)</option>
                    <option value="bug">Bug</option>
                    <option value="feature">Feature</option>
                    <option value="refactor">Refactor</option>
                  </select>
                  <select className="task-input" style={{ width: 140, padding: '6px 12px', height: 40 }} value={filterProject} onChange={e => setFilterProject(e.target.value)}>
                    <option value="all">Projetos (Todos)</option>
                    {savedProjects.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <select className="task-input" style={{ width: 130, padding: '6px 12px', height: 40 }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                    <option value="all">Prioridade (Todas)</option>
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>

                  {tasks.some(t => t.status === 'done') && (
                    <button 
                      className="btn-secondary" 
                      onClick={clearCompleted}
                      style={{ height: 40, padding: '0 12px', fontSize: 12, color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                    >
                      Limpar Concluídos
                    </button>
                  )}
               </div>
            </div>

            <section className="kanban-section">
               <div className="kanban-board">
                  {['todo', 'doing', 'done'].map(colId => (
                    <div key={colId} className="kanban-column">
                       <div className="column-header">
                          <h3 className="column-title">
                             {colId === 'todo' ? 'Backlog' : colId === 'doing' ? 'Em Progresso' : 'Concluído'}
                          </h3>
                          <span className="column-count">
                             {filteredTasks.filter(t => t.status === colId).length}
                          </span>
                       </div>

                       <Droppable droppableId={colId}>
                         {(provided) => (
                           <div 
                             className="task-list"
                             style={{ minHeight: 150 }}
                             {...provided.droppableProps}
                             ref={provided.innerRef}
                           >
                              <AnimatePresence mode="popLayout">
                                {filteredTasks.filter(t => t.status === colId).length === 0 && (
                                  <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: 13, border: '1px dashed var(--border)', borderRadius: 12, marginTop: 8 }}
                                  >
                                    Nenhuma task encontrada.
                                  </motion.div>
                                )}
                                {filteredTasks
                                  .filter(t => t.status === colId)
                                  .map((task, index) => (
                                    <TaskCard 
                                      key={task.id} 
                                      task={task} 
                                      index={index}
                                      onToggle={(id) => updateTaskStatus(id, task.status === 'done' ? 'todo' : 'done')} 
                                      onDelete={deleteTask} 
                                    />
                                  ))}
                              </AnimatePresence>
                              {provided.placeholder}
                           </div>
                         )}
                       </Droppable>
                    </div>
                  ))}
               </div>
            </section>

            {activeTab === "dashboard" && (
              <>
                <div className="bottom-grid" style={{ marginTop: 32 }}>
                  <div className="chart-card" style={{ gridColumn: 'span 1' }}>
                    <PomodoroTimer />
                  </div>
                  <div className="chart-card confidence-card" style={{ gridColumn: 'span 1' }}>
                    <SprintVelocityChart tasks={tasks} />
                  </div>
                  <div className="chart-card">
                    <BugVsFeatureChart tasks={tasks} />
                  </div>
                  <div className="chart-card">
                    <CompletionRateChart tasks={tasks} />
                  </div>
                </div>

                <section className="tips-section-home" style={{ marginTop: 24 }}>
                  <div className="section-header">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <RiLightbulbLine style={{ color: "var(--accent-amber)", fontSize: 20 }} />
                      <span className="section-title">Dicas de Produtividade Dev</span>
                    </div>
                  </div>
                  <div className="tips-grid-main" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: 16,
                    marginTop: 16 
                  }}>
                    {TIPS.map(tip => (
                      <div 
                        key={tip.id} 
                        className="tip-item chart-card" 
                        style={{ cursor: 'pointer', margin: 0 }}
                        onClick={() => viewTip(tip.id)}
                      >
                         <span className="tip-icon" style={{ color: 'var(--accent-primary)', fontSize: 24 }}>{tip.icon}</span>
                         <div className="tip-content">
                            <div className="tip-title">{tip.title}</div>
                            <div className="tip-desc" style={{ fontSize: 11 }}>{tip.desc}</div>
                          </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </>
        );
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ position: "relative", zIndex: 1 }}>
        {renderContent()}
        
        <TaskModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onAdd={addTask} 
        />

        <footer style={{ 
          marginTop: 48, 
          padding: '24px 0', 
          borderTop: '1px solid var(--border)', 
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: 13
        }}>
          <p>© {new Date().getFullYear()} FlowBoard — Desenvolvido por <strong>kleberdev</strong></p>
        </footer>
      </div>
    </DragDropContext>
  );
}
