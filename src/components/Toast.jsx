import { motion, AnimatePresence } from "framer-motion";
import { RiCloseLine, RiCheckboxCircleFill, RiErrorWarningFill, RiInformationFill } from "react-icons/ri";

export default function Toast({ message, type = "success", action, onClose }) {
  const icons = {
    success: <RiCheckboxCircleFill style={{ color: "#10B981" }} />,
    error: <RiErrorWarningFill style={{ color: "#EF4444" }} />,
    info: <RiInformationFill style={{ color: "#8B5CF6" }} />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`toast toast-${type}`}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        padding: "12px 20px",
        borderRadius: 16,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        minWidth: 300,
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ fontSize: 24 }}>{icons[type]}</div>
      <div style={{ flex: 1, fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>
        {message}
      </div>
      
      {action && (
        <button
          onClick={() => {
            action.onClick();
            onClose();
          }}
          style={{
            background: "var(--accent-primary)",
            color: "white",
            border: "none",
            padding: "6px 12px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
        >
          {action.label}
        </button>
      )}

      <button 
        onClick={onClose} 
        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: 4 }}
      >
        <RiCloseLine size={20} />
      </button>
    </motion.div>
  );
}
