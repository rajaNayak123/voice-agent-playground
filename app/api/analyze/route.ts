import { NextRequest, NextResponse } from "next/server";
import { analyzeTranscript } from "@/lib/analyzeTranscript";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("transcript") as File | null;
    const pastedText = formData.get("text") as string | null;

    let transcriptText = "";

    if (file && file.size > 0) {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith(".pdf") || fileType === "application/pdf") {
        // Handle PDF
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        // Dynamic import to avoid build issues
        const pdfParseModule = await import("pdf-parse");
        const pdfParse = (pdfParseModule as any).default || pdfParseModule;
        const pdfData = await pdfParse(buffer);
        transcriptText = pdfData.text;
      } else if (fileName.endsWith(".json") || fileType === "application/json") {
        // Handle JSON transcripts (common format from voice platforms)
        const text = await file.text();
        const json = JSON.parse(text);
        // Try to extract text from common voice platform JSON formats
        transcriptText = extractFromJson(json);
      } else {
        // Plain text, .txt, .md, .vtt, .srt, etc.
        transcriptText = await file.text();
      }
    } else if (pastedText && pastedText.trim()) {
      transcriptText = pastedText.trim();
    } else {
      return NextResponse.json(
        { error: "No transcript provided. Upload a file or paste text." },
        { status: 400 }
      );
    }

    if (!transcriptText || transcriptText.trim().length < 50) {
      return NextResponse.json(
        { error: "Transcript is too short or empty to analyze (minimum 50 characters)." },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured. Add it to your .env.local file." },
        { status: 500 }
      );
    }

    const result = await analyzeTranscript(transcriptText);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Analysis error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to analyze transcript";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function extractFromJson(json: unknown): string {
  // Handle Vapi format
  if (json && typeof json === "object") {
    const obj = json as Record<string, unknown>;
    if (Array.isArray(obj.messages)) {
      return (obj.messages as Array<Record<string, unknown>>)
        .map((m) => `${m.role || "unknown"}: ${m.content || m.text || ""}`)
        .join("\n");
    }
    // Handle Retell format
    if (Array.isArray(obj.transcript)) {
      return (obj.transcript as Array<Record<string, unknown>>)
        .map((t) => `${t.role || t.speaker || "unknown"}: ${t.content || t.text || ""}`)
        .join("\n");
    }
    // Handle array of utterances
    if (Array.isArray(json)) {
      return (json as Array<Record<string, unknown>>)
        .map((item) => {
          const speaker = item.role || item.speaker || item.who || "unknown";
          const text = item.content || item.text || item.message || "";
          return `${speaker}: ${text}`;
        })
        .join("\n");
    }
    // Fallback: stringify
    return JSON.stringify(json, null, 2);
  }
  return String(json);
}
