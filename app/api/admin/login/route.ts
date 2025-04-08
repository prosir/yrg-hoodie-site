import { NextResponse } from "next/server"
import { createSession } from "@/lib/auth"
import fs from "fs"
import path from "path"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Simple validation
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Read users from JSON file
    const usersPath = path.join(process.cwd(), "data", "users.json")
    const usersData = fs.readFileSync(usersPath, "utf8")
    const users = JSON.parse(usersData)

    // Find user
    const user = users.find((u: any) => u.username === username)

    // Simple password check (in production, use proper hashing)
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    // Create session
    await createSession(username)

    return NextResponse.json({
      success: true,
      redirectUrl: "/admin/dashboard",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
