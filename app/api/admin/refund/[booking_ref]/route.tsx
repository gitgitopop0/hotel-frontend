import { NextRequest, NextResponse } from "next/server"

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ booking_ref: string }> }
) {
    const { booking_ref } = await context.params

    const token = req.cookies.get("token")?.value

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/refund/${booking_ref}`,
        {
            method: "POST",
            headers: {
                Cookie: `token=${token ?? ""}`,
            },
        }
    )

    const data = await res.json().catch(() => null)

    return NextResponse.json(data, { status: res.status })
}