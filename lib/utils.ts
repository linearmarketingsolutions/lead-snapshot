import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

export function getInitial(name: string): string {
  return (name.trim()[0] ?? "?").toUpperCase();
}

export function scoreLabel(score: number | null): string {
  if (score === null) return "";
  if (score >= 8) return "Strong fit";
  if (score >= 5) return "Possible fit";
  return "Low fit";
}

export function scoreColor(score: number | null): {
  bg: string;
  text: string;
  border: string;
} {
  if (score === null)
    return { bg: "bg-surface-100", text: "text-slate-400", border: "border-surface-200" };
  if (score >= 8)
    return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
  if (score >= 5)
    return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
  return { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" };
}

/** Strip base64 image fields before persisting to DB */
export function stripImages<T extends { cardImageFront?: string; cardImageBack?: string }>(
  lead: T
): Omit<T, "cardImageFront" | "cardImageBack"> {
  const { cardImageFront: _f, cardImageBack: _b, ...rest } = lead; // intentionally unused - strips images
  return rest;
}
