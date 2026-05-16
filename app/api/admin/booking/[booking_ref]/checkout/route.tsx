import { NextRequest, NextResponse } from "next/server"

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ booking_ref: string }> }
) {
    try {
        const { booking_ref } = await params 

        const token = req.cookies.get("token")?.value

        const res = await fetch(
            `${process.env.API_URL}/room/${booking_ref}/checkout`,
            {
                method: "POST",
                headers: {
                    Cookie: `token=${token ?? ""}`,
                },
            }
        )

        const data = await res.json().catch(() => null)

        return NextResponse.json(data, { status: res.status })
    } catch (err) {
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        )
    }
}