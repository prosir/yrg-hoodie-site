import { type NextRequest, NextResponse } from "next/server"
import { getAllRides, createRide, updateRide, deleteRide, getRideById } from "@/lib/db-rides"

// GET /api/rides - Haal alle ritten op
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      const ride = await getRideById(id)
      if (!ride) {
        return NextResponse.json({ message: "Rit niet gevonden" }, { status: 404 })
      }
      return NextResponse.json(ride)
    }

    const rides = await getAllRides()
    return NextResponse.json(rides)
  } catch (error) {
    console.error("Error fetching rides:", error)
    return NextResponse.json({ message: "Er is een fout opgetreden bij het ophalen van de ritten" }, { status: 500 })
  }
}

// POST /api/rides - Maak een nieuwe rit aan
export async function POST(request: NextRequest) {
  try {
    const rideData = await request.json()

    // Valideer de verplichte velden
    if (!rideData.title || !rideData.date || !rideData.time || !rideData.startLocation || !rideData.distance) {
      return NextResponse.json({ message: "Vul alle verplichte velden in" }, { status: 400 })
    }

    // Zorg ervoor dat spots een nummer is
    if (rideData.spots) {
      rideData.spots = Number.parseInt(rideData.spots)
    }

    // Zet active standaard op true als het niet is meegegeven
    if (rideData.active === undefined) {
      rideData.active = true
    }

    const newRide = await createRide(rideData)

    return NextResponse.json(newRide, { status: 201 })
  } catch (error) {
    console.error("Error creating ride:", error)
    return NextResponse.json({ message: "Er is een fout opgetreden bij het aanmaken van de rit" }, { status: 500 })
  }
}

// PUT /api/rides - Werk een rit bij
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ message: "Rit ID is vereist" }, { status: 400 })
    }

    const rideData = await request.json()

    // Zorg ervoor dat spots een nummer is als het is meegegeven
    if (rideData.spots !== undefined) {
      rideData.spots = Number.parseInt(rideData.spots)
    }

    const updatedRide = await updateRide(id, rideData)

    if (!updatedRide) {
      return NextResponse.json({ message: "Rit niet gevonden" }, { status: 404 })
    }

    return NextResponse.json(updatedRide)
  } catch (error) {
    console.error("Error updating ride:", error)
    return NextResponse.json({ message: "Er is een fout opgetreden bij het bijwerken van de rit" }, { status: 500 })
  }
}

// DELETE /api/rides - Verwijder een rit
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ message: "Rit ID is vereist" }, { status: 400 })
    }

    const success = await deleteRide(id)

    if (!success) {
      return NextResponse.json({ message: "Rit niet gevonden" }, { status: 404 })
    }

    return NextResponse.json({ message: "Rit succesvol verwijderd" })
  } catch (error) {
    console.error("Error deleting ride:", error)
    return NextResponse.json({ message: "Er is een fout opgetreden bij het verwijderen van de rit" }, { status: 500 })
  }
}
