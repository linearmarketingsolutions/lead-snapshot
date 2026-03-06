export type Lead = {
  id: string;
  // Capture context
  repName: string;
  showName: string;
  capturedAt: string; // ISO 8601

  // Contact info
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  linkedin: string;
  tiktok: string;
  instagram: string;
  website: string;
  location: string;

  // Enrichment (added post-capture)
  alignmentScore: number | null; // 1-10, null until scored
  alignmentRationale: string | null; // Phase 4: AI-generated rationale
  notes: string;

  // Transient - strip before any DB write
  cardImageFront?: string; // base64
  cardImageBack?: string;  // base64
};

export type LeadInput = Omit<Lead, "id" | "capturedAt">;

export type ExtractedCard = Pick<
  Lead,
  | "name"
  | "title"
  | "company"
  | "email"
  | "phone"
  | "linkedin"
  | "tiktok"
  | "instagram"
  | "website"
  | "location"
  | "alignmentScore"
  | "alignmentRationale"
>;

export type RepSession = {
  repName: string;
  showName: string;
};

export type AlignmentScore = {
  score: number; // 1-10
  rationale: string;
};

// Phase 3 - CRM integration
export type CRMProvider = "hubspot" | "salesforce" | "webhook";

export type CRMConfig = {
  provider: CRMProvider;
  webhookUrl?: string;
  accessToken?: string;
};

// Phase 4 - ICP for alignment scoring
export type ICPConfig = {
  targetRoles: string[];
  targetIndustries: string[];
  targetCompanySizes: string[];
  targetTechStack: string[];
  customCriteria: string;
};
