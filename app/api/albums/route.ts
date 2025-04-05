import { type NextRequest, NextResponse } from "next/server"
import { getAllAlbums, createAlbum, updateAlbum, deleteAlbum } from "@/lib/db-albums"

export async function GET(request: NextRequest) {
  try {
    const albums = await getAllAlbums()
    return NextResponse.json(albums)
  } catch (error) {
    console.error("Error in GET /api/albums:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.category || !data.date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const album = await createAlbum(data)

    return NextResponse.json(album, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/albums:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.id) {
      return NextResponse.json({ error: "Missing album ID" }, { status: 400 })
    }

    const album = await updateAlbum(data.id, data)

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 })
    }

    return NextResponse.json(album)
  } catch (error) {
    console.error("Error in PUT /api/albums:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing album ID" }, { status: 400 })
    }

    const success = await deleteAlbum(id)

    if (!success) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/albums:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

