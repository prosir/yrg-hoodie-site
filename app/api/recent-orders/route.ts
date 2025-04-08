import { NextResponse } from "next/server"
import { getAllOrders } from "@/lib/db"
import { verifySession } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Verify the user is authenticated using the project's auth system
    const session = await verifySession(request)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all orders
    const orders = await getAllOrders()

    // Sort by date (newest first)
    const sortedOrders = orders.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    return NextResponse.json(sortedOrders)
  } catch (error) {
    console.error("Error fetching recent orders:", error)
    return NextResponse.json({ error: "Failed to fetch recent orders" }, { status: 500 })
  }
}
