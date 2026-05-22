"use client";

import { OverallAnalysis } from "@/lib/types";
import { scoreToColor, outcomeLabel } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  PhoneForwarded,
  RefreshCw,
  Zap,
  Target,
  AlertCircle,
} from "lucide-react";

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
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-20"
        style={{ background: color }}
      />
      <svg
        className="absolute inset-0 -rotate-90"
        width="144"
        height="144"
        viewBox="0 0 144 144"
      >
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="10"
        />
        {/* Tick marks */}
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i / 20) * 360;
          const rad = (angle * Math.PI) / 180;
          const x1 = 72 + 48 * Math.cos(rad);
          const y1 = 72 + 48 * Math.sin(rad);
          const x2 = 72 + 44 * Math.cos(rad);
          const y2 = 72 + 44 * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          );
        })}
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
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />
      </svg>
      <div className="flex flex-col items-center relative z-10">
        <span
          className="text-3xl font-bold tabular-nums"
          style={{ color }}
        >
          {score}
        </span>
        <span className="text-xs text-[var(--text-muted)] font-mono">/ 100</span>
      </div>
    </div>
  );
}

function OutcomeIcon({ outcome }: { outcome: string }) {
  if (outcome === "successful")
    return <CheckCircle className="w-4 h-4 text-emerald-400" />;
  if (outcome === "failed")
    return <XCircle className="w-4 h-4 text-red-400" />;
  return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
}

const sentimentConfig: Record<string, { emoji: string; color: string }> = {
  positive: { emoji: "😊", color: "text-emerald-400" },
  neutral: { emoji: "😐", color: "text-blue-400" },
  negative: { emoji: "😞", color: "text-orange-400" },
  frustrated: { emoji: "😤", color: "text-red-400" },
};

const qualityColors: Record<string, string> = {
  clear: "text-emerald-400",
  noisy: "text-yellow-400",
  incomplete: "text-orange-400",
};

function MiniMetric({
  label,
  value,
  icon: Icon,
  color,
  suffix = "",
}: {
  label: string;
  value: string | number | boolean | undefined;
  icon: React.ElementType;
  color: string;
  suffix?: string;
}) {
  if (value === undefined || value === null) return null;
  const display =
    typeof value === "boolean" ? (value ? "Yes" : "No") : `${value}${suffix}`;
  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface-2/60 border border-surface-border">
      <div className="flex items-center gap-1.5">
        <Icon className={`w-3 h-3 ${color}`} />
        <span className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span className={`text-sm font-bold font-mono ${color}`}>{display}</span>
    </div>
  );
}

export default function OverallHealthCard({ overall }: Props) {
  const sentiment = sentimentConfig[overall.sentiment] ?? {
    emoji: "😐",
    color: "text-gray-400",
  };

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-1 overflow-hidden">
      {/* Top section */}
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center gap-3 shrink-0">
            <HealthRing score={overall.overall_health} />
            <div className="flex items-center gap-2">
              <OutcomeIcon outcome={overall.call_outcome} />
              <span className="text-sm font-mono text-white">
                {outcomeLabel(overall.call_outcome)}
              </span>
            </div>
          </div>

          <div className="hidden md:block w-px bg-surface-border" />

          <div className="flex-1 space-y-4 min-w-0">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-brand-400" />
                <h2 className="font-display text-lg font-bold text-white">
                  Analysis Summary
                </h2>
              </div>
              <p className="text-[var(--text-subtle)] text-sm leading-relaxed">
                {overall.summary}
              </p>
            </div>

            {/* Key failure moment */}
            {overall.key_failure_moment && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/5 border border-red-500/15">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-300/80 leading-relaxed">
                  <span className="text-red-400 font-mono font-semibold">Key failure: </span>
                  {overall.key_failure_moment}
                </p>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-surface-2 border border-surface-border text-xs font-mono text-[var(--text-subtle)]">
                Primary Failure:{" "}
                <span className="text-white font-semibold">
                  {overall.primary_failure_stage === "none"
                    ? "None"
                    : overall.primary_failure_stage}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-surface-2 border border-surface-border text-xs font-mono text-[var(--text-subtle)]">
                Sentiment:{" "}
                <span className={`font-semibold capitalize ${sentiment.color}`}>
                  {sentiment.emoji} {overall.sentiment}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-surface-2 border border-surface-border text-xs font-mono text-[var(--text-subtle)]">
                Audio:{" "}
                <span className={`font-semibold capitalize ${qualityColors[overall.transcript_quality] ?? "text-gray-400"}`}>
                  {overall.transcript_quality}
                </span>
              </div>
              {overall.escalation_triggered && (
                <div className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-xs font-mono text-orange-400 flex items-center gap-1">
                  <PhoneForwarded className="w-3 h-3" />
                  Escalated
                </div>
              )}
              {overall.repeat_caller_signals && (
                <div className="px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs font-mono text-yellow-400 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  Repeat signals
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom metrics strip */}
      {(overall.resolution_rate !== undefined ||
        overall.user_effort_score !== undefined ||
        overall.agent_coherence_score !== undefined) && (
        <div className="border-t border-surface-border px-6 py-4 bg-surface-2/30">
          <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-widest mb-3">
            Conversational Quality Metrics
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <MiniMetric
              label="Resolution"
              value={overall.resolution_rate}
              icon={Target}
              color={
                (overall.resolution_rate ?? 0) >= 70
                  ? "text-emerald-400"
                  : (overall.resolution_rate ?? 0) >= 40
                  ? "text-yellow-400"
                  : "text-red-400"
              }
              suffix="%"
            />
            <MiniMetric
              label="User Effort"
              value={overall.user_effort_score}
              icon={Zap}
              color={
                (overall.user_effort_score ?? 0) >= 70
                  ? "text-emerald-400"
                  : (overall.user_effort_score ?? 0) >= 40
                  ? "text-yellow-400"
                  : "text-red-400"
              }
              suffix="%"
            />
            <MiniMetric
              label="Agent Coherence"
              value={overall.agent_coherence_score}
              icon={TrendingUp}
              color={
                (overall.agent_coherence_score ?? 0) >= 70
                  ? "text-emerald-400"
                  : (overall.agent_coherence_score ?? 0) >= 40
                  ? "text-yellow-400"
                  : "text-red-400"
              }
              suffix="%"
            />
          </div>
        </div>
      )}
    </div>
  );
}
