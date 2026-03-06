import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { ExtractedCard } from "@/types";
import { extractedCardSchema } from "@/lib/validators";

// Singleton — reused across requests in the same lambda instance
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const EXTRACTION_MODEL = "claude-haiku-4-5-20251001" as const;

export const CARD_EXTRACTION_PROMPT = `You are a business card OCR and data extraction specialist.

Extract ALL contact information from the provided business card image(s).

IMPORTANT: Business cards come in many shapes — standard landscape, square, vertical/portrait, round-cornered, mini, and non-standard sizes. Treat the entire image as a business card regardless of its aspect ratio or shape. Extract all visible text.

Return ONLY a valid JSON object — no markdown fences, no explanation, no preamble.
Use empty string "" for any field not found.

Required JSON shape:
{
  "name": "full name as printed",
  "title": "job title / position",
  "company": "company or organization name",
  "email": "primary email address",
  "phone": "primary phone number with country code if present",
  "linkedin": "linkedin.com/in/handle or full URL if present, else empty string",
  "tiktok": "tiktok handle or URL if present, else empty string",
  "instagram": "instagram handle or URL if present, else empty string",
  "website": "company/personal website URL if present, else empty string",
  "location": "any location info shown (city/state/country/address), else empty string",
  "alignmentScore": 1-10 integer or null,
  "alignmentRationale": "short reason for score based on title/company role context, or null"
}

Rules:
- Prefer work email over personal
- Include country code for phone if shown
- Normalize linkedin to linkedin.com/in/handle format
- If multiple phones, pick the first/primary
- For alignmentScore, infer likely decision-making influence from title/company context on the card itself
- Use null for alignmentScore when there is not enough signal
- Keep alignmentRationale under 20 words
- Do not invent data — only extract what is visible
- If an image is blurry, dark, or unclear, extract whatever text is legible and leave the rest as empty string`;

function detectMediaType(base64: string): "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
  // Inspect the first few base64 chars to detect the image format
  // Base64-encoded magic bytes: JPEG=/9j, PNG=iVBO, GIF=R0lG, WEBP=UklG
  if (base64.startsWith("/9j")) return "image/jpeg";
  if (base64.startsWith("iVBO")) return "image/png";
  if (base64.startsWith("R0lG")) return "image/gif";
  if (base64.startsWith("UklG")) return "image/webp";
  return "image/jpeg"; // fallback
}

export async function extractBusinessCard(
  frontImageBase64: string,
  backImageBase64?: string
): Promise<ExtractedCard> {
  const content: Anthropic.MessageParam["content"] = [
    { type: "text", text: CARD_EXTRACTION_PROMPT },
    {
      type: "image",
      source: {
        type: "base64",
        media_type: detectMediaType(frontImageBase64),
        data: frontImageBase64,
      },
    },
  ];

  if (backImageBase64) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: detectMediaType(backImageBase64),
        data: backImageBase64,
      },
    });
    content.push({
      type: "text",
      text: "The second image is the back of the same business card. Use both sides to extract the most complete information.",
    });
  }

  const message = await anthropic.messages.create({
    model: EXTRACTION_MODEL,
    max_tokens: 768,
    messages: [{ role: "user", content }],
  });

  const rawText =
    message.content[0]?.type === "text" ? message.content[0].text : "{}";

  const cleaned = rawText.replace(/```json|```/g, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`AI returned non-JSON response: ${rawText.slice(0, 200)}`);
  }

  const result = extractedCardSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`AI response failed validation: ${result.error.message}`);
  }

  return result.data;
}

export async function extractQRContact(
  contextText: string,
  hint: string
): Promise<ExtractedCard> {
  const prompt = `You are a contact data extraction specialist.

${hint}

Extract all available contact information from the data below.
Return ONLY a valid JSON object — no markdown fences, no explanation, no preamble.
Use empty string "" for any field not found.

Required JSON shape:
{
  "name": "full name",
  "title": "job title / position",
  "company": "company or organization name",
  "email": "email address",
  "phone": "phone number",
  "linkedin": "linkedin.com/in/handle or full URL if present, else empty string",
  "tiktok": "tiktok handle or URL if present, else empty string",
  "instagram": "instagram handle or URL if present, else empty string",
  "website": "website URL if present, else empty string",
  "location": "any location info, else empty string",
  "alignmentScore": null,
  "alignmentRationale": null
}

Data to extract from:
${contextText}`;

  const message = await anthropic.messages.create({
    model: EXTRACTION_MODEL,
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText =
    message.content[0]?.type === "text" ? message.content[0].text : "{}";
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`AI returned non-JSON response: ${rawText.slice(0, 200)}`);
  }

  const result = extractedCardSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`AI response failed validation: ${result.error.message}`);
  }

  return result.data;
}
