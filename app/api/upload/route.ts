import { type NextRequest, NextResponse } from "next/server"
import { saveBase64Image } from "@/lib/image-upload"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Geen bestand geüpload" }, { status: 400 })
    }

    // Controleer bestandstype
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Alleen afbeeldingen zijn toegestaan" }, { status: 400 })
    }

    // Lees het bestand als ArrayBuffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Converteer naar base64
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

    // Sla de afbeelding op
    const imageUrl = await saveBase64Image(base64)

    return NextResponse.json({ url: imageUrl })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Er is een fout opgetreden bij het uploaden van de afbeelding" }, { status: 500 })
  }
}

