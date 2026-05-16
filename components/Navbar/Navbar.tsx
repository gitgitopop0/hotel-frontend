"use client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { useAuthStore } from "@/lib/stores/authStore"

const links: { label: string, href: string }[] = [
    { label: "Home", href: "hero" },
    { label: "Rooms", href: "rooms" },
    { label: "About", href: "about" },
    { label: "Contact", href: "contact" },
]

const Navbar = () => {
    const router = useRouter()
    const user = useAuthStore((s) => s.user)
    const clearUser = useAuthStore((s) => s.clearUser)
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [activeSection, setActiveSection] = useState("")

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" })
        clearUser()
        setOpen(false)
        router.push("/")
    }

    useEffect(() => {
        const handler = () => {
            const sections = ["hero", "rooms", "about", "contact"]
            for (const id of sections) {
                const el = document.getElementById(id)
                if (!el) continue
                const rect = el.getBoundingClientRect()
                if (rect.top <= 80 && rect.bottom > 80) {
                    setActiveSection(id)
                    break
                }
            }
        }
        window.addEventListener("scroll", handler)
        handler()
        return () => window.removeEventListener("scroll", handler)
    }, [])

    return (
        <nav className="flex justify-between w-full px-4 h-[60px]
                items-center bg-[#171b21]/90 backdrop-blur-md sticky top-0 z-[9999]">
            <div className="flex items-center">
                <button className="text-white cursor-pointer -ml-3 md:ml-0" onClick={() => router.push("/#hero")}>
                    <Image src="/logoHotel.png" alt="Hotel Logo" width={120} height={120} />
                </button>
            </div>

            <div className="hidden md:flex gap-4 text-gray-400">
                {links.map((item, i) => (
                    <Link
                        href={`/#${item.href}`}
                        key={i}
                        className={`transition duration-300 cursor-pointer
                                ${activeSection === item.href
                                ? "text-amber-200"
                                : "text-gray-400 hover:text-white"
                            }`}
                    >
                        {item.label}
                    </Link>
                ))}
            </div>

            <div className="flex gap-4 items-center">
                {user ? (
                    <>
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setOpen((o) => !o)}
                                className="flex items-center gap-2 border border-gray-500/50 px-3 py-1.5
                  rounded-md text-gray-300 hover:border-amber-200/50 hover:text-amber-200
                  transition duration-300 cursor-pointer"
                            >
                                <span className="w-6 h-6 rounded-full bg-[#c9a96e]/20 border border-[#c9a96e]/40
                  flex items-center justify-center text-amber-200 text-xs font-bold">
                                    {user.username.charAt(0).toUpperCase()}
                                </span>
                                <span className="text-sm">{user.username}</span>
                                <svg
                                    className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {open && (
                                <div className="absolute right-0 mt-2 w-44 bg-[#1f242d] border border-[#363a42]
                  rounded-lg shadow-xl overflow-hidden z-50">
                                    <div className="px-4 py-3 border-b border-[#363a42]">
                                        <p className="text-white text-sm font-medium">{user.username}</p>
                                        <p className="text-gray-500 text-xs truncate">{user.email}</p>
                                    </div>
                                    <div className="py-1">
                                        <button
                                            onClick={() => { router.push("/booking/status"); setOpen(false) }} 
                                            className="w-full text-left px-4 py-2 text-sm text-gray-400
                        hover:bg-white/5 hover:text-white transition duration-150 cursor-pointer"
                                        >
                                            การจอง
                                        </button>
                                    </div>
                                    <div className="border-t border-[#363a42] py-1">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-400/80
                        hover:bg-red-400/5 hover:text-red-400 transition duration-150 cursor-pointer"
                                        >
                                            ออกจากระบบ
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {user.role === "admin" && (
                            <Link
                                href="/dashboard"
                                className="bg-[#c9a96e] px-3 py-2 rounded-sm text-sm hover:bg-[#ccb17f] transition duration-300"
                            >
                                ADMIN
                            </Link>
                        )}
                    </>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="border border-gray-500/50 px-4 py-1.5 text-gray-400
                                rounded-md cursor-pointer hover:border-white hover:text-white
                                hover:bg-white/5 transition duration-300"
                        >
                            Login
                        </Link>
                        <Link
                            href="/register"
                            className="border border-gray-500/50 px-4 py-1.5 text-gray-400
                                rounded-md cursor-pointer hover:border-white hover:text-white
                                hover:bg-white/5 transition duration-300"
                        >
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}
export default Navbar