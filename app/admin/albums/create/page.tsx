"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, Save, Plus, Trash2, Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function CreateAlbum() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<{ id: string; file: File | null; preview: string }[]>([])
  const { toast } = useToast()

  const handleAddImage = () => {
    setImages([...images, { id: Date.now().toString(), file: null, preview: "/placeholder.svg?height=200&width=200" }])
  }

  const handleImageChange = (id: string, file: File) => {
    setImages(
      images.map((img) => {
        if (img.id === id) {
          return {
            ...img,
            file,
            preview: URL.createObjectURL(file),
          }
        }
        return img
      }),
    )
  }

  const handleRemoveImage = (id: string) => {
    setImages(images.filter((img) => img.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Album aangemaakt",
        description: "Het album is succesvol aangemaakt.",
      })
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Nieuw Album Aanmaken</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Album Informatie</CardTitle>
              <CardDescription>Vul de basisgegevens van het album in.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel</Label>
                <Input id="title" placeholder="Bijv. Twente Tour 2025" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categorie</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer een categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rides">Ritten</SelectItem>
                    <SelectItem value="events">Evenementen</SelectItem>
                    <SelectItem value="members">Leden</SelectItem>
                    <SelectItem value="other">Overig</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschrijving</Label>
                <Textarea id="description" placeholder="Beschrijf het album" className="min-h-[150px]" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Datum</Label>
                <Input id="date" type="date" required />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Foto's</CardTitle>
              <CardDescription>Voeg foto's toe aan het album.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button type="button" onClick={handleAddImage} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Foto Toevoegen
              </Button>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                      <img
                        src={image.preview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="cursor-pointer">
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageChange(image.id, e.target.files[0])
                            }
                          }}
                        />
                        <Button size="sm" variant="secondary" className="bg-white/80 hover:bg-white">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </label>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="bg-white/80 hover:bg-red-100 text-red-600"
                        onClick={() => handleRemoveImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {images.length === 0 && (
                <div className="text-center py-8 border border-dashed rounded-md">
                  <ImageIcon className="h-10 w-10 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-500">Nog geen foto's toegevoegd</p>
                  <Button type="button" onClick={handleAddImage} className="mt-4" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Foto Toevoegen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline">
            Annuleren
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Opslaan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Album Aanmaken
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

