'use client'
import { useState, useEffect } from "react"
import toast from "react-hot-toast"

type Booking = {
  id: number
  booking_ref: string
  status: string
  total_price: number
  num_guests: number
  created_at: string
  check_in: string
  check_out: string
  lock_expires_at: string | null

  customer: {
    full_name: string
    email: string
  }

  room: {
    room_number: string
  }
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/15 text-yellow-400",
  PAID: "bg-green-500/15 text-green-400",
  CANCELLED: "bg-red-500/15 text-red-400",
  CHECKED_IN: "bg-blue-500/15 text-blue-400",
  CHECKED_OUT: "bg-gray-500/15 text-gray-400",
}

const BookingClient = () => {
  const [booking, setBooking] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [firstLoading, setFirstLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด")
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [expiring, setExpiring] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    const controller = new AbortController()
    let ignore = false

    async function fetchBooking() {
      setLoading(true)

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          search,
          status: statusFilter === "ทั้งหมด" ? "" : statusFilter,
        })

        const res = await fetch(`/api/admin/booking?${params}`, {
          signal: controller.signal,
        })

        if (!res.ok) throw new Error("Fetch failed")

        const data = await res.json()

        if (ignore) return

        setBooking(Array.isArray(data) ? data : (data.data ?? []))
        setTotalPages(data.total_pages ?? 1)

      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.log(error)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
          setFirstLoading(false)
        }
      }
    }

    fetchBooking()

    return () => {
      ignore = true
      controller.abort()
    }
  }, [page, search, statusFilter])


  async function handleCancel(booking_ref: string) {
    setCancellingId(booking_ref)

    try {
      const res = await fetch(`/api/admin/booking/${booking_ref}/cancel`, {
        method: "PUT",
        credentials: "include",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || "cancel failed")
      }

      setBooking((prev) =>
        prev.map((item) =>
          item.booking_ref === booking_ref
            ? { ...item, status: "CANCELLED" }
            : item
        )
      )

      toast.success("ยกเลิกการจองสำเร็จ")

    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาด")

    } finally {
      setCancellingId(null)
    }
  }

  async function handleExpirePending() {
    setExpiring(true)
    try {
      const res = await fetch("/api/admin/booking/admin/expire-pending", {
        method: "POST",
        credentials: "include",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || "expire failed")
      }

      toast.success(`Expire แล้ว ${data.detail}`)

      const refresh = await fetch("/api/admin/booking", {
        credentials: "include",
      })
      const newData = await refresh.json()
      setBooking(Array.isArray(newData) ? newData : (newData.data ?? []))

    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาด")
    }
    finally {
      setExpiring(false)
    }
  }

  async function handleRefund(booking_ref: string) {
    try {
      const res = await fetch(`/api/admin/refund/${booking_ref}`, {
        method: "POST",
        credentials: "include",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || "refund failed")
      }

      toast.success("คืนเงินสำเร็จ")

      setBooking(prev =>
        prev.map(item =>
          item.booking_ref === booking_ref
            ? { ...item, status: "CANCELLED" }
            : item
        )
      )
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  if (firstLoading) {
    return (
      <div className="grid xl:grid-cols-2 gap-4">

        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="relative overflow-hidden bg-[#171b21] border border-[#2a2f38] rounded-2xl"
          >

            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            <div className="flex items-start justify-between px-5 py-4 border-b border-[#2a2f38]">

              <div className="space-y-3">
                <div className="h-5 w-36 bg-white/10 rounded-md" />
                <div className="h-3 w-52 bg-white/5 rounded-md" />
              </div>

              <div className="h-6 w-20 bg-white/10 rounded-full" />
            </div>

            <div className="p-5 space-y-6">

              <div className="space-y-3">
                <div className="h-3 w-24 bg-white/5 rounded" />

                <div className="flex items-center justify-between">

                  <div className="space-y-2">
                    <div className="h-4 w-40 bg-white/10 rounded" />
                    <div className="h-3 w-56 bg-white/5 rounded" />
                  </div>

                  <div className="space-y-2 text-right">
                    <div className="h-4 w-12 bg-white/10 rounded" />
                    <div className="h-3 w-20 bg-white/5 rounded" />
                  </div>

                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">

                <div className="bg-[#20252d] rounded-xl p-3 space-y-2">
                  <div className="h-3 w-16 bg-white/5 rounded" />
                  <div className="h-4 w-28 bg-white/10 rounded" />
                </div>

                <div className="bg-[#20252d] rounded-xl p-3 space-y-2">
                  <div className="h-3 w-16 bg-white/5 rounded" />
                  <div className="h-4 w-28 bg-white/10 rounded" />
                </div>

              </div>

              <div className="flex items-center justify-between bg-[#20252d] rounded-xl p-4">

                <div className="space-y-2">
                  <div className="h-3 w-16 bg-white/5 rounded" />
                  <div className="h-6 w-24 bg-white/10 rounded" />
                </div>

                <div className="space-y-2 text-right">
                  <div className="h-3 w-16 bg-white/5 rounded" />
                  <div className="h-4 w-20 bg-white/10 rounded" />
                </div>

              </div>

              <div className="flex gap-2 pt-2">
                <div className="h-9 w-24 bg-white/10 rounded-lg" />
                <div className="h-9 w-28 bg-white/5 rounded-lg" />
              </div>

            </div>
          </div>
        ))}

        <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            รายการการจอง
          </h1>
          <p className="text-gray-500 mt-1">
            จัดการการจอง ยกเลิก และ expire pending
          </p>
        </div>
      </div>

      <div
        className="bg-[#171b21] border border-[#363a42]
        rounded-2xl p-4 flex flex-col lg:flex-row gap-3"
      >
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="ค้นหา booking ref..."
          className="flex-1 bg-[#20252d] border border-[#363a42]
        rounded-lg px-4 py-2.5 text-sm text-white outline-none
        focus:border-amber-300 transition"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#20252d] border border-[#363a42]
          rounded-lg px-4 py-2.5 text-sm text-white outline-none
          focus:border-amber-300 transition"
        >
          <option>ทั้งหมด</option>
          <option>PENDING</option>
          <option>PAID</option>
          <option>CANCELLED</option>
          <option>CHECKED_IN</option>
          <option>CHECKED_OUT</option>
        </select>
      </div>

      <div className="relative">

        {loading && (
          <div className="absolute inset-0 z-10 grid xl:grid-cols-2 gap-4 bg-black/20 p-4">

            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-[#171b21] border border-[#2a2f38] rounded-2xl p-5 space-y-4"
              >
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-white/10 rounded" />
                  <div className="h-3 w-48 bg-white/5 rounded" />
                </div>

                <div className="space-y-2">
                  <div className="h-3 w-20 bg-white/5 rounded" />
                  <div className="h-4 w-40 bg-white/10 rounded" />
                  <div className="h-3 w-32 bg-white/5 rounded" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="h-16 bg-white/5 rounded" />
                  <div className="h-16 bg-white/5 rounded" />
                </div>

                <div className="flex justify-between">
                  <div className="h-6 w-20 bg-white/10 rounded" />
                  <div className="h-6 w-16 bg-white/5 rounded" />
                </div>

                <div className="flex gap-2">
                  <div className="h-9 w-24 bg-white/10 rounded-lg" />
                  <div className="h-9 w-28 bg-white/5 rounded-lg" />
                </div>
              </div>
            ))}

          </div>
        )}

        <div className="grid xl:grid-cols-2 gap-4">

          {booking.map((item) => (

            <div
              key={item.id}
              className="bg-[#171b21] border border-[#363a42]
          rounded-2xl overflow-hidden"
            >

              <div
                className="flex items-center justify-between
            px-5 py-4 border-b border-[#2a2f38]"
              >

                <div>
                  <h2 className="text-white font-bold text-lg">
                    {item.booking_ref}
                  </h2>

                  <p className="text-gray-500 text-sm mt-1">
                    สร้างเมื่อ {new Date(item.created_at).toLocaleDateString("th-TH")}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold
              ${statusColors[item.status]}`}
                >
                  {item.status}
                </span>

              </div>

              <div className="p-5 space-y-4">

                <div>

                  <p className="text-xs text-gray-500 mb-2">
                    ผู้เข้าพัก
                  </p>

                  <div className="flex items-center justify-between">

                    <div>
                      <h3 className="text-white font-semibold">
                        {item.customer.full_name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {item.customer.email}
                      </p>
                    </div>

                    <div className="text-right">

                      <p className="text-sm text-white">
                        {item.num_guests} คน
                      </p>

                      <p className="text-xs text-gray-500">
                        ห้อง {item.room.room_number}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="grid grid-cols-2 gap-3">

                  <div className="bg-[#20252d] rounded-xl p-3">

                    <p className="text-xs text-gray-500">
                      Check In
                    </p>

                    <h4 className="text-white font-semibold mt-1">
                      {new Date(item.check_in).toLocaleDateString("th-TH")}
                    </h4>

                  </div>

                  <div className="bg-[#20252d] rounded-xl p-3">

                    <p className="text-xs text-gray-500">
                      Check Out
                    </p>

                    <h4 className="text-white font-semibold mt-1">
                      {new Date(item.check_out).toLocaleDateString("th-TH")}
                    </h4>

                  </div>

                </div>

                <div
                  className="flex items-center justify-between
              bg-[#20252d] rounded-xl p-4"
                >

                  <div>

                    <p className="text-xs text-gray-500">
                      ยอดรวม
                    </p>

                    <h3 className="text-xl font-bold text-amber-300 mt-1">
                      ฿{item.total_price.toLocaleString()}
                    </h3>

                  </div>

                  <div className="text-right">

                    <p className="text-xs text-gray-500">
                      สถานะ
                    </p>

                    <h3 className="text-white font-bold text-sm mt-1">
                      {item.status}
                    </h3>

                  </div>

                </div>

                <div className="flex flex-wrap gap-2 pt-2">

                  <button
                    onClick={() => handleCancel(item.booking_ref)}
                    disabled={cancellingId === item.booking_ref}
                    className={`px-4 py-2 rounded-lg transition text-sm cursor-pointer flex items-center gap-2
                  ${cancellingId === item.booking_ref
                        ? "bg-red-500/20 text-red-300 cursor-not-allowed"
                        : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      }`}
                  >
                    {cancellingId === item.booking_ref ? (

                      "กำลังยกเลิก...."
                    ) : (
                      "ยกเลิก"
                    )}
                  </button>

                  {item.status === "PENDING" && (
                    <button
                      onClick={handleExpirePending}
                      disabled={expiring}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer
                        ${expiring
                          ? "bg-amber-300/50 text-black cursor-not-allowed"
                          : "bg-amber-300 text-black hover:bg-amber-200"
                        }`}
                    >
                      {expiring ? "กำลัง expire..." : "Expire Pending"}
                    </button>

                  )}

                </div>
                <div>
                  {item.status === "PAID" && (
                    <button
                      onClick={() => handleRefund(item.booking_ref)}
                      className="px-4 py-2 rounded-lg text-sm bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
                    >
                      คืนเงิน
                    </button>
                  )}
                </div>
              </div>

            </div>

          ))}

        </div>

      </div>

      <div className="flex items-center justify-center gap-3 pt-6">

        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer
          bg-[#20252d] border border-[#2a2f38]
          text-white text-sm font-medium
          hover:bg-[#2a2f38] transition
          disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>

        <div className="px-4 py-2 rounded-xl bg-[#171b21] border border-[#2a2f38] text-white text-sm">
          Page <span className="text-amber-300 font-semibold">{page}</span>
          <span className="text-gray-500"> / {totalPages}</span>
        </div>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer
          bg-amber-300 text-black font-semibold text-sm
          hover:bg-amber-200 transition
          disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next →
        </button>

      </div>
    </div>
  )
}
export default BookingClient