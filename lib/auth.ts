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
  // Use a try-catch block to handle any errors
  try {
    const sessionId = cookies().get("admin_session")?.value
    if (!sessionId) return null

    const user = await getUserById(sessionId)
    return user
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

// Clear the session
export async function clearSession() {
  cookies().delete("admin_session")
}

// Validate session
export async function validateSession(sessionId: string): Promise<boolean> {
  try {
    const user = await getUserById(sessionId)
    return !!user
  } catch (error) {
    console.error("Error validating session:", error)
    return false
  }
}
// Check if the session is valid