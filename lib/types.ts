export type Severity = "critical" | "high" | "medium" | "low" | "none";

export interface StageFailure {
  stage: "STT" | "LLM" | "TTS";
  severity: Severity;
  score: number; // 0–100 health score
  issues: string[];
  root_cause: string;
  recommendation: string;
  examples: string[]; // quoted lines from transcript
}

export interface OverallAnalysis {
  overall_health: number; // 0–100
  primary_failure_stage: "STT" | "LLM" | "TTS" | "none";
  summary: string;
  call_outcome: "successful" | "partial" | "failed";
  sentiment: "positive" | "neutral" | "negative" | "frustrated";
  transcript_quality: "clear" | "noisy" | "incomplete";
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
}

export interface TimelineEvent {
  turn: number;
  speaker: "agent" | "user" | "system";
  text: string;
  flag?: {
    stage: "STT" | "LLM" | "TTS";
    issue: string;
    severity: Severity;
  };
}
