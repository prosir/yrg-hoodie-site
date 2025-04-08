import { NextResponse } from "next/server"
import { getSiteConfig } from "@/lib/site-config"

export async function GET() {
  try {
    const config = await getSiteConfig()

    return NextResponse.json({
      maintenanceMode: config.maintenanceMode,
      shopClosed: config.shopClosed,
      homeHeroImage: config.homeHeroImage,
      contactHeroImage: config.contactHeroImage,
      logoPath: config.logoPath,
    })
  } catch (error) {
    console.error("Error fetching site config:", error)
    return NextResponse.json({ error: "Failed to fetch site configuration" }, { status: 500 })
  }
}
