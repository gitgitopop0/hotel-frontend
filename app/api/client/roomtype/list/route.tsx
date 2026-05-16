import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch(`${process.env.API_URL}/category/`)
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}