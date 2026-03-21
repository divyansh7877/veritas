"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Edit2, Eye, Building2, Zap, ChevronLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Question {
  step: number;
  totalSteps: number;
  context: string;
  question: string;
  tags: string[];
  options: { icon: string; label: string }[];
}

const questions: Question[] = [
  {
    step: 1,
    totalSteps: 5,
    context: "Asking as architect",
    question: "What does this system do, and what's the core problem it solves?",
    tags: ["B2B SaaS", "50 customers", "Legacy Oracle"],
    options: [
      { icon: "person", label: "Just me" },
      { icon: "groups", label: "Engineering team" },
      { icon: "corporate_fare", label: "Whole company" },
    ],
  },
  {
    step: 2,
    totalSteps: 5,
    context: "Asking as architect",
    question: "What are the biggest pain points with the current system?",
    tags: ["B2B SaaS", "50 customers", "Legacy Oracle"],
    options: [
      { icon: "person", label: "Just me" },
      { icon: "groups", label: "Engineering team" },
      { icon: "corporate_fare", label: "Whole company" },
    ],
  },
  {
    step: 3,
    totalSteps: 5,
    context: "Asking as architect",
    question: "Who looks at this daily — just you, or does a team need it?",
    tags: ["B2B SaaS", "50 customers", "Legacy Oracle"],
    options: [
      { icon: "person", label: "Just me" },
      { icon: "groups", label: "Engineering team" },
      { icon: "corporate_fare", label: "Whole company" },
    ],
  },
];

function ProgressIndicator({ current, total }: { current: number; total: number }) {
  const progressPercent = Math.round((current / total) * 100);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-muted-foreground">
        Question {current} of {total}
      </span>
      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-secondary transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

function ContextBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-secondary/10 text-secondary text-xs font-semibold mb-8">
      <Zap className="h-3.5 w-3.5" />
      <span>Asking as architect</span>
    </div>
  );
}

interface OptionCardProps {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
}

function OptionCard({ icon, label, selected, onClick }: OptionCardProps) {
  return (
    <Card
      className={`
        group relative overflow-hidden cursor-pointer transition-all duration-200
        ${selected
          ? "border-secondary shadow-md bg-secondary/5"
          : "hover:shadow-md hover:border-primary/30"
        }
      `}
    >
      {!selected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-primary/20 transition-colors" />}
      <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
          selected ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
        }`}>
          {icon}
        </div>
        <span className={`text-sm font-semibold ${
          selected ? "text-secondary" : "text-foreground group-hover:text-primary"
        }`}>
          {label}
        </span>
      </CardContent>
    </Card>
  );
}

function FooterLenses({ activeLens }: { activeLens: string }) {
  const lenses = [
    { id: "user", icon: Eye, label: "User lens" },
    { id: "data", icon: Zap, label: "Data lens", active: true },
    { id: "architecture", icon: Building2, label: "Architecture lens" },
  ];

  return (
    <footer className="w-full py-6 px-6 border-t border-border/20 bg-card/50 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto flex items-center justify-center gap-8">
        {lenses.map((lens) => {
          const Icon = lens.icon;
          const isActive = lens.id === activeLens;
          return (
            <button
              key={lens.id}
              className={`flex items-center gap-2 group transition-all hover:opacity-100 ${
                isActive ? "opacity-100" : "opacity-40"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isActive ? "bg-secondary animate-pulse" : "bg-muted-foreground"}`} />
              <Icon className={`h-4 w-4 ${isActive ? "text-secondary" : "text-muted-foreground"}`} />
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {lens.label}
              </span>
            </button>
          );
        })}
      </div>
    </footer>
  );
}

export default function QuestionsPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customAnswer, setCustomAnswer] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  function handleNext() {
    if (selectedOption || customAnswer) {
      const answer = selectedOption || customAnswer;
      setAnswers((prev) => ({ ...prev, [currentQuestion]: answer }));

      if (isLastQuestion) {
        console.log("All answers:", { ...answers, [currentQuestion]: answer });
      } else {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedOption(null);
        setCustomAnswer("");
      }
    }
  }

  function handleOptionClick(label: string) {
    setSelectedOption(label);
    setCustomAnswer("");
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-border/30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Search className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-headline font-bold text-base tracking-tight text-primary">Migration Lens</span>
          </Link>
          <ProgressIndicator current={question.step} total={question.totalSteps} />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl flex flex-col items-center text-center">
          <ContextBadge />

          <span className="text-[11px] font-medium tracking-widest text-muted-foreground uppercase mb-3">
            Step 0{question.step}
          </span>

          <h1 className="text-2xl md:text-3xl font-headline font-bold text-foreground mb-6 tracking-tight leading-snug">
            {question.question}
          </h1>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {question.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="px-2.5 py-1 text-[11px] font-medium bg-card"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full mb-6">
            <OptionCard
              icon={<Eye className="h-6 w-6" />}
              label="Just me"
              selected={selectedOption === "Just me"}
              onClick={() => handleOptionClick("Just me")}
            />
            <OptionCard
              icon={<Building2 className="h-6 w-6" />}
              label="Engineering team"
              selected={selectedOption === "Engineering team"}
              onClick={() => handleOptionClick("Engineering team")}
            />
            <OptionCard
              icon={<Zap className="h-6 w-6" />}
              label="Whole company"
              selected={selectedOption === "Whole company"}
              onClick={() => handleOptionClick("Whole company")}
            />
          </div>

          <div className="relative w-full">
            <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-2 border border-border/60 focus-within:border-primary/50 focus-within:shadow-sm transition-all">
              <Edit2 className="h-4 w-4 text-muted-foreground/50 shrink-0" />
              <input
                className="flex-1 bg-transparent border-none text-sm focus:ring-0 placeholder:text-muted-foreground/40 text-foreground py-2"
                placeholder="Or type your own answer..."
                value={customAnswer}
                onChange={(e) => {
                  setCustomAnswer(e.target.value);
                  setSelectedOption(null);
                }}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <Button
              onClick={handleNext}
              disabled={!selectedOption && !customAnswer}
              className="gap-2 shadow-md hover:shadow-lg transition-shadow"
            >
              <span>{isLastQuestion ? "Finish" : "Next"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {currentQuestion > 0 && (
            <button
              onClick={() => {
                setCurrentQuestion((prev) => prev - 1);
                setSelectedOption(answers[currentQuestion - 1] || null);
                setCustomAnswer("");
              }}
              className="mt-6 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous question
            </button>
          )}
        </div>
      </div>

      <FooterLenses activeLens="data" />
    </main>
  );
}
