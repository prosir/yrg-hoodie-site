"use server"

import fs from "fs/promises"
import path from "path"

export type User = {
  id: string
  username: string
  passwordHash: string
  name: string
  permissions: string[]
}

// Pad naar het JSON-bestand voor opslag
const USERS_FILE = path.join(process.cwd(), "data", "users.json")

// Zorg ervoor dat de data directory en bestand bestaan
async function ensureUsersFile() {
  const dataDir = path.join(process.cwd(), "data")
  try {
    await fs.access(dataDir)
  } catch (error) {
    // Als de directory niet bestaat, maak deze aan
    console.log("Data directory bestaat niet, wordt aangemaakt...")
    await fs.mkdir(dataDir, { recursive: true })
  }

  // Controleer of het bestand bestaat, zo niet, maak het aan
  try {
    await fs.access(USERS_FILE)
  } catch (error) {
    // Als het bestand niet bestaat, maak een nieuw bestand met een lege array
    console.log("Users.json bestand bestaat niet, wordt aangemaakt...")
    await fs.writeFile(USERS_FILE, JSON.stringify([]), "utf8")
  }
}

// Lees alle gebruikers uit het bestand
async function getAllUsers(): Promise<User[]> {
  try {
    await ensureUsersFile()

    const data = await fs.readFile(USERS_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Fout bij het ophalen van gebruikers:", error)
    return []
  }
}

// Haal een specifieke gebruiker op basis van ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const users = await getAllUsers()
    const user = users.find((user) => user.id === id)
    return user || null
  } catch (error) {
    console.error(`Fout bij het ophalen van gebruiker met ID ${id}:`, error)
    return null
  }
}

// Haal een specifieke gebruiker op basis van username
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const users = await getAllUsers()
    const user = users.find((user) => user.username === username)
    return user || null
  } catch (error) {
    console.error(`Fout bij het ophalen van gebruiker met username ${username}:`, error)
    return null
  }
}
