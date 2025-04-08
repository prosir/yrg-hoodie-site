import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

// API route om de inhoud van orders.json te bekijken voor debugging
export async function GET() {
  try {
    const dataFile = path.join(process.cwd(), "data", "orders.json")

    // Controleer of het bestand bestaat
    try {
      await fs.access(dataFile)
    } catch (error) {
      return NextResponse.json(
        {
          error: "Bestand bestaat niet",
          path: dataFile,
          cwd: process.cwd(),
        },
        { status: 404 },
      )
    }

    // Lees de inhoud van het bestand
    const data = await fs.readFile(dataFile, "utf8")
    let orders = []

    try {
      orders = JSON.parse(data)
    } catch (error) {
      return NextResponse.json(
        {
          error: "Ongeldig JSON formaat",
          content: data,
        },
        { status: 500 },
      )
    }

    // Stuur de inhoud terug
    return NextResponse.json({
      success: true,
      path: dataFile,
      orders: orders,
      count: orders.length,
    })
  } catch (error) {
    console.error("Error reading orders.json:", error)
    return NextResponse.json(
      {
        error: "Failed to read orders.json",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
