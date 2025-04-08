"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Film, X } from "lucide-react"
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

export default function ViewAlbum({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [album, setAlbum] = useState<Album | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeMedia, setActiveMedia] = useState<AlbumMedia | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: nl })
    } catch (error) {
      return dateString
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

  const openLightbox = (media: AlbumMedia) => {
    setActiveMedia(media)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setActiveMedia(null)
    if (videoRef.current) {
      videoRef.current.pause()
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <MotorcycleLoader />
      </div>
    )
  }

  if (!album) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Album niet gevonden</h2>
        <Button onClick={() => router.push("/admin/albums")}>Terug naar Albums</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.push("/admin/albums")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{album.title}</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48">
              <img
                src={album.coverImage || "/placeholder.svg?height=300&width=500"}
                alt={album.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{formatDate(album.date)}</span>
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                  {getCategoryLabel(album.category)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{album.description}</p>
              <div className="mt-4 flex justify-between">
                <span className="text-sm text-gray-500">{album.images.length} media items</span>
                <Button variant="outline" size="sm" onClick={() => router.push(`/admin/albums/edit/${album.id}`)}>
                  Bewerken
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-bold mb-4">Media</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {album.images.map((media, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 rounded-md overflow-hidden border border-gray-200 cursor-pointer relative group"
                  onClick={() => openLightbox(media)}
                >
                  {media.type === "image" ? (
                    <img
                      src={media.path || "/placeholder.svg"}
                      alt={media.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white">
                      <Film className="h-10 w-10 mb-2" />
                      <span className="text-sm text-center px-2 truncate max-w-full">{media.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{media.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && activeMedia && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </Button>

          <div className="max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="flex-1 overflow-hidden flex items-center justify-center">
              {activeMedia.type === "image" ? (
                <img
                  src={activeMedia.path || "/placeholder.svg"}
                  alt={activeMedia.title}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              ) : (
                <video ref={videoRef} src={activeMedia.path} controls autoPlay className="max-w-full max-h-[70vh]" />
              )}
            </div>

            <div className="bg-black/50 p-4 mt-2 rounded-md">
              <h3 className="text-white text-lg font-bold">{activeMedia.title}</h3>
              {activeMedia.description && <p className="text-white/80 mt-1">{activeMedia.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
