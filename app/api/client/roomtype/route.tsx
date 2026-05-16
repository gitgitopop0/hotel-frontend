import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl
        const check_in = searchParams.get("check_in")
        const check_out = searchParams.get("check_out")

        if (!check_in || !check_out) {
            return NextResponse.json(
                { message: "กรุณาระบุวันที่เช็คอินและเช็คเอาท์" },
                { status: 400 }
            )
        }

        const params = new URLSearchParams({ check_in: check_in, check_out: check_out })
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/category/availability?${params}`)
        const data = await res.json()

        if (!res.ok) {
            const message =
                typeof data.detail === "string"
                    ? data.detail
                    : data.detail?.[0]?.msg || "เกิดข้อผิดพลาด"

            return NextResponse.json({ message }, { status: res.status })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "Server error" }, { status: 500 })
    }
}