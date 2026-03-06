import { NextRequest, NextResponse } from "next/server";
import { extractBusinessCard } from "@/lib/anthropic";
import { extractCardRequestSchema } from "@/lib/validators";
import { enforceRateLimit } from "@/lib/rateLimit";
import type { ExtractedCard } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 30; // Vercel function timeout (seconds)

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const [first] = forwarded.split(",");
    if (first) return first.trim();
  }
  return "unknown";
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req);
  const limit = enforceRateLimit({
    key: `extract-card:${ip}`,
    limit: 30,
    windowMs: 60_000,
  });

  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many scan requests. Please wait a moment." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  // Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate input
  const parsed = extractCardRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { frontImage, backImage } = parsed.data;

  // Extract card data via Anthropic Vision
  // If back image causes an error, retry with front only
  let extracted: ExtractedCard;
  try {
    extracted = await extractBusinessCard(frontImage, backImage);
  } catch (err) {
    if (backImage) {
      console.warn("[extract-card] Failed with back image, retrying front-only:", err);
      try {
        extracted = await extractBusinessCard(frontImage);
      } catch (retryErr) {
        console.error("[extract-card] Front-only retry also failed:", retryErr);
        const message = retryErr instanceof Error ? retryErr.message : "Extraction failed";
        return NextResponse.json({ error: message }, { status: 502 });
      }
    } else {
      console.error("[extract-card] Anthropic error:", err);
      const message = err instanceof Error ? err.message : "Extraction failed";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  return NextResponse.json(extracted, { status: 200 });
}
