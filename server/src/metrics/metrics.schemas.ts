import { z } from 'zod'

// Create Schema & Type
export const CreateMetricSchema = z.object({
  body: z.object({
    name: z.string(),
    value: z.number(),
    delta: z.number(),
    timestamp: z.string(),
    userId: z.string().optional()
  })
})

export type CreateMetricSchema = z.infer<typeof CreateMetricSchema>['body']