import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        if (!process.env.API_URL) {
            return NextResponse.json(
                { message: "API_URL not set" },
                { status: 500 }
            )
        }

        const body = await req.json()

        const res = await fetch(`${process.env.API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })

        const data = await res.json()

        if (!res.ok) {
            return NextResponse.json(
                { message: data.detail ?? "สมัครสมาชิกไม่สำเร็จ" },
                { status: res.status }
            )
        }
        return NextResponse.json(data, { status: 201 })
    } catch (err) {
        console.log(err)
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        )
    }

}