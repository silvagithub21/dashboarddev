import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import { useTheme } from "./context/ThemeContext";
import "./styles/global.css";
import "./styles/components.css";

export default function App() {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div data-theme={theme} className="app-layout">
      <div className="bg-glow" />

      <Sidebar 
        isOpen={sidebarOpen} 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false); // Close on mobile after selection
        }}
      />

      <div className="main-content">
        <Header
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
        />

        <main className="page-body">
          <Dashboard 
            activeTab={activeTab} 
            onTabChange={(tab) => setActiveTab(tab)} 
          />
        </main>
      </div>
    </div>
  );
}
