"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

const inputClass = `w-full border border-[#363a42] h-10 rounded-sm bg-[#1f242d]
  my-2 mb-5 focus:border-[#c9a96e] outline-none px-2 text-white transition duration-200`

const Register = () => {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    const form = new FormData(e.currentTarget)
    const username = form.get("username") as string
    const email = form.get("email") as string
    const password = form.get("password") as string
    const confirm = form.get("confirm") as string

    if (password !== confirm) return setError("รหัสผ่านไม่ตรงกัน")
    if (password.length < 6) return setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")

    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      })

      const data = await res.json()
      if (!res.ok) return setError(data.message)

      router.push("/login?registered=true")
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="register" className="bg-[#161b24e3] min-h-screen 
      justify-center flex items-center
    ">
      <main className="bg-[#161b24] rounded-xl h-auto flex flex-col p-5 w-100 border-1 border-[#4e4a00]">
        <div>
          <h1 className="text-center text-white text-2xl">Register</h1>
          {error && (
            <p className="text-red-400 text-sm text-center mb-3 bg-red-400/10 py-2 rounded-md">
              {error}
            </p>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="" className="text-amber-200">username :</label>
          <input name="username" className={inputClass} type="text" />
          <label htmlFor="" className="text-amber-200">email :</label>
          <input name="email" className={inputClass} type="email" />
          <label htmlFor="" className="text-amber-200">password :</label>
          <input name="password" className={inputClass} type="password" />
          <label htmlFor="" className=" text-amber-200 ">confirm password :</label>
          <input name="confirm" className={inputClass} type="password" />
          <button type="submit" disabled={loading} className="bg-[#c9a96e] w-full h-10 rounded-sm cursor-pointer hover:bg-[#dab87a] transition duration-300">
            {loading ? "กำลังสมัคร..." : "REGISTER"}
          </button>
        </form>
        <Link href="/login" className="text-amber-200 text-center mt-5 text-sm hover:underline">
          มีบัญชีแล้ว? login
        </Link>
      </main>
    </section>
  )
}
export default Register