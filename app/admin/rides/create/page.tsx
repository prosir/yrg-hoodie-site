"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft } from "lucide-react"
import Image from "next/image"

export default function CreateRidePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    startLocation: "",
    distance: "",
    description: "",
    image: "",
    spots: 15,
    active: true,
    requireAccessCode: false,
    accessCode: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "spots" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Controleer bestandstype
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Ongeldig bestandstype",
        description: "Upload alleen afbeeldingen (JPG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    setImageFile(file)

    // Maak een preview van de afbeelding
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadImage = async () => {
    if (!imageFile) return null

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append("file", imageFile)
      formData.append("folder", "rides")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Fout bij het uploaden van de afbeelding")
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Fout bij het uploaden",
        description: "De afbeelding kon niet worden geüpload. Probeer het opnieuw.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Valideer de invoer
      if (!formData.title || !formData.date || !formData.time || !formData.startLocation || !formData.distance) {
        throw new Error("Vul alle verplichte velden in")
      }

      // Controleer of er een toegangscode is ingesteld als deze vereist is
      if (formData.requireAccessCode && !formData.accessCode) {
        throw new Error("Stel een toegangscode in als deze vereist is")
      }

      // Upload de afbeelding als er een is geselecteerd
      let imageUrl = formData.image
      if (imageFile) {
        const uploadedUrl = await uploadImage()
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      // Stuur de data naar de API
      const response = await fetch("/api/rides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl || "/placeholder.svg?height=600&width=800",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Er is een fout opgetreden bij het aanmaken van de rit")
      }

      toast({
        title: "Rit aangemaakt",
        description: "De rit is succesvol aangemaakt",
      })

      // Navigeer terug naar de ritten pagina
      router.push("/admin/rides")
      router.refresh()
    } catch (error) {
      toast({
        title: "Fout",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug
        </Button>
        <h1 className="text-2xl font-bold">Nieuwe Rit Aanmaken</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Rit Details</CardTitle>
            <CardDescription>Vul de details in voor de nieuwe motorrit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Twente Tour"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startLocation">Startlocatie *</Label>
                <Input
                  id="startLocation"
                  name="startLocation"
                  value={formData.startLocation}
                  onChange={handleChange}
                  placeholder="Enschede"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Datum *</Label>
                <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Tijd *</Label>
                <Input id="time" name="time" type="time" value={formData.time} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="distance">Afstand *</Label>
                <Input
                  id="distance"
                  name="distance"
                  value={formData.distance}
                  onChange={handleChange}
                  placeholder="180 km"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="spots">Aantal plekken *</Label>
                <Input
                  id="spots"
                  name="spots"
                  type="number"
                  min="1"
                  value={formData.spots}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschrijving</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Een prachtige route door het Twentse landschap met stops bij mooie uitzichtpunten en een gezellige lunchpauze."
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <Label>Afbeelding</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                  ref={fileInputRef}
                />
                {imageFile && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ""
                      }
                    }}
                  >
                    Annuleren
                  </Button>
                )}
              </div>

              {imagePreview && (
                <div className="mt-4 relative h-48 w-full md:w-1/2 overflow-hidden rounded-md border">
                  <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-2">Toegangsinstellingen</h3>

              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="requireAccessCode"
                  checked={formData.requireAccessCode}
                  onCheckedChange={(checked) => handleSwitchChange("requireAccessCode", checked)}
                />
                <Label htmlFor="requireAccessCode">Toegangscode vereisen</Label>
              </div>

              {formData.requireAccessCode && (
                <div className="space-y-2">
                  <Label htmlFor="accessCode">Toegangscode *</Label>
                  <Input
                    id="accessCode"
                    name="accessCode"
                    value={formData.accessCode}
                    onChange={handleChange}
                    placeholder="Voer een toegangscode in"
                    required={formData.requireAccessCode}
                  />
                  <p className="text-sm text-gray-500">
                    Deelnemers moeten deze code invoeren om zich aan te kunnen melden voor de rit.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => handleSwitchChange("active", checked)}
              />
              <Label htmlFor="active">Rit actief</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              Annuleren
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Rit Aanmaken
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

