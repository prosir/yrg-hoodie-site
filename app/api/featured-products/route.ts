import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: Request) {
  try {
    const productsPath = path.join(process.cwd(), "data", "products.json")

    if (!fs.existsSync(productsPath)) {
      return NextResponse.json([])
    }

    const productsData = fs.readFileSync(productsPath, "utf8")
    const products = JSON.parse(productsData)

    // Get featured products (up to 4)
    const featuredProducts = products.slice(0, 4)

    return NextResponse.json(featuredProducts)
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return NextResponse.json({ error: "Failed to fetch featured products" }, { status: 500 })
  }
}
