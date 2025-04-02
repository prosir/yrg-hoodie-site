"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "./cart-context"
import { useRouter } from "next/navigation"

export function CartButton() {
  const { totalItems } = useCart()
  const router = useRouter()

  return (
    <Button variant="outline" size="sm" className="relative" onClick={() => router.push("/cart")}>
      <ShoppingCart className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </Button>
  )
}

