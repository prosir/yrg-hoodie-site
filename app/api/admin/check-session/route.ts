import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Check for the admin session cookie
    const sessionCookie = request.cookies.get("admin_session")

    // Return whether the user is authenticated or not
    return NextResponse.json({
      authenticated: sessionCookie?.value === "authenticated",
    })
  } catch (error) {
    console.error("Error checking session:", error)
    return NextResponse.json({ authenticated: false, error: "Failed to check session" }, { status: 500 })
  }
}

