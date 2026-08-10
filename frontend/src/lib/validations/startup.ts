import { z } from 'zod';

export const StartupStageEnum = z.enum(['IDEA', 'PROTOTYPE', 'MVP', 'EARLY_REVENUE', 'SCALING']);
export const StartupStatusEnum = z.enum(['ACTIVE', 'ALUMNI', 'INACTIVE', 'CLOSED']);
export const StartupRegistrationStatusEnum = z.enum(['REGISTERED', 'UNREGISTERED', 'INCORPORATED']);

const LenientUrl = z.preprocess((val) => {
  if (typeof val === 'string' && val.trim() !== '') {
    const trimmed = val.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }
  return val;
}, z.union([z.string().url(), z.literal(''), z.null()]).optional());

export const StartupFounderSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required").max(255),
  role: z.string().max(255).optional().nullable(),
  department: z.string().max(255).optional().nullable(),
  is_alumni: z.boolean().default(false),
  graduation_year: z.union([z.number().int(), z.string().transform(val => val === '' ? null : Number(val))]).optional().nullable(),
  linkedin_url: LenientUrl,
});

export const StartupAwardSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required").max(255),
  awarded_by: z.string().max(255).optional().nullable(),
  date_received: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const StartupFundingSchema = z.object({
  id: z.string().uuid().optional(),
  funding_round: z.string().min(1, "Round is required").max(100),
  amount: z.string().max(100).optional().nullable(),
  investors: z.string().max(255).optional().nullable(),
  date_received: z.string().optional().nullable(),
});

export const StartupPressLinkSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required").max(255),
  url: z.union([z.string().url("Must be a valid URL"), z.literal(''), z.null()]).optional(),
  publisher: z.string().max(255).optional().nullable(),
  date_published: z.string().optional().nullable(),
});

export const StartupGalleryImageSchema = z.object({
  id: z.string().uuid(),
  image_url: z.string().url(),
  alt_text: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
  is_published: z.boolean().default(true),
});

export const StartupSchema = z.object({
  // Basic Info
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  tagline: z.string().max(120).optional().nullable(),
  logo_url: LenientUrl,
  cover_image_url: LenientUrl,
  short_description: z.string().min(10, "Provide a short description").max(300),
  
  // Status & Details
  stage: StartupStageEnum,
  status: StartupStatusEnum.default('ACTIVE'),
  registration_status: StartupRegistrationStatusEnum.optional().nullable(),
  industry: z.string().max(255).optional().nullable(),
  founded_year: z.union([z.number().int().min(1900).max(new Date().getFullYear()), z.string().transform(val => val === '' ? null : Number(val))]).optional().nullable(),
  team_size: z.union([z.number().int().min(1), z.string().transform(val => val === '' ? null : Number(val))]).optional().nullable(),
  
  // Contact & Links
  email: z.union([z.string().email(), z.literal(''), z.null()]).optional(),
  phone: z.string().optional().nullable(),
  website_url: LenientUrl,
  github_url: LenientUrl,
  linkedin_url: LenientUrl,
  instagram_url: LenientUrl,
  demo_video_url: LenientUrl,
  pitch_deck_url: LenientUrl,
  youtube_demo_url: LenientUrl,
  
  // Deep Details
  full_description: z.string().min(1, "Full description is required"),
  business_model: z.string().optional().nullable(),
  problem_statement: z.string().optional().nullable(),
  solution: z.string().optional().nullable(),
  target_market: z.string().optional().nullable(),
  incubator: z.string().optional().nullable(),
  clients: z.string().optional().nullable(),
  patents: z.string().optional().nullable(),
  
  // Admin Settings
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  verification_status: z.string().default('PENDING'),
  display_order: z.union([z.number().int(), z.string().transform(val => val === '' ? 0 : Number(val))]).default(0),
  internal_notes: z.string().optional().nullable(),
  batch_id: z.string().uuid().optional().nullable(),
  assigned_mentor_id: z.string().uuid().optional().nullable(),
  
  // Nested Entities
  founders: z.array(StartupFounderSchema).default([]),
  awards: z.array(StartupAwardSchema).default([]),
  funding: z.array(StartupFundingSchema).default([]),
  press_links: z.array(StartupPressLinkSchema).default([]),
  technology_ids: z.array(z.string().uuid()).default([]),
});

export type StartupFounder = z.infer<typeof StartupFounderSchema>;
export type StartupAward = z.infer<typeof StartupAwardSchema>;
export type StartupFunding = z.infer<typeof StartupFundingSchema>;
export type StartupPressLink = z.infer<typeof StartupPressLinkSchema>;
export type StartupFormData = z.infer<typeof StartupSchema>;
export type StartupGalleryImage = z.infer<typeof StartupGalleryImageSchema>;

export interface Technology {
  id: string;
  name: string;
}

export interface Batch {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

export interface StartupResponse extends Omit<StartupFormData, 'founders' | 'awards' | 'funding' | 'press_links'> {
  id: string;
  created_at: string;
  updated_at: string;
  founders: StartupFounder[];
  team_members?: StartupFounder[];
  awards: StartupAward[];
  funding: StartupFunding[];
  press_links: StartupPressLink[];
  batch?: Batch | null;
  technologies?: Technology[];
  gallery_images?: StartupGalleryImage[];
}
