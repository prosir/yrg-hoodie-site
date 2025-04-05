"use server"

import fs from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export type ProductSize = {
  name: string
  stock: number
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string
  categoryId: string
  price: number
  images: string[]
  sizes?: ProductSize[]
  colors?: string[]
  active: boolean
  featured: boolean
  createdAt: string
  updatedAt: string
}

// Pad naar het JSON-bestand voor opslag
const PRODUCTS_FILE = path.join(process.cwd(), "data", "products.json")

// Zorg ervoor dat de data directory en bestand bestaan
async function ensureProductsFile() {
  const dataDir = path.join(process.cwd(), "data")
  try {
    await fs.access(dataDir)
  } catch (error) {
    // Als de directory niet bestaat, maak deze aan
    console.log("Data directory bestaat niet, wordt aangemaakt...")
    await fs.mkdir(dataDir, { recursive: true })
  }

  // Controleer of het bestand bestaat, zo niet, maak het aan
  try {
    await fs.access(PRODUCTS_FILE)
  } catch (error) {
    // Als het bestand niet bestaat, maak een nieuw bestand met een lege array
    console.log("Products.json bestand bestaat niet, wordt aangemaakt...")
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify([]), "utf8")
  }
}

// Haal alle producten op
export async function getAllProducts(): Promise<Product[]> {
  try {
    await ensureProductsFile()

    const data = await fs.readFile(PRODUCTS_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Fout bij het ophalen van producten:", error)
    return []
  }
}

// Haal producten op basis van categorie ID
export async function getProductsByCategoryId(categoryId: string): Promise<Product[]> {
  try {
    const products = await getAllProducts()
    return products.filter((product) => product.categoryId === categoryId)
  } catch (error) {
    console.error(`Fout bij het ophalen van producten voor categorie ${categoryId}:`, error)
    return []
  }
}

// Haal een specifiek product op basis van ID
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const products = await getAllProducts()
    const product = products.find((p) => p.id === id)
    return product || null
  } catch (error) {
    console.error(`Fout bij het ophalen van product met ID ${id}:`, error)
    return null
  }
}

// Haal een specifiek product op basis van slug
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const products = await getAllProducts()
    const product = products.find((p) => p.slug === slug)
    return product || null
  } catch (error) {
    console.error(`Fout bij het ophalen van product met slug ${slug}:`, error)
    return null
  }
}

// Voeg een nieuw product toe
export async function addProduct(productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
  try {
    await ensureProductsFile()

    // Haal bestaande producten op
    const products = await getAllProducts()

    // Controleer of de slug al bestaat
    const slugExists = products.some((p) => p.slug === productData.slug)
    if (slugExists) {
      throw new Error(`Een product met slug "${productData.slug}" bestaat al`)
    }

    const now = new Date().toISOString()
    const newProduct: Product = {
      ...productData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    }

    // Voeg het nieuwe product toe
    products.push(newProduct)

    // Schrijf terug naar het bestand
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf8")

    return newProduct
  } catch (error) {
    console.error("Fout bij het toevoegen van product:", error)
    throw error
  }
}

// Update een bestaand product
export async function updateProduct(
  id: string,
  productData: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>,
): Promise<Product> {
  try {
    await ensureProductsFile()

    // Haal bestaande producten op
    const products = await getAllProducts()

    // Zoek de index van het te updaten product
    const index = products.findIndex((p) => p.id === id)
    if (index === -1) {
      throw new Error(`Product met ID ${id} niet gevonden`)
    }

    // Als de slug wordt gewijzigd, controleer of deze al bestaat
    if (productData.slug && productData.slug !== products[index].slug) {
      const slugExists = products.some((p) => p.slug === productData.slug && p.id !== id)
      if (slugExists) {
        throw new Error(`Een product met slug "${productData.slug}" bestaat al`)
      }
    }

    // Update het product
    const updatedProduct: Product = {
      ...products[index],
      ...productData,
      updatedAt: new Date().toISOString(),
    }

    products[index] = updatedProduct

    // Schrijf terug naar het bestand
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf8")

    return updatedProduct
  } catch (error) {
    console.error(`Fout bij het updaten van product met ID ${id}:`, error)
    throw error
  }
}

// Verwijder een product
export async function deleteProduct(id: string): Promise<void> {
  try {
    await ensureProductsFile()

    // Haal bestaande producten op
    const products = await getAllProducts()

    // Filter het te verwijderen product
    const filteredProducts = products.filter((p) => p.id !== id)

    // Als het aantal producten niet is veranderd, bestaat het product niet
    if (filteredProducts.length === products.length) {
      throw new Error(`Product met ID ${id} niet gevonden`)
    }

    // Schrijf terug naar het bestand
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(filteredProducts, null, 2), "utf8")
  } catch (error) {
    console.error(`Fout bij het verwijderen van product met ID ${id}:`, error)
    throw error
  }
}

// Activeer of deactiveer een product
export async function toggleProductActive(id: string, active: boolean): Promise<Product> {
  try {
    await ensureProductsFile()

    // Haal bestaande producten op
    const products = await getAllProducts()

    // Zoek de index van het te updaten product
    const index = products.findIndex((p) => p.id === id)
    if (index === -1) {
      throw new Error(`Product met ID ${id} niet gevonden`)
    }

    // Update de active status
    products[index].active = active
    products[index].updatedAt = new Date().toISOString()

    // Schrijf terug naar het bestand
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf8")

    return products[index]
  } catch (error) {
    console.error(`Fout bij het wijzigen van active status voor product met ID ${id}:`, error)
    throw error
  }
}

// Haal alle actieve producten op
export async function getActiveProducts(): Promise<Product[]> {
  try {
    const products = await getAllProducts()
    return products.filter((p) => p.active)
  } catch (error) {
    console.error("Fout bij het ophalen van actieve producten:", error)
    return []
  }
}

// Update voorraad voor een product
export async function updateProductStock(productId: string, sizeName: string, newStock: number): Promise<Product> {
  try {
    await ensureProductsFile()

    // Haal bestaande producten op
    const products = await getAllProducts()

    // Zoek de index van het te updaten product
    const index = products.findIndex((p) => p.id === productId)
    if (index === -1) {
      throw new Error(`Product met ID ${productId} niet gevonden`)
    }

    const product = products[index]

    // Als het product geen sizes heeft, voeg deze toe
    if (!product.sizes) {
      product.sizes = []
    }

    // Zoek de index van de maat
    const sizeIndex = product.sizes.findIndex((s) => s.name === sizeName)

    if (sizeIndex === -1) {
      // Als de maat niet bestaat, voeg deze toe
      product.sizes.push({ name: sizeName, stock: newStock })
    } else {
      // Update de voorraad van de bestaande maat
      product.sizes[sizeIndex].stock = newStock
    }

    product.updatedAt = new Date().toISOString()

    // Schrijf terug naar het bestand
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf8")

    return product
  } catch (error) {
    console.error(`Fout bij het updaten van voorraad voor product ${productId}, maat ${sizeName}:`, error)
    throw error
  }
}

// Haal featured producten op
export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const products = await getAllProducts()
    return products.filter((p) => p.active && p.featured)
  } catch (error) {
    console.error("Fout bij het ophalen van featured producten:", error)
    return []
  }
}

