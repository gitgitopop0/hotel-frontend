import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const PROTECTED = ["/booking"]
const ADMIN_ONLY = ["/dashboard"]
const AUTH_PAGES = ["/login", "/register"]

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  const pathname = req.nextUrl.pathname

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  const isAdminOnly = ADMIN_ONLY.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p))

  let isValid = false
  let role = ""

  if (token) {
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET!)
      )
      isValid = true
      role = payload.role as string
    } catch {
      const url = new URL("/login", req.url)
      url.searchParams.set("from", pathname)
      const res = NextResponse.redirect(url)
      res.cookies.delete("token")
      return res
    }
  }

  if (isAuthPage && isValid) {
    return NextResponse.redirect(new URL("/", req.url))
  }


  if ((isProtected || isAdminOnly) && !isValid) {
    const url = new URL("/login", req.url)
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }


  if (isAdminOnly && isValid && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
}