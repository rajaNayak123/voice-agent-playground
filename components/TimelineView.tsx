"use client";

import { TimelineEvent } from "@/lib/types";
import { severityBg } from "@/lib/utils";
import { useState } from "react";
import { Filter } from "lucide-react";
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

export default function TimelineView({ timeline, totalLines }: Props) {
  const [filter, setFilter] = useState<FilterType>("All");
  const [showAll, setShowAll] = useState(false);

  const flaggedCount = timeline.filter((t) => t.flag).length;

  const filtered = timeline.filter((event) => {
    if (filter === "All") return true;
    if (filter === "Clean") return !event.flag;
    return event.flag?.stage === filter;
  });

  const displayed = showAll ? filtered : filtered.slice(0, 15);

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-1 overflow-hidden">

      <div className="px-6 py-4 border-b border-surface-border flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h2 className="font-display text-base font-700 text-white">
            Call Timeline
          </h2>
          <p className="text-xs text-(--text-muted) font-mono mt-0.5">
            {totalLines} total turns · {flaggedCount} flagged
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3 h-3 text-(--text-muted)" />
          <div className="flex rounded-lg overflow-hidden border border-surface-border">
            {stageFilter.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-xs font-mono transition-colors",
                  filter === f
                    ? "bg-brand-500/20 text-brand-400"
                    : "text-(--text-muted) hover:text-(--text-subtle)"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="divide-y divide-surface-border">
        {displayed.length === 0 && (
          <div className="px-6 py-10 text-center text-(--text-muted) text-sm font-mono">
            No turns match this filter.
          </div>
        )}

        {displayed.map((event, i) => (
          <div
            key={i}
            className={cn(
              "px-6 py-3 flex gap-4 transition-colors",
              event.flag ? "bg-surface-2/50" : "hover:bg-surface-2/30"
            )}
          >
            <span className="text-xs font-mono text-(--text-muted) w-6 pt-0.5 shrink-0">
              {event.turn}
            </span>

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "text-xs font-mono px-2 py-0.5 rounded border capitalize",
                    speakerBg[event.speaker] || "bg-surface-3 border-surface-border"
                  )}
                  style={{}}
                >
                  <span className={speakerColors[event.speaker] || "text-gray-400"}>
                    {event.speaker}
                  </span>
                </span>
                {event.flag && (
                  <span
                    className={cn(
                      "text-xs font-mono px-2 py-0.5 rounded border",
                      severityBg(event.flag.severity)
                    )}
                  >
                    {event.flag.stage}: {event.flag.issue}
                  </span>
                )}
              </div>
              <p className="text-sm text-(--text-subtle) leading-relaxed wrap-break-word">
                {event.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length > 15 && (
        <div className="border-t border-surface-border px-6 py-3 text-center">
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
