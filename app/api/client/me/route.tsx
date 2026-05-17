import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { cookies } from "next/headers"

export async function GET() {
  const token = (await cookies()).get("token")?.value

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    )
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 })
  }
}