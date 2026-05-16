"use client"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useAuthStore } from "@/lib/stores/authStore"

const inputClass = `w-full border border-[#363a42] h-10 rounded-sm bg-[#1f242d]
  my-2 mb-5 focus:border-[#c9a96e] outline-none px-2 text-white transition duration-200`


const Login = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setUser = useAuthStore((s) => s.setUser)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    const form = new FormData(e.currentTarget)

    const email = form.get("email") as string
    const password = form.get("password") as string

    if (!email || !password) {
      return setError("กรุณากรอกข้อมูลให้ครบ")
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        const msg =
          typeof data.message === "string"
            ? data.message
            : data.detail?.[0]?.msg || "เกิดข้อผิดพลาด"

        return setError(msg)
      }

      setUser(data.user)

      const from = searchParams.get("from")
      if (data.user.role === "admin") {
        router.push("/dashboard")
      } else {
        router.push(from ?? "/")
      }

    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setLoading(false)
    }
  }
  return (
    <section id="login" className="bg-[#161b24e3] min-h-screen 
      justify-center flex items-center
    ">
      <main className="bg-[#161b24] rounded-xl h-auto flex flex-col p-5 w-100 border-1 border-[#4e4a00]">
        <div>
          <h1 className="text-center text-white text-2xl">Login</h1>
        </div>
        {searchParams.get("registered") && (
          <p className="text-green-400 text-sm text-center mb-3 bg-green-400/10 py-2 rounded-md">
            สมัครสมาชิกสำเร็จ กรุณา login
          </p>
        )}
        {error && (
          <p className="text-red-400 text-sm text-center mb-3 bg-red-400/10 py-2 rounded-md">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <label htmlFor="" className="text-amber-200">email :</label>
          <input name="email" className={inputClass} type="email" />
          <label htmlFor="" className=" text-amber-200 ">password :</label>
          <input name="password" className={inputClass} type="password" />
          <button disabled={loading} type="submit" className="bg-[#c9a96e] w-full h-10 rounded-sm cursor-pointer hover:bg-[#dab87a] transition duration-300">
            {loading ? "กำลังเข้าสู่ระบบ..." : "LOGIN"}
          </button>
        </form>
        <Link href="/register" className="text-amber-200 text-center mt-5 text-sm hover:underline">
          ยังไม่มีบัญชี? register
        </Link>
      </main>
    </section>
  )
}

export default Login