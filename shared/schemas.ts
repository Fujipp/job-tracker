import { z } from 'zod'

export const jobStatusSchema = z.enum(['saved', 'applied', 'responded', 'interview', 'offer', 'rejected', 'withdrawn'])
export const workModeSchema = z.enum(['onsite', 'hybrid', 'remote', 'unspecified'])

export const statusEventSchema = z.object({
  id: z.string().min(1), from: jobStatusSchema.nullable(), to: jobStatusSchema,
  at: z.string().datetime(), note: z.string().optional()
})

export const jobInputSchema = z.object({
  url: z.string().url(), platform: z.string().trim().max(50).optional(),
  title: z.string().trim().min(1).max(160), company: z.string().trim().min(1).max(160),
  location: z.string().trim().max(160).optional().default(''), workMode: workModeSchema.optional().default('unspecified'),
  salary: z.string().trim().max(120).optional().default(''), notes: z.string().trim().max(5000).optional().default(''),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional().default([]),
  postedAt: z.string().date().nullable().optional().default(null)
})

export const jobSchema = jobInputSchema.extend({
  id: z.string().min(1), normalizedUrl: z.string(), platform: z.string().min(1), status: jobStatusSchema,
  appliedAt: z.string().datetime().nullable(), createdAt: z.string().datetime(), updatedAt: z.string().datetime(),
  lastActivityAt: z.string().datetime(), reviewDismissedAt: z.string().datetime().nullable(), archived: z.boolean(),
  history: z.array(statusEventSchema)
})

export const settingsSchema = z.object({ staleDays: z.number().int().min(1).max(365), compactCards: z.boolean() })
export const appDataSchema = z.object({ version: z.literal(1), jobs: z.array(jobSchema), settings: settingsSchema, dismissedDiscoveries: z.array(z.string()).default([]) })

export const jobPatchSchema = jobInputSchema.partial().extend({
  status: jobStatusSchema.optional(), archived: z.boolean().optional(), action: z.enum(['follow-up', 'dismiss-review']).optional(),
  note: z.string().trim().max(500).optional()
})
