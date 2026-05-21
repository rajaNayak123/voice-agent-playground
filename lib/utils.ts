import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Severity } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function severityColor(severity: Severity): string {
  switch (severity) {
    case "critical":
      return "text-red-400";
    case "high":
      return "text-orange-400";
    case "medium":
      return "text-yellow-400";
    case "low":
      return "text-blue-400";
    case "none":
      return "text-brand-400";
    default:
      return "text-gray-400";
  }
}

export function severityBg(severity: Severity): string {
  switch (severity) {
    case "critical":
      return "bg-red-500/10 border-red-500/30 text-red-400";
    case "high":
      return "bg-orange-500/10 border-orange-500/30 text-orange-400";
    case "medium":
      return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
    case "low":
      return "bg-blue-500/10 border-blue-500/30 text-blue-400";
    case "none":
      return "bg-brand-500/10 border-brand-500/30 text-brand-400";
    default:
      return "bg-gray-500/10 border-gray-500/30 text-gray-400";
  }
}

export function scoreToColor(score: number): string {
  if (score >= 80) return "#14b896";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

export function outcomeLabel(outcome: string): string {
  switch (outcome) {
    case "successful":
      return "Call Succeeded";
    case "partial":
      return "Partially Successful";
    case "failed":
      return "Call Failed";
    default:
      return outcome;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
