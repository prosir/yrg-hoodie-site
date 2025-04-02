"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Wijzig de CartItem interface om verzendmethode toe te voegen
export type CartItem = {
  id: string
  color: string
  colorName: string
  size: string
  price: number
  quantity: number
  image: string
  delivery: "pickup" | "shipping"
  shippingCost: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
  shippingCost: number
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [subtotal, setSubtotal] = useState(0)
  const shippingCost = 3.5

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse saved cart:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))

    // Calculate totals
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    setTotalItems(itemCount)

    const cartSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setSubtotal(cartSubtotal)
  }, [items])

  // Update de addItem functie om verzendkosten mee te nemen
  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      // Check if item with same color, size and delivery method already exists
      const existingItemIndex = prevItems.findIndex(
        (item) => item.color === newItem.color && item.size === newItem.size && item.delivery === newItem.delivery,
      )

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += newItem.quantity
        return updatedItems
      } else {
        // Add new item
        return [
          ...prevItems,
          {
            ...newItem,
            id: `${newItem.color}-${newItem.size}-${newItem.delivery}-${Date.now()}`,
          },
        ]
      }
    })
  }

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }

    setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setItems([])
  }

  // Update de total berekening om verzendkosten per item mee te nemen
  const total = items.reduce((sum, item) => sum + item.price * item.quantity + item.shippingCost * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        shippingCost,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

