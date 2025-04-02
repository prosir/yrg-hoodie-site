import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Create a response that will delete the cookie
    const response = NextResponse.json({ success: true })

    // Delete the admin session cookie by setting maxAge to 0
    response.cookies.set("admin_session", "", {
      path: "/",
      expires: new Date(0),
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ success: false, error: "An error occurred during logout" }, { status: 500 })
  }
}

