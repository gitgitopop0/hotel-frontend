import { NextRequest, NextResponse } from "next/server"

type Params = {
    params: Promise<{
        id: string
        imageId: string
    }>
}

export async function DELETE(
    req: NextRequest,
    { params }: Params
) {
    try {

        const { id, imageId } = await params

        const token = req.cookies.get("token")?.value

        const res = await fetch(
            `${process.env.API_URL}/images/${id}/${imageId}`,
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