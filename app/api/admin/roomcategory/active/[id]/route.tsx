import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const token = req.cookies.get("token")?.value

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/category/active/${id}`,
            {
                method: "PUT",
                headers: {
                    Cookie: `token=${token ?? ""}`,
                },
            }
        )

        const text = await res.text()
        console.log("FastAPI response:", text)

        let data: any
        try {
            data = text ? JSON.parse(text) : {}
        } catch {
            data = { message: text }
        }

        return NextResponse.json(data, { status: res.status })

    } catch {
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        )
    }
}