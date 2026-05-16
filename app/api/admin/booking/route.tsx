import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)

    const page = searchParams.get("page") || "1"
    const limit = searchParams.get("limit") || "10"
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""

    const token = req.cookies.get("token")?.value

    const params = new URLSearchParams({ page, limit })
    if (search) params.set("search", search)
    if (status && status !== "ทั้งหมด") params.set("status", status)

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/booking/?${params}`,
        {
            headers: {
                Cookie: `token=${token}`,
            },
        }
    )

    const data = await res.json()

    return NextResponse.json(data, { status: res.status })
}