import { getAuth, requireAuth } from '@clerk/express'
import dotenv from "dotenv";

dotenv.config()

const passThrough = (_req, _res, next) => next()

export const withClerkAuth = (req, _res, next) => {
  if (process.env.USE_CLERK !== 'true') {
    // In dev mode without Clerk, attach a fake user
    req.auth = { userId: process.env.DEV_USER_ID || 'dev-user' }
  }
  // In Clerk mode, do not touch req.auth; clerkMiddleware handles it
  next()
}

export const requireClerkAuth = (req, res, next) => {
  if (process.env.USE_CLERK === 'true') {
    return requireAuth()(req, res, next)
  }
  return passThrough(req, res, next)
}
