"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { RefreshCw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

type SiteConfig = {
  homeHeroImage: string
  contactHeroImage: string
  logoPath: string
}

export default function SiteImagesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [config, setConfig] = useState<SiteConfig>({
    homeHeroImage: "",
    contactHeroImage: "",
    logoPath: "",
  })
  const [homeImageFile, setHomeImageFile] = useState<File | null>(null)
  const [contactImageFile, setContactImageFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [homeImagePreview, setHomeImagePreview] = useState<string>("")
  const [contactImagePreview, setContactImagePreview] = useState<string>("")
  const [logoPreview, setLogoPreview] = useState<string>("")

  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch("/api/site-config")
        if (response.ok) {
          const data = await response.json()
          setConfig(data)
          setHomeImagePreview(data.homeHeroImage)
          setContactImagePreview(data.contactHeroImage)
          setLogoPreview(data.logoPath)
        } else {
          throw new Error("Failed to fetch site configuration")
        }
      } catch (error) {
        console.error("Error fetching site configuration:", error)
        toast({
          title: "Fout",
          description: "Er is een fout opgetreden bij het ophalen van de site configuratie.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchConfig()
  }, [toast])

  const handleHomeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setHomeImageFile(file)
      setHomeImagePreview(URL.createObjectURL(file))
    }
  }

  const handleContactImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setContactImageFile(file)
      setContactImagePreview(URL.createObjectURL(file))
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const uploadImage = async (file: File, type: "home" | "contact" | "logo") => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)

    const response = await fetch("/api/upload-site-image", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to upload ${type} image`)
    }

    const data = await response.json()
    return data.path
  }

  const saveHomeImage = async () => {
    if (!homeImageFile) return config.homeHeroImage

    try {
      const path = await uploadImage(homeImageFile, "home")
      return path
    } catch (error) {
      console.error("Error uploading home image:", error)
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het uploaden van de home afbeelding.",
        variant: "destructive",
      })
      return config.homeHeroImage
    }
  }

  const saveContactImage = async () => {
    if (!contactImageFile) return config.contactHeroImage

    try {
      const path = await uploadImage(contactImageFile, "contact")
      return path
    } catch (error) {
      console.error("Error uploading contact image:", error)
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het uploaden van de contact afbeelding.",
        variant: "destructive",
      })
      return config.contactHeroImage
    }
  }

  const saveLogo = async () => {
    if (!logoFile) return config.logoPath

    try {
      const path = await uploadImage(logoFile, "logo")
      return path
    } catch (error) {
      console.error("Error uploading logo:", error)
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het uploaden van het logo.",
        variant: "destructive",
      })
      return config.logoPath
    }
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Upload images if changed
      const homeImagePath = await saveHomeImage()
      const contactImagePath = await saveContactImage()
      const logoPath = await saveLogo()

      // Update configuration
      const response = await fetch("/api/update-site-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          homeHeroImage: homeImagePath,
          contactHeroImage: contactImagePath,
          logoPath: logoPath,
        }),
      })

      if (response.ok) {
        toast({
          title: "Succes",
          description: "Afbeeldingen zijn succesvol bijgewerkt.",
          variant: "default",
        })

        // Update local state
        setConfig({
          ...config,
          homeHeroImage: homeImagePath,
          contactHeroImage: contactImagePath,
          logoPath: logoPath,
        })

        // Refresh the page to show updated images
        router.refresh()
      } else {
        throw new Error("Failed to update site images")
      }
    } catch (error) {
      console.error("Error saving site images:", error)
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het opslaan van de afbeeldingen.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 py-8 flex justify-center items-center min-h-[60vh]">
        <RefreshCw className="h-8 w-8 animate-spin text-olive-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Website Afbeeldingen</h1>

      <Tabs defaultValue="home">
        <TabsList className="mb-6">
          <TabsTrigger value="home">Home Pagina</TabsTrigger>
          <TabsTrigger value="contact">Contact Pagina</TabsTrigger>
          <TabsTrigger value="logo">Logo</TabsTrigger>
        </TabsList>

        <TabsContent value="home">
          <Card>
            <CardHeader>
              <CardTitle>Home Pagina Hero Afbeelding</CardTitle>
              <CardDescription>
                Deze afbeelding wordt weergegeven bovenaan de home pagina. Aanbevolen formaat: 1920x1080 pixels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200">
                  <Image
                    src={homeImagePreview || "/placeholder.svg?height=1080&width=1920"}
                    alt="Home hero preview"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="homeImage">Upload nieuwe afbeelding</Label>
                  <Input id="homeImage" type="file" accept="image/*" onChange={handleHomeImageChange} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Pagina Hero Afbeelding</CardTitle>
              <CardDescription>
                Deze afbeelding wordt weergegeven bovenaan de contact pagina. Aanbevolen formaat: 1920x640 pixels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg border border-gray-200">
                  <Image
                    src={contactImagePreview || "/placeholder.svg?height=640&width=1920"}
                    alt="Contact hero preview"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="contactImage">Upload nieuwe afbeelding</Label>
                  <Input id="contactImage" type="file" accept="image/*" onChange={handleContactImageChange} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logo">
          <Card>
            <CardHeader>
              <CardTitle>Website Logo</CardTitle>
              <CardDescription>
                Dit logo wordt weergegeven in de navigatiebalk. Aanbevolen formaat: vierkant, minimaal 200x200 pixels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="relative h-40 w-40 overflow-hidden rounded-lg border border-gray-200">
                  <Image
                    src={logoPreview || "/placeholder.svg?height=200&width=200"}
                    alt="Logo preview"
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="logo">Upload nieuw logo</Label>
                  <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="bg-olive-600 hover:bg-olive-700">
          {isSaving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Opslaan...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Wijzigingen opslaan
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
