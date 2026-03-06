import { createHmac, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { stripImages } from "@/lib/utils";
import { enforceRateLimit } from "@/lib/rateLimit";
import { googleSheetsWebhookUrlSchema, leadInputSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const maxDuration = 15;

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
    key: `save-lead:${ip}`,
    limit: 60,
    windowMs: 60_000,
  });

  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = leadInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const webhookUrlRaw = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const webhookUrlParsed = googleSheetsWebhookUrlSchema.safeParse(webhookUrlRaw);
  if (!webhookUrlParsed.success) {
    return NextResponse.json(
      { error: "Server misconfigured: missing valid Google Sheets webhook URL" },
      { status: 500 }
    );
  }

  const { cardImageFront, cardImageBack, ...leadData } = parsed.data;

  const lead = {
    id: randomUUID(),
    capturedAt: new Date().toISOString(),
    ...leadData,
    ...(cardImageFront ? { cardImageFront } : {}),
    ...(cardImageBack ? { cardImageBack } : {}),
  };

  const payload = {
    event: "lead.saved",
    createdAt: new Date().toISOString(),
    lead: stripImages(lead),
  };
  const payloadString = JSON.stringify(payload);

  const secret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;
  const signature = secret
    ? createHmac("sha256", secret).update(payloadString).digest("hex")
    : undefined;

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(webhookUrlParsed.data, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(signature ? { "x-leadsnap-signature": signature } : {}),
      },
      body: payloadString,
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.error("[save-lead] webhook request failed", error);
    return NextResponse.json(
      { error: "Could not reach Google Sheets webhook" },
      { status: 502 }
    );
  }

  if (!upstreamRes.ok) {
    const details = await upstreamRes.text().catch(() => "");
    return NextResponse.json(
      {
        error: "Google Sheets webhook rejected request",
        status: upstreamRes.status,
        details: details.slice(0, 300),
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
