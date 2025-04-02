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
import Link from "next/link"

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, subtotal, shippingCost, total } = useCart()
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleQuantityChange = (id: string, newQuantity: number) => {
    setIsUpdating(true)
    updateQuantity(id, newQuantity)
    setTimeout(() => setIsUpdating(false), 300)
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        {/* Navigatie balk */}
        <header className="border-b py-6 mb-8">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary">YoungRidersOost</h1>
            </Link>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <nav>
                <ul className="flex space-x-6">
                  <li>
                    <Link href="/#hoodies" className="text-muted-foreground hover:text-primary transition-colors">
                      Hoodies
                    </Link>
                  </li>
                  <li>
                    <Link href="/#info" className="text-muted-foreground hover:text-primary transition-colors">
                      Info
                    </Link>
                  </li>
                  <li>
                    <Link href="/#crew" className="text-muted-foreground hover:text-primary transition-colors">
                      Crew
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </header>

        <h1 className="text-2xl font-bold mb-8">Winkelwagen</h1>
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <ShoppingCart className="h-16 w-16 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Je winkelwagen is leeg</h2>
              <p className="text-muted-foreground">Voeg producten toe aan je winkelwagen om te bestellen.</p>
              <Button onClick={() => router.push("/")} className="mt-4">
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
    <div className="container mx-auto px-4 py-12">
      {/* Navigatie balk */}
      <header className="border-b py-6 mb-8">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary">YoungRidersOost</h1>
          </Link>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <Link href="/#hoodies" className="text-muted-foreground hover:text-primary transition-colors">
                    Hoodies
                  </Link>
                </li>
                <li>
                  <Link href="/#info" className="text-muted-foreground hover:text-primary transition-colors">
                    Info
                  </Link>
                </li>
                <li>
                  <Link href="/#crew" className="text-muted-foreground hover:text-primary transition-colors">
                    Crew
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <h1 className="text-2xl font-bold mb-8">Winkelwagen</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Producten</CardTitle>
              <CardDescription>Je hebt {totalItems} product(en) in je winkelwagen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-4 py-4 border-b">
                  <div className="relative h-24 w-24 sm:h-32 sm:w-32 bg-secondary/30 rounded-md overflow-hidden">
                    <Image src={item.image || "/placeholder.svg"} alt={item.colorName} fill className="object-cover" />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <h3 className="font-medium">{item.colorName} Hoodie</h3>
                    <p className="text-sm text-muted-foreground">Maat: {item.size.toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.delivery === "pickup" ? "Ophalen" : "Verzenden (+€3.50)"}
                    </p>
                    <p className="font-medium text-primary mt-1">€{item.price.toFixed(2)}</p>

                    <div className="flex items-center mt-auto gap-2">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-r-none"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={isUpdating}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-l-none"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={isUpdating}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-right font-medium">
                    €{((item.price + item.shippingCost) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => router.push("/")} className="w-full sm:w-auto">
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
                <span>Subtotaal</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Verzendkosten</span>
                <span>€{items.reduce((sum, item) => sum + item.shippingCost * item.quantity, 0).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Totaal</span>
                <span>€{total.toFixed(2)}</span>
              </div>

              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Belangrijk</AlertTitle>
                <AlertDescription>
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

