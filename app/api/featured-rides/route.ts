import { NextResponse } from "next/server"
import { getActiveRides } from "@/lib/db-rides"

export async function GET() {
  try {
    // Get all active rides
    const allRides = await getActiveRides()

    // Sort by date (upcoming first)
    const sortedRides = allRides.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

    // Filter to only include upcoming rides
    const now = new Date()
    const upcomingRides = sortedRides.filter((ride) => {
      const rideDate = new Date(ride.date)
      return rideDate >= now
    })

    // Return the 3 most upcoming rides
    return NextResponse.json(upcomingRides.slice(0, 3), { status: 200 })
  } catch (error) {
    console.error("Error fetching featured rides:", error)
    return NextResponse.json({ error: "Failed to fetch featured rides" }, { status: 500 })
  }
}
