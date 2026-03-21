"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, HelpCircle, Github, Upload, FileText, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ingestGitHubRepo, ingestDocumentation, ingestSuggestions, analyzeProject } from "@/lib/api";

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
  onClick: () => void;
}

function SubmitButton({ loading, onClick }: SubmitButtonProps) {
  return (
    <div className="flex flex-col items-center gap-4 pt-2">
      <Button
        size="lg"
        onClick={onClick}
        disabled={loading}
        className="gap-2 shadow-md hover:shadow-lg transition-shadow"
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

export default function HomePage() {
  const router = useRouter();
  const [githubUrl, setGithubUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    setLoading(true);
    try {
      // Ingest from GitHub if URL provided
      if (githubUrl) {
        await ingestGitHubRepo(githubUrl);
      }
      // Ingest uploaded files if any
      if (files.length > 0) {
        await ingestDocumentation(files);
      }
      // If neither, use default suggestions prompt
      if (!githubUrl && files.length === 0) {
        await ingestSuggestions([
          "Analyze this migration project and identify critical decisions needed for a successful migration from legacy Oracle 11g to a modern cloud-native stack"
        ]);
      }
      // Trigger analysis to generate tasks
      await analyzeProject();
      router.push("/dashboard");
    } catch (err) {
      console.error("Analysis failed:", err);
      // Still redirect to dashboard even on error - it will show mock data
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <NavBar />
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-16">
        <HeroSection />
        <div className="w-full max-w-xl">
          <ImportSection
            githubUrl={githubUrl}
            files={files}
            onGithubUrlChange={setGithubUrl}
            onFilesChange={setFiles}
          />
          <SubmitButton
            loading={loading}
            onClick={handleAnalyze}
          />
        </div>
      </main>
    </div>
  );
}