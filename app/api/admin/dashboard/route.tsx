import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    try {
        if (!process.env.API_URL) {
            return NextResponse.json(
                { message: "API_URL not set" },
                { status: 500 }
            )
        }

        const token = req.cookies.get("token")?.value

        const res = await fetch(`${process.env.API_URL}/dashboard/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Cookie: `token=${token}`,
            },
        })

        const data = await res.json()

        return NextResponse.json(data)
    } catch {
        return NextResponse.json(
            { message: "เกิดข้อผิดพลาด" },
            { status: 500 }
        )
    }
}

