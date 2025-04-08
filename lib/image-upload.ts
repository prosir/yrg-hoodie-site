"use server"

import fs from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

async function saveBase64Image(base64String: string, folder: string): Promise<string> {
  try {
    // Extract base64 data en bestands type
    const base64Data = base64String.split(",")[1]
    const fileType = base64String.split(";")[0].split(":")[1]

    // Genereer een unieke bestandsnaam
    const filename = `${uuidv4()}.${fileType.split("/")[1]}`

    // Definieer het uploadpad
    const uploadPath = path.join(process.cwd(), "public", "uploads", folder, filename)

    // Zorg ervoor dat de directory bestaat
    const uploadDir = path.dirname(uploadPath)
    try {
      await fs.access(uploadDir)
    } catch (error) {
      await fs.mkdir(uploadDir, { recursive: true })
    }

    // Schrijf het bestand
    const buffer = Buffer.from(base64Data, "base64")
    await fs.writeFile(uploadPath, buffer)

    // Retourneer het pad naar het bestand
    return `/uploads/${folder}/${filename}`
  } catch (error) {
    console.error("Fout bij het opslaan van de base64 afbeelding:", error)
    throw new Error("Fout bij het opslaan van de base64 afbeelding")
  }
}

export { saveBase64Image }
