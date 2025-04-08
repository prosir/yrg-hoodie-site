import { NextResponse } from "next/server"
import { getAllOrders } from "@/lib/db"
import { cookies } from "next/headers"
import { validateSession } from "@/lib/auth"

export async function GET() {
  try {
    // Check if user is authenticated using the project's auth system
    const sessionCookie = cookies().get("session")?.value
    const isAuthenticated = sessionCookie ? await validateSession(sessionCookie) : false

    // Only allow authenticated users to see recent orders
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all orders
    const orders = await getAllOrders()

    // Sort by date (newest first)
    const sortedOrders = orders.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    // Return the 10 most recent orders
    return NextResponse.json(sortedOrders.slice(0, 10), { status: 200 })
  } catch (error) {
    console.error("Error fetching recent orders:", error)
    return NextResponse.json({ error: "Failed to fetch recent orders" }, { status: 500 })
  }
}
