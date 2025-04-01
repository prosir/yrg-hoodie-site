import { getSiteConfig } from "@/lib/site-config"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  try {
    const config = await getSiteConfig()

    if (password === config.maintenancePassword) {
      // Maak een response met een cookie
      const response = NextResponse.json({ success: true })

      // Voeg de bypass cookie toe
      response.cookies.set("maintenance_bypass", "true", {
        path: "/",
        maxAge: 60 * 60, // 1 uur
        httpOnly: true,
        sameSite: "strict",
      })

      return response
    } else {
      return NextResponse.json({ success: false })
    }
  } catch (error) {
    console.error("Error validating maintenance password:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

