"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronDown, AlertTriangle, Circle, Plus, Settings, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const priorityConfig = {
  critical: {
    icon: AlertTriangle,
    iconClass: "text-destructive fill-destructive",
    labelClass: "text-destructive",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
    dotClass: "bg-destructive",
  },
  important: {
    icon: Circle,
    iconClass: "text-amber-500 fill-amber-500",
    labelClass: "text-amber-600",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    dotClass: "bg-amber-500",
  },
  consider: {
    icon: Circle,
    iconClass: "text-muted-foreground/50 fill-muted-foreground/30",
    labelClass: "text-muted-foreground",
    badgeClass: "bg-muted text-muted-foreground",
    dotClass: "bg-muted-foreground/50",
  },
};

function TaskCard({ task, index }: { task: Task; index: number }) {
  const config = priorityConfig[task.priority];
  const IconComponent = config.icon;
  const isResolved = task.resolved;

  return (
    <Card
      className={`
        group relative overflow-hidden transition-all duration-300
        ${isResolved ? "opacity-60 hover:opacity-70" : "hover:shadow-md hover:border-primary/20"}
      `}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {!isResolved && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-destructive via-destructive/50 to-transparent" />
      )}
      <CardContent className={`p-5 flex items-start gap-5 ${!isResolved ? "pl-6" : ""}`}>
        <div className="flex flex-col items-center gap-2 min-w-[48px]">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isResolved ? "bg-secondary/10" : "bg-background"}`}>
            {isResolved ? (
              <CheckCircle2 className="h-5 w-5 text-secondary" />
            ) : (
              <IconComponent className={`h-5 w-5 ${config.iconClass}`} />
            )}
          </div>
          <div className={`w-2 h-2 rounded-full ${config.dotClass}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className={`text-sm font-semibold font-headline ${isResolved ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            {!isResolved && (
              <Button variant="ghost" size="sm" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs">Resolve</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`text-[10px] ${config.badgeClass}`}>
              {task.tag}
            </Badge>
            {task.priority !== "consider" && !isResolved && (
              <Badge variant="outline" className={`text-[10px] ${config.badgeClass}`}>
                {task.priority === "critical" ? "Critical" : "Important"}
              </Badge>
            )}
            {isResolved && task.resolution && (
              <span className="text-xs text-secondary flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {task.resolution}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Header() {
  const totalTasks = tasks.length;
  const resolvedTasks = tasks.filter((t) => t.resolved).length;
  const pendingTasks = totalTasks - resolvedTasks;
  const criticalTasks = tasks.filter((t) => t.priority === "critical" && !t.resolved).length;
  const progressPercent = Math.round((resolvedTasks / totalTasks) * 100);

  return (
    <header className="mb-10">
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ChevronLeft className="h-3.5 w-3.5" />
        Back to projects
      </Link>

      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-lg bg-primary/5 text-primary text-xs font-medium">
              Active Project
            </span>
            <span className="text-xs text-muted-foreground">HMRC Customs Declarations</span>
          </div>
          <h1 className="text-2xl font-headline font-bold text-foreground">Migration decisions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pendingTasks} pending · {resolvedTasks} resolved · {criticalTasks} critical
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Decision
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 border border-border/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Overall Progress</span>
            <Badge variant="outline" className="text-xs">{progressPercent}%</Badge>
          </div>
          <span className="text-sm text-secondary font-medium">{resolvedTasks} of {totalTasks} resolved</span>
        </div>
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full progress-shimmer transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-destructive" />
            {criticalTasks} critical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {tasks.filter((t) => t.priority === "important" && !t.resolved).length} important
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
            {tasks.filter((t) => t.priority === "consider" && !t.resolved).length} to consider
          </span>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-16 pt-8 border-t border-border/20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
          <a href="#" className="hover:text-foreground transition-colors">Support</a>
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
        </div>
        <p className="text-xs text-muted-foreground/70">
          © 2024 Migration Lens Intelligence Engine
        </p>
      </div>
    </footer>
  );
}

export default function DashboardPage() {
  const [showAll, setShowAll] = useState(false);
  const visibleTasks = showAll ? tasks : tasks.slice(0, 4);
  const hasMore = tasks.length > 4;

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Header />

        <div className="space-y-3">
          {visibleTasks.map((task, index) => (
            <TaskCard key={task.id} task={task} index={index} />
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="gap-2"
            >
              {showAll ? (
                <>
                  Show less
                  <ChevronDown className="h-4 w-4 rotate-180" />
                </>
              ) : (
                <>
                  Show {tasks.length - 4} more decisions
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}

        <Footer />
      </div>
    </main>
  );
}
