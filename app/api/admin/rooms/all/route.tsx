import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json()

  return NextResponse.json(data)
}