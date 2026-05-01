import { RiCheckLine, RiDeleteBinLine, RiDragMove2Fill, RiFlag2Fill, RiCheckboxBlankCircleFill, RiAlertFill } from "react-icons/ri";
import { Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";

const PRIORITY_MAP = {
  high:   { label: "High",   className: "priority-high",   icon: <RiAlertFill style={{ color: '#ef4444' }} /> },
  medium: { label: "Med",    className: "priority-medium", icon: <RiFlag2Fill style={{ color: 'var(--accent-amber)' }} /> },
  low:    { label: "Low",    className: "priority-low",    icon: <RiCheckboxBlankCircleFill style={{ color: 'var(--accent-green)', fontSize: 10 }} /> },
};

export default function TaskCard({ task, index, onToggle, onDelete }) {
  const prio = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <motion.div 
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            backgroundColor: task.status === 'done' ? "rgba(16, 185, 129, 0.03)" : "var(--bg-surface)",
            borderColor: task.status === 'done' ? "rgba(16, 185, 129, 0.2)" : "var(--border)"
          }}
          exit={{ opacity: 0, scale: 0.95 }}
          whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)" }}
          className={`task-card ${task.status} ${snapshot.isDragging ? " dragging" : ""}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          {/* Header with Type and Drag */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
             <div className={`badge badge-${task.type}`}>
                {task.type === 'bug' ? '🐞 Bug' : task.type === 'feature' ? '✨ Feature' : '♻️ Refactor'}
             </div>
             <div className="drag-handle" {...provided.dragHandleProps} style={{ padding: 0, opacity: 0.5 }}>
               <RiDragMove2Fill />
             </div>
          </div>

          {/* Body */}
          <div className="task-body" style={{ padding: 0 }}>
            <motion.div 
              animate={{ 
                color: task.status === 'done' ? "var(--text-muted)" : "var(--text-primary)",
                textDecoration: task.status === 'done' ? "line-through" : "none"
              }}
              className="task-text"
              style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, lineHeight: 1.4 }}
            >
              {task.text}
            </motion.div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
               <span style={{ fontSize: 12, background: 'var(--bg-elevated)', padding: '4px 10px', borderRadius: 6, color: 'var(--text-muted)', fontWeight: 600 }}>
                  📦 {task.project || 'Geral'}
               </span>
               <span className={`task-priority ${prio.className}`} style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6 }}>
                 <span style={{ display: 'flex', alignItems: 'center' }}>{prio.icon}</span> 
                 <span style={{ marginLeft: 6 }}>{prio.label}</span>
               </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="task-actions" style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 12, justifyContent: 'space-between' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
               {task.dueDate ? `📅 ${new Date(task.dueDate).toLocaleDateString('pt-BR')}` : 'No deadline'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
               <button
                 className="task-btn delete"
                 onClick={() => onDelete(task.id)}
                 style={{ padding: 4, background: 'none' }}
               >
                 <RiDeleteBinLine size={14} />
               </button>
            </div>
          </div>
        </motion.div>
      )}
    </Draggable>
  );
}
