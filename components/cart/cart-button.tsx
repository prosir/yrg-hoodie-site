import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CartButton() {
  return (
    <Button asChild variant="outline" size="icon" className="relative">
      <Link href="/cart">
        <ShoppingCart className="h-5 w-5" />
        <span className="absolute -top-2 -right-2 bg-olive-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          0
        </span>
        <span className="sr-only">Winkelwagen</span>
      </Link>
    </Button>
  )
}

