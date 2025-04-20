import { NextResponse } from "next/server";
import { NextRequest } from "next/server";


/// this function can be marked async if using await inside
export default function middleware(request: NextRequest) {
    // Get the pathname of the request
    const path = request.nextUrl.pathname
    // skip middleware for auth related paths
    if (path.startsWith("/api/auth") || path.startsWith("/auth")) {
        return NextResponse.next()
    }

    // Define protected routes that require authenication
    const protectedPaths = ["/profile", "/saved-places"]


    // check if the current path is a protected route
    const isProtectedPath = protectedPaths.some(
        (protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`)
    )

    // if it's not a protected path, allow the request to proceed
    if (!isProtectedPath) {
        return NextResponse.next()
    }

    // check for the session token in cookies
    const token = request.cookies.get("next-auth.session-token")?.value || 
                request.cookies.get("__Secure-next-auth.session-token")?.value

    
    // if there's no token redirect to the login page
    if (!token) {
        // create the url for the login page with a callback url
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("callbackUrl", encodeURI(request.url))

        // Redirect to the login page
        return NextResponse.redirect(loginUrl)
    }
    // if there is a token allow the request to proceed
    return NextResponse.next()
 }

 // Configre which routes use this middleware
 export const config = {
    matcher: [
        // Match all paths except those starting with
        "/((?!_next/static|_next/image|favicon.ico).*)"
    ]
 }
