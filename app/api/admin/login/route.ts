import { NextResponse } from "next/server"
import { verifyCredentials } from "@/lib/db-users"
import { createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Verify credentials
    const user = await verifyCredentials(username, password)

    if (!user) {
      return NextResponse.json({ message: "Invalid username or password" }, { status: 401 })
    }

    // Create session
    await createSession(user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "An error occurred during login" }, { status: 500 })
  }
}
