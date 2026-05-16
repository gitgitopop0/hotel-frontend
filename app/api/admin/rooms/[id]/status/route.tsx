import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("token")?.value

  if (!token) {
    return NextResponse.json({ detail: "No token" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const res = await fetch(`${process.env.API_URL}/room/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      room_id: Number(id),
      status: body.status,
    }),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}