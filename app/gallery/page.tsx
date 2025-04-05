"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import type { Album, AlbumMedia } from "@/lib/db-albums"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Film,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react"

export default function Gallery() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [mediaToEdit, setMediaToEdit] = useState<AlbumMedia | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const lightboxContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAlbums()
  }, [])

  useEffect(() => {
    if (lightboxOpen && selectedAlbum?.images?.[currentMediaIndex]?.type === "video") {
      if (isPlaying && videoRef.current) {
        videoRef.current.play()
      } else if (videoRef.current) {
        videoRef.current.pause()
      }
    }
  }, [isPlaying, lightboxOpen, currentMediaIndex, selectedAlbum])

  useEffect(() => {
    if (lightboxOpen && videoRef.current) {
      videoRef.current.muted = isMuted
    }
  }, [isMuted, lightboxOpen])

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
    } finally {
      setLoading(false)
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

  const openAlbum = (album: Album) => {
    setSelectedAlbum(album)
  }

  const closeAlbum = () => {
    setSelectedAlbum(null)
  }

  const openLightbox = (index: number) => {
    setCurrentMediaIndex(index)
    setLightboxOpen(true)
    setIsPlaying(selectedAlbum?.images?.[index]?.type === "video")
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setIsPlaying(false)
  }

  const nextMedia = () => {
    if (!selectedAlbum?.images) return
    setIsPlaying(false)
    setCurrentMediaIndex((prev) => (prev + 1) % selectedAlbum.images.length)
    setTimeout(() => {
      if (selectedAlbum.images[currentMediaIndex]?.type === "video") {
        setIsPlaying(true)
      }
    }, 100)
  }

  const prevMedia = () => {
    if (!selectedAlbum?.images) return
    setIsPlaying(false)
    setCurrentMediaIndex((prev) => (prev - 1 + selectedAlbum.images.length) % selectedAlbum.images.length)
    setTimeout(() => {
      if (selectedAlbum.images[currentMediaIndex]?.type === "video") {
        setIsPlaying(true)
      }
    }, 100)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && lightboxContainerRef.current) {
      lightboxContainerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  const downloadMedia = (media: AlbumMedia) => {
    const link = document.createElement("a")
    link.href = media.path
    link.download = media.title || "download"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const currentMedia = selectedAlbum?.images?.[currentMediaIndex]

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Gallery Header */}
      <section className="py-12 bg-gradient-to-b from-gray-100 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ONZE <span className="text-olive-600">GALERIJ</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Bekijk foto's en video's van onze ritten, evenementen en leden.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex justify-center mb-8">
              <TabsTrigger value="all">Alle Albums</TabsTrigger>
              <TabsTrigger value="rides">Ritten</TabsTrigger>
              <TabsTrigger value="events">Evenementen</TabsTrigger>
              <TabsTrigger value="members">Leden</TabsTrigger>
              <TabsTrigger value="other">Overig</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {loading ? (
                <div className="text-center py-10">
                  <div className="animate-spin h-10 w-10 border-4 border-olive-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-4 text-gray-500">Albums laden...</p>
                </div>
              ) : selectedAlbum ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={closeAlbum} className="flex items-center gap-2">
                      <ChevronLeft className="h-4 w-4" />
                      Terug naar albums
                    </Button>
                    <div className="text-right">
                      <h2 className="text-2xl font-bold">{selectedAlbum.title}</h2>
                      <p className="text-gray-500 flex items-center justify-end gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(selectedAlbum.date)}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600">{selectedAlbum.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {selectedAlbum.images && selectedAlbum.images.length > 0 ? (
                      selectedAlbum.images.map((media, index) => (
                        <motion.div
                          key={media.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ y: -5, scale: 1.02 }}
                          className="relative group cursor-pointer"
                          onClick={() => openLightbox(index)}
                        >
                          <div className="aspect-square bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                            {media.type === "image" ? (
                              <img
                                src={media.path || "/placeholder.svg"}
                                alt={media.title || `Afbeelding ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="relative w-full h-full bg-gray-800">
                                <video
                                  src={media.path}
                                  className="w-full h-full object-cover"
                                  muted
                                  playsInline
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openLightbox(index)
                                  }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="bg-black/50 rounded-full p-3">
                                    <Play className="h-8 w-8 text-white" />
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <h3 className="text-white font-bold text-lg">{media.title || `Media ${index + 1}`}</h3>
                              {media.description && <p className="text-sm text-gray-200">{media.description}</p>}
                            </div>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8 bg-white/80 hover:bg-white"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  downloadMedia(media)
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="absolute top-2 left-2">
                              {media.type === "video" && (
                                <Film className="h-5 w-5 text-white bg-black/50 p-1 rounded-full" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-10">
                        <p className="text-gray-500">Geen media gevonden in dit album.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : filteredAlbums.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAlbums.map((album, index) => (
                    <motion.div
                      key={album.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="relative group overflow-hidden rounded-lg cursor-pointer"
                      onClick={() => openAlbum(album)}
                    >
                      <div className="relative h-64 md:h-80">
                        {album.coverImage ? (
                          <img
                            src={album.coverImage || "/placeholder.svg"}
                            alt={album.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">Geen afbeelding</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-white font-bold text-lg">{album.title}</h3>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-300 capitalize">{album.category}</span>
                            <span className="text-sm text-gray-300">{formatDate(album.date)}</span>
                          </div>
                          <div className="mt-2 text-sm text-gray-300">{album.images?.length || 0} media items</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Geen albums gevonden in deze categorie.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && selectedAlbum?.images && (
        <div
          ref={lightboxContainerRef}
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
        >
          <button
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/80 transition-colors"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-black/50 hover:bg-black/80 transition-colors"
            onClick={prevMedia}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="max-w-4xl max-h-[80vh] relative">
            {currentMedia?.type === "image" ? (
              <img
                src={currentMedia.path || "/placeholder.svg"}
                alt={currentMedia.title || `Afbeelding ${currentMediaIndex + 1}`}
                className="max-h-[80vh] max-w-full object-contain"
              />
            ) : (
              <div className="relative">
                <video
                  ref={videoRef}
                  src={currentMedia?.path}
                  className="max-h-[80vh] max-w-full"
                  controls={false}
                  autoPlay={isPlaying}
                  loop
                  muted={isMuted}
                  playsInline
                />
                <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-4 p-4">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="bg-black/50 hover:bg-black/80 text-white"
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="bg-black/50 hover:bg-black/80 text-white"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="bg-black/50 hover:bg-black/80 text-white"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 text-white">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">{currentMedia?.title || `Media ${currentMediaIndex + 1}`}</h3>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-black/50 hover:bg-black/80 text-white"
                  onClick={() => downloadMedia(currentMedia!)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              {currentMedia?.description && <p className="text-sm text-gray-200 mt-1">{currentMedia.description}</p>}
              <p className="text-sm text-gray-400 mt-1">
                {currentMediaIndex + 1} / {selectedAlbum.images.length}
              </p>
            </div>
          </div>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-black/50 hover:bg-black/80 transition-colors"
            onClick={nextMedia}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  )
}

