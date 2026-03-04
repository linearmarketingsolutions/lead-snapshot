import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { ExtractedCard } from "@/types";
import { extractedCardSchema } from "@/lib/validators";

// Singleton — reused across requests in the same lambda instance
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const EXTRACTION_MODEL = "claude-opus-4-5" as const;

export const CARD_EXTRACTION_PROMPT = `You are a business card OCR and data extraction specialist.

Extract ALL contact information from the provided business card image(s).

Return ONLY a valid JSON object — no markdown fences, no explanation, no preamble.
Use empty string "" for any field not found.

Required JSON shape:
{
  "name": "full name as printed",
  "title": "job title / position",
  "company": "company or organization name",
  "email": "primary email address",
  "phone": "primary phone number with country code if present",
  "linkedin": "linkedin.com/in/handle or full URL if present, else empty string"
}

Rules:
- Prefer work email over personal
- Include country code for phone if shown
- Normalize linkedin to linkedin.com/in/handle format
- If multiple phones, pick the first/primary
- Do not invent data — only extract what is visible`;

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
        media_type: "image/jpeg",
        data: frontImageBase64,
      },
    },
  ];

  if (backImageBase64) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/jpeg",
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
    max_tokens: 512,
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
