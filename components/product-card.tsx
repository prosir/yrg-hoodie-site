"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, ShoppingCart } from "lucide-react"

type ProductCardProps = {
  color: string
  colorName: string
  image: string
  price: number
}

export function ProductCard({ color, colorName, image, price }: ProductCardProps) {
  const router = useRouter()

  const handleViewProduct = () => {
    router.push(`/product/${color}`)
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-olive-500/20 bg-white border border-gray-200">
      <div className="h-64 bg-gray-50 relative overflow-hidden group">
        <Image
          src={image || "/placeholder.svg"}
          alt={`${colorName} Hoodie`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/90 text-gray-800 border-olive-500 hover:bg-olive-500/20"
            onClick={handleViewProduct}
          >
            <Eye className="mr-2 h-4 w-4" />
            Bekijk details
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-bold text-gray-800">{colorName}</h3>
        <p className="text-gray-600 mt-1">YoungRidersOost premium hoodie</p>
        <p className="font-bold text-olive-600 mt-2 text-xl">€{price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={handleViewProduct} className="w-full bg-olive-600 hover:bg-olive-700 text-white">
          <ShoppingCart className="mr-2 h-4 w-4" />
          In winkelwagen
        </Button>
      </CardFooter>
    </Card>
  )
}

