import { NextResponse } from "next/server"
import { addOrder } from "@/lib/db"

// API route om een testbestelling toe te voegen
export async function GET() {
  try {
    // Maak een testbestelling
    const testOrderData = {
      name: "Test Gebruiker",
      email: "test@example.com",
      phone: "0612345678",
      address: "Teststraat 123",
      color: "black",
      size: "l",
      delivery: "pickup" as "pickup" | "shipping",
      notes: "Dit is een testbestelling",
      price: 50,
      status: "nieuw",
      date: new Date().toISOString(),
    }

    // Voeg de testbestelling toe
    const newOrder = await addOrder(testOrderData)

    // Stuur het resultaat terug
    return NextResponse.json({
      success: true,
      message: "Testbestelling succesvol toegevoegd",
      order: newOrder,
    })
  } catch (error) {
    console.error("Error adding test order:", error)
    return NextResponse.json(
      {
        error: "Failed to add test order",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

