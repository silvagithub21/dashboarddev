import {
  RiDashboardLine,
  RiTaskLine,
  RiBarChartLine,
  RiCalendarLine,
  RiSettings3Line,
  RiFlashlightLine,
  RiLogoutBoxLine,
  RiStickyNoteLine
} from "react-icons/ri";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { icon: <RiDashboardLine />, label: "Overview", id: "dashboard" },
  { icon: <RiTaskLine />, label: "Issues", id: "tarefas" },
  { icon: <RiBarChartLine />, label: "Analytics", id: "stats" },
  { icon: <RiStickyNoteLine />, label: "Scratchpad", id: "notas" },
  { icon: <RiCalendarLine />, label: "Calendar", id: "calendario" },
];

export default function Sidebar({ isOpen, activeTab, onTabChange }) {
  const { user, logout } = useAuth();

  return (
    <aside className={`sidebar${isOpen ? " open" : ""}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <RiFlashlightLine />
        </div>
        <div className="sidebar-logo-text">
          DevEngine
          <span>Productivity Suite</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <span className="sidebar-label">Workspace</span>
        {NAV_ITEMS.map((item) => (
          <div
            key={item.id}
            className={`nav-item${activeTab === item.id ? " active" : ""}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}

        <span className="sidebar-label">System</span>
        <div 
          className={`nav-item${activeTab === "settings" ? " active" : ""}`}
          onClick={() => onTabChange("settings")}
        >
          <span className="nav-icon"><RiSettings3Line /></span>
          Settings
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {user ? (
          <div className="sidebar-user" style={{ flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="sidebar-avatar" style={{ border: '2px solid var(--accent-primary)' }} />
              ) : (
                <div className="sidebar-avatar">{user.displayName?.charAt(0) || 'U'}</div>
              )}
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user.displayName}</div>
                <div className="sidebar-user-role">Synced ☁️</div>
              </div>
            </div>
            <button 
              className="nav-item" 
              onClick={logout}
              style={{ width: '100%', background: 'rgba(239,68,68,0.1)', color: '#F87171', border: 'none' }}
            >
              <RiLogoutBoxLine className="nav-icon" /> Sign Out
            </button>
          </div>
        ) : (
          <div className="sidebar-user">
            <div className="sidebar-avatar">D</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Dev Mode</div>
              <div className="sidebar-user-role">Offline • localStorage</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
