import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import fs from "fs"
import path from "path"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    console.log("Login attempt:", { username, password })

    // Simple validation
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Read users from JSON file
    const usersPath = path.join(process.cwd(), "data", "users.json")

    // Check if file exists
    if (!fs.existsSync(usersPath)) {
      console.log("Creating default users file")
      // Create default admin user
      const defaultUsers = [
        {
          id: "admin-1",
          username: "admin",
          password: "youngriders2025",
          name: "Administrator",
          permissions: [
            "dashboard",
            "orders",
            "rides",
            "albums",
            "products",
            "categories",
            "members",
            "site_settings",
            "site_images",
            "users",
            "whatsapp",
          ],
        },
      ]
      fs.writeFileSync(usersPath, JSON.stringify(defaultUsers, null, 2))
    }

    const usersData = fs.readFileSync(usersPath, "utf8")
    const users = JSON.parse(usersData)

    console.log("Users:", users)

    // Find user
    const user = users.find((u) => u.username === username)

    console.log("Found user:", user)

    // Simple password check
    if (!user || user.password !== password) {
      console.log("Invalid credentials")
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    // Set session cookie
    cookies().set({
      name: "admin_session",
      value: user.id,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    console.log("Login successful")
    return NextResponse.json({
      success: true,
      redirectUrl: "/admin/dashboard",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
