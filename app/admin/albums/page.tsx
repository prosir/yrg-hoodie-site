"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Image, Calendar, Tag } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Album } from "@/lib/db-albums"

export default function AlbumsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [albumToDelete, setAlbumToDelete] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchAlbums()
  }, [])

  const fetchAlbums = async () => {
    try {
      setLoading(true)
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
        description: "Er is een fout opgetreden bij het ophalen van de albums.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setAlbumToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
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
        description: "Er is een fout opgetreden bij het verwijderen van het album.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setAlbumToDelete(null)
    }
  }

  const filteredAlbums = activeTab === "all" ? albums : albums.filter((album) => album.category === activeTab)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("nl-NL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
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

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Alle Albums</TabsTrigger>
          <TabsTrigger value="rides">Ritten</TabsTrigger>
          <TabsTrigger value="events">Evenementen</TabsTrigger>
          <TabsTrigger value="members">Leden</TabsTrigger>
          <TabsTrigger value="other">Overig</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Albums laden...</p>
            </div>
          ) : filteredAlbums.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlbums.map((album) => (
                <Card key={album.id} className="overflow-hidden">
                  <div className="aspect-video relative overflow-hidden bg-gray-100">
                    {album.coverImage ? (
                      <img
                        src={album.coverImage || "/placeholder.svg"}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Image className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle>{album.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(album.date)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground capitalize">{album.category}</span>
                    </div>
                    <p className="text-sm line-clamp-2">{album.description}</p>
                    <div className="mt-2 text-sm text-muted-foreground">{album.images?.length || 0} foto's</div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/albums/${album.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Bewerken
                      </Link>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(album.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Verwijderen
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed rounded-lg">
              <Image className="h-16 w-16 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">Geen albums gevonden</h3>
              <p className="mt-1 text-muted-foreground">Er zijn nog geen albums in deze categorie.</p>
              <Button onClick={() => router.push("/admin/albums/create")} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Nieuw Album
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

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
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

