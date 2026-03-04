import { NextRequest, NextResponse } from "next/server";
import { extractBusinessCard } from "@/lib/anthropic";
import { extractCardRequestSchema } from "@/lib/validators";
import type { ExtractedCard } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 30; // Vercel function timeout (seconds)

export async function POST(req: NextRequest): Promise<NextResponse> {
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
  let extracted: ExtractedCard;
  try {
    extracted = await extractBusinessCard(frontImage, backImage);
  } catch (err) {
    console.error("[extract-card] Anthropic error:", err);
    const message =
      err instanceof Error ? err.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json(extracted, { status: 200 });
}
