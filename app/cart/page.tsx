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
import { Logo } from "@/components/logo"

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
      <div className="min-h-screen bg-black text-white">
        {/* Navigatie balk */}
        <header className="border-b border-gray-200 py-6">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
            <Logo />
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <nav>
                <ul className="flex space-x-6">
                  <li>
                    <Link href="/" className="text-gray-700 hover:text-olive-600 transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/webshop" className="text-gray-700 hover:text-olive-600 transition-colors">
                      Webshop
                    </Link>
                  </li>
                  <li>
                    <Link href="/gallery" className="text-gray-700 hover:text-olive-600 transition-colors">
                      Galerij
                    </Link>
                  </li>
                  <li>
                    <Link href="/rides" className="text-gray-700 hover:text-olive-600 transition-colors">
                      Ritten
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-8 text-gray-800">Winkelwagen</h1>
          <Card className="text-center py-12 bg-white border-gray-200 text-gray-800">
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <ShoppingCart className="h-16 w-16 text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-800">Je winkelwagen is leeg</h2>
                <p className="text-gray-600">Voeg producten toe aan je winkelwagen om te bestellen.</p>
                <Button onClick={() => router.push("/webshop")} className="mt-4 bg-olive-600 hover:bg-olive-700">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Terug naar producten
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigatie balk */}
      <header className="border-b border-gray-200 py-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
          <Logo />
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <Link href="/" className="text-gray-700 hover:text-olive-600 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/webshop" className="text-gray-700 hover:text-olive-600 transition-colors">
                    Webshop
                  </Link>
                </li>
                <li>
                  <Link href="/gallery" className="text-gray-700 hover:text-olive-600 transition-colors">
                    Galerij
                  </Link>
                </li>
                <li>
                  <Link href="/rides" className="text-gray-700 hover:text-olive-600 transition-colors">
                    Ritten
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-8 text-gray-800">Winkelwagen</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white border-gray-200 text-gray-800">
              <CardHeader>
                <CardTitle>Producten</CardTitle>
                <CardDescription className="text-gray-600">
                  Je hebt {totalItems} product(en) in je winkelwagen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-4 py-4 border-b border-gray-200">
                    <div className="relative h-24 w-24 sm:h-32 sm:w-32 bg-gray-100 rounded-md overflow-hidden">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.colorName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col">
                      <h3 className="font-medium text-gray-800">{item.colorName} Hoodie</h3>
                      <p className="text-sm text-gray-600">Maat: {item.size.toUpperCase()}</p>
                      <p className="text-sm text-gray-600">
                        {item.delivery === "pickup" ? "Ophalen" : "Verzenden (+€3.50)"}
                      </p>
                      <p className="font-medium text-olive-600 mt-1">€{item.price.toFixed(2)}</p>

                      <div className="flex items-center mt-auto gap-2">
                        <div className="flex items-center border border-gray-300 rounded-md bg-white">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-r-none text-gray-800"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={isUpdating}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-l-none text-gray-800"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={isUpdating}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-olive-600 hover:text-olive-700 hover:bg-gray-100"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-right font-medium text-gray-800">
                      €{((item.price + item.shippingCost) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => router.push("/webshop")}
                  className="w-full sm:w-auto border-olive-600 text-gray-800 hover:bg-olive-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Verder winkelen
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div>
            <Card className="bg-white border-gray-200 text-gray-800">
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
                  <span>€{items.reduce((sum, item) => sum + item.shippingCost * item.quantity, 0).toFixed(2)}</span>
                </div>
                <Separator className="bg-gray-200" />
                <div className="flex justify-between font-bold">
                  <span>Totaal</span>
                  <span className="text-olive-600">€{total.toFixed(2)}</span>
                </div>

                <Alert className="mt-4 bg-gray-50 border-gray-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Belangrijk</AlertTitle>
                  <AlertDescription className="text-gray-700">
                    Onze hoodies vallen 1 maat kleiner! Bestel 1 maat groter dan normaal. Voor over motorkleding
                    adviseren we 2 maten groter te bestellen.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button onClick={() => router.push("/checkout")} className="w-full bg-olive-600 hover:bg-olive-700">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Doorgaan naar bestellen
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

