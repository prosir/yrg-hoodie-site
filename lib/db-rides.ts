import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { deleteParticipantsByRideId } from "./db-participants"

// Definieer het type voor een rit
export interface Ride {
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

// Pad naar het JSON-bestand
const ridesFilePath = path.join(process.cwd(), "data", "rides.json")

// Functie om alle ritten op te halen
export async function getAllRides(): Promise<Ride[]> {
  try {
    // Controleer of het bestand bestaat, zo niet, maak het aan
    if (!fs.existsSync(ridesFilePath)) {
      fs.writeFileSync(ridesFilePath, JSON.stringify([]))
      return []
    }

    // Lees het bestand
    const data = fs.readFileSync(ridesFilePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Fout bij het ophalen van ritten:", error)
    return []
  }
}

// Functie om actieve ritten op te halen
export async function getActiveRides(): Promise<Ride[]> {
  const rides = await getAllRides()
  return rides.filter((ride) => ride.active)
}

// Functie om een rit op te halen op basis van ID
export async function getRideById(id: string): Promise<Ride | null> {
  const rides = await getAllRides()
  return rides.find((ride) => ride.id === id) || null
}

// Functie om een nieuwe rit aan te maken
export async function createRide(rideData: Omit<Ride, "id" | "registered">): Promise<Ride> {
  const rides = await getAllRides()

  const newRide: Ride = {
    id: uuidv4(),
    ...rideData,
    registered: 0,
  }

  rides.push(newRide)

  // Schrijf de bijgewerkte lijst terug naar het bestand
  fs.writeFileSync(ridesFilePath, JSON.stringify(rides, null, 2))

  return newRide
}

// Functie om een rit bij te werken
export async function updateRide(id: string, rideData: Partial<Ride>): Promise<Ride | null> {
  const rides = await getAllRides()

  const index = rides.findIndex((ride) => ride.id === id)
  if (index === -1) return null

  rides[index] = { ...rides[index], ...rideData }

  // Schrijf de bijgewerkte lijst terug naar het bestand
  fs.writeFileSync(ridesFilePath, JSON.stringify(rides, null, 2))

  return rides[index]
}

// Functie om een rit te verwijderen
export async function deleteRide(id: string): Promise<boolean> {
  const rides = await getAllRides()

  const filteredRides = rides.filter((ride) => ride.id !== id)

  if (filteredRides.length === rides.length) return false

  // Verwijder ook alle deelnemers voor deze rit
  await deleteParticipantsByRideId(id)

  // Schrijf de bijgewerkte lijst terug naar het bestand
  fs.writeFileSync(ridesFilePath, JSON.stringify(filteredRides, null, 2))

  return true
}

// Functie om een deelnemer toe te voegen aan een rit
export async function registerParticipant(rideId: string): Promise<Ride | null> {
  const rides = await getAllRides()

  const index = rides.findIndex((ride) => ride.id === rideId)
  if (index === -1) return null

  // Controleer of er nog plekken beschikbaar zijn
  if (rides[index].registered >= rides[index].spots) return null

  rides[index].registered += 1

  // Schrijf de bijgewerkte lijst terug naar het bestand
  fs.writeFileSync(ridesFilePath, JSON.stringify(rides, null, 2))

  return rides[index]
}

// Functie om te controleren of een toegangscode geldig is
export async function validateAccessCode(rideId: string, code: string): Promise<boolean> {
  const ride = await getRideById(rideId)

  if (!ride) return false
  if (!ride.requireAccessCode) return true

  return ride.accessCode === code
}

