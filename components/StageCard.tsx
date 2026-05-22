"use client";

import { StageFailure } from "@/lib/types";
import { severityBg, scoreToColor } from "@/lib/utils";
import { Mic, Brain, Volume2, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { useState } from "react";

const stageIcons = {
  STT: Mic,
  LLM: Brain,
  TTS: Volume2,
};

const stageDescriptions = {
  STT: "Speech-to-Text",
  LLM: "Language Model",
  TTS: "Text-to-Speech",
};

const stageColors = {
  STT: {
    accent: "#6366f1",
    bg: "rgba(99,102,241,0.04)",
    border: "rgba(99,102,241,0.18)",
    text: "#818cf8",
    glow: "rgba(99,102,241,0.15)",
  },
  LLM: {
    accent: "#14b896",
    bg: "rgba(20,184,150,0.04)",
    border: "rgba(20,184,150,0.18)",
    text: "#2dd4aa",
    glow: "rgba(20,184,150,0.15)",
  },
  TTS: {
    accent: "#f59e0b",
    bg: "rgba(245,158,11,0.04)",
    border: "rgba(245,158,11,0.18)",
    text: "#fbbf24",
    glow: "rgba(245,158,11,0.15)",
  },
};

const scoreLabels = (score: number) => {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Poor";
  if (score >= 20) return "Critical";
  return "Broken";
};

interface Props {
  stage: StageFailure;
  index: number;
}

export default function StageCard({ stage, index }: Props) {
  const [expanded, setExpanded] = useState(index === 1); // expand LLM by default (usually most issues)
  const Icon = stageIcons[stage.stage];
  const colors = stageColors[stage.stage];
  const scoreColor = scoreToColor(stage.score);
  const hasIssues = stage.issues.length > 0;

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg"
      style={{
        background: colors.bg,
        borderColor: colors.border,
        boxShadow: expanded ? `0 0 30px ${colors.glow}` : "none",
      }}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: `${colors.accent}18`,
              border: `1px solid ${colors.border}`,
            }}
          >
            <Icon className="w-4 h-4" style={{ color: colors.text }} />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-xs" style={{ color: colors.text }}>
              {stage.stage}
            </p>
            <p className="text-white text-sm font-semibold truncate">
              {stageDescriptions[stage.stage]}
            </p>
          </div>
        </div>

        {/* Score */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className="text-2xl font-bold tabular-nums"
            style={{ color: scoreColor }}
          >
            {stage.score}
          </span>
          <div
            className={`px-2 py-0.5 rounded-full text-xs font-mono border ${severityBg(
              stage.severity
            )}`}
          >
            {stage.severity}
          </div>
        </div>
      </div>

      {/* Score bar with label */}
      <div className="mx-4 mb-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-mono text-[var(--text-muted)]">
            {scoreLabels(stage.score)}
          </span>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            {stage.score}/100
          </span>
        </div>
        <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${stage.score}%`,
              background: `linear-gradient(90deg, ${scoreColor}88, ${scoreColor})`,
            }}
          />
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-mono border-t transition-colors"
        style={{
          borderColor: colors.border,
          color: colors.text,
        }}
      >
        <span>
          {hasIssues
            ? `${stage.issues.length} issue${stage.issues.length !== 1 ? "s" : ""} found`
            : "No issues found"}
        </span>
        {expanded ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>

      {/* Expandable details */}
      {expanded && (
        <div
          className="border-t px-4 py-4 space-y-4"
          style={{ borderColor: colors.border }}
        >
          {/* Impact summary */}
          {stage.impact && (
            <div
              className="text-xs text-[var(--text-subtle)] leading-relaxed px-3 py-2 rounded-lg italic"
              style={{ background: `${colors.accent}06` }}
            >
              {stage.impact}
            </div>
          )}

          {/* Issues */}
          {hasIssues && (
            <div>
              <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Issues
              </p>
              <ul className="space-y-1.5">
                {stage.issues.map((issue, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-[var(--text-subtle)]"
                  >
                    <span style={{ color: colors.text }} className="mt-0.5 shrink-0">
                      ·
                    </span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Root Cause */}
          <div>
            <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
              Root Cause
            </p>
            <p className="text-xs text-[var(--text-subtle)] leading-relaxed">
              {stage.root_cause}
            </p>
          </div>

          {/* Recommendation */}
          <div
            className="rounded-lg p-3"
            style={{
              background: `${colors.accent}08`,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3 h-3" style={{ color: colors.text }} />
              <p className="text-xs font-mono" style={{ color: colors.text }}>
                Recommendation
              </p>
            </div>
            <p className="text-xs text-[var(--text-subtle)] leading-relaxed">
              {stage.recommendation}
            </p>
          </div>

          {/* Examples / Evidence */}
          {stage.examples && stage.examples.length > 0 && stage.examples[0] !== "" && (
            <div>
              <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Evidence
              </p>
              <div className="space-y-2">
                {stage.examples.slice(0, 2).map((ex, i) => (
                  <div
                    key={i}
                    className="text-xs font-mono px-3 py-2 rounded-lg border"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      borderColor: colors.border,
                      color: colors.text,
                    }}
                  >
                    &ldquo;{ex}&rdquo;
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
