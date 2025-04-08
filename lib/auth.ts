"use server"

import { cookies } from "next/headers"
import { getUserById } from "./db-users"

// Create a new session
export async function createSession(userId: string) {
  cookies().set({
    name: "admin_session",
    value: userId,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })
}

// Get the current session
export async function getSession() {
  // In Next.js 14, cookies() doesn't need to be awaited
  // but we need to use it directly without storing in a variable
  const sessionId = cookies().get("admin_session")?.value
  if (!sessionId) return null

  const user = await getUserById(sessionId)
  return user
}

// Validate the session
export async function validateSession(sessionId: string) {
  if (!sessionId) return false

  const user = await getUserById(sessionId)
  return !!user
}

// Clear the session
export async function clearSession() {
  cookies().delete("admin_session")
}
