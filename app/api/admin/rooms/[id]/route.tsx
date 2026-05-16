import { NextRequest, NextResponse } from "next/server"

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const token = req.cookies.get("token")?.value
        const body = await req.json()

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Cookie: `token=${token ?? ""}`,
            },
            body: JSON.stringify(body),
        })

        const data = await res.json()
        return NextResponse.json(data, { status: res.status })

    } catch {
        return NextResponse.json({ message: "Server error" }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const token = req.cookies.get("token")?.value

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room/${id}`, {
            method: "DELETE",
            headers: {
                Cookie: `token=${token ?? ""}`,
            },
        })

        const data = await res.json()
        return NextResponse.json(data, { status: res.status })

    } catch {
        return NextResponse.json({ message: "Server error" }, { status: 500 })
    }
}