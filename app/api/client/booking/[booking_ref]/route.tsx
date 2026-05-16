import { NextRequest, NextResponse } from "next/server"

interface Params {
    params: Promise<{
        booking_ref: string
    }>
}

export async function GET(
    req: NextRequest,
    { params }: Params
) {
    try {
        if (!process.env.API_URL) {
            return NextResponse.json(
                { message: "API_URL not set" },
                { status: 500 }
            )
        }

        const { booking_ref } = await params

        const token = req.cookies.get("token")?.value

        const res = await fetch(
            `${process.env.API_URL}/booking/${booking_ref}`,
            {
                method: "GET",
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
        console.log(error)

        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        )
    }
}

