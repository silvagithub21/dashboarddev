import {
  RiCheckboxCircleLine,
  RiTimeLine,
  RiFlashlightLine,
  RiTrophyLine,
  RiArrowUpLine,
} from "react-icons/ri";

export default function StatsPanel({ tasks }) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const pending = total - done;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  // Bug Stats
  const openBugs = tasks.filter(t => t.type === 'bug' && t.status !== 'done').length;
  
  // Velocity: Tasks done in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sprintVelocity = tasks.filter(t => t.status === 'done' && new Date(t.createdAt) > sevenDaysAgo).length;

  const stats = [
    {
      label: "Issues Totais",
      value: total,
      icon: <RiFlashlightLine />,
      iconBg: "rgba(139, 92, 246, 0.15)",
      iconColor: "#8B5CF6",
      desc: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <RiArrowUpLine style={{ color: 'var(--accent-green)' }} /> +{total > 0 ? 1 : 0} hoje
        </span>
      ),
      color: "linear-gradient(90deg, #8B5CF6, #D8B4FE)",
    },
    {
      label: "Completion Rate",
      value: `${pct}%`,
      icon: <RiCheckboxCircleLine />,
      iconBg: "rgba(16,185,129,0.15)",
      iconColor: "#10B981",
      desc: `${done} resolvidos`,
      color: "linear-gradient(90deg, #10B981, #34D399)",
    },
    {
      label: "Sprint Velocity",
      value: sprintVelocity,
      icon: <RiTrophyLine />,
      iconBg: "rgba(245,158,11,0.15)",
      iconColor: "#F59E0B",
      desc: "Pontos entregues em 7d",
      color: "linear-gradient(90deg, #F59E0B, #FBBF24)",
      showBar: true,
      barPct: Math.min(100, (sprintVelocity / 10) * 100), // Assuming 10 is a good baseline
    },
    {
      label: "Open Bugs",
      value: openBugs,
      icon: <RiTimeLine />,
      iconBg: "rgba(239,68,68,0.15)",
      iconColor: "#EF4444",
      desc: openBugs > 2 ? "Atenção necessária" : "Qualidade sob controle",
      color: "linear-gradient(90deg, #EF4444, #F87171)",
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((s) => (
        <div
          key={s.label}
          className="stat-card"
          style={{ "--card-color": s.color }}
        >
          <div className="stat-card-header">
            <span className="stat-label">{s.label}</span>
            <div
              className="stat-icon"
              style={{ background: s.iconBg, color: s.iconColor }}
            >
              {s.icon}
            </div>
          </div>
          <div className="stat-value">{s.value}</div>
          <div className="stat-desc">{s.desc}</div>
          {s.showBar && (
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${s.barPct}%`, background: s.color }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
