"use server"

import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

// Functie om een base64 afbeelding op te slaan
export async function saveBase64Image(base64Image: string, folder = "rides"): Promise<string> {
  try {
    // Verwijder het "data:image/..." deel van de base64 string
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "")

    // Genereer een unieke bestandsnaam
    const fileName = `${uuidv4()}.jpg`

    // Maak het pad naar de map waar de afbeelding moet worden opgeslagen
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder)

    // Zorg ervoor dat de map bestaat
    await mkdir(uploadDir, { recursive: true })

    // Sla de afbeelding op
    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, Buffer.from(base64Data, "base64"))

    // Geef het pad terug dat in de frontend kan worden gebruikt
    return `/uploads/${folder}/${fileName}`
  } catch (error) {
    console.error("Fout bij het opslaan van de afbeelding:", error)
    throw new Error("Kon de afbeelding niet opslaan")
  }
}

// Functie om een afbeelding te verwijderen
export async function deleteImage(imagePath: string): Promise<void> {
  try {
    // Verwijder het eerste "/" karakter als dat aanwezig is
    const normalizedPath = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath

    // Maak het volledige pad naar de afbeelding
    const fullPath = path.join(process.cwd(), "public", normalizedPath)

    // Controleer of het bestand bestaat
    const { access, unlink } = await import("fs/promises")
    await access(fullPath)

    // Verwijder het bestand
    await unlink(fullPath)
  } catch (error) {
    console.error(`Fout bij het verwijderen van afbeelding ${imagePath}:`, error)
    throw new Error("Kon de afbeelding niet verwijderen")
  }
}

