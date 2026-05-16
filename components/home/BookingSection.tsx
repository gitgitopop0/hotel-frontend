"use client"
import { useState } from "react"
import { Kanit } from "next/font/google"


const prompt = Kanit({
    subsets: ["thai"],
    weight: ["300", "400", "500", "600", "700"],
})


interface BookingResult {
  id: number
  booking_ref: string
  status: "PENDING" | "RESERVED" | "PAID" | "CANCELLED" | "CHECKED_IN" | "CHECKED_OUT"
  check_in: string
  check_out: string
  num_guests: number
  total_price: number
  lock_expires_at: string | null
  created_at: string
  room: {
    id: number
    room_number: string
    floor: number
    status: string
  }
  customer: {
    id: number
    full_name: string
    email: string
    phone: string | null
    id_card: string | null
  }
}

const STATUS_CONFIG = {
  PENDING: {
    label: "รอชำระเงิน",
    bg: "bg-yellow-900/20",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
    icon: "⏳",
    desc: "กรุณาชำระเงินก่อนหมดเวลา",
  },
  RESERVED: {
    label: "จองแล้ว",
    bg: "bg-blue-900/20",
    text: "text-blue-400",
    border: "border-blue-500/30",
    icon: "🔒",
    desc: "การจองได้รับการยืนยันแล้ว",
  },
  PAID: {
    label: "ชำระเงินแล้ว",
    bg: "bg-emerald-900/20",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    icon: "✓",
    desc: "ชำระเงินเรียบร้อย พร้อมเช็คอิน",
  },
  CANCELLED: {
    label: "ยกเลิกแล้ว",
    bg: "bg-red-900/20",
    text: "text-red-400",
    border: "border-red-500/30",
    icon: "✕",
    desc: "การจองนี้ถูกยกเลิกแล้ว",
  },
  CHECKED_IN: {
    label: "เช็คอินแล้ว",
    bg: "bg-purple-900/20",
    text: "text-purple-400",
    border: "border-purple-500/30",
    icon: "🏨",
    desc: "กำลังเข้าพักอยู่",
  },
  CHECKED_OUT: {
    label: "เช็คเอาท์แล้ว",
    bg: "bg-gray-900/20",
    text: "text-gray-400",
    border: "border-gray-500/30",
    icon: "👋",
    desc: "เช็คเอาท์เรียบร้อยแล้ว",
  },
}

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  })
}

const formatTime = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
}

const nights = (checkIn: string, checkOut: string) =>
  Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))

export default function BookingSection() {
  const [ref, setRef] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<BookingResult | null>(null)

  const handleSearch = async () => {
    const cleaned = ref.trim().toUpperCase()
    if (!cleaned) { setError("กรุณากรอกรหัสการจอง"); return }
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch(`/api/client/booking/${cleaned}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail || "ไม่พบรหัสการจองนี้")
        return
      }
      setResult(data)
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้")
    } finally {
      setLoading(false)
    }
  }


  const cfg = result ? STATUS_CONFIG[result.status] ?? STATUS_CONFIG.PENDING : null
  const n = result ? nights(result.check_in, result.check_out) : 0

  return (
    <div className="bg-[#161b24] min-h-screen py-16 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-10">
          <p className="text-[#9c8251] text-sm tracking-widest uppercase mb-2">ตรวจสอบ</p>
          <h1 className={`${prompt.className} text-white text-3xl font-semibold mb-3`}>
            สถานะการจอง
          </h1>
          <p className="text-gray-500 text-sm">กรอกรหัสการจองที่ได้รับหลังจากจองห้องพัก</p>
        </div>

        <div className="bg-[#1e2535] border border-[#9c8251]/30 rounded-sm p-5 mb-6">
          <label className="text-gray-500 text-xs block mb-2">รหัสการจอง</label>
          <div className="flex gap-2">
            <input
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="เช่น BK4F2A9E1C"
              className="flex-1 bg-[#161b24] border border-[#2a3347] rounded-sm px-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-[#9c8251] tracking-wider uppercase"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-[#be964c] hover:bg-[#b8965c] disabled:opacity-50 text-black font-medium px-5 py-2.5 rounded-sm text-sm transition-colors cursor-pointer active:scale-[0.98]"
            >
              {loading ? "..." : "ค้นหา"}
            </button>
          </div>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>

        {result && cfg && (
          <div className="bg-[#1e2535] border border-[#2a3347] rounded-sm overflow-hidden">
            <div className={`${cfg.bg} border-b ${cfg.border} px-5 py-4 flex items-center gap-3`}>
              <span className={`text-xl ${cfg.text}`}>{cfg.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={`font-semibold text-sm ${cfg.text}`}>{cfg.label}</p>
                  <span className={`text-[10px] border ${cfg.border} ${cfg.text} px-2 py-0.5 rounded-sm font-mono`}>
                    {result.status}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-0.5">{cfg.desc}</p>
              </div>
              <p className={`font-mono text-lg font-bold ${cfg.text}`}>
                {result.booking_ref}
              </p>
            </div>

            <div className="p-5 border-b border-[#2a3347]">
              <p className="text-gray-600 text-xs mb-3 uppercase tracking-wider">รายละเอียดห้องพัก</p>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className={`${prompt.className} text-white text-lg font-semibold`}>
                    ห้อง {result.room.room_number}
                  </p>
                  <p className="text-gray-500 text-xs">ชั้น {result.room.floor}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#be964c] font-semibold text-lg">
                    ฿{result.total_price.toLocaleString()}
                  </p>
                  <p className="text-gray-600 text-xs">{n} คืน</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#161b24] rounded-sm p-3">
                  <p className="text-gray-600 text-xs mb-1">เช็คอิน</p>
                  <p className="text-white text-sm font-medium">{formatDate(result.check_in)}</p>
                  <p className="text-gray-600 text-xs">14:00 น.</p>
                </div>
                <div className="bg-[#161b24] rounded-sm p-3">
                  <p className="text-gray-600 text-xs mb-1">เช็คเอาท์</p>
                  <p className="text-white text-sm font-medium">{formatDate(result.check_out)}</p>
                  <p className="text-gray-600 text-xs">12:00 น.</p>
                </div>
              </div>
            </div>

            <div className="p-5 border-b border-[#2a3347]">
              <p className="text-gray-600 text-xs mb-3 uppercase tracking-wider">ข้อมูลผู้เข้าพัก</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ชื่อ-นามสกุล</span>
                  <span className="text-white">{result.customer.full_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">อีเมล</span>
                  <span className="text-white">{result.customer.email}</span>
                </div>
                {result.customer.phone && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">โทรศัพท์</span>
                    <span className="text-white">{result.customer.phone}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">จำนวนผู้เข้าพัก</span>
                  <span className="text-white">{result.num_guests} คน</span>
                </div>
              </div>
            </div>

            {result.status === "PENDING" && result.lock_expires_at && (
              <div className="p-5 bg-yellow-900/10">
                <p className="text-yellow-400 text-xs font-medium mb-1">⚠ รอชำระเงิน</p>
                <p className="text-gray-500 text-xs">
                  กรุณากลับไปที่หน้าชำระเงินก่อน{" "}
                  <span className="text-yellow-400">
                    {formatDate(result.lock_expires_at)} {formatTime(result.lock_expires_at)} น.
                  </span>
                </p>
              </div>
            )}

            <div className="px-5 py-3 bg-[#161b24] flex justify-between items-center">
              <p className="text-gray-600 text-xs">
                จองเมื่อ {formatDate(result.created_at)} {formatTime(result.created_at)}
              </p>
              <button
                onClick={() => { setResult(null); setRef("") }}
                className="text-gray-600 hover:text-gray-400 text-xs transition-colors cursor-pointer"
              >
                ค้นหาใหม่
              </button>
            </div>
            <a
              href="https://www.facebook.com/yourpage"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-sm text-sm transition m-2"
            >
              ติดต่อเจ้าหน้าที่เพื่อดำเนินการคืนเงิน
            </a>
          </div>
        )}
      </div>

    </div>
  )
}
