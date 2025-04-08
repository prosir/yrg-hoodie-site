import { type NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (!type || !["home", "contact", "logo"].includes(type)) {
      return NextResponse.json({ error: "Invalid image type" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${type}-${uuidv4()}.${fileExt}`

    // Define path based on type
    let uploadDir
    if (type === "logo") {
      uploadDir = join(process.cwd(), "public", "images", "site")
    } else {
      uploadDir = join(process.cwd(), "public", "images", "site", type)
    }

    // Ensure directory exists
    try {
      await writeFile(join(uploadDir, fileName), buffer)
    } catch (error: any) {
      // If directory doesn't exist, create it
      if (error.code === "ENOENT") {
        const { mkdir } = require("fs/promises")
        await mkdir(uploadDir, { recursive: true })
        await writeFile(join(uploadDir, fileName), buffer)
      } else {
        throw error
      }
    }

    // Return the path to the uploaded file
    const path = `/images/site/${type === "logo" ? "" : type + "/"}${fileName}`

    return NextResponse.json({
      success: true,
      path,
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}
