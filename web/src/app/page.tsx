"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, HelpCircle, Github, Upload, FileText, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ingestGitHubRepo, ingestDocumentation, analyzeProject } from "@/lib/api";

function NavBar() {
  return (
    <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-border/30 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
          <Search className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-headline font-bold text-base tracking-tight text-primary">Migration Lens</span>
      </div>
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
        <HelpCircle className="h-4 w-4 mr-2" />
        Help
      </Button>
    </nav>
  );
}

function HeroSection() {
  return (
    <div className="text-center max-w-2xl mx-auto mb-10">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-medium mb-6">
        <Sparkles className="h-3.5 w-3.5" />
        AI-Powered Migration Analysis
      </div>
      <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-foreground mb-4">
        Start your next <span className="text-primary">migration project</span>
      </h1>
      <p className="text-base text-muted-foreground leading-relaxed">
        Describe your system in plain language. We&apos;ll analyze it and surface every critical decision you need to make before rebuilding.
      </p>
    </div>
  );
}

function SearchSection() {
  return (
    <div className="relative group mb-8">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
      <div className="relative flex items-center bg-card border-2 border-border/60 rounded-2xl px-5 py-4 shadow-sm focus-within:border-primary/50 focus-within:shadow-md transition-all">
        <Search className="h-5 w-5 text-muted-foreground/60 mr-4 shrink-0" />
        <input
          className="flex-1 bg-transparent border-none text-base focus:ring-0 placeholder:text-muted-foreground/50 text-foreground text-lg"
          placeholder="Describe the system you're migrating…"
          type="text"
        />
        <kbd className="hidden md:inline-flex h-7 items-center gap-1 rounded-lg border border-border/50 bg-muted/50 px-2.5 text-xs text-muted-foreground font-medium">
          Enter ↵
        </kbd>
      </div>
    </div>
  );
}

interface ImportSectionProps {
  githubUrl: string;
  files: File[];
  onGithubUrlChange: (url: string) => void;
  onFilesChange: (files: File[]) => void;
}

function ImportSection({ githubUrl, files, onGithubUrlChange, onFilesChange }: ImportSectionProps) {
  const fileName = files.length > 0 ? files[0].name : null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (fileList) {
      onFilesChange(Array.from(fileList));
    }
  }

  return (
    <Card className="overflow-hidden border-border/40">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold">Or import from</CardTitle>
        <CardDescription className="text-xs">Connect an existing repository or upload documentation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="space-y-3">
          <Label htmlFor="import-repo-url" className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Github className="h-4 w-4" />
            GitHub Repository
          </Label>
          <Input
            id="import-repo-url"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://github.com/org/repository"
            className="h-10"
            value={githubUrl}
            onChange={(e) => onGithubUrlChange(e.target.value)}
          />
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/30" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-3 text-xs text-muted-foreground">or</span>
          </div>
        </div>
        <div className="space-y-3">
          <Label htmlFor="import-doc-file" className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Upload className="h-4 w-4" />
            Upload Documentation
          </Label>
          <label
            htmlFor="import-doc-file"
            className="flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-border/50 bg-muted/30 px-6 py-8 cursor-pointer hover:border-primary/30 hover:bg-muted/50 transition-all group"
          >
            {fileName ? (
              <>
                <FileText className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium text-foreground">{fileName}</span>
                <span className="text-xs text-muted-foreground">Click to change file</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Click to upload PDF or Word
                </span>
                <span className="text-xs text-muted-foreground/70">Max 10MB</span>
              </>
            )}
          </label>
          <input
            id="import-doc-file"
            type="file"
            accept=".pdf,.doc,.docx"
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface SubmitButtonProps {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

function SubmitButton({ loading, disabled, onClick }: SubmitButtonProps) {
  return (
    <div className="flex flex-col items-center gap-4 pt-2">
      <Button
        size="lg"
        className="w-full md:w-auto md:min-w-[280px] h-12 text-base shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
        onClick={onClick}
        disabled={disabled || loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            Analyze & Generate Tasks
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground/70 text-center max-w-md">
        Takes approximately 2-5 minutes depending on system complexity
      </p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="w-full py-8 px-6 border-t border-border/20 bg-muted/20">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>© 2024 Migration Lens</span>
          <span className="text-border">·</span>
          <span>Built with AI</span>
        </div>
        <div className="flex items-center gap-6">
          {["Documentation", "Support", "Privacy", "Terms"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [githubUrl, setGithubUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!githubUrl && files.length === 0) {
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Ingest GitHub repo if provided
      if (githubUrl) {
        await ingestGitHubRepo(githubUrl);
      }

      // Ingest documentation files if provided
      if (files.length > 0) {
        await ingestDocumentation(files);
      }

      // Trigger analysis
      await analyzeProject();

      // Navigate to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Analysis failed. Please try again or use demo data.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <NavBar />
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-16">
        <HeroSection />
        <div className="w-full max-w-xl">
          <SearchSection />
          <ImportSection
            githubUrl={githubUrl}
            files={files}
            onGithubUrlChange={setGithubUrl}
            onFilesChange={setFiles}
          />
          {error && (
            <div className="mt-4 px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive">
              {error}
            </div>
          )}
          <SubmitButton
            loading={loading}
            disabled={!githubUrl && files.length === 0}
            onClick={handleAnalyze}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
