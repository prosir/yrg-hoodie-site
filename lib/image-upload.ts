import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

// Functie om een base64 afbeelding op te slaan
export async function saveBase64Image(base64Image: string): Promise<string> {
  try {
    // Controleer of het een base64 string is
    if (!base64Image.startsWith("data:image/")) {
      throw new Error("Ongeldige afbeelding")
    }

    // Haal het bestandstype uit de base64 string
    const matches = base64Image.match(/^data:image\/([a-zA-Z0-9]+);base64,/)
    if (!matches || matches.length !== 2) {
      throw new Error("Ongeldig afbeeldingsformaat")
    }

    const fileType = matches[1]
    const base64Data = base64Image.replace(/^data:image\/[a-zA-Z0-9]+;base64,/, "")
    const buffer = Buffer.from(base64Data, "base64")

    // Maak een unieke bestandsnaam
    const fileName = `${uuidv4()}.${fileType}`

    // Zorg ervoor dat de map bestaat
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Sla het bestand op
    const filePath = path.join(uploadDir, fileName)
    fs.writeFileSync(filePath, buffer)

    // Geef de URL terug
    return `/uploads/${fileName}`
  } catch (error) {
    console.error("Error saving image:", error)
    throw error
  }
}

