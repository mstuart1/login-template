import { z } from 'zod'

// Signin Schema & Type
export const SigninSchema = z.object({
  body: z.object({
    email: z.string(),
  })
})

export type SigninSchema = z.infer<typeof SigninSchema>['body']

// Authenticate Schema & Type
export const AuthenticateSchema = z.object({
  body: z.object({
    email: z.string(),
    emailToken: z.string()
  })
})

export type AuthenticateSchema = z.infer<typeof AuthenticateSchema>['body']

export const ApiTokenSchema = z.object({
  tokenId: z.string()
})

export type ApiTokenSchema = z.infer<typeof ApiTokenSchema>