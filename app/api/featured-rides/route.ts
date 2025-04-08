import { NextResponse } from "next/server"
import { getAllRides } from "@/lib/db-rides"

export async function GET() {
  try {
    // Get all rides
    const allRides = await getAllRides()

    // Get current date
    const currentDate = new Date()

    // Filter for upcoming rides
    const upcomingRides = allRides
      .filter((ride) => {
        const rideDate = new Date(ride.date)
        return rideDate >= currentDate
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3)

    return NextResponse.json(upcomingRides)
  } catch (error) {
    console.error("Error fetching featured rides:", error)
    return NextResponse.json({ error: "Failed to fetch featured rides" }, { status: 500 })
  }
}
