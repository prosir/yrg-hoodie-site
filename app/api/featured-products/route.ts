import { NextResponse } from "next/server"
import { getAllProducts } from "@/lib/db-products"

export async function GET() {
  try {
    // Get all products
    const products = await getAllProducts()

    // Filter for products with images and limit to 4
    const featuredProducts = products.filter((product) => product.imageUrl).slice(0, 4)

    return NextResponse.json(featuredProducts, { status: 200 })
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return NextResponse.json({ error: "Failed to fetch featured products" }, { status: 500 })
  }
}
