"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Eye, Film, ImageIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MotorcycleLoader } from "@/components/motorcycle-loader"
import { format } from "date-fns"
import { nl } from "date-fns/locale"

interface AlbumMedia {
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

export default function AlbumsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [albums, setAlbums] = useState<Album[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [albumToDelete, setAlbumToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchAlbums()
  }, [])

  const fetchAlbums = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/albums")

      if (!response.ok) {
        throw new Error("Failed to fetch albums")
      }

      const data = await response.json()
      setAlbums(data)
    } catch (error) {
      console.error("Error fetching albums:", error)
      toast({
        title: "Fout bij ophalen",
        description: "De albums konden niet worden opgehaald.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setAlbumToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!albumToDelete) return

    try {
      const response = await fetch(`/api/albums/${albumToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete album")
      }

      // Remove the deleted album from the state
      setAlbums(albums.filter((album) => album.id !== albumToDelete))

      toast({
        title: "Album verwijderd",
        description: "Het album is succesvol verwijderd.",
      })
    } catch (error) {
      console.error("Error deleting album:", error)
      toast({
        title: "Fout bij verwijderen",
        description: "Het album kon niet worden verwijderd.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setAlbumToDelete(null)
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "rides":
        return "Ritten"
      case "events":
        return "Evenementen"
      case "members":
        return "Leden"
      case "other":
        return "Overig"
      default:
        return category
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: nl })
    } catch (error) {
      return dateString
    }
  }

  const countMediaByType = (images: AlbumMedia[]) => {
    const counts = {
      image: 0,
      video: 0,
    }

    images.forEach((item) => {
      if (item.type === "image") counts.image++
      if (item.type === "video") counts.video++
    })

    return counts
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
        <h1 className="text-2xl font-bold">Albums</h1>
        <Button onClick={() => router.push("/admin/albums/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Nieuw Album
        </Button>
      </div>

      {albums.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Geen albums gevonden</h3>
            <p className="text-gray-500 text-center mb-6">
              Er zijn nog geen albums aangemaakt. Maak je eerste album aan om foto's en video's te delen.
            </p>
            <Button onClick={() => router.push("/admin/albums/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Nieuw Album
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => {
            const mediaCounts = countMediaByType(album.images)

            return (
              <Card key={album.id} className="overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={album.coverImage || "/placeholder.svg?height=300&width=500"}
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
                    {getCategoryLabel(album.category)}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle>{album.title}</CardTitle>
                  <CardDescription>{formatDate(album.date)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{album.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center text-xs text-gray-500">
                        <ImageIcon className="h-3 w-3 mr-1" />
                        {mediaCounts.image}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Film className="h-3 w-3 mr-1" />
                        {mediaCounts.video}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/admin/albums/view/${album.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Bekijken
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/admin/albums/edit/${album.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Bewerken
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteClick(album.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Verwijderen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Album verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je dit album wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
