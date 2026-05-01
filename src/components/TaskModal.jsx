import { useState, useEffect } from "react";
import { RiCloseLine, RiAddLine, RiFlag2Line, RiCalendarLine } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalStorage } from "../hooks/useLocalStorage";

export default function TaskModal({ isOpen, onClose, onAdd }) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [type, setType] = useState("feature");
  
  const [savedProjects, setSavedProjects] = useLocalStorage("devengine-projects", ["Geral", "Frontend", "Backend", "Infra"]);
  const [project, setProject] = useState("Geral");
  const [isNewProject, setIsNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
      // Reset state when closed
      setText("");
      setPriority("medium");
      setType("feature");
      setProject("Geral");
      setIsNewProject(false);
      setNewProjectName("");
      setDueDate("");
      setError(false);
    }
    
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) {
      setError(true);
      return;
    }
    
    let finalProject = project;
    if (isNewProject && newProjectName.trim()) {
      finalProject = newProjectName.trim();
      if (!savedProjects.includes(finalProject)) {
        setSavedProjects([...savedProjects, finalProject]);
      }
    }

    onAdd({
      text,
      priority,
      type,
      project: finalProject,
      dueDate,
      status: "todo",
      createdAt: new Date().toISOString()
    });
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="modal-overlay" 
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="modal-header">
              <h2 className="modal-title">Nova Tarefa Dev</h2>
              <button className="close-btn" onClick={onClose} aria-label="Fechar">
                <RiCloseLine />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="task-text">O que precisa ser desenvolvido?</label>
                <div className="input-with-icon">
                  <input
                    id="task-text"
                    type="text"
                    className={`task-input ${error ? 'error' : ''}`}
                    placeholder="Ex: Implementar autenticação OAuth..."
                    autoFocus
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      if (error) setError(false);
                    }}
                  />
                </div>
                {error && (
                  <motion.span 
                    className="error-msg"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    O nome da tarefa é obrigatório.
                  </motion.span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label><RiFlag2Line style={{ verticalAlign: 'middle', marginRight: 4 }} /> Prioridade</label>
                  <div className="priority-segmented-control">
                    {["low", "medium", "high"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`priority-segment ${p} ${priority === p ? "active" : ""}`}
                        onClick={() => setPriority(p)}
                      >
                        {p === "low" ? "Baixa" : p === "medium" ? "Média" : "Alta"}
                        {priority === p && (
                          <motion.div 
                            layoutId="active-priority" 
                            className="active-indicator"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-row">
                 <div className="form-group" style={{ flex: 1 }}>
                    <label>Tipo de Task</label>
                    <select className="task-input" value={type} onChange={(e) => setType(e.target.value)}>
                       <option value="feature">✨ Feature</option>
                       <option value="bug">🐞 Bug</option>
                       <option value="refactor">♻️ Refactor</option>
                    </select>
                 </div>
                 <div className="form-group" style={{ flex: 1 }}>
                    <label>Projeto</label>
                    {isNewProject ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input 
                          autoFocus
                          className="task-input" 
                          placeholder="Nome do projeto..."
                          value={newProjectName}
                          onChange={e => setNewProjectName(e.target.value)}
                        />
                        <button type="button" className="btn-secondary" onClick={() => setIsNewProject(false)} style={{ padding: '0 12px' }}>
                          <RiCloseLine />
                        </button>
                      </div>
                    ) : (
                      <select 
                        className="task-input" 
                        value={project} 
                        onChange={(e) => {
                          if (e.target.value === 'new_project_trigger') {
                            setIsNewProject(true);
                          } else {
                            setProject(e.target.value);
                          }
                        }}
                      >
                         {savedProjects.map(p => <option key={p} value={p}>📦 {p}</option>)}
                         <option value="new_project_trigger">➕ Novo projeto...</option>
                      </select>
                    )}
                 </div>
              </div>

              <div className="form-group">
                <label htmlFor="due-date"><RiCalendarLine style={{ verticalAlign: 'middle', marginRight: 4 }} /> Prazo Estimado</label>
                <input
                  id="due-date"
                  type="date"
                  className="task-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ color: dueDate ? 'var(--text-primary)' : 'var(--text-muted)' }}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Cancelar
                </button>
                <button type="submit" className="add-task-btn accent-purple" style={{ width: 'auto', padding: '0 28px', height: 48 }}>
                  <RiAddLine style={{ marginRight: 8, fontSize: 20 }} /> Commit Task
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
