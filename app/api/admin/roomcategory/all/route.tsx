import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
            return NextResponse.json(
                { message: "NEXT_PUBLIC_API_URL not set" },
                { status: 500 }
            )
        }

        const token = req.cookies.get("token")?.value

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category/all`, {
            method: "GET",
            headers: {
                Cookie: `token=${token ?? ""}`,
            },
            cache: "no-store"
        })

        const data = await res.json()

        return NextResponse.json(data, { status: res.status })

    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        )
    }
}