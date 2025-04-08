"use server"

import fs from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"

// User model
export type User = {
  id: string
  username: string
  passwordHash: string
  permissions: string[]
  createdAt: string
  lastLogin?: string
}

// User with password for creation
export type UserWithPassword = Omit<User, "passwordHash"> & {
  password: string
}

// User without sensitive data for client
export type SafeUser = Omit<User, "passwordHash">

// Available permissions
export const availablePermissions = [
  { id: "dashboard", label: "Dashboard" },
  { id: "orders", label: "Bestellingen" },
  { id: "rides", label: "Ritten" },
  { id: "albums", label: "Albums" },
  { id: "products", label: "Producten" },
  { id: "categories", label: "Categorieën" },
  { id: "members", label: "Leden" },
  { id: "site_settings", label: "Site Instellingen" },
  { id: "site_images", label: "Site Afbeeldingen" },
  { id: "users", label: "Gebruikers" },
  { id: "whatsapp", label: "WhatsApp" },
]

// Path to the JSON file for storage
const DATA_FILE = path.join(process.cwd(), "data", "users.json")

// Ensure the data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), "data")
  try {
    await fs.access(dataDir)
  } catch (error) {
    // If the directory doesn't exist, create it
    console.log("Data directory doesn't exist, creating...")
    await fs.mkdir(dataDir, { recursive: true })
  }

  // Check if the file exists, if not, create it
  try {
    await fs.access(DATA_FILE)
  } catch (error) {
    // If the file doesn't exist, create a new file with an empty array
    console.log("users.json file doesn't exist, creating...")

    // Create default admin user
    const defaultAdmin: User = {
      id: uuidv4(),
      username: "admin",
      passwordHash: await bcrypt.hash("youngriders2025", 10),
      permissions: availablePermissions.map((p) => p.id),
      createdAt: new Date().toISOString(),
    }

    await fs.writeFile(DATA_FILE, JSON.stringify([defaultAdmin]), "utf8")
  }
}

// Get all users
export async function getAllUsers(): Promise<SafeUser[]> {
  try {
    await ensureDataDirectory()

    const data = await fs.readFile(DATA_FILE, "utf8")
    const users: User[] = JSON.parse(data)

    // Remove sensitive data
    return users.map((user) => {
      const { passwordHash, ...safeUser } = user
      return safeUser as SafeUser
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<SafeUser | null> {
  try {
    const users = await getAllUsers()
    const user = users.find((user) => user.id === id)
    return user || null
  } catch (error) {
    console.error("Error fetching user by ID:", error)
    return null
  }
}

// Get user by username (with password for auth)
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    await ensureDataDirectory()

    const data = await fs.readFile(DATA_FILE, "utf8")
    const users: User[] = JSON.parse(data)

    return users.find((user) => user.username.toLowerCase() === username.toLowerCase()) || null
  } catch (error) {
    console.error("Error fetching user by username:", error)
    return null
  }
}

// Create a new user
export async function createUser(userData: UserWithPassword): Promise<SafeUser | null> {
  try {
    await ensureDataDirectory()

    // Get existing users
    const data = await fs.readFile(DATA_FILE, "utf8")
    const users: User[] = JSON.parse(data)

    // Check if username already exists
    if (users.some((user) => user.username.toLowerCase() === userData.username.toLowerCase())) {
      throw new Error("Username already exists")
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(userData.password, 10)

    // Create new user
    const newUser: User = {
      id: uuidv4(),
      username: userData.username,
      passwordHash,
      permissions: userData.permissions,
      createdAt: new Date().toISOString(),
    }

    // Add to users array
    users.push(newUser)

    // Write back to file
    await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), "utf8")

    // Return safe user object
    const { passwordHash: _, ...safeUser } = newUser
    return safeUser as SafeUser
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

// Update a user
export async function updateUser(id: string, userData: Partial<UserWithPassword>): Promise<SafeUser | null> {
  try {
    await ensureDataDirectory()

    // Get existing users
    const data = await fs.readFile(DATA_FILE, "utf8")
    const users: User[] = JSON.parse(data)

    // Find user index
    const userIndex = users.findIndex((user) => user.id === id)

    if (userIndex === -1) {
      throw new Error("User not found")
    }

    // Check if updating username and it already exists
    if (
      userData.username &&
      userData.username !== users[userIndex].username &&
      users.some((user) => user.username.toLowerCase() === userData.username!.toLowerCase())
    ) {
      throw new Error("Username already exists")
    }

    // Update user
    const updatedUser: User = { ...users[userIndex] }

    if (userData.username) updatedUser.username = userData.username
    if (userData.permissions) updatedUser.permissions = userData.permissions

    // Update password if provided
    if (userData.password) {
      updatedUser.passwordHash = await bcrypt.hash(userData.password, 10)
    }

    // Update in array
    users[userIndex] = updatedUser

    // Write back to file
    await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), "utf8")

    // Return safe user object
    const { passwordHash, ...safeUser } = updatedUser
    return safeUser as SafeUser
  } catch (error) {
    console.error("Error updating user:", error)
    return null
  }
}

// Delete a user
export async function deleteUser(id: string): Promise<boolean> {
  try {
    await ensureDataDirectory()

    // Get existing users
    const data = await fs.readFile(DATA_FILE, "utf8")
    const users: User[] = JSON.parse(data)

    // Filter out the user to delete
    const filteredUsers = users.filter((user) => user.id !== id)

    // Check if any user was removed
    if (filteredUsers.length === users.length) {
      return false // No user was removed
    }

    // Write back to file
    await fs.writeFile(DATA_FILE, JSON.stringify(filteredUsers, null, 2), "utf8")

    return true
  } catch (error) {
    console.error("Error deleting user:", error)
    return false
  }
}

// Update last login time
export async function updateLastLogin(id: string): Promise<boolean> {
  try {
    await ensureDataDirectory()

    // Get existing users
    const data = await fs.readFile(DATA_FILE, "utf8")
    const users: User[] = JSON.parse(data)

    // Find user index
    const userIndex = users.findIndex((user) => user.id === id)

    if (userIndex === -1) {
      return false
    }

    // Update last login
    users[userIndex].lastLogin = new Date().toISOString()

    // Write back to file
    await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), "utf8")

    return true
  } catch (error) {
    console.error("Error updating last login:", error)
    return false
  }
}

// Verify user credentials
export async function verifyCredentials(username: string, password: string): Promise<SafeUser | null> {
  try {
    const user = await getUserByUsername(username)

    if (!user) {
      return null
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)

    if (!passwordMatch) {
      return null
    }

    // Update last login
    await updateLastLogin(user.id)

    // Return safe user object
    const { passwordHash, ...safeUser } = user
    return safeUser as SafeUser
  } catch (error) {
    console.error("Error verifying credentials:", error)
    return null
  }
}

// Check if user has permission
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  try {
    const user = await getUserById(userId)

    if (!user) {
      return false
    }

    return user.permissions.includes(permission)
  } catch (error) {
    console.error("Error checking permission:", error)
    return false
  }
}

// Initialize the database
export async function initUserDatabase(): Promise<void> {
  await ensureDataDirectory()
}
