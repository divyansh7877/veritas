"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock task data - in production this would come from API
const mockTasks: Record<string, {
  id: string;
  priority: "critical" | "important" | "consider";
  title: string;
  description: string;
  tag: string;
  resolved?: boolean;
  resolution?: string;
  status?: "Open" | "In Progress" | "Resolved";
  questions: Question[];
}> = {
  "1": {
    id: "1",
    priority: "critical",
    title: "Choose database strategy",
    description: "The current system uses Oracle 11g. Decide between PostgreSQL migration or cloud-native alternative",
    tag: "Architecture",
    status: "Open",
    questions: [
      {
        id: "q1",
        question: "What are the current Oracle 11g features being used?",
        answer: "We are using Advanced Queuing, XML DB, and Oracle Spatial for our mapping features.",
      },
      {
        id: "q2",
        question: "What's the expected data volume growth over the next 5 years?",
        answer: "",
      },
      {
        id: "q3",
        question: "Do you have budget for commercial database licenses?",
        answer: "",
      },
    ],
  },
  "2": {
    id: "2",
    priority: "critical",
    title: "Define API compatibility layer",
    description: "47 external systems connect to the current SOAP API. Determine backward compatibility approach",
    tag: "Integration",
    status: "Open",
    questions: [
      {
        id: "q1",
        question: "How many unique API operations are being used?",
        answer: "Approximately 120 distinct operations across 15 service endpoints.",
      },
      {
        id: "q2",
        question: "What's the deprecation timeline for the legacy API?",
        answer: "",
      },
    ],
  },
  "3": {
    id: "3",
    priority: "important",
    title: "Authentication modernization",
    description: "Legacy system uses custom session tokens. Decide on OAuth2, SAML, or passkey approach",
    tag: "Security",
    status: "Open",
    questions: [
      {
        id: "q1",
        question: "How many active users need to be migrated?",
        answer: "",
      },
    ],
  },
  "4": {
    id: "4",
    priority: "important",
    title: "Data migration strategy",
    description: "22 years of transaction records. Define what migrates, what archives, what gets purged",
    tag: "Data",
    status: "Open",
    questions: [
      {
        id: "q1",
        question: "What is the total size of historical data?",
        answer: "",
      },
    ],
  },
  "5": {
    id: "5",
    priority: "consider",
    title: "User interface approach",
    description: "",
    tag: "UX",
    resolved: true,
    resolution: "Adopted React SPA for modern frontend flexibility.",
    status: "Resolved",
    questions: [
      {
        id: "q1",
        question: "What frontend framework was chosen?",
        answer: "React with Next.js 16 for SSR and better SEO.",
      },
    ],
  },
  "6": {
    id: "6",
    priority: "consider",
    title: "Monitoring and observability",
    description: "",
    tag: "Architecture",
    resolved: true,
    resolution: "Implementation of Prometheus/Grafana stack approved.",
    status: "Resolved",
    questions: [
      {
        id: "q1",
        question: "What monitoring stack was selected?",
        answer: "Prometheus for metrics, Grafana for dashboards, and Loki for logs.",
      },
    ],
  },
};

interface Question {
  id: string;
  question: string;
  answer: string;
}

function QuestionCard({ question, onSubmit }: { question: Question; onSubmit: (answer: string) => void }) {
  const [answer, setAnswer] = useState(question.answer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(!!question.answer);

  async function handleSubmit() {
    if (!answer.trim()) return;
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    onSubmit(answer);
    setIsSubmitting(false);
    setIsSubmitted(true);
  }

  return (
    <Card className={isSubmitted && question.answer ? "opacity-70" : ""}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            isSubmitted && question.answer
              ? "bg-secondary/10"
              : "bg-muted"
          }`}>
            {isSubmitted && question.answer ? (
              <CheckCircle2 className="h-4 w-4 text-secondary" />
            ) : (
              <span className="text-xs font-medium text-muted-foreground">
                {question.id.replace("q", "")}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground mb-3">
              {question.question}
            </p>
            {isSubmitted && answer ? (
              <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                {answer}
              </p>
            ) : (
              <div className="space-y-3">
                <textarea
                  className="w-full min-h-[80px] rounded-lg border border-border/60 bg-card px-3 py-2 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none"
                  placeholder="Type your answer..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!answer.trim() || isSubmitting}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Submit Answer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Header({ task }: { task: typeof mockTasks[string] }) {
  const isResolved = task.resolved;

  return (
    <header className="mb-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ChevronLeft className="h-3.5 w-3.5" />
        Back to decisions
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {task.tag}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${
                isResolved
                  ? "bg-secondary/10 text-secondary border-secondary/20"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {isResolved ? "Resolved" : "Open"}
            </Badge>
          </div>
          <h1 className={`text-2xl font-headline font-bold mb-2 ${isResolved ? "text-muted-foreground line-through" : "text-foreground"}`}>
            {task.title}
          </h1>
          {task.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {task.description}
            </p>
          )}
          {isResolved && task.resolution && (
            <div className="mt-4 p-4 rounded-lg bg-secondary/5 border border-secondary/20">
              <p className="text-sm text-secondary font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Resolution
              </p>
              <p className="text-sm text-foreground mt-1">{task.resolution}</p>
            </div>
          )}
        </div>
        {!isResolved && (
          <Button className="gap-2 shrink-0">
            Mark as Resolved
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </header>
  );
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const task = mockTasks[taskId];

  const [questions, setQuestions] = useState(task?.questions || []);

  if (!task) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/10">
        <div className="max-w-3xl mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-xl font-headline font-bold text-foreground mb-2">Task not found</h1>
          <p className="text-sm text-muted-foreground mb-6">The task you're looking for doesn't exist.</p>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to dashboard
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const answeredCount = questions.filter((q) => q.answer).length;
  const totalCount = questions.length;
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  function handleAnswerSubmit(questionId: string, answer: string) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, answer } : q))
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Header task={task} />

        {!task.resolved && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Questions to resolve</span>
              <span className="text-sm text-muted-foreground">
                {answeredCount} of {totalCount} answered
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-secondary transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onSubmit={(answer) => handleAnswerSubmit(question.id, answer)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}