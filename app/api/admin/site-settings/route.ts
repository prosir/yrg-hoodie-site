import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// In-memory opslag voor site-instellingen
// Dit is niet ideaal voor productie, maar werkt als tijdelijke oplossing
const siteConfig = {
  maintenanceMode: false,
  shopClosed: false,
  maintenancePassword: "youngriders2025",
}

// GET route om de huidige site-instellingen op te halen
export async function GET() {
  try {
    // Verwijder het wachtwoord uit de response voor veiligheid
    const safeConfig = {
      maintenanceMode: siteConfig.maintenanceMode,
      shopClosed: siteConfig.shopClosed,
    }

    return NextResponse.json(safeConfig)
  } catch (error) {
    console.error("Error fetching site config:", error)
    return NextResponse.json({ error: "Failed to fetch site configuration" }, { status: 500 })
  }
}

// POST route om site-instellingen bij te werken
export async function POST(request: NextRequest) {
  try {
    const { action, value } = await request.json()

    if (!action) {
      return NextResponse.json({ error: "Missing required field: action" }, { status: 400 })
    }

    switch (action) {
      case "setMaintenanceMode":
        if (typeof value !== "boolean") {
          return NextResponse.json({ error: "Value must be a boolean for setMaintenanceMode" }, { status: 400 })
        }
        siteConfig.maintenanceMode = value
        break

      case "setShopClosed":
        if (typeof value !== "boolean") {
          return NextResponse.json({ error: "Value must be a boolean for setShopClosed" }, { status: 400 })
        }
        siteConfig.shopClosed = value
        break

      case "updateMaintenancePassword":
        if (typeof value !== "string" || !value) {
          return NextResponse.json(
            { error: "Value must be a non-empty string for updateMaintenancePassword" },
            { status: 400 },
          )
        }
        siteConfig.maintenancePassword = value
        break

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }

    // Verwijder het wachtwoord uit de response voor veiligheid
    const safeResult = {
      maintenanceMode: siteConfig.maintenanceMode,
      shopClosed: siteConfig.shopClosed,
    }

    return NextResponse.json(safeResult)
  } catch (error) {
    console.error("Error updating site config:", error)
    return NextResponse.json({ error: "Failed to update site configuration" }, { status: 500 })
  }
}
