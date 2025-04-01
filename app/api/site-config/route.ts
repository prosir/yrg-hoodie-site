import { getSiteConfig } from "@/lib/site-config"
import { NextResponse } from "next/server"

// API route om de site configuratie op te halen
export async function GET() {
  try {
    const config = await getSiteConfig()

    // Verwijder het wachtwoord uit de response voor veiligheid
    const safeConfig = {
      maintenanceMode: config.maintenanceMode,
      shopClosed: config.shopClosed,
    }

    return NextResponse.json(safeConfig)
  } catch (error) {
    console.error("Error fetching site config:", error)
    return NextResponse.json({ error: "Failed to fetch site configuration" }, { status: 500 })
  }
}

