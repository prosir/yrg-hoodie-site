import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: Request) {
  try {
    const ridesPath = path.join(process.cwd(), "data", "rides.json")

    if (!fs.existsSync(ridesPath)) {
      return NextResponse.json([])
    }

    const ridesData = fs.readFileSync(ridesPath, "utf8")
    const rides = JSON.parse(ridesData)

    // Filter active rides and sort by date (upcoming first)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const upcomingRides = rides
      .filter((ride) => new Date(ride.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3)

    return NextResponse.json(upcomingRides)
  } catch (error) {
    console.error("Error fetching featured rides:", error)
    return NextResponse.json({ error: "Failed to fetch featured rides" }, { status: 500 })
  }
}
