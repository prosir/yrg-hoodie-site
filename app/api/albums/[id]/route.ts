import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const ALBUMS_FILE = path.join(process.cwd(), "data", "albums.json")

// Ensure albums file exists
async function ensureAlbumsFile() {
  const dataDir = path.join(process.cwd(), "data")
  try {
    await fs.access(dataDir)
  } catch (error) {
    await fs.mkdir(dataDir, { recursive: true })
  }

  try {
    await fs.access(ALBUMS_FILE)
  } catch (error) {
    await fs.writeFile(ALBUMS_FILE, JSON.stringify([]), "utf8")
  }
}

// Get all albums
async function getAlbums() {
  await ensureAlbumsFile()
  const data = await fs.readFile(ALBUMS_FILE, "utf8")
  return JSON.parse(data)
}

// Get album by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const albums = await getAlbums()
    const album = albums.find((a: any) => a.id === params.id)

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 })
    }

    return NextResponse.json(album)
  } catch (error) {
    console.error("Error fetching album:", error)
    return NextResponse.json({ error: "Failed to fetch album" }, { status: 500 })
  }
}

// Update album
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const albums = await getAlbums()
    const albumIndex = albums.findIndex((a: any) => a.id === params.id)

    if (albumIndex === -1) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 })
    }

    const updatedData = await request.json()

    // Update the album
    albums[albumIndex] = {
      ...albums[albumIndex],
      ...updatedData,
      id: params.id, // Ensure ID doesn't change
    }

    // Save to file
    await fs.writeFile(ALBUMS_FILE, JSON.stringify(albums, null, 2), "utf8")

    return NextResponse.json(albums[albumIndex])
  } catch (error) {
    console.error("Error updating album:", error)
    return NextResponse.json({ error: "Failed to update album" }, { status: 500 })
  }
}

// Delete album
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const albums = await getAlbums()
    const filteredAlbums = albums.filter((a: any) => a.id !== params.id)

    if (filteredAlbums.length === albums.length) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 })
    }

    // Save to file
    await fs.writeFile(ALBUMS_FILE, JSON.stringify(filteredAlbums, null, 2), "utf8")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting album:", error)
    return NextResponse.json({ error: "Failed to delete album" }, { status: 500 })
  }
}
