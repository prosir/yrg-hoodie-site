import { type NextRequest, NextResponse } from "next/server"
import { addMediaToAlbum, removeMediaFromAlbum, setAlbumCover, getAlbumById, updateMediaInAlbum } from "@/lib/db-albums"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const albumId = params.id

    const album = await getAlbumById(albumId)

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 })
    }

    return NextResponse.json(album.images || [])
  } catch (error) {
    console.error(`Error in GET /api/albums/${params.id}/images:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const albumId = params.id
    const data = await request.json()

    // Validate required fields
    if (!data.path || !data.type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const media = await addMediaToAlbum(albumId, data)

    if (!media) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 })
    }

    return NextResponse.json(media, { status: 201 })
  } catch (error) {
    console.error(`Error in POST /api/albums/${params.id}/images:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const albumId = params.id
    const data = await request.json()

    if (!data.mediaId) {
      return NextResponse.json({ error: "Missing mediaId" }, { status: 400 })
    }

    const media = await updateMediaInAlbum(albumId, data.mediaId, data)

    if (!media) {
      return NextResponse.json({ error: "Album or media not found" }, { status: 404 })
    }

    return NextResponse.json(media)
  } catch (error) {
    console.error(`Error in PUT /api/albums/${params.id}/images:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const albumId = params.id
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get("mediaId")

    if (!mediaId) {
      return NextResponse.json({ error: "Missing mediaId parameter" }, { status: 400 })
    }

    const success = await removeMediaFromAlbum(albumId, mediaId)

    if (!success) {
      return NextResponse.json({ error: "Album or media not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error in DELETE /api/albums/${params.id}/images:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const albumId = params.id
    const data = await request.json()

    if (data.action === "setCover") {
      if (!data.mediaId) {
        return NextResponse.json({ error: "Missing mediaId" }, { status: 400 })
      }

      const album = await setAlbumCover(albumId, data.mediaId)

      if (!album) {
        return NextResponse.json({ error: "Album or media not found" }, { status: 404 })
      }

      return NextResponse.json(album)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error(`Error in PATCH /api/albums/${params.id}/images:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

