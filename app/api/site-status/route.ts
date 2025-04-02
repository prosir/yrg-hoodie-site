import { NextResponse } from "next/server"

// Haal de site-instellingen op van de admin API
export async function GET() {
  try {
    // Interne API-aanroep om de instellingen op te halen
    const response = await fetch(
      `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/admin/site-settings`,
      {
        cache: "no-store",
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch site settings: ${response.status}`)
    }

    const config = await response.json()

    // Stuur alleen de status informatie
    return NextResponse.json({
      maintenanceMode: config.maintenanceMode,
      shopClosed: config.shopClosed,
    })
  } catch (error) {
    console.error("Error fetching site status:", error)
    // Standaard waarden als fallback
    return NextResponse.json({
      maintenanceMode: false,
      shopClosed: false,
      error: "Failed to fetch site status",
    })
  }
}

