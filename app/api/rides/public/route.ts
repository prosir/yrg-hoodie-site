import { NextResponse } from "next/server"
import { getActiveRides } from "@/lib/db-rides"

// GET /api/rides/public - Haal alle actieve ritten op voor de publieke website
export async function GET() {
  try {
    const rides = await getActiveRides()

    // Sorteer ritten op datum (oplopend)
    rides.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json(rides)
  } catch (error) {
    console.error("Fout bij het ophalen van publieke ritten:", error)
    return NextResponse.json({ message: "Er is een fout opgetreden bij het ophalen van de ritten" }, { status: 500 })
  }
}

