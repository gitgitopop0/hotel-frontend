import { NextRequest, NextResponse } from "next/server"

type Params = {
    params: Promise<{
        id: string
    }>
}

export async function POST(
    req: NextRequest,
    { params }: Params
) {
    try {

        const { id } = await params

        const token = req.cookies.get("token")?.value

        const formData = await req.formData()

        const res = await fetch(
            `${process.env.API_URL}/cover/${id}`,
            {
                method: "POST",
                headers: {
                    Cookie: `token=${token}`
                },
                body: formData
            }
        )

        const data = await res.json()

        return NextResponse.json(data, {
            status: res.status
        })

    } catch {
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: Params
) {
    try {

        const { id } = await params

        const token = req.cookies.get("token")?.value

        const res = await fetch(
            `${process.env.API_URL}/cover/${id}`,
            {
                method: "DELETE",
                headers: {
                    Cookie: `token=${token}`
                }
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