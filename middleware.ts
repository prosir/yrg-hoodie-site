import { NextResponse, type NextRequest } from "next/server"

// Eenvoudige middleware die alleen controleert of we naar de admin, api, maintenance of shop-closed routes gaan
export function middleware(request: NextRequest) {
  // Laat alle requests gewoon door
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



