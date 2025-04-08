import { type NextRequest, NextResponse } from "next/server"
import { getRideById, registerParticipant, validateAccessCode } from "@/lib/db-rides"
import { saveParticipant } from "@/lib/db-participants"

// POST /api/rides/[id]/register - Registreer een deelnemer voor een rit
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rideId = params.id

    // Controleer of de rit bestaat
    const ride = await getRideById(rideId)
    if (!ride) {
      return NextResponse.json({ message: "Rit niet gevonden" }, { status: 404 })
    }

    // Controleer of er nog plekken beschikbaar zijn
    if (ride.registered >= ride.spots) {
      return NextResponse.json({ message: "Deze rit is vol" }, { status: 400 })
    }

    // Haal de deelnemergegevens op uit de request
    const participantData = await request.json()

    // Valideer de verplichte velden
    if (
      !participantData.firstName ||
      !participantData.lastName ||
      !participantData.email ||
      !participantData.phone ||
      !participantData.motorcycle
    ) {
      return NextResponse.json({ message: "Vul alle verplichte velden in" }, { status: 400 })
    }

    // Controleer de toegangscode als die vereist is
    if (ride.requireAccessCode) {
      const accessCode = participantData.accessCode

      if (!accessCode) {
        return NextResponse.json({ message: "Toegangscode is vereist voor deze rit" }, { status: 400 })
      }

      const isValidCode = await validateAccessCode(rideId, accessCode)

      if (!isValidCode) {
        return NextResponse.json({ message: "Ongeldige toegangscode" }, { status: 400 })
      }

      // Verwijder de toegangscode uit de data voordat we deze opslaan
      delete participantData.accessCode
    }

    // Sla de deelnemer op
    await saveParticipant(rideId, participantData)

    // Update het aantal aanmeldingen voor de rit
    const updatedRide = await registerParticipant(rideId)
    if (!updatedRide) {
      return NextResponse.json({ message: "Kon de rit niet bijwerken" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Aanmelding succesvol",
      ride: updatedRide,
    })
  } catch (error) {
    console.error("Fout bij het registreren van deelnemer:", error)
    return NextResponse.json({ message: "Er is een fout opgetreden bij het aanmelden" }, { status: 500 })
  }
}
