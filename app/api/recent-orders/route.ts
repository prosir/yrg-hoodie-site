import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    // Check if user is authenticated
    const sessionId = cookies().get("admin_session")?.value

    if (!sessionId) {
      // Only authenticated users can access recent orders
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // If authenticated, return all orders
    const ordersPath = path.join(process.cwd(), "data", "orders.json")

    if (!fs.existsSync(ordersPath)) {
      return NextResponse.json([])
    }

    const ordersData = fs.readFileSync(ordersPath, "utf8")
    const orders = JSON.parse(ordersData)

    // Sort by date (newest first)
    const sortedOrders = orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json(sortedOrders.slice(0, 10))
  } catch (error) {
    console.error("Error fetching recent orders:", error)
    return NextResponse.json({ error: "Failed to fetch recent orders" }, { status: 500 })
  }
}
