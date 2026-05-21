"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalysisResult } from "@/lib/types";
import OverallHealthCard from "@/components/OverallHealthCard";
import StageCard from "@/components/StageCard";
import TimelineView from "@/components/TimelineView";
import { ArrowLeft, Download, Mic } from "lucide-react";

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (!stored) {
      router.push("/");
      return;
    }
    try {
      setResult(JSON.parse(stored));
    } catch {
      router.push("/");
    }
  }, [router]);

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voice-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
          <p className="text-(--text-subtle) font-mono text-sm">
            Loading analysis...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-surface-border px-6 py-4 flex items-center justify-between glass sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-(--text-subtle) hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            New Analysis
          </button>
          <div className="w-px h-4 bg-surface-border" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <Mic className="w-3 h-3 text-brand-400" />
            </div>
            <span className="text-xs text-(--text-subtle) font-mono">
              SuperBryn · Analysis Report
            </span>
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-border text-xs text-(--text-subtle) hover:text-white hover:border-brand-500/40 transition-all font-mono"
        >
          <Download className="w-3 h-3" />
          Export JSON
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10 space-y-8">
        {/* Overall Health */}
        <div className="animate-fade-up stagger-1">
          <OverallHealthCard overall={result.overall} />
        </div>

        {/* Pipeline Stages */}
        <div>
          <h2 className="font-mono text-xs font-semibold text-(--text-muted) uppercase tracking-widest mb-4 font-mono">
            Pipeline Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="animate-fade-up stagger-2">
              <StageCard stage={result.stages.stt} index={0} />
            </div>
            <div className="animate-fade-up stagger-3">
              <StageCard stage={result.stages.llm} index={1} />
            </div>
            <div className="animate-fade-up stagger-4">
              <StageCard stage={result.stages.tts} index={2} />
            </div>
          </div>
        </div>

        {/* Timeline */}
        {result.timeline && result.timeline.length > 0 && (
          <div className="animate-fade-up stagger-5">
            <TimelineView
              timeline={result.timeline}
              totalLines={result.raw_transcript_lines}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-surface-border px-6 py-4 text-center">
        <p className="text-xs text-(--text-muted) font-mono">
          Powered by{" "}
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
