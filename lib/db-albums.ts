"use server"

import fs from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export type Album = {
  id: string
  title: string
  description: string
  category: string
  date: string
  coverImage: string
  images: AlbumMedia[]
  createdAt: string
  updatedAt: string
}

export type AlbumMedia = {
  id: string
  albumId: string
  path: string
  title: string
  description?: string
  type: "image" | "video"
  order: number
}

// Path to the JSON file for storage
const ALBUMS_FILE = path.join(process.cwd(), "data", "albums.json")

// Ensure the data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), "data")
  try {
    await fs.access(dataDir)
  } catch (error) {
    // If the directory doesn't exist, create it
    console.log("Data directory doesn't exist, creating...")
    await fs.mkdir(dataDir, { recursive: true })
  }

  // Check if the file exists, if not, create it
  try {
    await fs.access(ALBUMS_FILE)
  } catch (error) {
    // If the file doesn't exist, create a new file with an empty array
    console.log("Albums.json file doesn't exist, creating...")
    await fs.writeFile(ALBUMS_FILE, JSON.stringify([]), "utf8")
  }
}

// Get all albums
export async function getAllAlbums(): Promise<Album[]> {
  try {
    await ensureDataDirectory()

    const data = await fs.readFile(ALBUMS_FILE, "utf8")
    const albums = JSON.parse(data)
    return albums
  } catch (error) {
    console.error("Error fetching albums:", error)
    return []
  }
}

// Get album by ID
export async function getAlbumById(id: string): Promise<Album | null> {
  try {
    const albums = await getAllAlbums()
    const album = albums.find((album) => album.id === id)
    return album || null
  } catch (error) {
    console.error(`Error fetching album with ID ${id}:`, error)
    return null
  }
}

// Get albums by category
export async function getAlbumsByCategory(category: string): Promise<Album[]> {
  try {
    const albums = await getAllAlbums()
    return albums.filter((album) => album.category === category)
  } catch (error) {
    console.error(`Error fetching albums with category ${category}:`, error)
    return []
  }
}

// Create a new album
export async function createAlbum(albumData: Omit<Album, "id" | "createdAt" | "updatedAt">): Promise<Album> {
  try {
    await ensureDataDirectory()

    const albums = await getAllAlbums()

    const newAlbum: Album = {
      ...albumData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    albums.push(newAlbum)

    await fs.writeFile(ALBUMS_FILE, JSON.stringify(albums, null, 2), "utf8")

    return newAlbum
  } catch (error) {
    console.error("Error creating album:", error)
    throw new Error("Could not create album")
  }
}

// Update an existing album
export async function updateAlbum(id: string, albumData: Partial<Album>): Promise<Album | null> {
  try {
    const albums = await getAllAlbums()

    const albumIndex = albums.findIndex((album) => album.id === id)

    if (albumIndex === -1) {
      return null
    }

    const updatedAlbum = {
      ...albums[albumIndex],
      ...albumData,
      updatedAt: new Date().toISOString(),
    }

    albums[albumIndex] = updatedAlbum

    await fs.writeFile(ALBUMS_FILE, JSON.stringify(albums, null, 2), "utf8")

    return updatedAlbum
  } catch (error) {
    console.error(`Error updating album with ID ${id}:`, error)
    throw new Error("Could not update album")
  }
}

// Delete an album
export async function deleteAlbum(id: string): Promise<boolean> {
  try {
    const albums = await getAllAlbums()

    const filteredAlbums = albums.filter((album) => album.id !== id)

    if (filteredAlbums.length === albums.length) {
      return false // No album was removed
    }

    await fs.writeFile(ALBUMS_FILE, JSON.stringify(filteredAlbums, null, 2), "utf8")

    return true
  } catch (error) {
    console.error(`Error deleting album with ID ${id}:`, error)
    throw new Error("Could not delete album")
  }
}

// Add media to an album
export async function addMediaToAlbum(
  albumId: string,
  mediaData: Omit<AlbumMedia, "id" | "albumId">,
): Promise<AlbumMedia | null> {
  try {
    const albums = await getAllAlbums()

    const albumIndex = albums.findIndex((album) => album.id === albumId)

    if (albumIndex === -1) {
      return null
    }

    const newMedia: AlbumMedia = {
      ...mediaData,
      id: uuidv4(),
      albumId,
    }

    if (!albums[albumIndex].images) {
      albums[albumIndex].images = []
    }

    albums[albumIndex].images.push(newMedia)
    albums[albumIndex].updatedAt = new Date().toISOString()

    // If this is the first media, set it as the cover image
    if (albums[albumIndex].images.length === 1 && !albums[albumIndex].coverImage && mediaData.type === "image") {
      albums[albumIndex].coverImage = mediaData.path
    }

    await fs.writeFile(ALBUMS_FILE, JSON.stringify(albums, null, 2), "utf8")

    return newMedia
  } catch (error) {
    console.error(`Error adding media to album with ID ${albumId}:`, error)
    throw new Error("Could not add media to album")
  }
}

// Update media in an album
export async function updateMediaInAlbum(
  albumId: string,
  mediaId: string,
  mediaData: Partial<AlbumMedia>,
): Promise<AlbumMedia | null> {
  try {
    const albums = await getAllAlbums()

    const albumIndex = albums.findIndex((album) => album.id === albumId)

    if (albumIndex === -1) {
      return null
    }

    if (!albums[albumIndex].images) {
      return null
    }

    const mediaIndex = albums[albumIndex].images.findIndex((media) => media.id === mediaId)

    if (mediaIndex === -1) {
      return null
    }

    const updatedMedia = {
      ...albums[albumIndex].images[mediaIndex],
      ...mediaData,
    }

    albums[albumIndex].images[mediaIndex] = updatedMedia
    albums[albumIndex].updatedAt = new Date().toISOString()

    await fs.writeFile(ALBUMS_FILE, JSON.stringify(albums, null, 2), "utf8")

    return updatedMedia
  } catch (error) {
    console.error(`Error updating media in album with ID ${albumId}:`, error)
    throw new Error("Could not update media in album")
  }
}

// Remove media from an album
export async function removeMediaFromAlbum(albumId: string, mediaId: string): Promise<boolean> {
  try {
    const albums = await getAllAlbums()

    const albumIndex = albums.findIndex((album) => album.id === albumId)

    if (albumIndex === -1) {
      return false
    }

    if (!albums[albumIndex].images) {
      return false
    }

    const originalLength = albums[albumIndex].images.length
    const removedMedia = albums[albumIndex].images.find((media) => media.id === mediaId)
    albums[albumIndex].images = albums[albumIndex].images.filter((media) => media.id !== mediaId)

    if (albums[albumIndex].images.length === originalLength) {
      return false // No media was removed
    }

    // If the removed media was the cover image, update the cover image
    if (removedMedia && albums[albumIndex].coverImage === removedMedia.path) {
      // Find the first image to use as cover
      const firstImage = albums[albumIndex].images.find((media) => media.type === "image")
      albums[albumIndex].coverImage = firstImage ? firstImage.path : ""
    }

    albums[albumIndex].updatedAt = new Date().toISOString()

    await fs.writeFile(ALBUMS_FILE, JSON.stringify(albums, null, 2), "utf8")

    return true
  } catch (error) {
    console.error(`Error removing media from album with ID ${albumId}:`, error)
    throw new Error("Could not remove media from album")
  }
}

// Set an image as the album cover
export async function setAlbumCover(albumId: string, mediaId: string): Promise<Album | null> {
  try {
    const albums = await getAllAlbums()

    const albumIndex = albums.findIndex((album) => album.id === albumId)

    if (albumIndex === -1) {
      return null
    }

    if (!albums[albumIndex].images) {
      return null
    }

    const media = albums[albumIndex].images.find((img) => img.id === mediaId)

    if (!media || media.type !== "image") {
      return null
    }

    albums[albumIndex].coverImage = media.path
    albums[albumIndex].updatedAt = new Date().toISOString()

    await fs.writeFile(ALBUMS_FILE, JSON.stringify(albums, null, 2), "utf8")

    return albums[albumIndex]
  } catch (error) {
    console.error(`Error setting cover for album with ID ${albumId}:`, error)
    throw new Error("Could not set album cover")
  }
}

