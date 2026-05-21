"use client";

import { StageFailure } from "@/lib/types";
import { severityBg, scoreToColor } from "@/lib/utils";
import { Mic, Brain, Volume2, ChevronDown, ChevronUp } from "lucide-react";
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
    bg: "rgba(99,102,241,0.05)",
    border: "rgba(99,102,241,0.2)",
    text: "#818cf8",
  },
  LLM: {
    accent: "#14b896",
    bg: "rgba(20,184,150,0.05)",
    border: "rgba(20,184,150,0.2)",
    text: "#2dd4aa",
  },
  TTS: {
    accent: "#f59e0b",
    bg: "rgba(245,158,11,0.05)",
    border: "rgba(245,158,11,0.2)",
    text: "#fbbf24",
  },
};

interface Props {
  stage: StageFailure;
  index: number;
}

export default function StageCard({ stage, index }: Props) {
  const [expanded, setExpanded] = useState(index === 0);
  const Icon = stageIcons[stage.stage];
  const colors = stageColors[stage.stage];
  const scoreColor = scoreToColor(stage.score);

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-200"
      style={{
        background: colors.bg,
        borderColor: colors.border,
      }}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: `${colors.accent}20`,
              border: `1px solid ${colors.border}`,
            }}
          >
            <Icon className="w-4 h-4" style={{ color: colors.text }} />
          </div>
          <div>
            <p className="font-mono text-xs" style={{ color: colors.text }}>
              {stage.stage}
            </p>
            <p className="text-white text-sm font-display font-600">
              {stageDescriptions[stage.stage]}
            </p>
          </div>
        </div>

        {/* Score */}
        <div className="flex flex-col items-end gap-1">
          <span
            className="text-xl font-display font-800"
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

      {/* Score bar */}
      <div className="mx-4 mb-3 h-1 bg-surface-3 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${stage.score}%`,
            background: scoreColor,
          }}
        />
      </div>

      {/* Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2 flex items-center justify-between text-xs font-mono border-t"
        style={{
          borderColor: colors.border,
          color: colors.text,
        }}
      >
        {stage.issues.length === 0
          ? "No issues found"
          : `${stage.issues.length} issue${stage.issues.length !== 1 ? "s" : ""} found`}
        {expanded ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>

      {/* Expandable details */}
      {expanded && (
        <div className="border-t px-4 py-4 space-y-4" style={{ borderColor: colors.border }}>
          {/* Issues */}
          {stage.issues.length > 0 && (
            <div>
              <p className="text-xs font-mono text-(--text-muted) uppercase tracking-wider mb-2">
                Issues
              </p>
              <ul className="space-y-1.5">
                {stage.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-(--text-subtle)">
                    <span style={{ color: colors.text }} className="mt-0.5">
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
            <p className="text-xs font-mono text-(--text-muted) uppercase tracking-wider mb-1.5">
              Root Cause
            </p>
            <p className="text-xs text-(--text-subtle) leading-relaxed">
              {stage.root_cause}
            </p>
          </div>

          {/* Recommendation */}
          <div
            className="rounded-lg p-3"
            style={{ background: `${colors.accent}08`, borderColor: colors.border }}
          >
            <p className="text-xs font-mono mb-1" style={{ color: colors.text }}>
              → Recommendation
            </p>
            <p className="text-xs text-(--text-subtle) leading-relaxed">
              {stage.recommendation}
            </p>
          </div>

          {/* Examples */}
          {stage.examples && stage.examples.length > 0 && stage.examples[0] !== "" && (
            <div>
              <p className="text-xs font-mono text-(--text-muted) uppercase tracking-wider mb-2">
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
                    "{ex}"
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
