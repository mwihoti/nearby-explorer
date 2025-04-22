import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export default async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Skip middleware for auth related paths
  if (path.startsWith("/api/auth") || path.startsWith("/auth") || path === "/login" || path === "/register") {
    return NextResponse.next()
  }

  // Define protected routes that require authentication
  const protectedPaths = ["/profile", "/saved-places"]

  // Check if the current path is a protected route
  const isProtectedPath = protectedPaths.some(
    (protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`),
  )

  // If it's not a protected path, allow the request to proceed
  if (!isProtectedPath) {
    return NextResponse.next()
  }

  // Get the token using next-auth/jwt
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // If there's no token redirect to the login page
  if (!token) {
    // Create the URL for the login page with a callback URL
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", encodeURI(request.url))

    // Redirect to the login page
    return NextResponse.redirect(loginUrl)
  }

  // If there is a token allow the request to proceed
  return NextResponse.next()
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    // Match all paths except those starting with
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
