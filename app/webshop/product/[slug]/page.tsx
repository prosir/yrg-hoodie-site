"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ShoppingCart, ArrowLeft, Info, Plus, Minus, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/components/cart/cart-context"
import { getProductBySlug } from "@/lib/db-products"
import { getCategoryById } from "@/lib/db-categories"
import type { Product } from "@/lib/db-products"
import type { ProductCategory } from "@/lib/db-categories"
import { v4 as uuidv4 } from "uuid"
import type { CartItem } from "@/lib/cart"

export default function ProductPage({ params }: { params: { slug: string } }) {
  // Controleer of er andere dynamische routes zijn die conflicteren met deze
  // Bijvoorbeeld, als er een route is zoals /product/[color]/page.tsx
  // dan zou dat een conflict veroorzaken met /product/[slug]/page.tsx
  // omdat Next.js niet twee verschillende parameternamen kan hebben voor dezelfde route-structuur
  const [product, setProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<ProductCategory | null>(null)
  const [selectedSize, setSelectedSize] = useState("")
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "shipping">("pickup")
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const { addItem } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  // Haal product op bij het laden van de pagina
  useEffect(() => {
    async function fetchProduct() {
      try {
        setIsLoading(true)
        const fetchedProduct = await getProductBySlug(params.slug)

        if (!fetchedProduct) {
          toast({
            title: "Product niet gevonden",
            description: "Het opgevraagde product kon niet worden gevonden.",
            variant: "destructive",
          })
          router.push("/webshop")
          return
        }

        setProduct(fetchedProduct)

        // Haal categorie op
        if (fetchedProduct.categoryId) {
          const fetchedCategory = await getCategoryById(fetchedProduct.categoryId)
          setCategory(fetchedCategory)
        }
      } catch (error) {
        toast({
          title: "Fout bij het ophalen van product",
          description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [params.slug, router, toast])

  const shippingCost = deliveryMethod === "shipping" ? 3.5 : 0
  const totalPrice = product ? (product.price + shippingCost) * quantity : 0

  const handleAddToCart = () => {
    if (!product) return

    if (!selectedSize) {
      toast({
        title: "Selecteer een maat",
        description: "Kies een maat voordat je het product aan je winkelwagen toevoegt.",
        variant: "destructive",
      })
      return
    }

    const cartItem: CartItem = {
      id: uuidv4(),
      productId: product.id,
      name: product.name,
      size: selectedSize,
      color: product.slug.split("-")[0], // Assuming the slug starts with the color
      colorName: product.colorName || product.name, // Use colorName if available
      price: product.price,
      quantity: 1,
      image: product.images[0] || "/placeholder.svg?height=200&width=200",
      delivery: deliveryMethod,
      shippingCost: deliveryMethod === "shipping" ? 3.5 : 0,
    }

    addItem(cartItem)

    toast({
      title: "Product toegevoegd",
      description: `${product.name} (Maat ${selectedSize.toUpperCase()}) is toegevoegd aan je winkelwagen.`,
    })

    // Optionally, redirect to cart
    router.push("/cart")
  }

  const toggleSizeChart = () => {
    setShowSizeChart(!showSizeChart)
  }

  const incrementQuantity = () => {
    // Controleer of er voldoende voorraad is
    if (category?.isClothing && selectedSize) {
      const selectedSizeObj = product?.sizes?.find((size) => size.name === selectedSize)
      if (selectedSizeObj && quantity >= selectedSizeObj.stock) {
        toast({
          title: "Maximale voorraad bereikt",
          description: `Er zijn slechts ${selectedSizeObj.stock} stuks beschikbaar in maat ${selectedSize}.`,
          variant: "destructive",
        })
        return
      }
    }
    setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-olive-600" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Product niet gevonden</h1>
        <p className="text-gray-600 mb-6">Het opgevraagde product kon niet worden gevonden.</p>
        <Button asChild>
          <Link href="/webshop">Terug naar de webshop</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 bg-white text-gray-800">
      <Button
        variant="outline"
        onClick={() => router.push("/webshop")}
        className="mb-8 border-olive-600 text-gray-800 hover:bg-olive-50"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Terug naar producten
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {/* Hoofdafbeelding */}
          <div className="relative h-[400px] md:h-[500px] bg-secondary/30 rounded-lg overflow-hidden">
            <Image
              src={
                product.images && product.images.length > 0
                  ? product.images[0]
                  : "/placeholder.svg?height=400&width=400"
              }
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Miniatuurafbeeldingen */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-md overflow-hidden cursor-pointer">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} - afbeelding ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-gray-400 mt-2">YoungRidersOost officiële merchandise</p>
          </div>

          <div className="text-2xl font-bold text-olive-600">€{product.price.toFixed(2)}</div>

          {product.description && (
            <div className="prose max-w-none">
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Kleuren selectie */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <Label>Kleur</Label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color, index) => (
                    <div key={index} className="px-3 py-1 border rounded-md text-sm">
                      {color}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Maten selectie voor kledingproducten */}
            {category?.isClothing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="size">Maat</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={toggleSizeChart}
                    className="h-6 w-6 p-0 rounded-full"
                  >
                    <Info className="h-4 w-4" />
                    <span className="sr-only">Bekijk maattabel</span>
                  </Button>
                </div>
                <Select onValueChange={setSelectedSize} value={selectedSize}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-800">
                    <SelectValue placeholder="Selecteer maat" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 text-gray-800">
                    {product.sizes?.map((size) => (
                      <SelectItem key={size.name} value={size.name} disabled={size.stock <= 0}>
                        {size.name} {size.stock <= 0 ? "(Niet op voorraad)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-400">
                  Let op: Onze hoodies vallen 1 maat kleiner! Bestel 1 maat groter dan normaal. Voor over motorkleding
                  adviseren we 2 maten groter te bestellen.
                </p>
              </div>
            )}

            {showSizeChart && (
              <Card className="mt-2 mb-4 bg-white border-gray-200 text-gray-800">
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium mb-3">Maattabel YoungRidersOost Hoodies</h3>
                  <div className="relative h-72 bg-gray-50 rounded-md overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=600&width=800"
                      alt="Maattabel voor hoodies"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="mt-3 text-sm text-gray-600">
                    Tip: Voor normaal gebruik, neem één maat groter dan je gebruikelijke maat. Voor over motorkleding,
                    neem twee maten groter.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Hoeveelheid selector met animatie effecten */}
            <div className="space-y-2">
              <Label>Aantal</Label>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="h-10 w-10 rounded-r-none transition-all duration-200 hover:bg-olive-50 bg-white border-gray-300 text-gray-800"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="h-10 px-4 flex items-center justify-center border-t border-b border-gray-300 min-w-[60px] bg-white text-gray-800">
                  <span className="text-center font-medium text-lg">{quantity}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                  className="h-10 w-10 rounded-l-none transition-all duration-200 hover:bg-olive-50 bg-white border-gray-300 text-gray-800"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bezorgmethode</Label>
              <RadioGroup
                value={deliveryMethod}
                onValueChange={(value) => setDeliveryMethod(value as "pickup" | "shipping")}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pickup" id="pickup" className="text-olive-600" />
                  <Label htmlFor="pickup">Ophalen (Gratis)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="shipping" id="shipping" className="text-olive-600" />
                  <Label htmlFor="shipping">Verzending via Vinted GO (+€3.50)</Label>
                </div>
              </RadioGroup>
            </div>

            {deliveryMethod === "shipping" && (
              <Alert className="bg-gray-50 border-gray-200 text-gray-800">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Informatie over verzending</AlertTitle>
                <AlertDescription>
                  <p className="mb-1">
                    Bij verzending wordt je pakket verzonden via Vinted GO naar het dichtstbijzijnde pakketpunt.
                  </p>
                  <p>Je pakket is verzekerd en je ontvangt een track & trace code zodra het onderweg is.</p>
                </AlertDescription>
              </Alert>
            )}

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Totaalprijs:</span>
                <span className="text-olive-600">€{totalPrice.toFixed(2)}</span>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full relative overflow-hidden group bg-olive-600 hover:bg-olive-700"
                disabled={category?.isClothing && !selectedSize}
                size="lg"
              >
                <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-full bg-white/20 group-hover:translate-x-[-100%]"></span>
                <ShoppingCart className="mr-2 h-5 w-5" />
                In winkelwagen
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

