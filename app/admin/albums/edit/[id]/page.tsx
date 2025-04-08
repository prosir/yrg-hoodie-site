"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, Save, Trash2, Check, Film, Edit, ImageIcon as ImageLucide, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { saveBase64Image } from "@/lib/image-upload"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { MotorcycleLoader } from "@/components/motorcycle-loader"

interface AlbumMedia {
  id?: string
  path: string
  title: string
  description: string
  type: "image" | "video"
  order: number
}

interface Album {
  id: string
  title: string
  description: string
  category: string
  date: string
  coverImage: string
  images: AlbumMedia[]
}

export default function EditAlbum({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [album, setAlbum] = useState<Album | null>(null)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [media, setMedia] = useState<
    {
      id: string
      file: File | null
      preview: string
      type: "image" | "video"
      title: string
      description: string
      path?: string
      isExisting?: boolean
      uploading?: boolean
      uploaded?: boolean
    }[]
  >([])
  const [editMediaDialog, setEditMediaDialog] = useState(false)
  const [currentEditMedia, setCurrentEditMedia] = useState<{
    id: string
    title: string
    description: string
  } | null>(null)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/albums/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch album")
        }

        const albumData = await response.json()
        setAlbum(albumData)

        // Set form values
        setTitle(albumData.title)
        setCategory(albumData.category)
        setDescription(albumData.description)
        setDate(albumData.date)

        // Set media
        const mediaItems = albumData.images.map((image: AlbumMedia) => ({
          id: image.id || `existing-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file: null,
          preview: image.path,
          type: image.type,
          title: image.title,
          description: image.description,
          path: image.path,
          isExisting: true,
        }))

        setMedia(mediaItems)
      } catch (error) {
        console.error("Error fetching album:", error)
        toast({
          title: "Fout bij ophalen",
          description: "Het album kon niet worden opgehaald.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlbum()
  }, [params.id, toast])

  const handleAddImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleAddVideo = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click()
    }
  }

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Process each file
    Array.from(files).forEach((file) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 9)

      // Create object URL for preview
      const preview = type === "image" ? URL.createObjectURL(file) : URL.createObjectURL(file)

      setMedia((prev) => [
        ...prev,
        {
          id,
          file,
          preview,
          type,
          title: file.name.split(".")[0] || `Nieuwe ${type === "image" ? "afbeelding" : "video"}`,
          description: "",
        },
      ])
    })

    // Reset the input
    e.target.value = ""
  }

  const handleRemoveMedia = (id: string) => {
    setMedia(media.filter((item) => item.id !== id))
  }

  const handleEditMedia = (id: string) => {
    const mediaItem = media.find((item) => item.id === id)
    if (mediaItem) {
      setCurrentEditMedia({
        id: mediaItem.id,
        title: mediaItem.title,
        description: mediaItem.description,
      })
      setEditMediaDialog(true)
    }
  }

  const saveMediaEdit = () => {
    if (!currentEditMedia) return

    setMedia((prev) =>
      prev.map((item) =>
        item.id === currentEditMedia.id
          ? { ...item, title: currentEditMedia.title, description: currentEditMedia.description }
          : item,
      ),
    )

    setEditMediaDialog(false)
    setCurrentEditMedia(null)

    toast({
      title: "Media bijgewerkt",
      description: "De titel en beschrijving zijn bijgewerkt.",
    })
  }

  const uploadMedia = async (file: File, type: "image" | "video"): Promise<string> => {
    try {
      // Convert file to base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = async () => {
          try {
            const base64Data = reader.result as string
            // Upload the file
            const filePath = await saveBase64Image(base64Data, "albums")
            resolve(filePath)
          } catch (error) {
            reject(error)
          }
        }
        reader.onerror = (error) => reject(error)
      })
    } catch (error) {
      console.error(`Error uploading ${type}:`, error)
      throw new Error(`Could not upload ${type}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !category || !date) {
      toast({
        title: "Ontbrekende velden",
        description: "Vul alle verplichte velden in.",
        variant: "destructive",
      })
      return
    }

    if (media.length === 0) {
      toast({
        title: "Geen media",
        description: "Voeg ten minste één afbeelding of video toe aan het album.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Upload all new media first
      const uploadedMedia = []

      for (let i = 0; i < media.length; i++) {
        const item = media[i]

        if (item.isExisting) {
          // Add existing media to the array
          uploadedMedia.push({
            path: item.path,
            title: item.title,
            description: item.description,
            type: item.type,
            order: i,
          })
        } else if (item.file) {
          // Update status to uploading
          setMedia((prev) => prev.map((m) => (m.id === item.id ? { ...m, uploading: true } : m)))

          // Upload the media
          const filePath = await uploadMedia(item.file, item.type)

          // Add to uploaded media array
          uploadedMedia.push({
            path: filePath,
            title: item.title,
            description: item.description,
            type: item.type,
            order: i,
          })

          // Update status to uploaded
          setMedia((prev) => prev.map((m) => (m.id === item.id ? { ...m, uploading: false, uploaded: true } : m)))
        }
      }

      // Find the first image to use as cover
      const firstImage = uploadedMedia.find((item) => item.type === "image")
      const coverImage = firstImage ? firstImage.path : album?.coverImage || ""

      // Update the album with the uploaded media
      const response = await fetch(`/api/albums/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          category,
          date,
          coverImage,
          images: uploadedMedia,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update album")
      }

      toast({
        title: "Album bijgewerkt",
        description: "Het album is succesvol bijgewerkt.",
      })

      // Redirect to albums page
      router.push("/admin/albums")
    } catch (error) {
      console.error("Error updating album:", error)
      toast({
        title: "Fout bij bijwerken",
        description: "Er is een fout opgetreden bij het bijwerken van het album.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <MotorcycleLoader />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/albums")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Album Bewerken</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Album Informatie</CardTitle>
              <CardDescription>Bewerk de basisgegevens van het album.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  placeholder="Bijv. Twente Tour 2025"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categorie</Label>
                <Select value={category} onValueChange={setCategory}>
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
                <Textarea
                  id="description"
                  placeholder="Beschrijf het album"
                  className="min-h-[150px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Datum</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <CardDescription>Bewerk foto's en video's in het album.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button type="button" onClick={handleAddImage} className="flex-1">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Foto's Toevoegen
                </Button>
                <Button type="button" onClick={handleAddVideo} className="flex-1">
                  <Film className="mr-2 h-4 w-4" />
                  Video's Toevoegen
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileSelected(e, "image")}
                />
                <Input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileSelected(e, "video")}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {media.map((item) => (
                  <div key={item.id} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                      {item.type === "image" ? (
                        <img
                          src={item.preview || "/placeholder.svg"}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white relative">
                          <Film className="h-10 w-10 mb-2" />
                          <span className="text-sm text-center px-2 truncate max-w-full">{item.title}</span>
                          {item.preview && (
                            <video
                              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity"
                              src={item.preview}
                              muted
                              onMouseOver={(e) => e.currentTarget.play()}
                              onMouseOut={(e) => {
                                e.currentTarget.pause()
                                e.currentTarget.currentTime = 0
                              }}
                            />
                          )}
                        </div>
                      )}
                      {item.uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
                        </div>
                      )}
                      {item.uploaded && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        {item.type === "image" ? (
                          <ImageLucide className="h-5 w-5 text-white bg-black/50 p-1 rounded-full" />
                        ) : (
                          <Film className="h-5 w-5 text-white bg-black/50 p-1 rounded-full" />
                        )}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/80 hover:bg-white"
                        onClick={() => handleEditMedia(item.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="bg-white/80 hover:bg-red-100 text-red-600"
                        onClick={() => handleRemoveMedia(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {media.length === 0 && (
                <div className="text-center py-8 border border-dashed rounded-md">
                  <div className="flex justify-center gap-4 mb-4">
                    <ImageIcon className="h-10 w-10 text-gray-400" />
                    <Film className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="mt-2 text-gray-500">Nog geen media toegevoegd</p>
                  <div className="flex gap-2 justify-center mt-4">
                    <Button type="button" onClick={handleAddImage} variant="outline" size="sm">
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Foto's Toevoegen
                    </Button>
                    <Button type="button" onClick={handleAddVideo} variant="outline" size="sm">
                      <Film className="mr-2 h-4 w-4" />
                      Video's Toevoegen
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/albums")}>
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
                Album Bijwerken
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Edit Media Dialog */}
      <Dialog open={editMediaDialog} onOpenChange={setEditMediaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Media bewerken</DialogTitle>
            <DialogDescription>Bewerk de titel en beschrijving van deze media.</DialogDescription>
          </DialogHeader>

          {currentEditMedia && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="mediaTitle">Titel</Label>
                <Input
                  id="mediaTitle"
                  value={currentEditMedia.title}
                  onChange={(e) => setCurrentEditMedia({ ...currentEditMedia, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mediaDescription">Beschrijving</Label>
                <Textarea
                  id="mediaDescription"
                  value={currentEditMedia.description}
                  onChange={(e) => setCurrentEditMedia({ ...currentEditMedia, description: e.target.value })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMediaDialog(false)}>
              Annuleren
            </Button>
            <Button onClick={saveMediaEdit}>Opslaan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
