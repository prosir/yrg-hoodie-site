import { NextResponse } from "next/server"
import { getFeaturedProducts, getActiveProducts } from "@/lib/db-products"

export async function GET() {
  try {
    // First try to get featured products
    let products = await getFeaturedProducts()

    // If no featured products, get active products
    if (products.length === 0) {
      products = await getActiveProducts()
    }

    // Limit to 4 products
    return NextResponse.json(products.slice(0, 4))
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
