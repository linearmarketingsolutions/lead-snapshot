import { z } from "zod";

export const extractedCardSchema = z.object({
  name: z.string(),
  title: z.string(),
  company: z.string(),
  email: z.string(),
  phone: z.string(),
  linkedin: z.string(),
  tiktok: z.string(),
  instagram: z.string(),
  website: z.string(),
  location: z.string(),
  alignmentScore: z.number().int().min(1).max(10).nullable(),
  alignmentRationale: z.string().nullable(),
});

export const extractCardRequestSchema = z.object({
  frontImage: z
    .string()
    .min(100, "Front image is required")
    .refine((v) => v.length < 10_000_000, "Image too large (max ~7MB)"),
  backImage: z.string().optional(),
});

export const leadSchema = z.object({
  id: z.string().uuid(),
  repName: z.string().min(1, "Rep name is required"),
  showName: z.string().min(1, "Show name is required"),
  capturedAt: z.string().datetime(),
  name: z.string(),
  title: z.string(),
  company: z.string(),
  email: z.string(),
  phone: z.string(),
  linkedin: z.string(),
  tiktok: z.string(),
  instagram: z.string(),
  website: z.string(),
  location: z.string(),
  alignmentScore: z.number().int().min(1).max(10).nullable(),
  alignmentRationale: z.string().nullable(),
  notes: z.string(),
});

export const leadInputSchema = leadSchema.omit({
  id: true,
  capturedAt: true,
}).extend({
  cardImageFront: z.string().optional(),
  cardImageBack: z.string().optional(),
});

export const repSessionSchema = z.object({
  repName: z.string().min(1).max(100),
  showName: z.string().min(1).max(200),
});

export const googleSheetsWebhookUrlSchema = z.string().url().refine(
  (url) => url.startsWith("https://script.google.com/"),
  "GOOGLE_SHEETS_WEBHOOK_URL must be a Google Apps Script URL"
);

export type ExtractCardRequest = z.infer<typeof extractCardRequestSchema>;
export type ExtractedCardData = z.infer<typeof extractedCardSchema>;
export type LeadData = z.infer<typeof leadSchema>;
export type LeadInputData = z.infer<typeof leadInputSchema>;
