import { NextResponse } from "next/server"
import { getActiveRides } from "@/lib/db-rides"

export async function GET() {
  try {
    const rides = await getActiveRides()

    // Sort rides by date (most recent first)
    rides.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Limit to 3 rides
    return NextResponse.json(rides.slice(0, 3))
  } catch (error) {
    console.error("Error fetching active rides:", error)
    return NextResponse.json({ error: "Failed to fetch rides" }, { status: 500 })
  }
}
