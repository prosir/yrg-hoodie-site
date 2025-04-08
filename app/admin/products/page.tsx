"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Star, Filter, Loader2, ImageIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getAllProducts, toggleProductActive, deleteProduct } from "@/lib/db-products"
import { getAllCategories } from "@/lib/db-categories"
import type { Product } from "@/lib/db-products"
import type { ProductCategory } from "@/lib/db-categories"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const { toast } = useToast()

  // Haal producten en categorieën op bij het laden van de pagina
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const [fetchedProducts, fetchedCategories] = await Promise.all([getAllProducts(), getAllCategories()])
        setProducts(fetchedProducts)
        setCategories(fetchedCategories)
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

  // Filter producten op basis van zoekopdracht en filters
  const filteredProducts = products.filter((product) => {
    // Filter op zoekopdracht
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter op categorie
    const matchesCategory = categoryFilter === null || product.categoryId === categoryFilter

    // Filter op status
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && product.active) ||
      (statusFilter === "inactive" && !product.active)

    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      setIsSaving(true)
      const updatedProduct = await toggleProductActive(id, active)
      setProducts(products.map((product) => (product.id === id ? updatedProduct : product)))

      toast({
        title: active ? "Product geactiveerd" : "Product gedeactiveerd",
        description: `Het product is succesvol ${active ? "geactiveerd" : "gedeactiveerd"}.`,
      })
    } catch (error) {
      toast({
        title: `Fout bij het ${active ? "activeren" : "deactiveren"} van product`,
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      setIsSaving(true)
      await deleteProduct(id)
      setProducts(products.filter((product) => product.id !== id))

      toast({
        title: "Product verwijderd",
        description: "Het product is succesvol verwijderd.",
      })
    } catch (error) {
      toast({
        title: "Fout bij het verwijderen van product",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.name : "Onbekende categorie"
  }

  const resetFilters = () => {
    setSearchQuery("")
    setCategoryFilter(null)
    setStatusFilter("all")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Producten</h1>
        <Button asChild>
          <Link href="/admin/products/create">
            <Plus className="mr-2 h-4 w-4" />
            Nieuw Product
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle Producten</CardTitle>
          <CardDescription>Beheer de producten in de webshop.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Zoek op naam of beschrijving..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Categorie
                    {categoryFilter && <Badge className="ml-2">1</Badge>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter op categorie</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setCategoryFilter(null)}>Alle categorieën</DropdownMenuItem>
                    {categories.map((category) => (
                      <DropdownMenuItem key={category.id} onClick={() => setCategoryFilter(category.id)}>
                        {category.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Status
                    {statusFilter !== "all" && <Badge className="ml-2">1</Badge>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter op status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>Alle producten</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                      Alleen actieve producten
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                      Alleen inactieve producten
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {(searchQuery || categoryFilter || statusFilter !== "all") && (
                <Button variant="ghost" onClick={resetFilters}>
                  Reset filters
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Afbeelding</TableHead>
                    <TableHead>Naam</TableHead>
                    <TableHead>Categorie</TableHead>
                    <TableHead>Prijs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="relative h-10 w-10 rounded-md overflow-hidden bg-gray-100">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        {product.featured && (
                          <div className="flex items-center mt-1">
                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                            <span className="text-xs text-gray-500">Featured</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                      <TableCell>€{product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={product.active ? "success" : "secondary"}>
                          {product.active ? "Actief" : "Inactief"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/products/edit/${product.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={
                              product.active
                                ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                : "text-green-600 hover:text-green-700 hover:bg-green-50"
                            }
                            onClick={() => handleToggleActive(product.id, !product.active)}
                            disabled={isSaving}
                          >
                            {product.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={isSaving}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {products.length === 0
                          ? "Geen producten gevonden. Voeg een nieuw product toe."
                          : "Geen producten gevonden die voldoen aan de filters."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
