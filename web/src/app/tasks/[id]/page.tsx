"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, ChevronLeft, CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTask, sendTaskMessage, getTaskConversations, type BackendTask, type Conversation } from "@/lib/api";

function ConversationCard({ conversation }: { conversation: Conversation }) {
  const hasAnswer = conversation.answer && conversation.answer.trim() !== "";

  return (
    <Card className={hasAnswer ? "opacity-80" : ""}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            hasAnswer
              ? "bg-secondary/10"
              : "bg-muted"
          }`}>
            {hasAnswer ? (
              <CheckCircle2 className="h-4 w-4 text-secondary" />
            ) : (
              <span className="text-xs font-medium text-muted-foreground">?</span>
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">You</p>
              <p className="text-sm font-medium text-foreground">
                {conversation.question || "No question yet"}
              </p>
            </div>
            {hasAnswer && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Agent</p>
                <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">
                  {conversation.answer}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Header({ task }: { task: BackendTask }) {
  const isResolved = task.status === "Resolved";

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
              {task.category}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${
                isResolved
                  ? "bg-secondary/10 text-secondary border-secondary/20"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {task.status}
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
  const taskId = params.id as string;

  const [task, setTask] = useState<BackendTask | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [taskData, convos] = await Promise.all([
          getTask(taskId),
          getTaskConversations(taskId),
        ]);
        setTask(taskData);
        setConversations(convos);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load task");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [taskId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations]);

  async function handleSendMessage() {
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await sendTaskMessage(taskId, message);
      // Add user message and agent response to conversations
      setConversations((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          question: message,
          answer: response.agent_reply || "",
          status: "resolved",
        },
      ]);
      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/10">
        <div className="max-w-3xl mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-4">Loading task...</p>
        </div>
      </main>
    );
  }

  if (error || !task) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/10">
        <div className="max-w-3xl mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-xl font-headline font-bold text-foreground mb-2">Task not found</h1>
          <p className="text-sm text-muted-foreground mb-6">{error || "The task you're looking for doesn't exist."}</p>
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

  const answeredCount = conversations.filter((c) => c.answer && c.answer.trim() !== "").length;
  const totalCount = conversations.length;
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/10">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Header task={task} />

        {task.status !== "Resolved" && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Conversation with agent</span>
              <span className="text-sm text-muted-foreground">
                {answeredCount} of {totalCount} {totalCount === 1 ? "exchange" : "exchanges"} answered
              </span>
            </div>
            {totalCount > 0 && (
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-secondary transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>
        )}

        <div className="space-y-4 mb-6">
          {conversations.map((conversation) => (
            <ConversationCard key={conversation.id} conversation={conversation} />
          ))}
        </div>

        {task.status !== "Resolved" && (
          <div className="sticky bottom-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <textarea
                    className="flex-1 min-h-[60px] rounded-lg border border-border/60 bg-card px-3 py-2 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none"
                    placeholder="Ask the agent a question or share information..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isSending}
                    className="gap-2 self-end"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </main>
  );
}