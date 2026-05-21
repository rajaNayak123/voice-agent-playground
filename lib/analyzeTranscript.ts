import Groq from "groq-sdk";
import { AnalysisResult } from "./types";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert Voice AI reliability engineer specializing in diagnosing failures in voice agent pipelines. You have deep expertise in:
- STT (Speech-to-Text): transcription accuracy, word error rate, noise handling, speaker diarization
- LLM (Large Language Model): intent recognition, context management, response relevance, hallucinations, latency
- TTS (Text-to-Speech): prosody, naturalness, pronunciation errors, output clarity

When given a voice call transcript, analyze it for failures across all three pipeline stages.

You MUST respond with ONLY valid JSON — no markdown, no code fences, no preamble. The JSON must follow this exact schema:

{
  "overall": {
    "overall_health": <0-100 integer>,
    "primary_failure_stage": <"STT"|"LLM"|"TTS"|"none">,
    "summary": "<2-3 sentence executive summary>",
    "call_outcome": <"successful"|"partial"|"failed">,
    "sentiment": <"positive"|"neutral"|"negative"|"frustrated">,
    "transcript_quality": <"clear"|"noisy"|"incomplete">
  },
  "stages": {
    "stt": {
      "stage": "STT",
      "severity": <"critical"|"high"|"medium"|"low"|"none">,
      "score": <0-100>,
      "issues": ["<issue 1>", "<issue 2>"],
      "root_cause": "<1 sentence root cause>",
      "recommendation": "<1-2 sentence fix>",
      "examples": ["<quoted text from transcript showing the issue>"]
    },
    "llm": {
      "stage": "LLM",
      "severity": <"critical"|"high"|"medium"|"low"|"none">,
      "score": <0-100>,
      "issues": ["<issue 1>"],
      "root_cause": "<1 sentence root cause>",
      "recommendation": "<1-2 sentence fix>",
      "examples": ["<quoted text from transcript showing the issue>"]
    },
    "tts": {
      "stage": "TTS",
      "severity": <"critical"|"high"|"medium"|"low"|"none">,
      "score": <0-100>,
      "issues": ["<issue 1>"],
      "root_cause": "<1 sentence root cause>",
      "recommendation": "<1-2 sentence fix>",
      "examples": ["<quoted text from transcript showing the issue>"]
    }
  },
  "timeline": [
    {
      "turn": <integer>,
      "speaker": <"agent"|"user"|"system">,
      "text": "<the line of dialogue>",
      "flag": {
        "stage": <"STT"|"LLM"|"TTS">,
        "issue": "<short issue label>",
        "severity": <"critical"|"high"|"medium"|"low">
      }
    }
  ],
  "raw_transcript_lines": <integer>
}

IMPORTANT RULES:
- For "timeline", include ALL turns from the transcript (max 30). Only add "flag" field when a turn shows a clear failure. Omit "flag" for clean turns.
- CRITICAL CONSISTENCY RULE: If a stage has issues listed in the "stages" section, you MUST flag at least one matching turn in the "timeline" with that same stage. If stt has issues, at least one timeline turn must have flag.stage = "STT". Never report a stage issue without a corresponding timeline flag.
- Score each stage: 100 = perfect, 0 = completely broken
- Be specific. Reference actual text from the transcript as evidence.
- If a stage has no issues, set severity to "none", score to 90-100, issues to [], root_cause to "No issues detected", recommendation to "No action needed", examples to [].
- STT timeline flags: tag user turns where the agent asked to repeat, [inaudible] or [unclear] appears, or a clarification loop began. Tag the first turn in the breakdown.
- LLM timeline flags: tag agent turns with wrong intent, irrelevant response, context loss, repetition, or hallucination.
- TTS timeline flags: tag agent turns with unnatural phrasing, broken sentences, robotic markers like underscores, or malformed output.`;

export async function analyzeTranscript(
  transcriptText: string
): Promise<AnalysisResult> {
  const userPrompt = `Analyze this voice call transcript for failures across the STT, LLM, and TTS pipeline stages:

---TRANSCRIPT START---
${transcriptText.slice(0, 12000)}
---TRANSCRIPT END---

Return ONLY the JSON object as specified. No other text.`;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 4000,
    temperature: 0.1, // Low temperature for consistent structured output
    response_format: { type: "json_object" }, // Force JSON output
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  const rawText = response.choices[0]?.message?.content || "";

  // Strip any accidental markdown fences just in case
  const cleaned = rawText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  const result: AnalysisResult = JSON.parse(cleaned);
  return result;
}