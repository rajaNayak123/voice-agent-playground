export type Severity = "critical" | "high" | "medium" | "low" | "none";

export interface StageFailure {
  stage: "STT" | "LLM" | "TTS";
  severity: Severity;
  score: number;
  issues: string[];
  root_cause: string;
  recommendation: string;
  examples: string[];
  impact?: string;
}

export interface OverallAnalysis {
  overall_health: number;
  primary_failure_stage: "STT" | "LLM" | "TTS" | "none";
  summary: string;
  call_outcome: "successful" | "partial" | "failed";
  sentiment: "positive" | "neutral" | "negative" | "frustrated";
  transcript_quality: "clear" | "noisy" | "incomplete";
  resolution_rate?: number;
  escalation_triggered?: boolean;
  repeat_caller_signals?: boolean;
  agent_coherence_score?: number;
  user_effort_score?: number;
  key_failure_moment?: string;
}

export interface Recommendation {
  priority: "critical" | "high" | "medium";
  title: string;
  description: string;
  stage: "STT" | "LLM" | "TTS" | "general";
}

export interface AnalysisResult {
  overall: OverallAnalysis;
  stages: {
    stt: StageFailure;
    llm: StageFailure;
    tts: StageFailure;
  };
  timeline: TimelineEvent[];
  raw_transcript_lines: number;
  recommendations?: Recommendation[];
}

export interface TimelineEvent {
  turn: number;
  speaker: "agent" | "user" | "system";
  text: string;
  flag?: {
    stage: "STT" | "LLM" | "TTS";
    issue: string;
    severity: Severity;
    explanation?: string;
  };
}
