"use server"

import fs from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export type Order = {
  id: string
  orderId: string // Gemeenschappelijk order ID voor groepsbestellingen
  name: string
  email: string
  phone: string
  address: string
  color: string
  colorName?: string // Toegevoegd voor weergave in bestellijst
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
  quantity: number // Toegevoegd quantity veld
}

// Pad naar het JSON-bestand voor opslag
const DATA_FILE = path.join(process.cwd(), "data", "orders.json")

// Zorg ervoor dat de data directory bestaat
async function ensureDataDirectory() {
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
    await fs.access(DATA_FILE)
  } catch (error) {
    // Als het bestand niet bestaat, maak een nieuw bestand met een lege array
    console.log("Orders.json bestand bestaat niet, wordt aangemaakt...")
    await fs.writeFile(DATA_FILE, JSON.stringify([]), "utf8")
  }
}

// Lees alle bestellingen uit het bestand
export async function getAllOrders(): Promise<Order[]> {
  try {
    await ensureDataDirectory()

    try {
      const data = await fs.readFile(DATA_FILE, "utf8")
      const orders = JSON.parse(data)

      // Voeg quantity toe aan bestaande orders die het veld nog niet hebben
      const updatedOrders = orders.map((order: any) => ({
        ...order,
        quantity: order.quantity || 1, // Default naar 1 als quantity niet bestaat
      }))

      return updatedOrders
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
export async function addOrder(
  orderData: Omit<Order, "id" | "orderId"> & { quantity?: number },
  orderId?: string,
): Promise<Order> {
  try {
    // Zorg ervoor dat de data directory en bestand bestaan
    await ensureDataDirectory()

    // Genereer een uniek ID voor de nieuwe bestelling
    const newOrderId =
      orderId ||
      `ORDER-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`

    // Zorg ervoor dat quantity altijd een waarde heeft (default naar 1)
    const quantity = orderData.quantity || 1

    const newOrder: Order = {
      ...orderData,
      id: uuidv4().substring(0, 8).toUpperCase(),
      orderId: newOrderId,
      quantity: quantity,
    }

    console.log("Nieuwe bestelling aangemaakt:", newOrder)

    // Haal bestaande bestellingen op
    let orders: Order[] = []
    try {
      const data = await fs.readFile(DATA_FILE, "utf8")
      orders = JSON.parse(data)
      console.log(`Bestaande bestellingen geladen, aantal: ${orders.length}`)
    } catch (error) {
      console.error("Fout bij het lezen van bestellingen:", error)
      // Als er een fout is bij het lezen, maak een nieuwe lege array
      orders = []
    }

    // Voeg de nieuwe bestelling toe
    orders.push(newOrder)

    // Debug log om te zien of we hier komen
    console.log("Bestellingen bijgewerkt, totaal aantal:", orders.length)
    console.log("Bestelling wordt weggeschreven naar:", DATA_FILE)

    // Schrijf terug naar het bestand
    await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2), "utf8")
    console.log("Bestelling succesvol opgeslagen in orders.json")

    return newOrder
  } catch (error) {
    console.error("Fout bij het toevoegen van bestelling:", error)
    throw new Error(`Kon bestelling niet opslaan: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Haal bestellingen op basis van orderId
export async function getOrdersByOrderId(orderId: string): Promise<Order[]> {
  try {
    const orders = await getAllOrders()
    const matchingOrders = orders.filter((order) => order.orderId === orderId)

    // Expandeer orders op basis van quantity
    const expandedOrders: Order[] = []

    for (const order of matchingOrders) {
      // Als er een quantity is, maak het juiste aantal kopieën
      const quantity = order.quantity || 1

      // Voeg het originele order toe met de juiste quantity
      expandedOrders.push(order)
    }

    return expandedOrders
  } catch (error) {
    console.error("Fout bij het ophalen van bestellingen op orderId:", error)
    return []
  }
}

// Bereken totaalbedrag voor een orderId
export async function getOrderTotal(orderId: string): Promise<number> {
  try {
    const orders = await getOrdersByOrderId(orderId)
    return orders.reduce((total, order) => total + order.price * (order.quantity || 1), 0)
  } catch (error) {
    console.error("Fout bij het berekenen van totaalbedrag:", error)
    return 0
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

// Update status voor alle bestellingen met hetzelfde orderId
export async function updateOrderStatus(orderId: string, newStatus: string): Promise<void> {
  try {
    // Haal bestaande bestellingen op
    const orders = await getAllOrders()

    // Update alle bestellingen met het gegeven orderId
    const updatedOrders = orders.map((order) => {
      if (order.orderId === orderId) {
        return { ...order, status: newStatus }
      }
      return order
    })

    // Schrijf terug naar het bestand
    await fs.writeFile(DATA_FILE, JSON.stringify(updatedOrders, null, 2), "utf8")
  } catch (error) {
    console.error("Fout bij het updaten van bestellingsstatus:", error)
    throw new Error("Kon bestellingsstatus niet updaten")
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

    // Probeer het bestand te lezen om te controleren of het werkt
    try {
      const data = await fs.readFile(DATA_FILE, "utf8")
      const orders = JSON.parse(data)
      console.log("Database geïnitialiseerd, aantal bestellingen:", orders.length)
    } catch (error) {
      console.error("Fout bij het lezen van het orders bestand:", error)
    }
  } catch (error) {
    console.error("Fout bij het initialiseren van de database:", error)
  }
}

