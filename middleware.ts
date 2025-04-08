import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Check if the path is for the admin area (except login)
  const isAdminPath = path.startsWith("/admin") && path !== "/admin/login"

  // If it's an admin path, check for the session cookie
  if (isAdminPath) {
    const sessionCookie = request.cookies.get("admin_session")

    // If there's no session cookie, redirect to login
    if (!sessionCookie) {
      const url = new URL("/admin/login", request.url)
      return NextResponse.redirect(url)
    }
  }

  // Continue with the request
  return NextResponse.next()
}

// Configure the middleware to run only for admin paths
export const config = {
  matcher: ["/admin/:path*"],
}
