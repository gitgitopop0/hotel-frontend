import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
            return NextResponse.json(
                { message: "NEXT_PUBLIC_API_URL not set" },
                { status: 500 }
            )
        }
        const body = await req.json()

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })

        let data
        try {
            data = await res.json()
        } catch {
            data = {}
        }

        if (!res.ok) {
            const message =
                typeof data.detail === "string"
                    ? data.detail
                    : data.detail?.[0]?.msg || "อีเมลหรือรหัสผ่านไม่ถูกต้อง"

            return NextResponse.json(
                { message },
                { status: res.status }
            )
        }

        const response = NextResponse.json({ user: data.user })

        response.cookies.set("token", data.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        })

        return response
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        )
    }

}