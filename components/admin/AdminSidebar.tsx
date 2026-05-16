"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/authStore"
import Image from "next/image"
import { useState } from "react"

const menus = [
  { label: "Dashboard", href: "/dashboard", icon: "▪" },
  { label: "ห้องพัก", href: "/dashboard/rooms", icon: "▪" },
  { label: "ลูกค้า", href: "/dashboard/customers", icon: "▪" },
  { label: "การจอง", href: "/dashboard/bookings", icon: "▪" },
  { label: "ประเภทห้อง", href: "/dashboard/roomcategory", icon: "▪" },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const clearUser = useAuthStore((s) => s.clearUser)
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    clearUser()
    router.push("/")
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="md:hidden fixed top-3 left-4 z-[9999] w-9 h-9 flex items-center justify-center
          bg-[#171b21] border border-[#363a42] rounded-md text-gray-400 hover:text-white cursor-pointer"
      >
        {open
          ? <span className="text-lg leading-none">✕</span>
          : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        }
      </button>

      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-[9998]"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 h-screen w-56 bg-[#171b21] border-r border-[#363a42]
        flex flex-col z-[9999] transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>

        <div className="p-5 border-b border-[#363a42] flex flex-col items-center">
          <Image src="/logoHotel.png" alt="Hotel Logo" width={120} height={120} />
          <h1 className="text-amber-200 font-bold text-lg">Hotel Admin</h1>
          <p className="text-gray-500 text-xs mt-0.5">Management Panel</p>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {menus.map((menu) => {
            const isActive = pathname === menu.href
            return (
              <Link
                key={menu.href}
                href={menu.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition duration-200
                  ${isActive
                    ? "bg-[#c9a96e]/15 text-amber-200 border border-[#c9a96e]/30"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <span className={isActive ? "text-amber-200" : "text-gray-600"}>{menu.icon}</span>
                {menu.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-[#363a42] flex flex-col gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400
              hover:text-white hover:bg-white/5 rounded-md transition duration-200"
          >
            ← กลับหน้าหลัก
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-400/70
              hover:text-red-400 hover:bg-red-400/5 rounded-md transition duration-200 cursor-pointer"
          >
            ออกจากระบบ
          </button>
        </div>
      </aside>
    </>
  )
}