import { RiSunLine, RiMoonLine, RiMenu2Line } from "react-icons/ri";
import { useTheme } from "../context/ThemeContext";

export default function Header({ onToggleSidebar }) {
  const { theme, toggleTheme } = useTheme();
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <header className="header">
      <div className="header-left">
        <h1>
          {greeting}! <span className="gradient-text">Ready to ship?</span>
        </h1>
        <p>{dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}</p>
      </div>

      <div className="header-right">
        <span className="header-date">{dateStr.split(",")[0]}</span>

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title="Alternar tema"
          id="theme-toggle-btn"
        >
          {theme === "dark" ? <RiSunLine /> : <RiMoonLine />}
        </button>

        <button
          className="theme-toggle mobile-menu-btn"
          onClick={onToggleSidebar}
          id="mobile-menu-btn"
        >
          <RiMenu2Line />
        </button>
      </div>
    </header>
  );
}
