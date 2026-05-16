import { NextRequest, NextResponse } from "next/server"

type Params = {
    params: {
        booking_ref: string
    }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ booking_ref: string }> }
) {
  try {
    const { booking_ref } = await params

    const token = req.cookies.get("token")?.value

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/booking/${booking_ref}/cancel`,
      {
        method: "PUT",
        headers: {
          Cookie: `token=${token}`,
        },
      }
    )

    const data = await res.json()

    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}