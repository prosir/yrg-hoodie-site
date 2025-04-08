import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// Path to users.json
const usersPath = path.join(process.cwd(), "data", "users.json")

// Helper to read users
function getUsers() {
  try {
    const data = fs.readFileSync(usersPath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Error reading users:", error)
    return []
  }
}

// Helper to write users
function saveUsers(users: any[]) {
  try {
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf8")
    return true
  } catch (error) {
    console.error("Error saving users:", error)
    return false
  }
}

// GET all users
export async function GET() {
  try {
    const users = getUsers()

    // Remove passwords before sending
    const safeUsers = users.map((user: any) => {
      const { password, ...safeUser } = user
      return safeUser
    })

    return NextResponse.json(safeUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// POST new user
export async function POST(request: Request) {
  try {
    const userData = await request.json()

    // Validate required fields
    if (!userData.username || !userData.password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const users = getUsers()

    // Check if username already exists
    if (users.some((u: any) => u.username === userData.username)) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username: userData.username,
      password: userData.password, // In production, hash this password
      name: userData.name || userData.username,
      permissions: userData.permissions || [],
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)

    if (saveUsers(users)) {
      // Remove password before sending response
      const { password, ...safeUser } = newUser
      return NextResponse.json(safeUser, { status: 201 })
    } else {
      return NextResponse.json({ error: "Failed to save user" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
