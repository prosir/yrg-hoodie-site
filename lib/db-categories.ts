"use server"

import fs from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export type ProductCategory = {
  id: string
  name: string
  slug: string
  description?: string
  isClothing: boolean
  sizes?: string[]
  active: boolean
  createdAt: string
  updatedAt: string
}

// Pad naar het JSON-bestand voor opslag
const CATEGORIES_FILE = path.join(process.cwd(), "data", "categories.json")

// Zorg ervoor dat de data directory en bestand bestaan
async function ensureCategoriesFile() {
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
    await fs.access(CATEGORIES_FILE)
  } catch (error) {
    // Als het bestand niet bestaat, maak een nieuw bestand met een lege array
    console.log("Categories.json bestand bestaat niet, wordt aangemaakt...")
    await fs.writeFile(CATEGORIES_FILE, JSON.stringify([]), "utf8")
  }
}

// Haal alle categorieën op
export async function getAllCategories(): Promise<ProductCategory[]> {
  try {
    await ensureCategoriesFile()

    const data = await fs.readFile(CATEGORIES_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Fout bij het ophalen van categorieën:", error)
    return []
  }
}

// Haal een specifieke categorie op basis van slug
export async function getCategoryBySlug(slug: string): Promise<ProductCategory | null> {
  try {
    const categories = await getAllCategories()
    const category = categories.find((cat) => cat.slug === slug)
    return category || null
  } catch (error) {
    console.error(`Fout bij het ophalen van categorie met slug ${slug}:`, error)
    return null
  }
}

// Haal een specifieke categorie op basis van ID
export async function getCategoryById(id: string): Promise<ProductCategory | null> {
  try {
    const categories = await getAllCategories()
    const category = categories.find((cat) => cat.id === id)
    return category || null
  } catch (error) {
    console.error(`Fout bij het ophalen van categorie met ID ${id}:`, error)
    return null
  }
}

// Voeg een nieuwe categorie toe
export async function addCategory(
  categoryData: Omit<ProductCategory, "id" | "createdAt" | "updatedAt">,
): Promise<ProductCategory> {
  try {
    await ensureCategoriesFile()

    // Haal bestaande categorieën op
    const categories = await getAllCategories()

    // Controleer of de slug al bestaat
    const slugExists = categories.some((cat) => cat.slug === categoryData.slug)
    if (slugExists) {
      throw new Error(`Een categorie met slug "${categoryData.slug}" bestaat al`)
    }

    const now = new Date().toISOString()
    const newCategory: ProductCategory = {
      ...categoryData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    }

    // Voeg de nieuwe categorie toe
    categories.push(newCategory)

    // Schrijf terug naar het bestand
    await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2), "utf8")

    return newCategory
  } catch (error) {
    console.error("Fout bij het toevoegen van categorie:", error)
    throw error
  }
}

// Update een bestaande categorie
export async function updateCategory(
  id: string,
  categoryData: Partial<Omit<ProductCategory, "id" | "createdAt" | "updatedAt">>,
): Promise<ProductCategory> {
  try {
    await ensureCategoriesFile()

    // Haal bestaande categorieën op
    const categories = await getAllCategories()

    // Zoek de index van de te updaten categorie
    const index = categories.findIndex((cat) => cat.id === id)
    if (index === -1) {
      throw new Error(`Categorie met ID ${id} niet gevonden`)
    }

    // Als de slug wordt gewijzigd, controleer of deze al bestaat
    if (categoryData.slug && categoryData.slug !== categories[index].slug) {
      const slugExists = categories.some((cat) => cat.slug === categoryData.slug && cat.id !== id)
      if (slugExists) {
        throw new Error(`Een categorie met slug "${categoryData.slug}" bestaat al`)
      }
    }

    // Update de categorie
    const updatedCategory: ProductCategory = {
      ...categories[index],
      ...categoryData,
      updatedAt: new Date().toISOString(),
    }

    categories[index] = updatedCategory

    // Schrijf terug naar het bestand
    await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2), "utf8")

    return updatedCategory
  } catch (error) {
    console.error(`Fout bij het updaten van categorie met ID ${id}:`, error)
    throw error
  }
}

// Verwijder een categorie
export async function deleteCategory(id: string): Promise<void> {
  try {
    await ensureCategoriesFile()

    // Haal bestaande categorieën op
    const categories = await getAllCategories()

    // Filter de te verwijderen categorie
    const filteredCategories = categories.filter((cat) => cat.id !== id)

    // Als het aantal categorieën niet is veranderd, bestaat de categorie niet
    if (filteredCategories.length === categories.length) {
      throw new Error(`Categorie met ID ${id} niet gevonden`)
    }

    // Schrijf terug naar het bestand
    await fs.writeFile(CATEGORIES_FILE, JSON.stringify(filteredCategories, null, 2), "utf8")
  } catch (error) {
    console.error(`Fout bij het verwijderen van categorie met ID ${id}:`, error)
    throw error
  }
}

// Activeer of deactiveer een categorie
export async function toggleCategoryActive(id: string, active: boolean): Promise<ProductCategory> {
  try {
    await ensureCategoriesFile()

    // Haal bestaande categorieën op
    const categories = await getAllCategories()

    // Zoek de index van de te updaten categorie
    const index = categories.findIndex((cat) => cat.id === id)
    if (index === -1) {
      throw new Error(`Categorie met ID ${id} niet gevonden`)
    }

    // Update de active status
    categories[index].active = active
    categories[index].updatedAt = new Date().toISOString()

    // Schrijf terug naar het bestand
    await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2), "utf8")

    return categories[index]
  } catch (error) {
    console.error(`Fout bij het wijzigen van active status voor categorie met ID ${id}:`, error)
    throw error
  }
}

// Haal alle actieve categorieën op
export async function getActiveCategories(): Promise<ProductCategory[]> {
  try {
    const categories = await getAllCategories()
    return categories.filter((cat) => cat.active)
  } catch (error) {
    console.error("Fout bij het ophalen van actieve categorieën:", error)
    return []
  }
}

