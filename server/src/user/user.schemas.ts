import { z } from 'zod'

// Signup Schema & Type
export const CreateSchema = z.object({
  body: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    organizationId: z.string(),
    role: z.string(),
  })
})
export type CreateSchema = z.infer<typeof CreateSchema>['body']
