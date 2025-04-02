import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Simple admin authentication - in a real app, this would be handled more securely
    if (username === "admin" && password === "youngriders2025") {
      // Create a response with a cookie
      const response = NextResponse.json({ success: true })

      // Set a secure cookie for admin session
      response.cookies.set("admin_session", "authenticated", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      })

      return response
    } else {
      return NextResponse.json({ success: false, message: "Invalid credentials" })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "An error occurred during login" }, { status: 500 })
  }
}

