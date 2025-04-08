import { type NextRequest, NextResponse } from "next/server"
import { updateHomeHeroImage, updateContactHeroImage, updateLogoPath } from "@/lib/site-config"

export async function POST(request: NextRequest) {
  try {
    const { homeHeroImage, contactHeroImage, logoPath } = await request.json()

    // Update home hero image if provided
    if (homeHeroImage) {
      await updateHomeHeroImage(homeHeroImage)
    }

    // Update contact hero image if provided
    if (contactHeroImage) {
      await updateContactHeroImage(contactHeroImage)
    }

    // Update logo path if provided
    if (logoPath) {
      await updateLogoPath(logoPath)
    }

    return NextResponse.json({
      success: true,
      message: "Site images updated successfully",
    })
  } catch (error) {
    console.error("Error updating site images:", error)
    return NextResponse.json({ error: "Failed to update site images" }, { status: 500 })
  }
}
