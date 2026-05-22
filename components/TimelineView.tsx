"use client";

import { TimelineEvent } from "@/lib/types";
import { severityBg } from "@/lib/utils";
import { useState } from "react";
import { Filter, ChevronDown, ChevronUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  timeline: TimelineEvent[];
  totalLines: number;
}

const speakerColors: Record<string, string> = {
  agent: "text-brand-400",
  user: "text-blue-400",
  system: "text-yellow-400",
};

const speakerBg: Record<string, string> = {
  agent: "bg-brand-500/10 border-brand-500/20",
  user: "bg-blue-500/10 border-blue-500/20",
  system: "bg-yellow-500/10 border-yellow-500/20",
};

const stageFilter = ["All", "STT", "LLM", "TTS", "Clean"] as const;
type FilterType = (typeof stageFilter)[number];

const stageAccent: Record<string, string> = {
  STT: "border-l-indigo-500",
  LLM: "border-l-brand-500",
  TTS: "border-l-amber-500",
};

export default function TimelineView({ timeline, totalLines }: Props) {
  const [filter, setFilter] = useState<FilterType>("All");
  const [showAll, setShowAll] = useState(false);
  const [expandedExplanations, setExpandedExplanations] = useState<Set<number>>(new Set());

  const flaggedCount = timeline.filter((t) => t.flag).length;

  const filtered = timeline.filter((event) => {
    if (filter === "All") return true;
    if (filter === "Clean") return !event.flag;
    return event.flag?.stage === filter;
  });

  const INITIAL_SHOW = 12;
  const displayed = showAll ? filtered : filtered.slice(0, INITIAL_SHOW);

  const toggleExplanation = (turn: number) => {
    setExpandedExplanations((prev) => {
      const next = new Set(prev);
      if (next.has(turn)) next.delete(turn);
      else next.add(turn);
      return next;
    });
  };

  // Stats per stage
  const stats = {
    STT: timeline.filter((t) => t.flag?.stage === "STT").length,
    LLM: timeline.filter((t) => t.flag?.stage === "LLM").length,
    TTS: timeline.filter((t) => t.flag?.stage === "TTS").length,
  };

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-1 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-surface-border">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between mb-3">
          <div>
            <h2 className="font-display text-base font-bold text-white">
              Call Timeline
            </h2>
            <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
              {totalLines} total turns · {flaggedCount} flagged
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3 h-3 text-[var(--text-muted)]" />
            <div className="flex rounded-lg overflow-hidden border border-surface-border">
              {stageFilter.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-mono transition-colors",
                    filter === f
                      ? "bg-brand-500/20 text-brand-400"
                      : "text-[var(--text-muted)] hover:text-[var(--text-subtle)]"
                  )}
                >
                  {f}
                  {f !== "All" && f !== "Clean" && stats[f as keyof typeof stats] > 0 && (
                    <span className="ml-1 text-[10px] opacity-70">
                      {stats[f as keyof typeof stats]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stage issue badges */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats).map(([stage, count]) =>
            count > 0 ? (
              <button
                key={stage}
                onClick={() => setFilter(stage as FilterType)}
                className={cn(
                  "text-xs font-mono px-2 py-1 rounded-md border transition-all",
                  filter === stage
                    ? "opacity-100"
                    : "opacity-60 hover:opacity-90",
                  stage === "STT"
                    ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                    : stage === "LLM"
                    ? "bg-brand-500/10 border-brand-500/20 text-brand-400"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                )}
              >
                {count} {stage} {count === 1 ? "issue" : "issues"}
              </button>
            ) : null
          )}
          {flaggedCount === 0 && (
            <span className="text-xs font-mono text-brand-400 px-2 py-1 rounded-md bg-brand-500/10 border border-brand-500/20">
              ✓ No issues detected
            </span>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="divide-y divide-surface-border">
        {displayed.length === 0 && (
          <div className="px-6 py-12 text-center text-[var(--text-muted)] text-sm font-mono">
            No turns match this filter.
          </div>
        )}

        {displayed.map((event) => {
          const isExpanded = expandedExplanations.has(event.turn);
          return (
            <div
              key={event.turn}
              className={cn(
                "px-6 py-3 flex gap-4 transition-colors border-l-2",
                event.flag
                  ? cn(
                      "bg-surface-2/40",
                      stageAccent[event.flag.stage] ?? "border-l-transparent"
                    )
                  : "border-l-transparent hover:bg-surface-2/20"
              )}
            >
              <span className="text-xs font-mono text-[var(--text-muted)] w-6 pt-0.5 shrink-0 tabular-nums">
                {event.turn}
              </span>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      "text-xs font-mono px-2 py-0.5 rounded border capitalize",
                      speakerBg[event.speaker] ??
                        "bg-surface-3 border-surface-border"
                    )}
                  >
                    <span
                      className={
                        speakerColors[event.speaker] ?? "text-gray-400"
                      }
                    >
                      {event.speaker}
                    </span>
                  </span>
                  {event.flag && (
                    <button
                      onClick={() => toggleExplanation(event.turn)}
                      className={cn(
                        "text-xs font-mono px-2 py-0.5 rounded border flex items-center gap-1 transition-opacity hover:opacity-90",
                        severityBg(event.flag.severity)
                      )}
                    >
                      {event.flag.stage}: {event.flag.issue}
                      {event.flag.explanation && (
                        <Info className="w-2.5 h-2.5 opacity-70" />
                      )}
                    </button>
                  )}
                </div>

                <p className="text-sm text-[var(--text-subtle)] leading-relaxed break-words">
                  {event.text}
                </p>

                {/* Explanation (expandable) */}
                {event.flag?.explanation && isExpanded && (
                  <div className="mt-1.5 px-3 py-2 rounded-lg bg-surface-3/60 border border-surface-border text-xs text-[var(--text-muted)] leading-relaxed">
                    <span className="text-brand-400 font-mono">Why flagged: </span>
                    {event.flag.explanation}
                  </div>
                )}
              </div>

              {/* Expand explanation button */}
              {event.flag?.explanation && (
                <button
                  onClick={() => toggleExplanation(event.turn)}
                  className="shrink-0 mt-1 text-[var(--text-muted)] hover:text-[var(--text-subtle)] transition-colors"
                  title={isExpanded ? "Hide explanation" : "Show explanation"}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length > INITIAL_SHOW && (
        <div className="border-t border-surface-border px-6 py-3 text-center bg-surface-2/20">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-mono text-brand-400 hover:text-brand-300 transition-colors"
          >
            {showAll
              ? "Show less"
              : `Show all ${filtered.length} turns`}
          </button>
        </div>
      )}
    </div>
  );
}
