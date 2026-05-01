import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { RiAddLine, RiDeleteBinLine, RiStickyNoteLine } from "react-icons/ri";

export default function NotesPanel() {
  const [notes, setNotes] = useLocalStorage("devengine-notes", []);
  const [activeNoteId, setActiveNoteId] = useState(null);

  const addNote = () => {
    const newNote = {
      id: Date.now(),
      title: "Nova Nota",
      content: "",
      category: "Ideia",
      createdAt: new Date().toISOString()
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
  };

  const updateActiveNote = (updates) => {
    setNotes(notes.map(n => n.id === activeNoteId ? { ...n, ...updates } : n));
  };

  const activeNote = notes.find(n => n.id === activeNoteId);

  return (
    <div className="notes-container" style={{ display: 'flex', height: 'calc(100vh - 200px)', gap: 24 }}>
      {/* Sidebar for Notes */}
      <div className="notes-sidebar chart-card" style={{ width: 300, display: 'flex', flexDirection: 'column', padding: '20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span className="chart-card-title" style={{ margin: 0 }}>Scratchpad</span>
          <button className="add-task-btn" onClick={addNote} style={{ padding: '6px 12px', fontSize: 12 }}>
            <RiAddLine /> Nova
          </button>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notes.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 40 }}>
              <RiStickyNoteLine size={32} style={{ opacity: 0.5, marginBottom: 12 }} />
              <p>Nenhuma nota criada.</p>
            </div>
          ) : (
            notes.map(note => (
              <div 
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                style={{ 
                  padding: 12, 
                  borderRadius: 8, 
                  background: activeNoteId === note.id ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-elevated)',
                  border: `1px solid ${activeNoteId === note.id ? 'var(--border-accent)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {note.title || "Sem título"}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(note.createdAt).toLocaleDateString()}</span>
                  <span style={{ fontSize: 10, padding: '2px 6px', background: 'var(--bg-surface)', borderRadius: 4, color: 'var(--text-secondary)' }}>{note.category}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="notes-editor chart-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 24 }}>
        {activeNote ? (
          <>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <input 
                value={activeNote.title}
                onChange={e => updateActiveNote({ title: e.target.value })}
                placeholder="Título da nota..."
                style={{ flex: 1, background: 'transparent', border: 'none', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', outline: 'none' }}
              />
              <select 
                value={activeNote.category}
                onChange={e => updateActiveNote({ category: e.target.value })}
                className="task-input"
                style={{ width: 140, padding: '8px 12px' }}
              >
                <option value="Ideia">💡 Ideia</option>
                <option value="Bug">🐛 Bug</option>
                <option value="Lembrete">📝 Lembrete</option>
                <option value="Code Snippet">💻 Code Snippet</option>
              </select>
              <button className="task-btn delete" onClick={() => deleteNote(activeNote.id)} title="Excluir nota">
                <RiDeleteBinLine />
              </button>
            </div>
            
            <textarea 
              value={activeNote.content}
              onChange={e => updateActiveNote({ content: e.target.value })}
              placeholder="Escreva suas ideias, logs de bugs ou pedaços de código..."
              style={{ 
                flex: 1, 
                background: 'var(--bg-elevated)', 
                border: '1px solid var(--border)', 
                borderRadius: 12, 
                padding: 16, 
                color: 'var(--text-primary)', 
                fontSize: 14, 
                fontFamily: 'Inter, sans-serif',
                resize: 'none',
                outline: 'none',
                lineHeight: 1.6
              }}
            />
          </>
        ) : (
          <div className="empty-state" style={{ flex: 1, border: 'none', background: 'transparent' }}>
            <RiStickyNoteLine className="empty-state-icon" />
            <div className="empty-state-text">Selecione ou crie uma nota</div>
            <div className="empty-state-sub">O Scratchpad salva automaticamente enquanto você digita.</div>
          </div>
        )}
      </div>
    </div>
  );
}
