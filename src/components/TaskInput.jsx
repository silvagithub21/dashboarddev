import { useState } from "react";
import { RiAddLine } from "react-icons/ri";

const FILTERS = [
  { id: "all", label: "Todas" },
  { id: "pending", label: "Pendentes" },
  { id: "done", label: "Concluídas" },
];

export default function TaskInput({ onAdd, filter, onFilterChange }) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");

  function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed, priority);
    setText("");
    setPriority("medium");
  }

  function handleKey(e) {
    if (e.key === "Enter") handleAdd();
  }

  return (
    <section className="task-input-section">
      <div className="task-input-wrapper">
        <input
          id="task-text-input"
          className="task-input"
          type="text"
          placeholder="Digite uma nova tarefa e pressione Enter..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
        />

        <select
          id="task-priority-select"
          className="priority-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="high">🔴 Alta</option>
          <option value="medium">🟡 Média</option>
          <option value="low">🟢 Baixa</option>
        </select>

        <button
          id="add-task-btn"
          className="add-task-btn"
          onClick={handleAdd}
        >
          <RiAddLine size={18} />
          Adicionar
        </button>
      </div>

      <div className="filter-tabs">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            id={`filter-${f.id}`}
            className={`filter-tab${filter === f.id ? " active" : ""}`}
            onClick={() => onFilterChange(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
    </section>
  );
}
