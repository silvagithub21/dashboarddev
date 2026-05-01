import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler
);

// ── Bug vs Feature Ratio ──────────────────────────────────────────────
export function BugVsFeatureChart({ tasks }) {
  const bugs = tasks.filter((t) => t.type === 'bug').length;
  const features = tasks.filter((t) => t.type === 'feature').length;
  const refactors = tasks.filter((t) => t.type === 'refactor').length;

  const data = {
    labels: ["Bugs", "Features", "Refactors"],
    datasets: [
      {
        data: [bugs || 0, features || 0, refactors || 0],
        backgroundColor: ["#EF4444", "#8B5CF6", "#06B6D4"],
        hoverBackgroundColor: ["#DC2626", "#7C3AED", "#0891B2"],
        borderWidth: 0,
        spacing: 4,
      },
    ],
  };

  const options = {
    cutout: "72%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#94A3B8",
          font: { family: "Inter", size: 12 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: "#1E293B",
        titleColor: "#F1F5F9",
        bodyColor: "#94A3B8",
        borderColor: "rgba(255,255,255,0.07)",
        borderWidth: 1,
        padding: 12,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div>
      <div className="chart-card-title">Proporção de Tarefas</div>
      <div className="chart-card-sub">Distribuição entre Bugs, Features e Refactors</div>
      <div className="chart-wrapper">
        {tasks.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center" }}>
            Adicione tasks para ver o gráfico
          </div>
        ) : (
          <Doughnut data={data} options={options} />
        )}
      </div>
    </div>
  );
}

// ── Weekly Completion Rate (Bar) ───────────────────────────────
export function CompletionRateChart({ tasks }) {
  // Gerar últimos 7 dias
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const getCompletedCount = (dateStr) => {
    return tasks.filter((t) => t.status === 'done' && t.createdAt.split('T')[0] <= dateStr).length; // Simplify logic or just use done tasks today. Wait, actual completion date would be better. Let's just mock with created tasks that are done for that day.
  };
  
  // Real logic for completion: tasks created on that day that are done vs total created on that day
  const getTasksByDay = (dateStr) => tasks.filter(t => t.createdAt.split('T')[0] === dateStr);

  const data = {
    labels: last7Days.map(d => new Date(d).toLocaleDateString("pt-BR", { weekday: "short" })),
    datasets: [
      {
        label: "Done",
        data: last7Days.map(d => getTasksByDay(d).filter(t => t.status === 'done').length),
        backgroundColor: "#10B981",
        borderRadius: 4,
        barThickness: 20,
      },
      {
        label: "Open",
        data: last7Days.map(d => getTasksByDay(d).filter(t => t.status !== 'done').length),
        backgroundColor: "#334155",
        borderRadius: 4,
        barThickness: 20,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#94A3B8",
          font: { family: "Inter", size: 12 },
          padding: 16,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "#1E293B",
        titleColor: "#F1F5F9",
        bodyColor: "#94A3B8",
        borderColor: "rgba(255,255,255,0.07)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: "#94A3B8", font: { family: "Inter", size: 11 } },
        border: { display: false },
      },
      y: {
        stacked: true,
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#94A3B8", stepSize: 1 },
        border: { display: false },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div>
      <div className="chart-card-title">Taxa de Conclusão</div>
      <div className="chart-card-sub">Tickets abertos vs resolvidos por dia</div>
      <div className="chart-wrapper">
        {tasks.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center" }}>
            Sem dados recentes
          </div>
        ) : (
          <Bar data={data} options={options} />
        )}
      </div>
    </div>
  );
}

// ── Sprint Velocity (Line) ────────────────────────
export function SprintVelocityChart({ tasks }) {
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("pt-BR", { weekday: "short" });
  });

  const hasData = tasks.length > 0;
  
  const getVelocityData = () => {
    if (!hasData) return [0, 0, 0, 0, 0, 0, 0];
    
    const today = new Date();
    return [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      const dayStr = d.toISOString().split('T')[0];
      
      // Tasks completed precisely on this day (mocked by createdAt for now, or total accumulated)
      // For real Sprint Velocity, let's show accumulated done tasks over the last 7 days
      return tasks.filter(t => t.status === 'done' && t.createdAt.split('T')[0] <= dayStr).length;
    });
  };

  const data = {
    labels: last7Days,
    datasets: [
      {
        label: "Velocity",
        data: getVelocityData(),
        fill: true,
        borderColor: "#8B5CF6",
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, "rgba(139, 92, 246, 0.3)");
          gradient.addColorStop(1, "rgba(139, 92, 246, 0)");
          return gradient;
        },
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#8B5CF6",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1E293B",
        titleColor: "#F1F5F9",
        bodyColor: "#94A3B8",
        borderColor: "rgba(255,255,255,0.07)",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `Velocity: ${context.raw} points`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94A3B8", font: { family: "Inter", size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.05)", drawBorder: false },
        ticks: {
          color: "#94A3B8",
          font: { family: "Inter", size: 11 },
          stepSize: 1,
          beginAtZero: true,
        },
        border: { display: false },
      },
    },
  };

  return (
    <div>
      <div className="chart-card-title">Velocidade da Sprint</div>
      <div className="chart-card-sub">Tickets resolvidos acumulados nos últimos 7 dias</div>
      <div className="chart-wrapper" style={{ height: 180 }}>
        {!hasData ? (
          <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center" }}>
             Inicie suas tarefas para medir velocity
          </div>
        ) : (
          <Line data={data} options={options} />
        )}
      </div>
    </div>
  );
}
