"use server"

import fs from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export type Order = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  color: string
  size: string
  delivery: "pickup" | "shipping"
  notes?: string
  price: number
  status: string
  date: string
  isCrew?: boolean
  orderedFromSupplier?: boolean
  trackingNumber?: string
  trackingSent?: boolean
}

// Pad naar het JSON-bestand voor opslag
const DATA_FILE = path.join(process.cwd(), "data", "orders.json")

// Zorg ervoor dat de data directory bestaat
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), "data")
  try {
    await fs.access(dataDir)
  } catch (error) {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Lees alle bestellingen uit het bestand
export async function getAllOrders(): Promise<Order[]> {
  try {
    await ensureDataDirectory()

    try {
      const data = await fs.readFile(DATA_FILE, "utf8")
      return JSON.parse(data)
    } catch (error) {
      // Als het bestand niet bestaat, maak een nieuw bestand met een lege array
      await fs.writeFile(DATA_FILE, JSON.stringify([]), "utf8")
      return []
    }
  } catch (error) {
    console.error("Fout bij het ophalen van bestellingen:", error)
    return []
  }
}

// Voeg een nieuwe bestelling toe
export async function addOrder(orderData: Omit<Order, "id">): Promise<Order> {
  try {
    await ensureDataDirectory()

    // Genereer een uniek ID voor de nieuwe bestelling
    const newOrder: Order = {
      ...orderData,
      id: orderData.id || uuidv4().substring(0, 8).toUpperCase(),
    }

    // Haal bestaande bestellingen op
    const orders = await getAllOrders()

    // Voeg de nieuwe bestelling toe
    orders.push(newOrder)

    // Schrijf terug naar het bestand
    await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2), "utf8")

    return newOrder
  } catch (error) {
    console.error("Fout bij het toevoegen van bestelling:", error)
    throw new Error("Kon bestelling niet opslaan")
  }
}

// Update een bestaande bestelling
export async function updateOrder(updatedOrder: Order): Promise<Order> {
  try {
    await ensureDataDirectory()

    // Haal bestaande bestellingen op
    const orders = await getAllOrders()

    // Zoek de index van de te updaten bestelling
    const index = orders.findIndex((order) => order.id === updatedOrder.id)

    if (index === -1) {
      throw new Error(`Bestelling met ID ${updatedOrder.id} niet gevonden`)
    }

    // Update de bestelling
    orders[index] = updatedOrder

    // Schrijf terug naar het bestand
    await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2), "utf8")

    return updatedOrder
  } catch (error) {
    console.error("Fout bij het updaten van bestelling:", error)
    throw new Error("Kon bestelling niet updaten")
  }
}

// Verwijder een bestelling
export async function deleteOrder(orderId: string): Promise<void> {
  try {
    await ensureDataDirectory()

    // Haal bestaande bestellingen op
    const orders = await getAllOrders()

    // Filter de te verwijderen bestelling
    const filteredOrders = orders.filter((order) => order.id !== orderId)

    // Schrijf terug naar het bestand
    await fs.writeFile(DATA_FILE, JSON.stringify(filteredOrders, null, 2), "utf8")
  } catch (error) {
    console.error("Fout bij het verwijderen van bestelling:", error)
    throw new Error("Kon bestelling niet verwijderen")
  }
}

// Update tracking nummer voor een bestelling
export async function updateTrackingNumber(orderId: string, trackingNumber: string): Promise<Order> {
  try {
    // Haal bestaande bestellingen op
    const orders = await getAllOrders()

    // Zoek de bestelling
    const orderIndex = orders.findIndex((order) => order.id === orderId)

    if (orderIndex === -1) {
      throw new Error(`Bestelling met ID ${orderId} niet gevonden`)
    }

    // Update het tracking nummer
    const updatedOrder = {
      ...orders[orderIndex],
      trackingNumber,
      trackingSent: false, // Reset trackingSent wanneer een nieuw nummer wordt toegevoegd
    }

    // Update de bestelling in de array
    orders[orderIndex] = updatedOrder

    // Schrijf terug naar het bestand
    await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2), "utf8")

    return updatedOrder
  } catch (error) {
    console.error("Fout bij het updaten van tracking nummer:", error)
    throw new Error("Kon tracking nummer niet updaten")
  }
}

// Markeer tracking als verzonden
export async function markTrackingAsSent(orderId: string): Promise<Order> {
  try {
    // Haal bestaande bestellingen op
    const orders = await getAllOrders()

    // Zoek de bestelling
    const orderIndex = orders.findIndex((order) => order.id === orderId)

    if (orderIndex === -1) {
      throw new Error(`Bestelling met ID ${orderId} niet gevonden`)
    }

    // Update trackingSent status
    const updatedOrder = {
      ...orders[orderIndex],
      trackingSent: true,
    }

    // Update de bestelling in de array
    orders[orderIndex] = updatedOrder

    // Schrijf terug naar het bestand
    await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2), "utf8")

    return updatedOrder
  } catch (error) {
    console.error("Fout bij het markeren van tracking als verzonden:", error)
    throw new Error("Kon tracking status niet updaten")
  }
}

// Initialiseer de database
export async function initDatabase(): Promise<void> {
  try {
    await ensureDataDirectory()

    // Controleer of het bestand bestaat, zo niet, maak het aan
    try {
      await fs.access(DATA_FILE)
    } catch (error) {
      await fs.writeFile(DATA_FILE, JSON.stringify([]), "utf8")
    }
  } catch (error) {
    console.error("Fout bij het initialiseren van de database:", error)
  }
}

