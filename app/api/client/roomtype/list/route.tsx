import { NextResponse } from "next/server"

export const maxDuration = 30

export async function GET() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category/`, {
      signal: AbortSignal.timeout(25000),
      cache: "no-store",
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}