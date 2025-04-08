import { NextResponse } from "next/server"
import { getAllProducts } from "@/lib/db-products"

export async function GET() {
  try {
    // Get all products
    const allProducts = await getAllProducts()

    // Filter to only include active products
    const activeProducts = allProducts.filter((product) => product.active)

    // Filter to only include featured products if any are marked as featured
    const featuredProducts = activeProducts.filter((product) => product.featured)

    // If there are no featured products, return the first 4 active products
    const productsToReturn = featuredProducts.length > 0 ? featuredProducts.slice(0, 4) : activeProducts.slice(0, 4)

    return NextResponse.json(productsToReturn, { status: 200 })
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return NextResponse.json({ error: "Failed to fetch featured products" }, { status: 500 })
  }
}
