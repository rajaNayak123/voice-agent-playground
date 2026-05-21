"use client";

import { OverallAnalysis } from "@/lib/types";
import { scoreToColor, outcomeLabel } from "@/lib/utils";
import { CheckCircle, XCircle, AlertTriangle, TrendingUp } from "lucide-react";

interface Props {
  overall: OverallAnalysis;
}

function HealthRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = scoreToColor(score);

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg
        className="absolute inset-0 -rotate-90"
        width="144"
        height="144"
        viewBox="0 0 144 144"
      >
        {/* Background track */}
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="10"
        />
        {/* Progress */}
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span
          className="text-3xl font-display font-800"
          style={{ color }}
        >
          {score}
        </span>
        <span className="text-xs text-(--text-muted) font-mono">/ 100</span>
      </div>
    </div>
  );
}

function OutcomeIcon({ outcome }: { outcome: string }) {
  if (outcome === "successful")
    return <CheckCircle className="w-5 h-5 text-brand-400" />;
  if (outcome === "failed")
    return <XCircle className="w-5 h-5 text-red-400" />;
  return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
}

const sentimentEmoji: Record<string, string> = {
  positive: "😊",
  neutral: "😐",
  negative: "😞",
  frustrated: "😤",
};

const qualityColors: Record<string, string> = {
  clear: "text-brand-400",
  noisy: "text-yellow-400",
  incomplete: "text-orange-400",
};

export default function OverallHealthCard({ overall }: Props) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-1 p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col items-center gap-3">
          <HealthRing score={overall.overall_health} />
          <div className="flex items-center gap-2">
            <OutcomeIcon outcome={overall.call_outcome} />
            <span className="text-sm font-mono text-white">
              {outcomeLabel(overall.call_outcome)}
            </span>
          </div>
        </div>

        <div className="hidden md:block w-px bg-surface-border" />

        <div className="flex-1 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              <h2 className="font-display text-lg font-700 text-white">
                Analysis Summary
              </h2>
            </div>
            <p className="text-(--text-subtle) text-sm leading-relaxed">
              {overall.summary}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-surface-2 border border-surface-border text-xs font-mono text-(--text-subtle)">
              Primary Failure:{" "}
              <span className="text-white font-500">
                {overall.primary_failure_stage === "none"
                  ? "None detected"
                  : overall.primary_failure_stage}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-surface-2 border border-surface-border text-xs font-mono text-(--text-subtle)">
              Sentiment:{" "}
              <span className="text-white font-500 capitalize">
                {sentimentEmoji[overall.sentiment]} {overall.sentiment}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-surface-2 border border-surface-border text-xs font-mono text-(--text-subtle)">
              Audio Quality:{" "}
              <span
                className={`font-500 capitalize ${
                  qualityColors[overall.transcript_quality]
                }`}
              >
                {overall.transcript_quality}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
