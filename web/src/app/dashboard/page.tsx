"use client";

import { ArrowRight, CheckCircle, ChevronDown, Circle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress, ProgressIndicator } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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
  const priorityStyles = {
    critical: { icon: AlertCircle, iconClass: "text-destructive", label: "text-destructive" },
    important: { icon: Circle, iconClass: "text-orange-500", label: "text-orange-600" },
    consider: { icon: Circle, iconClass: "text-primary", label: "text-primary" },
  };

  const style = priorityStyles[task.priority];
  const IconComponent = style.icon;

  if (task.resolved) {
    return (
      <Card className="opacity-80 grayscale-[0.5]">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center gap-1 min-w-[70px]">
              <IconComponent className={`h-2 w-2 mb-1 ${style.iconClass}`} />
              <span className={`text-[10px] font-bold uppercase tracking-tighter ${style.label}`}>Consider</span>
            </div>
            <div className="flex flex-col gap-1 max-w-[540px]">
              <h3 className="text-sm font-bold line-through decoration-muted-foreground/30">{task.title}</h3>
              <div className="flex items-center gap-2 text-[12px] text-secondary font-medium">
                <CheckCircle className="h-4 w-4 shrink-0" />
                Resolved: {task.resolution}
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-[10px]">{task.tag}</Badge>
              </div>
            </div>
          </div>
          <div className="text-secondary flex items-center gap-1 pr-4">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs font-bold">Resolved</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:translate-x-1 transition-all duration-200">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex items-start gap-6">
          <div className="flex flex-col items-center gap-1 min-w-[70px]">
            <IconComponent className={`h-2 w-2 mb-1 ${style.iconClass}`} />
            <span className={`text-[10px] font-bold uppercase tracking-tighter ${style.label}`}>
              {task.priority === "critical" ? "Critical" : "Important"}
            </span>
          </div>
          <div className="flex flex-col gap-1 max-w-[540px]">
            <h3 className="text-sm font-bold font-headline">{task.title}</h3>
            <p className="text-[12px] text-muted-foreground leading-relaxed">{task.description}</p>
            <div className="mt-2">
              <Badge variant="outline" className="text-[10px]">{task.tag}</Badge>
            </div>
          </div>
        </div>
        <div>
          <Button variant="outline" size="sm" className="gap-2">
            Resolve
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
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
        <span className="text-xs font-semibold tracking-wider text-muted-foreground/70 uppercase">Project: HMRC Customs Declarations</span>
        <h1 className="text-[22px] font-bold text-primary font-headline">Migration decisions</h1>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-muted-foreground">{totalTasks} decisions identified · {resolvedTasks} resolved · {pendingTasks} pending</p>
          <span className="text-xs font-bold text-secondary">{progressPercent}% Complete</span>
        </div>
      </div>
      <Progress value={progressPercent} className="w-full h-2">
        <ProgressIndicator style={{ width: `${progressPercent}%` }} />
      </Progress>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-auto py-12 px-8 flex justify-between items-center max-w-[1440px] mx-auto opacity-50">
      <div className="flex gap-6">
        <a className="text-xs font-medium hover:underline" href="#">Documentation</a>
        <a className="text-xs font-medium hover:underline" href="#">Support</a>
      </div>
      <div className="text-[10px] text-muted-foreground">
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
        <Button variant="ghost" className="gap-2">
          Show more pending tasks
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <Footer />
    </main>
  );
}
