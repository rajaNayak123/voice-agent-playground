"use client";

import { Recommendation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info, Mic, Brain, Volume2, Wrench } from "lucide-react";

interface Props {
  recommendations: Recommendation[];
}

const priorityConfig = {
  critical: {
    icon: AlertCircle,
    bg: "bg-red-500/8 border-red-500/20",
    badge: "bg-red-500/10 border-red-500/25 text-red-400",
    dot: "bg-red-400",
    label: "Critical",
  },
  high: {
    icon: AlertTriangle,
    bg: "bg-orange-500/8 border-orange-500/20",
    badge: "bg-orange-500/10 border-orange-500/25 text-orange-400",
    dot: "bg-orange-400",
    label: "High",
  },
  medium: {
    icon: Info,
    bg: "bg-blue-500/8 border-blue-500/20",
    badge: "bg-blue-500/10 border-blue-500/25 text-blue-400",
    dot: "bg-blue-400",
    label: "Medium",
  },
};

const stageIconMap = {
  STT: Mic,
  LLM: Brain,
  TTS: Volume2,
  general: Wrench,
};

const stageColorMap = {
  STT: "text-indigo-400",
  LLM: "text-brand-400",
  TTS: "text-amber-400",
  general: "text-gray-400",
};

export default function RecommendationsPanel({ recommendations }: Props) {
  if (!recommendations || recommendations.length === 0) return null;

  // Sort by priority
  const sorted = [...recommendations].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-1 overflow-hidden">
      <div className="px-6 py-4 border-b border-surface-border">
        <h2 className="font-display text-base font-bold text-white">
          Actionable Recommendations
        </h2>
        <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
          {sorted.length} prioritized fix{sorted.length !== 1 ? "es" : ""} to improve reliability
        </p>
      </div>

      <div className="divide-y divide-surface-border">
        {sorted.map((rec, i) => {
          const pConfig = priorityConfig[rec.priority];
          const StageIcon = stageIconMap[rec.stage] ?? Wrench;
          const stageColor = stageColorMap[rec.stage] ?? "text-gray-400";

          return (
            <div
              key={i}
              className={cn(
                "px-6 py-4 flex gap-4 transition-colors border-l-2",
                rec.priority === "critical"
                  ? "border-l-red-500"
                  : rec.priority === "high"
                  ? "border-l-orange-500"
                  : "border-l-blue-500"
              )}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-2 shrink-0 mt-0.5">
                  <div className={cn("w-1.5 h-1.5 rounded-full mt-1", pConfig.dot)} />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">
                      {rec.title}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-mono px-2 py-0.5 rounded-full border",
                        pConfig.badge
                      )}
                    >
                      {pConfig.label}
                    </span>
                    <span className={cn("text-xs font-mono flex items-center gap-1", stageColor)}>
                      <StageIcon className="w-3 h-3" />
                      {rec.stage}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-subtle)] leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}