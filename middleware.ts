import { NextResponse, type NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname

  // Check if the path is an admin route
  if (pathname.startsWith("/admin")) {
    // Skip auth check for the admin login page itself
    if (pathname === "/admin" || pathname === "/admin/login") {
      return NextResponse.next()
    }

    // Check for admin authentication cookie
    const adminSessionCookie = request.cookies.get("admin_session")

    // If no admin session cookie or it's not valid, redirect to admin login
    if (!adminSessionCookie || adminSessionCookie.value !== "authenticated") {
      const url = new URL("/admin/login", request.url)
      return NextResponse.redirect(url)
    }
  }

  // Check if we need to handle maintenance mode
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/maintenance") && !pathname.startsWith("/_next")) {
    // Check for maintenance mode bypass
    const bypassCookie = request.cookies.get("maintenance_bypass")

    // Check the site config API to see if site is in maintenance mode
    // For simplicity in the middleware, we'll just check the cookie here
    // In a production app, you might want to use a more robust solution
    // like a cache or fast database check
  }

  // Allow the request to continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

