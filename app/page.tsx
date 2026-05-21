"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  Mic,
  ChevronRight,
  Zap,
  Activity,
  AlertCircle,
} from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleAnalyze = async () => {
    setError("");
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      if (activeTab === "upload" && file) {
        formData.append("transcript", file);
      } else if (activeTab === "paste" && pastedText.trim()) {
        formData.append("text", pastedText);
      } else {
        setError("Please upload a file or paste a transcript.");
        setIsAnalyzing(false);
        return;
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      // Store result in sessionStorage and navigate
      sessionStorage.setItem("analysisResult", JSON.stringify(data));
      router.push("/results");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsAnalyzing(false);
    }
  };

  const canAnalyze =
    (activeTab === "upload" && file !== null) ||
    (activeTab === "paste" && pastedText.trim().length >= 50);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-surface-border px-6 py-4 flex items-center justify-between glass sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <Mic className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <span className="font-display font-bold text-white text-sm tracking-tight">
              SuperBryn
            </span>
            <span className="text-surface-border mx-2">·</span>
            <span className="text-xs text-[var(--text-subtle)] font-mono">
              Voice Agent Playground
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-slow" />
          <span className="text-xs text-[var(--text-subtle)] font-mono">
            LIVE
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 max-w-4xl mx-auto w-full">
        <div className="animate-fade-up stagger-1 mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-500/20 bg-brand-500/5 text-brand-400 text-xs font-mono">
          <Zap className="w-3 h-3" />
          STT · LLM · TTS Pipeline Analyzer
        </div>

        <h1 className="animate-fade-up stagger-2 font-display text-4xl md:text-5xl font-extrabold text-center text-white leading-tight mb-4">
          Your voice agents break
          <br />
          <span className="text-brand-400">in production.</span>
        </h1>

        <p className="animate-fade-up stagger-3 text-[var(--text-subtle)] text-center max-w-lg mb-10 leading-relaxed">
          Upload a call transcript and instantly diagnose exactly where your
          voice agent failed — speech recognition, reasoning, or synthesis.
        </p>

        <div className="animate-fade-up stagger-4 w-full max-w-2xl">
          <div className="rounded-2xl border border-surface-border bg-surface-1 overflow-hidden">
            <div className="flex border-b border-surface-border">
              {(["upload", "paste"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 py-3 text-sm font-mono transition-all",
                    activeTab === tab
                      ? "bg-surface-2 text-brand-400 border-b-2 border-brand-400"
                      : "text-[var(--text-muted)] hover:text-[var(--text-subtle)]"
                  )}
                >
                  {tab === "upload" ? "↑ Upload File" : "⌘ Paste Text"}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "upload" ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative rounded-xl border-2 border-dashed p-10 cursor-pointer transition-all duration-200 text-center",
                    isDragging
                      ? "border-brand-400 bg-brand-500/5"
                      : file
                      ? "border-brand-500/40 bg-brand-500/5"
                      : "border-surface-border hover:border-brand-500/40 hover:bg-surface-2"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,.json,.md,.vtt,.srt,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-1">
                        <FileText className="w-5 h-5 text-brand-400" />
                      </div>
                      <p className="text-white font-mono text-sm">{file.name}</p>
                      <p className="text-[var(--text-muted)] text-xs">
                        {formatBytes(file.size)} · Click to change
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-surface-3 border border-surface-border flex items-center justify-center">
                        <Upload className="w-5 h-5 text-[var(--text-muted)]" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium mb-1">
                          Drop your transcript here
                        </p>
                        <p className="text-[var(--text-muted)] text-xs">
                          .txt · .pdf · .json · .vtt · .srt · .md
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder={`Paste your call transcript here...\n\nExample:\nAgent: Hello, how can I help you today?\nUser: I want to know my account balance.\nAgent: I'm sorry, can you repeat that?\n...`}
                    rows={10}
                    className="w-full bg-surface-2 border border-surface-border rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--text-muted)] font-mono resize-none focus:outline-none focus:border-brand-500/40 transition-colors"
                  />
                  <p className="text-xs text-[var(--text-muted)] font-mono text-right">
                    {pastedText.length} chars{" "}
                    {pastedText.length < 50 && pastedText.length > 0
                      ? "(need 50+)"
                      : ""}
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze || isAnalyzing}
                className={cn(
                  "mt-5 w-full py-3 px-6 rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200",
                  canAnalyze && !isAnalyzing
                    ? "bg-brand-500 hover:bg-brand-600 text-white glow-brand"
                    : "bg-surface-3 text-[var(--text-muted)] cursor-not-allowed"
                )}
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="w-4 h-4 animate-pulse" />
                    Analyzing pipeline...
                  </>
                ) : (
                  <>
                    Analyze Transcript
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-[var(--text-muted)] font-mono mt-4">
            Works with Vapi · Retell · Bland.ai · Custom implementations
          </p>
        </div>

        <div className="animate-fade-up stagger-5 flex flex-wrap gap-3 justify-center mt-12">
          {[
            { icon: "🎙️", label: "STT Failure Detection" },
            { icon: "🧠", label: "LLM Intent Analysis" },
            { icon: "🔊", label: "TTS Quality Check" },
            { icon: "🔍", label: "Root Cause Diagnosis" },
            { icon: "📊", label: "Health Scores" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2 border border-surface-border text-xs text-[var(--text-subtle)]"
            >
              <span>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-surface-border px-6 py-4 text-center">
        <p className="text-xs text-[var(--text-muted)] font-mono">
          Built for{" "}
          <a
            href="https://superbryn.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 hover:underline"
          >
            SuperBryn
          </a>{" "}
          · Voice AI Reliability Platform
        </p>
      </footer>
    </div>
  );
}
