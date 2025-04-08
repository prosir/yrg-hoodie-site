"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, Save, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
} from "@/lib/db-categories"
import { getProductsByCategoryId } from "@/lib/db-products"
import type { ProductCategory } from "@/lib/db-categories"

export default function HoodieCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [newCategory, setNewCategory] = useState<Partial<ProductCategory>>({
    name: "",
    slug: "",
    description: "",
    isClothing: false,
    sizes: [],
    active: true,
  })
  const [editingCategory, setEditingCategory] = useState<null | (Partial<ProductCategory> & { id: string })>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [productCounts, setProductCounts] = useState<Record<string, number>>({})
  const { toast } = useToast()

  // Haal categorieën op bij het laden van de pagina
  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true)
        const fetchedCategories = await getAllCategories()
        setCategories(fetchedCategories)

        // Haal het aantal producten per categorie op
        const counts: Record<string, number> = {}
        for (const category of fetchedCategories) {
          const products = await getProductsByCategoryId(category.id)
          counts[category.id] = products.length
        }
        setProductCounts(counts)
      } catch (error) {
        toast({
          title: "Fout bij het ophalen van categorieën",
          description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [toast])

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.slug) {
      toast({
        title: "Fout",
        description: "Vul alle verplichte velden in",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)

      // Genereer een slug als deze niet is ingevuld
      if (!newCategory.slug) {
        newCategory.slug = newCategory.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
      }

      const addedCategory = await addCategory(newCategory as Omit<ProductCategory, "id" | "createdAt" | "updatedAt">)
      setCategories([...categories, addedCategory])
      setNewCategory({
        name: "",
        slug: "",
        description: "",
        isClothing: false,
        sizes: [],
        active: true,
      })
      setIsDialogOpen(false)
      setProductCounts({ ...productCounts, [addedCategory.id]: 0 })

      toast({
        title: "Categorie toegevoegd",
        description: `De categorie "${addedCategory.name}" is succesvol toegevoegd.`,
      })
    } catch (error) {
      toast({
        title: "Fout bij het toevoegen van categorie",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditCategory = (category: ProductCategory) => {
    setEditingCategory({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      isClothing: category.isClothing,
      sizes: category.sizes,
      active: category.active,
    })
  }

  const handleSaveEdit = async () => {
    if (!editingCategory) return

    try {
      setIsSaving(true)
      const updatedCategory = await updateCategory(editingCategory.id, {
        name: editingCategory.name,
        slug: editingCategory.slug,
        description: editingCategory.description,
        isClothing: editingCategory.isClothing,
        sizes: editingCategory.sizes,
        active: editingCategory.active,
      })

      setCategories(categories.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat)))
      setEditingCategory(null)

      toast({
        title: "Categorie bijgewerkt",
        description: "De categorie is succesvol bijgewerkt.",
      })
    } catch (error) {
      toast({
        title: "Fout bij het bijwerken van categorie",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    const categoryToDelete = categories.find((cat) => cat.id === id)
    if (!categoryToDelete) return

    if (productCounts[id] > 0) {
      toast({
        title: "Kan niet verwijderen",
        description: "Deze categorie bevat producten en kan niet worden verwijderd.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      await deleteCategory(id)
      setCategories(categories.filter((cat) => cat.id !== id))

      toast({
        title: "Categorie verwijderd",
        description: "De categorie is succesvol verwijderd.",
      })
    } catch (error) {
      toast({
        title: "Fout bij het verwijderen van categorie",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      setIsSaving(true)
      const updatedCategory = await toggleCategoryActive(id, active)
      setCategories(categories.map((cat) => (cat.id === id ? updatedCategory : cat)))

      toast({
        title: active ? "Categorie geactiveerd" : "Categorie gedeactiveerd",
        description: `De categorie is succesvol ${active ? "geactiveerd" : "gedeactiveerd"}.`,
      })
    } catch (error) {
      toast({
        title: `Fout bij het ${active ? "activeren" : "deactiveren"} van categorie`,
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSizeChange = (size: string) => {
    if (!editingCategory) return

    const currentSizes = editingCategory.sizes || []
    const newSizes = currentSizes.includes(size) ? currentSizes.filter((s) => s !== size) : [...currentSizes, size]

    setEditingCategory({
      ...editingCategory,
      sizes: newSizes,
    })
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Productcategorieën</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nieuwe Categorie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nieuwe Categorie Toevoegen</DialogTitle>
              <DialogDescription>Voeg een nieuwe productcategorie toe voor de webshop.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Naam *</Label>
                <Input
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setNewCategory({
                      ...newCategory,
                      name,
                      slug: generateSlug(name),
                    })
                  }}
                  placeholder="Bijv. Hoodies"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={newCategory.slug}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, ""),
                    })
                  }
                  placeholder="bijv. hoodies"
                />
                <p className="text-sm text-gray-500">De slug wordt gebruikt in URLs en moet uniek zijn.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Beschrijving</Label>
                <Textarea
                  id="description"
                  value={newCategory.description || ""}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Beschrijving van de categorie"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isClothing"
                  checked={newCategory.isClothing}
                  onCheckedChange={(checked) => setNewCategory({ ...newCategory, isClothing: checked as boolean })}
                />
                <Label htmlFor="isClothing">Dit is een kledingcategorie (met maten)</Label>
              </div>
              {newCategory.isClothing && (
                <div className="space-y-2 pt-2">
                  <Label>Beschikbare maten</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["S", "M", "L", "XL", "XXL", "XXXL"].map((size) => (
                      <div key={size} className="flex items-center space-x-2">
                        <Checkbox
                          id={`size-${size}`}
                          checked={(newCategory.sizes || []).includes(size)}
                          onCheckedChange={(checked) => {
                            const currentSizes = newCategory.sizes || []
                            const newSizes = checked ? [...currentSizes, size] : currentSizes.filter((s) => s !== size)
                            setNewCategory({ ...newCategory, sizes: newSizes })
                          }}
                        />
                        <Label htmlFor={`size-${size}`}>{size}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="active"
                  checked={newCategory.active}
                  onCheckedChange={(checked) => setNewCategory({ ...newCategory, active: checked as boolean })}
                />
                <Label htmlFor="active">Categorie actief (zichtbaar in webshop)</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                Annuleren
              </Button>
              <Button onClick={handleAddCategory} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Categorie Toevoegen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle Categorieën</CardTitle>
          <CardDescription>Beheer de productcategorieën voor de webshop.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naam</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Aantal Producten</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {editingCategory?.id === category.id ? (
                        <Input
                          value={editingCategory.name}
                          onChange={(e) => {
                            const name = e.target.value
                            setEditingCategory({
                              ...editingCategory,
                              name,
                              // Alleen automatisch de slug updaten als deze niet handmatig is gewijzigd
                              slug: editingCategory.slug === category.slug ? generateSlug(name) : editingCategory.slug,
                            })
                          }}
                        />
                      ) : (
                        category.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCategory?.id === category.id ? (
                        <Input
                          value={editingCategory.slug}
                          onChange={(e) =>
                            setEditingCategory({
                              ...editingCategory,
                              slug: e.target.value
                                .toLowerCase()
                                .replace(/\s+/g, "-")
                                .replace(/[^a-z0-9-]/g, ""),
                            })
                          }
                        />
                      ) : (
                        <Badge variant="outline">{category.slug}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCategory?.id === category.id ? (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-isClothing-${category.id}`}
                            checked={editingCategory.isClothing}
                            onCheckedChange={(checked) =>
                              setEditingCategory({ ...editingCategory, isClothing: checked as boolean })
                            }
                          />
                          <Label htmlFor={`edit-isClothing-${category.id}`}>Kleding</Label>
                        </div>
                      ) : category.isClothing ? (
                        "Kleding"
                      ) : (
                        "Standaard"
                      )}
                    </TableCell>
                    <TableCell>{productCounts[category.id] || 0}</TableCell>
                    <TableCell>
                      {editingCategory?.id === category.id ? (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-active-${category.id}`}
                            checked={editingCategory.active}
                            onCheckedChange={(checked) =>
                              setEditingCategory({ ...editingCategory, active: checked as boolean })
                            }
                          />
                          <Label htmlFor={`edit-active-${category.id}`}>Actief</Label>
                        </div>
                      ) : (
                        <Badge variant={category.active ? "success" : "secondary"}>
                          {category.active ? "Actief" : "Inactief"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingCategory?.id === category.id ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={handleSaveEdit} disabled={isSaving}>
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4 mr-1" />
                            )}
                            Opslaan
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingCategory(null)}
                            disabled={isSaving}
                          >
                            Annuleren
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCategory(category)}
                            disabled={isSaving}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {category.active ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              onClick={() => handleToggleActive(category.id, false)}
                              disabled={isSaving}
                            >
                              Deactiveren
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleToggleActive(category.id, true)}
                              disabled={isSaving}
                            >
                              Activeren
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={isSaving || productCounts[category.id] > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Geen categorieën gevonden. Voeg een nieuwe categorie toe.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Toon maten bewerken dialoog als we een kledingcategorie bewerken */}
      {editingCategory?.isClothing && (
        <Dialog open={!!editingCategory?.isClothing} onOpenChange={(open) => !open && setEditingCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Maten bewerken</DialogTitle>
              <DialogDescription>Selecteer de beschikbare maten voor deze categorie.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              {["S", "M", "L", "XL", "XXL", "XXXL"].map((size) => (
                <div key={size} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-size-${size}`}
                    checked={(editingCategory.sizes || []).includes(size)}
                    onCheckedChange={() => handleSizeChange(size)}
                  />
                  <Label htmlFor={`edit-size-${size}`}>{size}</Label>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Opslaan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
