"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

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
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="h-64 bg-secondary/30 relative overflow-hidden">
        <Image src={image || "/placeholder.svg"} alt={`${colorName} Hoodie`} fill className="object-cover" />
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-foreground">{colorName}</h3>
        <p className="text-muted-foreground mt-2">YoungRidersOost hoodie</p>
        <p className="font-medium text-primary mt-2">€{price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={handleViewProduct} className="w-full">
          <Eye className="mr-2 h-4 w-4" />
          Bekijk product
        </Button>
      </CardFooter>
    </Card>
  )
}

