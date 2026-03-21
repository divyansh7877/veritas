"use client";

import { useState } from "react";
import Link from "next/link";

function Icon({ name, filled = false }: { name: string; filled?: boolean }) {
  return (
    <span
      className="material-symbols-outlined text-base"
      style={filled ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
    >
      {name}
    </span>
  );
}

function NavBar() {
  return (
    <nav className="w-full px-8 py-5 flex items-center justify-between border-b border-outline-variant/20 bg-white">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-lg shrink-0">
          <Icon name="lens" />
        </div>
        <span className="font-headline font-bold text-sm tracking-tight text-primary">Migration Lens</span>
      </div>
      <button type="button" className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors" aria-label="Help">
        <Icon name="help_outline" />
      </button>
    </nav>
  );
}

function SearchInput() {
  return (
    <div className="relative group">
      <div className="absolute -inset-3 bg-primary/5 rounded-3xl blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
      <div className="relative flex items-center bg-white border border-outline-variant/60 rounded-full px-6 py-3.5 search-container-shadow focus-within:border-outline transition-all">
        <input
          className="flex-grow bg-transparent border-none text-base focus:ring-0 placeholder:text-on-surface-variant/50 text-on-surface"
          placeholder="Describe the system you're migrating…"
          type="text"
        />
      </div>
    </div>
  );
}

function ImportSection() {
  const [fileName, setFileName] = useState("Click to choose a file…");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : "Click to choose a file…");
  }

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm divide-y divide-outline-variant/20 overflow-hidden">
      <div className="px-5 py-4 space-y-2">
        <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="import-repo-url">
          <Icon name="commit" />
          GitHub repository
        </label>
        <input
          id="import-repo-url"
          type="url"
          inputMode="url"
          autoComplete="url"
          placeholder="https://github.com/org/repository"
          className="w-full rounded-lg border border-outline-variant/50 bg-background px-3.5 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-outline focus:ring-1 focus:ring-outline transition-all"
        />
      </div>
      <div className="px-5 py-4 space-y-2">
        <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="import-doc-file">
          <Icon name="upload_file" />
          Upload document
          <span className="normal-case font-normal tracking-normal text-on-surface-variant/60">— PDF or Word</span>
        </label>
        <label
          htmlFor="import-doc-file"
          className="flex items-center gap-3 w-full rounded-xl border-2 border-dashed border-outline-variant/40 bg-background px-4 py-4 cursor-pointer hover:border-outline-variant hover:bg-surface-container transition-all group/drop"
        >
          <Icon name="description" />
          <span className="text-sm text-on-surface-variant/60 group-hover/drop:text-on-surface-variant transition-colors">
            {fileName}
          </span>
        </label>
        <input
          id="import-doc-file"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

function SubmitButton() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Link
        href="/dashboard"
        className="w-full flex items-center justify-center gap-2.5 px-8 py-4 bg-secondary hover:bg-on-secondary-container text-white font-headline font-bold text-sm rounded-full shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
      >
        Analyze & Generate Tasks
        <Icon name="auto_awesome" filled />
      </Link>
      <p className="text-[11px] text-on-surface-variant/50 text-center max-w-[380px] leading-relaxed">
        Migration Lens will analyze your system and surface every decision you need to make before rebuilding.
      </p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="w-full py-6 px-8 flex justify-center items-center gap-8 border-t border-outline-variant/15">
      <a className="text-[11px] font-medium text-on-surface-variant/60 hover:text-primary transition-colors" href="#">Support</a>
      <a className="text-[11px] font-medium text-on-surface-variant/60 hover:text-primary transition-colors" href="#">Documentation</a>
      <a className="text-[11px] font-medium text-on-surface-variant/60 hover:text-primary transition-colors" href="#">Privacy Policy</a>
      <a className="text-[11px] font-medium text-on-surface-variant/60 hover:text-primary transition-colors" href="#">Terms</a>
    </footer>
  );
}

export default function HomePage() {
  return (
    <>
      <NavBar />
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-[560px] flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-[30px] md:text-[36px] font-headline font-bold tracking-tight text-primary leading-tight">
              Start a new migration project
            </h1>
            <p className="mt-2 text-sm text-on-surface-variant">
              Describe your system, then let Migration Lens surface every decision you need to make.
            </p>
          </div>

          <SearchInput />
          <ImportSection />
          <SubmitButton />
        </div>
      </main>
      <Footer />
    </>
  );
}
