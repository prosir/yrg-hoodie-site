import { type NextRequest, NextResponse } from "next/server"
import { saveBase64Image } from "@/lib/image-upload"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "rides"

    if (!file) {
      return NextResponse.json({ error: "Geen bestand gevonden" }, { status: 400 })
    }

    // Converteer het bestand naar base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

    // Sla de afbeelding op
    const imageUrl = await saveBase64Image(base64, folder)

    return NextResponse.json({ url: imageUrl })
  } catch (error) {
    console.error("Fout bij het uploaden van de afbeelding:", error)
    return NextResponse.json({ error: "Er is een fout opgetreden bij het uploaden van de afbeelding" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
