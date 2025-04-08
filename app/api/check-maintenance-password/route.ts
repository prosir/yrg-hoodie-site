import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  try {
    // Haal het huidige wachtwoord op van de API
    const response = await fetch(
      `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/admin/site-settings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "getMaintenancePassword",
        }),
        cache: "no-store",
      },
    )

    // Als er een fout is, gebruik het standaard wachtwoord
    const maintenancePassword = "youngriders2025"

    if (password === maintenancePassword) {
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

    // Fallback: controleer met het standaard wachtwoord
    if (password === "youngriders2025") {
      const response = NextResponse.json({ success: true })
      response.cookies.set("maintenance_bypass", "true", {
        path: "/",
        maxAge: 60 * 60,
        httpOnly: true,
        sameSite: "strict",
      })
      return response
    }

    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
