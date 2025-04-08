import { NextResponse } from "next/server"
import { getAllProducts } from "@/lib/db-products"

export async function GET() {
  try {
    // Get all products
    const allProducts = await getAllProducts()

    // Filter for featured products or just return the first 4
    const featuredProducts = allProducts.filter((product) => product.featured || product.images?.length > 0).slice(0, 4)

    return NextResponse.json(featuredProducts)
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return NextResponse.json({ error: "Failed to fetch featured products" }, { status: 500 })
  }
}
