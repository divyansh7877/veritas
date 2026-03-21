"use client";

function Icon({ name, filled = false, className = "" }: { name: string; filled?: boolean; className?: string }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
    >
      {name}
    </span>
  );
}

interface Task {
  id: string;
  priority: "critical" | "important" | "consider";
  title: string;
  description: string;
  tag: string;
  resolved?: boolean;
  resolution?: string;
}

const tasks: Task[] = [
  {
    id: "1",
    priority: "critical",
    title: "Choose database strategy",
    description: "The current system uses Oracle 11g. Decide between PostgreSQL migration or cloud-native alternative",
    tag: "Architecture",
  },
  {
    id: "2",
    priority: "critical",
    title: "Define API compatibility layer",
    description: "47 external systems connect to the current SOAP API. Determine backward compatibility approach",
    tag: "Integration",
  },
  {
    id: "3",
    priority: "important",
    title: "Authentication modernization",
    description: "Legacy system uses custom session tokens. Decide on OAuth2, SAML, or passkey approach",
    tag: "Security",
  },
  {
    id: "4",
    priority: "important",
    title: "Data migration strategy",
    description: "22 years of transaction records. Define what migrates, what archives, what gets purged",
    tag: "Data",
  },
  {
    id: "5",
    priority: "consider",
    title: "User interface approach",
    description: "",
    tag: "UX",
    resolved: true,
    resolution: "Adopted React SPA for modern frontend flexibility.",
  },
  {
    id: "6",
    priority: "consider",
    title: "Monitoring and observability",
    description: "",
    tag: "Architecture",
    resolved: true,
    resolution: "Implementation of Prometheus/Grafana stack approved.",
  },
];

function TaskCard({ task }: { task: Task }) {
  const priorityColors = {
    critical: { dot: "bg-error", label: "text-error" },
    important: { dot: "bg-orange-500", label: "text-orange-600" },
    consider: { dot: "bg-tertiary-container", label: "text-tertiary-container" },
  };

  const color = priorityColors[task.priority];

  if (task.resolved) {
    return (
      <div className="bg-surface-container-low/50 p-6 rounded-xl border border-outline-variant/5 flex items-center justify-between grayscale-[0.5] opacity-80">
        <div className="flex items-start gap-6">
          <div className="flex flex-col items-center gap-1 min-w-[70px]">
            <span className={`w-2 h-2 rounded-full ${color.dot} mb-1`} />
            <span className={`text-[10px] font-bold uppercase tracking-tighter ${color.label} font-label`}>Consider</span>
          </div>
          <div className="flex flex-col gap-1 max-w-[540px]">
            <h3 className="text-sm font-bold text-on-surface/60 font-headline line-through decoration-on-surface-variant/30">{task.title}</h3>
            <div className="flex items-center gap-2 text-[12px] text-secondary font-medium font-body">
              <Icon name="check_circle" filled className="text-sm" />
              Resolved: {task.resolution}
            </div>
            <div className="mt-2">
              <span className="px-2 py-0.5 bg-surface-container text-[10px] font-semibold rounded text-on-surface-variant/50 font-label">{task.tag}</span>
            </div>
          </div>
        </div>
        <div className="text-secondary/60 flex items-center gap-1 pr-4">
          <Icon name="check_circle" filled />
          <span className="text-xs font-bold font-label">Resolved</span>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-surface-container-lowest p-6 rounded-xl transition-all duration-200 hover:translate-x-1 shadow-[0px_12px_32px_rgba(25,28,30,0.02)] border border-outline-variant/10 flex items-center justify-between">
      <div className="flex items-start gap-6">
        <div className="flex flex-col items-center gap-1 min-w-[70px]">
          <span className={`w-2 h-2 rounded-full ${color.dot} mb-1`} />
          <span className={`text-[10px] font-bold uppercase tracking-tighter ${color.label} font-label`}>
            {task.priority === "critical" ? "Critical" : "Important"}
          </span>
        </div>
        <div className="flex flex-col gap-1 max-w-[540px]">
          <h3 className="text-sm font-bold text-on-surface font-headline">{task.title}</h3>
          <p className="text-[12px] text-on-surface-variant font-body leading-relaxed">{task.description}</p>
          <div className="mt-2">
            <span className="px-2 py-0.5 bg-surface-container text-[10px] font-semibold rounded text-on-surface-variant font-label">{task.tag}</span>
          </div>
        </div>
      </div>
      <div>
        <button className="flex items-center gap-2 px-5 py-2 border border-primary text-primary text-xs font-bold rounded-full hover:bg-primary hover:text-white transition-all active:scale-95 group/btn">
          Resolve
          <Icon name="arrow_forward" className="text-sm group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

function Header() {
  const totalTasks = tasks.length;
  const resolvedTasks = tasks.filter((t) => t.resolved).length;
  const pendingTasks = totalTasks - resolvedTasks;
  const progressPercent = Math.round((resolvedTasks / totalTasks) * 100);

  return (
    <header className="mb-12">
      <div className="flex flex-col gap-1 mb-4">
        <span className="text-xs font-semibold tracking-wider text-on-surface-variant/70 uppercase font-label">Project: HMRC Customs Declarations</span>
        <h1 className="text-[22px] font-bold text-primary font-headline">Migration decisions</h1>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-on-surface-variant font-body">{totalTasks} decisions identified · {resolvedTasks} resolved · {pendingTasks} pending</p>
          <span className="text-xs font-bold text-secondary font-label">{progressPercent}% Complete</span>
        </div>
      </div>
      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
        <div className="h-full bg-secondary w-1/4 rounded-full" />
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-auto py-12 px-8 flex justify-between items-center max-w-[1440px] mx-auto opacity-50">
      <div className="flex gap-6">
        <a className="text-xs font-medium text-on-surface hover:underline font-body" href="#">Documentation</a>
        <a className="text-xs font-medium text-on-surface hover:underline font-body" href="#">Support</a>
      </div>
      <div className="text-[10px] text-on-surface-variant font-label">
        © 2024 Migration Lens Intelligence Engine
      </div>
    </footer>
  );
}

export default function DashboardPage() {
  return (
    <main className="max-w-[1000px] mx-auto px-8 py-12">
      <Header />

      <div className="flex flex-col gap-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      <div className="mt-12 pt-8 flex justify-center">
        <button className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors font-body flex items-center gap-2">
          Show more pending tasks
          <Icon name="keyboard_arrow_down" className="text-sm" />
        </button>
      </div>

      <Footer />
    </main>
  );
}
