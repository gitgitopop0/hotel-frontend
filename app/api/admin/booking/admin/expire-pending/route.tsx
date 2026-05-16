import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/booking/admin/expire-pending`,
            {
                method: "POST",
                headers: {
                    Cookie: `token=${token}`,
                },
            }
        )

        const data = await res.json()

        return NextResponse.json(data, {
            status: res.status,
        })
    } catch (error) {
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        )
    }
}