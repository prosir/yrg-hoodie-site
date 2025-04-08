import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Only protect admin routes
  if (path.startsWith("/admin") && !path.includes("/admin/login")) {
    // Check for admin cookie
    const adminSession = request.cookies.get("admin_session")

    if (!adminSession) {
      // Redirect to login if no session
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}
