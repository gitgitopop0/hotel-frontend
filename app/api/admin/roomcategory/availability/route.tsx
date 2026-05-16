import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    try {

        const searchParams = req.nextUrl.searchParams

        const check_in = searchParams.get("check_in")
        const check_out = searchParams.get("check_out")

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/category/availability?check_in=${check_in}&check_out=${check_out}`,
            {
                cache: "no-store"
            }
        )

        const data = await res.json()

        return NextResponse.json(data)

    } catch {
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        )
    }
}