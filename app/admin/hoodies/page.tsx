"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { SiteSettings } from "@/app/admin-components/site-settings"
import { Loader2, Settings, Tag, ShoppingBag, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getAllCategories } from "@/lib/db-categories"
import { getAllProducts } from "@/lib/db-products"
import type { ProductCategory } from "@/lib/db-categories"
import type { Product } from "@/lib/db-products"

export default function HoodiesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Haal categorieën en producten op bij het laden van de pagina
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const [fetchedCategories, fetchedProducts] = await Promise.all([getAllCategories(), getAllProducts()])
        setCategories(fetchedCategories)
        setProducts(fetchedProducts)
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
  }, [toast])

  // Bereken het aantal producten per categorie
  const getProductCountByCategory = (categoryId: string) => {
    return products.filter((product) => product.categoryId === categoryId).length
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Webshop Beheer</h1>
      </div>

      <Tabs defaultValue="categories">
        <TabsList className="mb-4">
          <TabsTrigger value="categories">
            <Tag className="h-4 w-4 mr-2" />
            Categorieën
          </TabsTrigger>
          <TabsTrigger value="products">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Producten
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Instellingen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Categorieën</CardTitle>
                  <CardDescription>Beheer de productcategorieën voor de webshop.</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/admin/hoodies/categories">
                    <Plus className="h-4 w-4 mr-2" />
                    Nieuwe Categorie
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Geen categorieën gevonden. Voeg een nieuwe categorie toe.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <Card key={category.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          {category.isClothing ? "Kledingcategorie met maten" : "Standaard categorie"}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <Badge variant={category.active ? "success" : "secondary"}>
                            {category.active ? "Actief" : "Inactief"}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {getProductCountByCategory(category.id)} producten
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Producten</CardTitle>
                  <CardDescription>Beheer de producten in de webshop.</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/admin/products/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Nieuw Product
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {products.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Geen producten gevonden. Voeg een nieuw product toe.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Recente Producten</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {products.slice(0, 5).map((product) => (
                          <li key={product.id} className="flex justify-between items-center">
                            <Link href={`/admin/products/edit/${product.id}`} className="hover:underline">
                              {product.name}
                            </Link>
                            <Badge variant={product.active ? "success" : "secondary"}>
                              {product.active ? "Actief" : "Inactief"}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Voorraad Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {products
                          .filter((product) => {
                            const category = categories.find((cat) => cat.id === product.categoryId)
                            return (
                              category?.isClothing && product.sizes && product.sizes.some((size) => size.stock <= 3)
                            )
                          })
                          .slice(0, 5)
                          .map((product) =>
                            product.sizes
                              ?.filter((size) => size.stock <= 3)
                              .map((size) => (
                                <li key={`${product.id}-${size.name}`} className="flex justify-between items-center">
                                  <span>
                                    {product.name} - Maat {size.name.toUpperCase()}
                                  </span>
                                  <Badge
                                    variant={size.stock === 0 ? "destructive" : "outline"}
                                    className="text-red-500"
                                  >
                                    {size.stock === 0 ? "Uitverkocht" : `Nog ${size.stock} stuks`}
                                  </Badge>
                                </li>
                              )),
                          )}
                        {products.filter((product) => {
                          const category = categories.find((cat) => cat.id === product.categoryId)
                          return category?.isClothing && product.sizes && product.sizes.some((size) => size.stock <= 3)
                        }).length === 0 && (
                          <li className="text-gray-500 text-sm">Alle producten hebben voldoende voorraad.</li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <SiteSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
