"use server"

import fs from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export type Ride = {
  id: string
  title: string
  date: string
  time: string
  startLocation: string
  distance: string
  description: string
  image: string
  spots: number
  registered: number
  active: boolean
  accessCode?: string
  requireAccessCode?: boolean
}

// Pad naar het JSON-bestand voor opslag
const RIDES_FILE = path.join(process.cwd(), "data", "rides.json")

// Zorg ervoor dat de data directory en bestand bestaan
async function ensureRidesFile() {
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
    await fs.access(RIDES_FILE)
  } catch (error) {
    // Als het bestand niet bestaat, maak een nieuw bestand met een lege array
    console.log("Rides.json bestand bestaat niet, wordt aangemaakt...")
    await fs.writeFile(RIDES_FILE, JSON.stringify([]), "utf8")
  }
}

// Haal alle ritten op
export async function getAllRides(): Promise<Ride[]> {
  try {
    await ensureRidesFile()

    const data = await fs.readFile(RIDES_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Fout bij het ophalen van ritten:", error)
    return []
  }
}

// Haal een specifieke rit op basis van ID
export async function getRideById(id: string): Promise<Ride | null> {
  try {
    const rides = await getAllRides()
    const ride = rides.find((ride) => ride.id === id)
    return ride || null
  } catch (error) {
    console.error(`Fout bij het ophalen van rit met ID ${id}:`, error)
    return null
  }
}

// Voeg een nieuwe rit toe
export async function createRide(rideData: Omit<Ride, "id" | "registered">): Promise<Ride> {
  try {
    await ensureRidesFile()

    const rides = await getAllRides()

    const newRide: Ride = {
      ...rideData,
      id: uuidv4(),
      registered: 0,
    }

    rides.push(newRide)

    await fs.writeFile(RIDES_FILE, JSON.stringify(rides, null, 2), "utf8")

    return newRide
  } catch (error) {
    console.error("Fout bij het toevoegen van rit:", error)
    throw error
  }
}

// Update een bestaande rit
export async function updateRide(id: string, rideData: Partial<Ride>): Promise<Ride | null> {
  try {
    await ensureRidesFile()

    const rides = await getAllRides()

    const rideIndex = rides.findIndex((ride) => ride.id === id)

    if (rideIndex === -1) {
      return null
    }

    const updatedRide: Ride = {
      ...rides[rideIndex],
      ...rideData,
    }

    rides[rideIndex] = updatedRide

    await fs.writeFile(RIDES_FILE, JSON.stringify(rides, null, 2), "utf8")

    return updatedRide
  } catch (error) {
    console.error(`Fout bij het updaten van rit met ID ${id}:`, error)
    throw error
  }
}

// Verwijder een rit
export async function deleteRide(id: string): Promise<boolean> {
  try {
    await ensureRidesFile()

    const rides = await getAllRides()

    const filteredRides = rides.filter((ride) => ride.id !== id)

    if (filteredRides.length === rides.length) {
      return false
    }

    await fs.writeFile(RIDES_FILE, JSON.stringify(filteredRides, null, 2), "utf8")

    return true
  } catch (error) {
    console.error(`Fout bij het verwijderen van rit met ID ${id}:`, error)
    throw error
  }
}

// Registreer een deelnemer voor een rit
export async function registerParticipant(rideId: string): Promise<Ride | null> {
  try {
    await ensureRidesFile()

    const rides = await getAllRides()

    const rideIndex = rides.findIndex((ride) => ride.id === rideId)

    if (rideIndex === -1) {
      return null
    }

    rides[rideIndex].registered = (rides[rideIndex].registered || 0) + 1

    await fs.writeFile(RIDES_FILE, JSON.stringify(rides, null, 2), "utf8")

    return rides[rideIndex]
  } catch (error) {
    console.error(`Fout bij het registreren van deelnemer voor rit met ID ${rideId}:`, error)
    throw error
  }
}

// Valideer de toegangscode voor een rit
export async function validateAccessCode(rideId: string, accessCode: string): Promise<boolean> {
  try {
    const ride = await getRideById(rideId)

    if (!ride) {
      return false
    }

    return ride.accessCode === accessCode
  } catch (error) {
    console.error(`Fout bij het valideren van toegangscode voor rit met ID ${rideId}:`, error)
    return false
  }
}

// Haal alle actieve ritten op
export async function getActiveRides(): Promise<Ride[]> {
  try {
    const rides = await getAllRides()
    return rides.filter((ride) => ride.active)
  } catch (error) {
    console.error("Fout bij het ophalen van actieve ritten:", error)
    return []
  }
}

// Add this function to get upcoming rides
export async function getUpcomingRides(limit?: number) {
  const rides = await getAllRides()

  // Filter for upcoming rides (today or in the future)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingRides = rides
    .filter((ride) => new Date(ride.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Return all or limited number
  return limit ? upcomingRides.slice(0, limit) : upcomingRides
}
