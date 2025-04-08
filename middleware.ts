import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip middleware for login page
  if (path === "/admin/login") {
    return NextResponse.next()
  }

  // Only protect admin routes
  if (path.startsWith("/admin")) {
    // Check for admin cookie
    const adminSession = request.cookies.get("admin_session")

    if (!adminSession) {
      // Redirect to login if no session
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

// Specify the paths that should be checked by the middleware
export const config = {
  matcher: ["/admin/:path*"],
}
