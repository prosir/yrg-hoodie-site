import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

// Definieer het type voor een deelnemer
export interface Participant {
  id: string
  rideId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  motorcycle: string
  comments?: string
  registeredAt: string
}

// Pad naar het JSON-bestand
const participantsFilePath = path.join(process.cwd(), "data", "participants.json")

// Functie om alle deelnemers op te halen
export async function getAllParticipants(): Promise<Participant[]> {
  try {
    // Controleer of het bestand bestaat, zo niet, maak het aan
    if (!fs.existsSync(participantsFilePath)) {
      fs.writeFileSync(participantsFilePath, JSON.stringify([]))
      return []
    }

    // Lees het bestand
    const data = fs.readFileSync(participantsFilePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Fout bij het ophalen van deelnemers:", error)
    return []
  }
}

// Functie om deelnemers voor een specifieke rit op te halen
export async function getParticipantsByRideId(rideId: string): Promise<Participant[]> {
  const participants = await getAllParticipants()
  return participants.filter((participant) => participant.rideId === rideId)
}

// Functie om een deelnemer op te slaan
export async function saveParticipant(
  rideId: string,
  participantData: Omit<Participant, "id" | "rideId" | "registeredAt">,
): Promise<Participant> {
  const participants = await getAllParticipants()

  const newParticipant: Participant = {
    id: uuidv4(),
    rideId,
    ...participantData,
    registeredAt: new Date().toISOString(),
  }

  participants.push(newParticipant)

  // Schrijf de bijgewerkte lijst terug naar het bestand
  fs.writeFileSync(participantsFilePath, JSON.stringify(participants, null, 2))

  return newParticipant
}

// Functie om een deelnemer te verwijderen
export async function deleteParticipant(id: string): Promise<boolean> {
  const participants = await getAllParticipants()

  const filteredParticipants = participants.filter((participant) => participant.id !== id)

  if (filteredParticipants.length === participants.length) return false

  // Schrijf de bijgewerkte lijst terug naar het bestand
  fs.writeFileSync(participantsFilePath, JSON.stringify(filteredParticipants, null, 2))

  return true
}

// Functie om alle deelnemers voor een rit te verwijderen
export async function deleteParticipantsByRideId(rideId: string): Promise<number> {
  const participants = await getAllParticipants()

  const initialCount = participants.length
  const filteredParticipants = participants.filter((participant) => participant.rideId !== rideId)
  const deletedCount = initialCount - filteredParticipants.length

  // Schrijf de bijgewerkte lijst terug naar het bestand
  fs.writeFileSync(participantsFilePath, JSON.stringify(filteredParticipants, null, 2))

  return deletedCount
}

