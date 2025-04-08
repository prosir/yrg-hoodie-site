"use server"

import { v4 as uuidv4 } from "uuid"
import fs from "fs/promises"
import path from "path"
import { query } from "./db-mysql"

export type Order = {
  id: string
  orderId: string
  name: string
  email: string
  phone: string
  address: string
  color: string
  colorName?: string
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
  quantity: number
}

// Determine if we should use MySQL or JSON files
const useMySQL = process.env.USE_MYSQL === "true" || process.env.NODE_ENV === "production"

// Path to JSON file (for development/fallback)
const DATA_FILE = path.join(process.cwd(), "data", "orders.json")

// Ensure data directory exists (for development/fallback)
async function ensureDataDirectory() {
  if (useMySQL) return // Skip if using MySQL

  const dataDir = path.join(process.cwd(), "data")
  try {
    await fs.access(dataDir)
  } catch (error) {
    console.log("Data directory does not exist, creating...")
    await fs.mkdir(dataDir, { recursive: true })
  }

  try {
    await fs.access(DATA_FILE)
  } catch (error) {
    console.log("Orders.json file does not exist, creating...")
    await fs.writeFile(DATA_FILE, JSON.stringify([]), "utf8")
  }
}

// Get all orders
export async function getAllOrders(): Promise<Order[]> {
  try {
    if (useMySQL) {
      // Use MySQL
      const results = (await query("SELECT * FROM orders ORDER BY date DESC")) as Order[]
      return results
    } else {
      // Use JSON files
      await ensureDataDirectory()
      const data = await fs.readFile(DATA_FILE, "utf8")
      const orders = JSON.parse(data)

      // Add quantity to existing orders that don't have it
      const updatedOrders = orders.map((order: any) => ({
        ...order,
        quantity: order.quantity || 1,
      }))

      return updatedOrders
    }
  } catch (error) {
    console.error("Error getting orders:", error)
    return []
  }
}

// Add a new order
export async function addOrder(
  orderData: Omit<Order, "id" | "orderId"> & { quantity?: number },
  orderId?: string,
): Promise<Order> {
  try {
    // Generate a unique ID for the new order
    const newOrderId =
      orderId ||
      `ORDER-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`
    const quantity = orderData.quantity || 1

    const newOrder: Order = {
      ...orderData,
      id: uuidv4().substring(0, 8).toUpperCase(),
      orderId: newOrderId,
      quantity: quantity,
    }

    if (useMySQL) {
      // Use MySQL
      const sql = `
        INSERT INTO orders (
          id, orderId, name, email, phone, address, color, colorName, 
          size, delivery, notes, price, status, date, isCrew, 
          orderedFromSupplier, trackingNumber, trackingSent, quantity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `

      await query(sql, [
        newOrder.id,
        newOrder.orderId,
        newOrder.name,
        newOrder.email,
        newOrder.phone,
        newOrder.address,
        newOrder.color,
        newOrder.colorName || null,
        newOrder.size,
        newOrder.delivery,
        newOrder.notes || null,
        newOrder.price,
        newOrder.status,
        newOrder.date,
        newOrder.isCrew || false,
        newOrder.orderedFromSupplier || false,
        newOrder.trackingNumber || null,
        newOrder.trackingSent || false,
        newOrder.quantity,
      ])
    } else {
      // Use JSON files
      await ensureDataDirectory()

      // Get existing orders
      let orders: Order[] = []
      try {
        const data = await fs.readFile(DATA_FILE, "utf8")
        orders = JSON.parse(data)
      } catch (error) {
        console.error("Error reading orders:", error)
        orders = []
      }

      // Add the new order
      orders.push(newOrder)

      // Write back to the file
      await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2), "utf8")
    }

    return newOrder
  } catch (error) {
    console.error("Error adding order:", error)
    throw new Error(`Could not save order: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Get orders by orderId
export async function getOrdersByOrderId(orderId: string): Promise<Order[]> {
  try {
    if (useMySQL) {
      // Use MySQL
      const results = (await query("SELECT * FROM orders WHERE orderId = ?", [orderId])) as Order[]
      return results
    } else {
      // Use JSON files
      const orders = await getAllOrders()
      return orders.filter((order) => order.orderId === orderId)
    }
  } catch (error) {
    console.error("Error getting orders by orderId:", error)
    return []
  }
}

// Calculate total for an orderId
export async function getOrderTotal(orderId: string): Promise<number> {
  try {
    const orders = await getOrdersByOrderId(orderId)
    return orders.reduce((total, order) => total + order.price * (order.quantity || 1), 0)
  } catch (error) {
    console.error("Error calculating order total:", error)
    return 0
  }
}

// Update an existing order
export async function updateOrder(updatedOrder: Order): Promise<Order> {
  try {
    if (useMySQL) {
      // Use MySQL
      const sql = `
        UPDATE orders SET
          orderId = ?,
          name = ?,
          email = ?,
          phone = ?,
          address = ?,
          color = ?,
          colorName = ?,
          size = ?,
          delivery = ?,
          notes = ?,
          price = ?,
          status = ?,
          date = ?,
          isCrew = ?,
          orderedFromSupplier = ?,
          trackingNumber = ?,
          trackingSent = ?,
          quantity = ?
        WHERE id = ?
      `

      await query(sql, [
        updatedOrder.orderId,
        updatedOrder.name,
        updatedOrder.email,
        updatedOrder.phone,
        updatedOrder.address,
        updatedOrder.color,
        updatedOrder.colorName || null,
        updatedOrder.size,
        updatedOrder.delivery,
        updatedOrder.notes || null,
        updatedOrder.price,
        updatedOrder.status,
        updatedOrder.date,
        updatedOrder.isCrew || false,
        updatedOrder.orderedFromSupplier || false,
        updatedOrder.trackingNumber || null,
        updatedOrder.trackingSent || false,
        updatedOrder.quantity,
        updatedOrder.id,
      ])
    } else {
      // Use JSON files
      await ensureDataDirectory()

      // Get existing orders
      const orders = await getAllOrders()

      // Find the index of the order to update
      const index = orders.findIndex((order) => order.id === updatedOrder.id)

      if (index === -1) {
        throw new Error(`Order with ID ${updatedOrder.id} not found`)
      }

      // Update the order
      orders[index] = updatedOrder

      // Write back to the file
      await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2), "utf8")
    }

    return updatedOrder
  } catch (error) {
    console.error("Error updating order:", error)
    throw new Error("Could not update order")
  }
}

// Update status for all orders with the same orderId
export async function updateOrderStatus(orderId: string, newStatus: string): Promise<void> {
  try {
    if (useMySQL) {
      // Use MySQL
      await query("UPDATE orders SET status = ? WHERE orderId = ?", [newStatus, orderId])
    } else {
      // Use JSON files
      // Get existing orders
      const orders = await getAllOrders()

      // Update all orders with the given orderId
      const updatedOrders = orders.map((order) => {
        if (order.orderId === orderId) {
          return { ...order, status: newStatus }
        }
        return order
      })

      // Write back to the file
      await fs.writeFile(DATA_FILE, JSON.stringify(updatedOrders, null, 2), "utf8")
    }
  } catch (error) {
    console.error("Error updating order status:", error)
    throw new Error("Could not update order status")
  }
}

// Delete an order
export async function deleteOrder(orderId: string): Promise<void> {
  try {
    if (useMySQL) {
      // Use MySQL
      await query("DELETE FROM orders WHERE id = ?", [orderId])
    } else {
      // Use JSON files
      await ensureDataDirectory()

      // Get existing orders
      const orders = await getAllOrders()

      // Filter out the order to delete
      const filteredOrders = orders.filter((order) => order.id !== orderId)

      // Write back to the file
      await fs.writeFile(DATA_FILE, JSON.stringify(filteredOrders, null, 2), "utf8")
    }
  } catch (error) {
    console.error("Error deleting order:", error)
    throw new Error("Could not delete order")
  }
}

// Update tracking number for an order
export async function updateTrackingNumber(orderId: string, trackingNumber: string): Promise<Order> {
  try {
    if (useMySQL) {
      // Use MySQL
      await query("UPDATE orders SET trackingNumber = ?, trackingSent = false WHERE id = ?", [trackingNumber, orderId])

      // Get the updated order
      const results = (await query("SELECT * FROM orders WHERE id = ?", [orderId])) as Order[]
      if (results.length === 0) {
        throw new Error(`Order with ID ${orderId} not found`)
      }
      return results[0]
    } else {
      // Use JSON files
      // Get existing orders
      const orders = await getAllOrders()

      // Find the order
      const orderIndex = orders.findIndex((order) => order.id === orderId)

      if (orderIndex === -1) {
        throw new Error(`Order with ID ${orderId} not found`)
      }

      // Update the tracking number
      const updatedOrder = {
        ...orders[orderIndex],
        trackingNumber,
        trackingSent: false,
      }

      // Update the order in the array
      orders[orderIndex] = updatedOrder

      // Write back to the file
      await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2), "utf8")

      return updatedOrder
    }
  } catch (error) {
    console.error("Error updating tracking number:", error)
    throw new Error("Could not update tracking number")
  }
}

// Mark tracking as sent
export async function markTrackingAsSent(orderId: string): Promise<Order> {
  try {
    if (useMySQL) {
      // Use MySQL
      await query("UPDATE orders SET trackingSent = true WHERE id = ?", [orderId])

      // Get the updated order
      const results = (await query("SELECT * FROM orders WHERE id = ?", [orderId])) as Order[]
      if (results.length === 0) {
        throw new Error(`Order with ID ${orderId} not found`)
      }
      return results[0]
    } else {
      // Use JSON files
      // Get existing orders
      const orders = await getAllOrders()

      // Find the order
      const orderIndex = orders.findIndex((order) => order.id === orderId)

      if (orderIndex === -1) {
        throw new Error(`Order with ID ${orderId} not found`)
      }

      // Update trackingSent status
      const updatedOrder = {
        ...orders[orderIndex],
        trackingSent: true,
      }

      // Update the order in the array
      orders[orderIndex] = updatedOrder

      // Write back to the file
      await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2), "utf8")

      return updatedOrder
    }
  } catch (error) {
    console.error("Error marking tracking as sent:", error)
    throw new Error("Could not update tracking status")
  }
}

// Initialize the database
export async function initDatabase(): Promise<void> {
  try {
    if (!useMySQL) {
      // Only initialize JSON files if not using MySQL
      await ensureDataDirectory()

      try {
        const data = await fs.readFile(DATA_FILE, "utf8")
        const orders = JSON.parse(data)
        console.log("Database initialized, order count:", orders.length)
      } catch (error) {
        console.error("Error reading orders file:", error)
      }
    }
  } catch (error) {
    console.error("Error initializing database:", error)
  }
}
