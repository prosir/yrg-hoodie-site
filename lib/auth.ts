import { cookies } from "next/headers"

export async function createSession(username: string) {
  // Create a simple session cookie
  cookies().set({
    name: "admin_session",
    value: username,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })
}

export async function getSession() {
  const sessionCookie = cookies().get("admin_session")
  return sessionCookie?.value
}

export async function clearSession() {
  cookies().delete("admin_session")
}
