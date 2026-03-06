import { NextRequest, NextResponse } from "next/server";
import { extractQRContact } from "@/lib/anthropic";
import { enforceRateLimit } from "@/lib/rateLimit";
import type { ExtractedCard } from "@/types";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const [first] = forwarded.split(",");
    if (first) return first.trim();
  }
  return "unknown";
}

function parseVCard(raw: string): string {
  const lines = raw.split(/\r?\n/);
  const fields: string[] = [];
  for (const line of lines) {
    const [key, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    if (!value) continue;
    const k = (key ?? "").split(";")[0]?.toUpperCase() ?? "";
    if (k === "FN") fields.push(`Name: ${value}`);
    else if (k === "ORG") fields.push(`Company: ${value}`);
    else if (k === "TITLE") fields.push(`Title: ${value}`);
    else if (k.startsWith("TEL")) fields.push(`Phone: ${value}`);
    else if (k.startsWith("EMAIL")) fields.push(`Email: ${value}`);
    else if (k.startsWith("URL")) fields.push(`URL: ${value}`);
    else if (k === "ADR") fields.push(`Address: ${value.replace(/;/g, " ").trim()}`);
    else if (k === "NOTE") fields.push(`Note: ${value}`);
  }
  return fields.join("\n");
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req);
  const limit = enforceRateLimit({
    key: `extract-qr:${ip}`,
    limit: 30,
    windowMs: 60_000,
  });

  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const qrData = (body as Record<string, unknown>)?.qrData;
  if (!qrData || typeof qrData !== "string" || qrData.trim().length === 0) {
    return NextResponse.json({ error: "qrData is required" }, { status: 422 });
  }

  const raw = qrData.trim();
  const isVCard = raw.toUpperCase().startsWith("BEGIN:VCARD");
  const isLinkedIn = raw.includes("linkedin.com/in/");
  const isUrl = /^https?:\/\//i.test(raw);

  let contextText: string;
  let hint: string;

  if (isVCard) {
    contextText = parseVCard(raw);
    hint = "This is parsed vCard contact data.";
  } else if (isLinkedIn) {
    contextText = `LinkedIn Profile URL: ${raw}`;
    hint = "This is a LinkedIn profile URL. Extract the handle as the linkedin field. Leave other fields empty unless visible in the URL.";
  } else if (isUrl) {
    contextText = `Website URL: ${raw}`;
    hint = "This is a website URL. Extract the domain as the website field. Leave other fields empty.";
  } else {
    contextText = raw;
    hint = "This is plain text from a QR code. Extract any contact information you can find.";
  }

  let extracted: ExtractedCard;
  try {
    extracted = await extractQRContact(contextText, hint);
  } catch (err) {
    console.error("[extract-qr] error:", err);
    const message = err instanceof Error ? err.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json(extracted, { status: 200 });
}
