import { getSiteConfig } from "@/lib/site-config"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const config = await getSiteConfig()

    // Stuur alleen de status informatie, niet het wachtwoord
    return NextResponse.json({
      maintenanceMode: config.maintenanceMode,
      shopClosed: config.shopClosed,
    })
  } catch (error) {
    console.error("Error fetching site status:", error)
    return NextResponse.json({ error: "Failed to fetch site status" }, { status: 500 })
  }
}

