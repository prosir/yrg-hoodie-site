"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { getAllCategories, getCategoryById } from "@/lib/db-categories"
import { getProductById, updateProduct } from "@/lib/db-products"
import { saveBase64Image } from "@/lib/image-upload"
import type { ProductCategory } from "@/lib/db-categories"
import type { Product, ProductSize } from "@/lib/db-products"
import { ImagePlus, Trash2, Loader2, Save, ArrowLeft, Plus, Minus } from "lucide-react"

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null)
  const [productData, setProductData] = useState<Partial<Product>>({
    name: "",
    slug: "",
    description: "",
    categoryId: "",
    price: 0,
    images: [],
    sizes: [],
    colors: [],
    active: true,
    featured: false,
  })
  const [originalImages, setOriginalImages] = useState<string[]>([])

  // Haal product en categorieën op bij het laden van de pagina
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)

        // Haal product op
        const product = await getProductById(params.id)
        if (!product) {
          toast({
            title: "Product niet gevonden",
            description: "Het opgevraagde product kon niet worden gevonden.",
            variant: "destructive",
          })
          router.push("/admin/products")
          return
        }

        setProductData(product)
        setOriginalImages(product.images || [])

        // Haal categorieën op
        const fetchedCategories = await getAllCategories()
        setCategories(fetchedCategories)

        // Haal geselecteerde categorie op
        if (product.categoryId) {
          const category = await getCategoryById(product.categoryId)
          setSelectedCategory(category)
        }
      } catch (error) {
        toast({
          title: "Fout bij het ophalen van gegevens",
          description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, router, toast])

  // Update geselecteerde categorie wanneer categoryId verandert
  useEffect(() => {
    async function fetchCategory() {
      if (productData.categoryId) {
        try {
          const category = await getCategoryById(productData.categoryId)
          setSelectedCategory(category)

          // Als de categorie kleding is en maten heeft, initialiseer de maten als ze nog niet bestaan
          if (category?.isClothing && category.sizes && category.sizes.length > 0) {
            if (!productData.sizes || productData.sizes.length === 0) {
              const initialSizes: ProductSize[] = category.sizes.map((size) => ({
                name: size,
                stock: 0,
              }))
              setProductData((prev) => ({ ...prev, sizes: initialSizes }))
            }
          }
        } catch (error) {
          console.error("Fout bij het ophalen van categorie:", error)
        }
      } else {
        setSelectedCategory(null)
      }
    }

    fetchCategory()
  }, [productData.categoryId])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setUploadingImage(true)

      const file = files[0]
      const reader = new FileReader()

      reader.onload = async (event) => {
        if (event.target && typeof event.target.result === "string") {
          const base64Image = event.target.result

          // Upload de afbeelding naar de server
          const imagePath = await saveBase64Image(base64Image)

          // Voeg de afbeelding toe aan de productdata
          setProductData((prev) => ({
            ...prev,
            images: [...(prev.images || []), imagePath],
          }))

          // Reset het bestandsinvoerveld
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }

          toast({
            title: "Afbeelding geüpload",
            description: "De afbeelding is succesvol geüpload.",
          })
        }
      }

      reader.readAsDataURL(file)
    } catch (error) {
      toast({
        title: "Fout bij het uploaden van afbeelding",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = (index: number) => {
    const imageToRemove = productData.images?.[index]

    setProductData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index),
    }))
  }

  const updateStockForSize = (sizeName: string, newStock: number) => {
    if (!productData.sizes) return

    setProductData((prev) => ({
      ...prev,
      sizes: prev.sizes?.map((size) => (size.name === sizeName ? { ...size, stock: newStock } : size)),
    }))
  }

  const addColor = () => {
    setProductData((prev) => ({
      ...prev,
      colors: [...(prev.colors || []), ""],
    }))
  }

  const updateColor = (index: number, color: string) => {
    setProductData((prev) => ({
      ...prev,
      colors: prev.colors?.map((c, i) => (i === index ? color : c)),
    }))
  }

  const removeColor = (index: number) => {
    setProductData((prev) => ({
      ...prev,
      colors: prev.colors?.filter((_, i) => i !== index),
    }))
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
  }

  const handleSaveProduct = async () => {
    // Validatie
    if (!productData.name || !productData.categoryId || productData.price === undefined) {
      toast({
        title: "Fout bij het opslaan",
        description: "Vul alle verplichte velden in",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)

      // Genereer een slug als deze niet is ingevuld
      if (!productData.slug) {
        productData.slug = generateSlug(productData.name)
      }

      // Verwijder lege kleuren
      if (productData.colors) {
        productData.colors = productData.colors.filter((color) => color.trim() !== "")
      }

      // Update het product
      const updatedProduct = await updateProduct(params.id, {
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        categoryId: productData.categoryId,
        price: productData.price,
        images: productData.images,
        sizes: productData.sizes,
        colors: productData.colors,
        active: productData.active,
        featured: productData.featured,
      })

      toast({
        title: "Product bijgewerkt",
        description: "Het product is succesvol bijgewerkt.",
      })

      // Navigeer terug naar de productenlijst
      router.push("/admin/products")
    } catch (error) {
      toast({
        title: "Fout bij het opslaan van product",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/products")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug
          </Button>
          <h1 className="text-2xl font-bold">Product Bewerken</h1>
        </div>
        <Button onClick={handleSaveProduct} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Opslaan...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Wijzigingen Opslaan
            </>
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">Algemeen</TabsTrigger>
            <TabsTrigger value="images">Afbeeldingen</TabsTrigger>
            <TabsTrigger value="inventory">Voorraad & Maten</TabsTrigger>
            <TabsTrigger value="colors">Kleuren</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Algemene Informatie</CardTitle>
                <CardDescription>Bewerk de basisinformatie voor het product.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Productnaam *</Label>
                    <Input
                      id="name"
                      value={productData.name}
                      onChange={(e) => {
                        const name = e.target.value
                        setProductData({
                          ...productData,
                          name,
                          // Alleen automatisch de slug updaten als deze niet handmatig is gewijzigd
                          slug:
                            productData.slug === generateSlug(productData.name || "")
                              ? generateSlug(name)
                              : productData.slug,
                        })
                      }}
                      placeholder="Bijv. YoungRidersOost Hoodie"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={productData.slug}
                      onChange={(e) =>
                        setProductData({
                          ...productData,
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                            .replace(/[^a-z0-9-]/g, ""),
                        })
                      }
                      placeholder="bijv. youngridersoost-hoodie"
                    />
                    <p className="text-sm text-gray-500">De slug wordt gebruikt in URLs en moet uniek zijn.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Beschrijving</Label>
                  <Textarea
                    id="description"
                    value={productData.description || ""}
                    onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                    placeholder="Beschrijving van het product"
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categorie *</Label>
                    <Select
                      value={productData.categoryId}
                      onValueChange={(value) => setProductData({ ...productData, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer een categorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Prijs (€) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={productData.price || ""}
                      onChange={(e) => setProductData({ ...productData, price: Number.parseFloat(e.target.value) })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="active"
                      checked={productData.active}
                      onCheckedChange={(checked) => setProductData({ ...productData, active: checked as boolean })}
                    />
                    <Label htmlFor="active">Product actief (zichtbaar in webshop)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={productData.featured}
                      onCheckedChange={(checked) => setProductData({ ...productData, featured: checked as boolean })}
                    />
                    <Label htmlFor="featured">Featured product (wordt uitgelicht in de webshop)</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>Productafbeeldingen</CardTitle>
                <CardDescription>Beheer de afbeeldingen voor dit product.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {productData.images &&
                      productData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-md overflow-hidden border border-gray-200">
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={`Product afbeelding ${index + 1}`}
                              width={200}
                              height={200}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                    <div
                      className="aspect-square rounded-md border border-dashed border-gray-300 flex flex-col items-center justify-center p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadingImage ? (
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      ) : (
                        <>
                          <ImagePlus className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500 text-center">Klik om een afbeelding te uploaden</p>
                        </>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </div>
                  </div>

                  <p className="text-sm text-gray-500">
                    Tip: De eerste afbeelding wordt gebruikt als hoofdafbeelding in de webshop.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Voorraad & Maten</CardTitle>
                <CardDescription>
                  {selectedCategory?.isClothing
                    ? "Beheer de beschikbare maten en voorraad voor dit product."
                    : "Dit product heeft geen maten omdat het geen kledingproduct is."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedCategory?.isClothing ? (
                  <div className="space-y-4">
                    <div className="border rounded-md">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left">Maat</th>
                            <th className="px-4 py-2 text-left">Voorraad</th>
                            <th className="px-4 py-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productData.sizes &&
                            productData.sizes.map((size, index) => (
                              <tr key={index} className="border-b last:border-b-0">
                                <td className="px-4 py-2">{size.name}</td>
                                <td className="px-4 py-2">
                                  <div className="flex items-center">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 rounded-r-none"
                                      onClick={() => updateStockForSize(size.name, Math.max(0, size.stock - 1))}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={size.stock}
                                      onChange={(e) =>
                                        updateStockForSize(size.name, Number.parseInt(e.target.value) || 0)
                                      }
                                      className="h-8 rounded-none w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 rounded-l-none"
                                      onClick={() => updateStockForSize(size.name, size.stock + 1)}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </td>
                                <td className="px-4 py-2">
                                  <Badge variant={size.stock > 0 ? "success" : "secondary"}>
                                    {size.stock > 0 ? "Op voorraad" : "Niet op voorraad"}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    <p className="text-sm text-gray-500">
                      Tip: Stel de voorraad in op 0 om aan te geven dat een maat niet op voorraad is.
                    </p>
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <p>Selecteer eerst een kledingcategorie om maten en voorraad te beheren.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colors">
            <Card>
              <CardHeader>
                <CardTitle>Kleuren</CardTitle>
                <CardDescription>Beheer de kleuren voor dit product (optioneel).</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productData.colors &&
                    productData.colors.map((color, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={color}
                          onChange={(e) => updateColor(index, e.target.value)}
                          placeholder="Bijv. Zwart, Rood, Blauw"
                        />
                        <Button variant="outline" size="icon" className="shrink-0" onClick={() => removeColor(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                  <Button variant="outline" onClick={addColor}>
                    <Plus className="h-4 w-4 mr-2" />
                    Kleur Toevoegen
                  </Button>

                  <p className="text-sm text-gray-500">
                    Tip: Voeg kleuren toe als het product in verschillende kleuren beschikbaar is.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

