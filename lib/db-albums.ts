import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

// Define the album type
export interface Album {
  id: string
  title: string
  description?: string
  category: string
  date: string
  coverImage?: string
  images?: string[]
  createdAt: string
  updatedAt: string
}

// Path to the albums JSON file
const albumsFilePath = path.join(process.cwd(), "data", "albums.json")

// Helper function to read albums from the JSON file
function readAlbumsFile(): Album[] {
  try {
    const fileData = fs.readFileSync(albumsFilePath, "utf8")
    return JSON.parse(fileData)
  } catch (error) {
    console.error("Error reading albums file:", error)
    return []
  }
}

// Helper function to write albums to the JSON file
function writeAlbumsFile(albums: Album[]): void {
  try {
    fs.writeFileSync(albumsFilePath, JSON.stringify(albums, null, 2), "utf8")
  } catch (error) {
    console.error("Error writing albums file:", error)
  }
}

// Get all albums
export async function getAllAlbums(): Promise<Album[]> {
  return readAlbumsFile()
}

// Get a single album by ID
export async function getAlbumById(id: string): Promise<Album | null> {
  const albums = readAlbumsFile()
  return albums.find((album) => album.id === id) || null
}

// Create a new album
export async function createAlbum(albumData: Partial<Album>): Promise<Album> {
  const albums = readAlbumsFile()

  const newAlbum: Album = {
    id: uuidv4(),
    title: albumData.title || "",
    description: albumData.description || "",
    category: albumData.category || "",
    date: albumData.date || new Date().toISOString().split("T")[0],
    coverImage: albumData.coverImage || "",
    images: albumData.images || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  albums.push(newAlbum)
  writeAlbumsFile(albums)

  return newAlbum
}

// Update an existing album
export async function updateAlbum(id: string, albumData: Partial<Album>): Promise<Album | null> {
  const albums = readAlbumsFile()
  const albumIndex = albums.findIndex((album) => album.id === id)

  if (albumIndex === -1) {
    return null
  }

  const updatedAlbum: Album = {
    ...albums[albumIndex],
    ...albumData,
    updatedAt: new Date().toISOString(),
  }

  albums[albumIndex] = updatedAlbum
  writeAlbumsFile(albums)

  return updatedAlbum
}

// Delete an album
export async function deleteAlbum(id: string): Promise<boolean> {
  const albums = readAlbumsFile()
  const albumIndex = albums.findIndex((album) => album.id === id)

  if (albumIndex === -1) {
    return false
  }

  albums.splice(albumIndex, 1)
  writeAlbumsFile(albums)

  return true
}
