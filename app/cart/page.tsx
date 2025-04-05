"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/components/cart/cart-context"
import { Minus, Plus, ShoppingCart, Trash2, ArrowLeft, ShoppingBag } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, subtotal, shippingCost, total } = useCart()
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const { toast } = useToast()

  const handleQuantityChange = (id: string, newQuantity: number, colorName: string, size: string) => {
    // Don't do anything if we're already updating
    if (isUpdating) return

    // Store current quantity for comparison
    const currentItem = items.find((item) => item.id === id)
    if (!currentItem) return

    const oldQuantity = currentItem.quantity

    // If trying to set to 0 or negative, handle removal
    if (newQuantity <= 0) {
      if (confirm(`Weet je zeker dat je ${colorName} Hoodie (maat ${size.toUpperCase()}) wilt verwijderen?`)) {
        removeItem(id)
        toast({
          title: "Product verwijderd",
          description: `${colorName} Hoodie (maat ${size.toUpperCase()}) is verwijderd uit je winkelwagen.`,
          variant: "default",
        })
      }
      return
    }

    // Set updating state
    setIsUpdating(true)
    setLastUpdated(id)

    // Update the quantity
    updateQuantity(id, newQuantity)

    // Show toast notification
    toast({
      title: "Winkelwagen bijgewerkt",
      description: `${colorName} Hoodie (maat ${size.toUpperCase()}) aangepast van ${oldQuantity} naar ${newQuantity}.`,
      variant: "default",
    })

    // Reset updating state after a delay
    setTimeout(() => {
      setIsUpdating(false)
      setLastUpdated(null)
    }, 800)
  }

  const handleRemoveItem = (id: string, colorName: string, size: string) => {
    if (confirm(`Weet je zeker dat je ${colorName} Hoodie (maat ${size.toUpperCase()}) wilt verwijderen?`)) {
      removeItem(id)
      toast({
        title: "Product verwijderd",
        description: `${colorName} Hoodie (maat ${size.toUpperCase()}) is verwijderd uit je winkelwagen.`,
        variant: "default",
      })
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Winkelwagen</h1>
        <Card className="p-8 text-center">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <ShoppingCart className="h-16 w-16 text-gray-400" />
              <h2 className="text-xl font-semibold">Je winkelwagen is leeg</h2>
              <p className="text-gray-600">Voeg producten toe aan je winkelwagen om te bestellen.</p>
              <Button onClick={() => router.push("/webshop")} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Terug naar producten
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Winkelwagen</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Producten</CardTitle>
              <CardDescription>Je hebt {totalItems} product(en) in je winkelwagen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-4 py-4 border-b border-gray-200">
                  <div className="relative h-24 w-24 sm:h-32 sm:w-32 bg-gray-100 rounded-md overflow-hidden">
                    <Image src={item.image || "/placeholder.svg"} alt={item.colorName} fill className="object-cover" />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <h3 className="font-medium">{item.colorName} Hoodie</h3>
                    <p className="text-sm text-gray-600">Maat: {item.size.toUpperCase()}</p>
                    <p className="text-sm text-gray-600">
                      {item.delivery === "pickup" ? "Ophalen" : "Verzenden (+€3.50)"}
                    </p>
                    <p className="font-medium text-green-600 mt-1">€{item.price.toFixed(2)}</p>

                    <div className="flex items-center mt-auto gap-2">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-r-none"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.colorName, item.size)}
                          disabled={isUpdating}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center relative">
                          {item.quantity}
                          {lastUpdated === item.id && (
                            <span className="absolute inset-0 flex items-center justify-center bg-green-100 text-green-800 animate-pulse rounded">
                              {item.quantity}
                            </span>
                          )}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-l-none"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.colorName, item.size)}
                          disabled={isUpdating}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveItem(item.id, item.colorName, item.size)}
                        disabled={isUpdating}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-right font-medium">
                    €{((item.price + (item.shippingCost || 0)) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => router.push("/webshop")} className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Verder winkelen
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Samenvatting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotaal</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Verzendkosten</span>
                <span>
                  €{items.reduce((sum, item) => sum + (item.shippingCost || 0) * item.quantity, 0).toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Totaal</span>
                <span className="text-green-600">€{total.toFixed(2)}</span>
              </div>

              <Alert className="mt-4 bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-800" />
                <AlertTitle className="text-amber-800">Belangrijk</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Onze hoodies vallen 1 maat kleiner! Bestel 1 maat groter dan normaal. Voor over motorkleding adviseren
                  we 2 maten groter te bestellen.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push("/checkout")} className="w-full">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Doorgaan naar bestellen
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

