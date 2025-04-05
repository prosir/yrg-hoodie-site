import { type NextRequest, NextResponse } from "next/server"
import { getParticipantsByRideId, deleteParticipant } from "@/lib/db-participants"
import { getRideById } from "@/lib/db-rides"

// GET /api/rides/[id]/participants - Haal alle deelnemers voor een rit op
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rideId = params.id

    // Controleer of de rit bestaat
    const ride = await getRideById(rideId)
    if (!ride) {
      return NextResponse.json({ message: "Rit niet gevonden" }, { status: 404 })
    }

    // Haal alle deelnemers op
    const participants = await getParticipantsByRideId(rideId)

    return NextResponse.json(participants)
  } catch (error) {
    console.error("Fout bij het ophalen van deelnemers:", error)
    return NextResponse.json(
      { message: "Er is een fout opgetreden bij het ophalen van de deelnemers" },
      { status: 500 },
    )
  }
}

// DELETE /api/rides/[id]/participants/[participantId] - Verwijder een deelnemer
export async function DELETE(request: NextRequest, { params }: { params: { id: string; participantId: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const participantId = searchParams.get("participantId")

    if (!participantId) {
      return NextResponse.json({ message: "Deelnemer ID is vereist" }, { status: 400 })
    }

    const success = await deleteParticipant(participantId)

    if (!success) {
      return NextResponse.json({ message: "Deelnemer niet gevonden" }, { status: 404 })
    }

    return NextResponse.json({ message: "Deelnemer succesvol verwijderd" })
  } catch (error) {
    console.error("Fout bij het verwijderen van deelnemer:", error)
    return NextResponse.json(
      { message: "Er is een fout opgetreden bij het verwijderen van de deelnemer" },
      { status: 500 },
    )
  }
}

