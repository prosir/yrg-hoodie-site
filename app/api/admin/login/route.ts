import { NextResponse } from "next/server"
import { getUserByUsername } from "@/lib/db-users"
import { createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ message: "Username and password are required" }, { status: 400 })
    }

    // Get user
    const user = await getUserByUsername(username)
    if (!user) {
      return NextResponse.json({ message: "Invalid username or password" }, { status: 401 })
    }

    // Simple password check (plain text)
    if (user.passwordHash !== password) {
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
