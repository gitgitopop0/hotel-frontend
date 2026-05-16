"use client"
import { Prompt } from "next/font/google"
import { useState, useEffect } from "react"
import BookingModal from "@/components/home/BookingModal"


const prompt = Prompt({
  subsets: ["thai"],
  weight: ["300", "400", "600", "700"],
})

interface RoomCategory {
  id: number
  name: string
  description: string
  price_per_night: number
  capacity: number
  beds: number
  area_sqm: number
  cover_image_url: string | null
  is_active: boolean
  total_rooms: number
  available_rooms: number
  images: RoomImage[]
}

interface AvailableRoom extends RoomCategory {
  available_rooms: number
}

interface RoomImage {
  id: number
  image_url: string
  sort_order: number
}

const Lightbox = ({
  images,
  initialIndex,
  roomName,
  onClose,
}: {
  images: string[]
  initialIndex: number
  roomName: string
  onClose: () => void
}) => {
  const [current, setCurrent] = useState(initialIndex)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") setCurrent((p) => (p + 1) % images.length)
      if (e.key === "ArrowLeft") setCurrent((p) => (p - 1 + images.length) % images.length)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [images.length, onClose])

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" onClick={(e) => e.stopPropagation()}>
        <p className="text-white/70 text-sm">{roomName}</p>
        <div className="flex items-center gap-4">
          <p className="text-white/40 text-xs">{current + 1} / {images.length}</p>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative px-16 min-h-0" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[current]}
          alt={`${roomName} ${current + 1}`}
          className="max-w-full max-h-full object-contain rounded-sm"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((p) => (p - 1 + images.length) % images.length)}
              className="absolute left-4 bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors text-xl"
            >
              ‹
            </button>
            <button
              onClick={() => setCurrent((p) => (p + 1) % images.length)}
              className="absolute right-4 bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors text-xl"
            >
              ›
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 justify-center overflow-x-auto px-5 py-4" onClick={(e) => e.stopPropagation()}>
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => setCurrent(i)}
              className={`h-14 w-20 object-cover rounded-sm cursor-pointer flex-shrink-0 transition-all
              ${i === current ? "opacity-100 ring-1 ring-[#9c8251] scale-105" : "opacity-40 hover:opacity-70"}`}
            />
          ))}
        </div>
      )}
    </div>

  )
}


const RoomsSection = () => {
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [availableMap, setAvailableMap] = useState<Map<number, number> | null>(null)
  const [allRooms, setAllRooms] = useState<RoomCategory[]>([])
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number; name: string } | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [bookingTarget, setBookingTarget] = useState<RoomCategory | null>(null)

  const handleSearch = async () => {
    if (!checkIn || !checkOut) {
      setError("กรุณาเลือกวันที่เช็คอินและเช็คเอาท์")
      return
    }
    setLoading(true)
    setError("")
    try {
      const checkInDate = new Date(`${checkIn}T14:00:00+07:00`)
      const checkOutDate = new Date(`${checkOut}T12:00:00+07:00`)

      const params = new URLSearchParams({
        check_in: checkInDate.toISOString(),
        check_out: checkOutDate.toISOString(),
      })
      const res = await fetch(`/api/client/roomtype?${params}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "เกิดข้อผิดพลาด")
        return
      }

      const map = new Map<number, number>()
        ; (data as AvailableRoom[]).forEach((r) => map.set(r.id, r.available_rooms))
      setAvailableMap(map)
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้")
    } finally {
      setLoading(false)
    }
  }

  const nights =
    checkIn && checkOut
      ? Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
      )
      : 0

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    fetch("/api/client/roomtype/list")
      .then((r) => r.json())
      .then((data) => {
        setAllRooms(Array.isArray(data) ? data : [])
      })
      .catch(console.error)
      .finally(() => setInitialLoading(false))
  }, [])

  const openLightbox = (room: RoomCategory) => {
    const imgs = [
      ...(room.cover_image_url ? [room.cover_image_url] : []),
      ...room.images.map((i) => i.image_url),
    ]
    if (imgs.length === 0) return
    setLightbox({ images: imgs, index: 0, name: room.name })
  }

  const handleBookClick = (room: RoomCategory) => {
    if (!checkIn || !checkOut) {
      setError("กรุณาเลือกวันที่เช็คอินและเช็คเอาท์ก่อนจอง")
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    setBookingTarget(room)
  }

  if (initialLoading) {
    return (
      <div className="bg-[#161b24]">
        <div className="flex flex-col items-center p-5 gap-5">
          <h2 className="text-[#9c8251] text-xl">คอลเลกชันของเรา</h2>
          <h1 className={`${prompt.className} text-center text-white text-2xl sm:text-3xl md:text-4xl`}>ประเภทห้อง</h1>
          <p className="text-gray-500 text-center">ตั้งแต่ห้องมาตรฐานบรรยากาศอบอุ่นไปจนถึงเพนต์เฮาส์สุดกว้างขวาง</p>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
          .shimmer {
            background: #1e2535;
            animation: pulse 1.8s ease-in-out infinite;
          }
          `}</style>

        <div className="max-w-3xl mx-auto mb-10 border border-[#9c8251]/30 rounded-sm p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="shimmer h-10 rounded-lg" />
            <div className="shimmer h-10 rounded-lg" />
            <div className="shimmer h-10 rounded-sm" />
          </div>
        </div>

        <div className="bg-[#0d1117] py-10 px-5">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#1e2535] border border-[#2a3347] rounded-sm overflow-hidden">
                <div className="shimmer h-44 w-full" />
                <div className="p-4 space-y-3">
                  <div className="shimmer h-5 w-2/3 rounded" />
                  <div className="shimmer h-3 w-full rounded" />
                  <div className="shimmer h-3 w-4/5 rounded" />
                  <div className="flex gap-3 mt-1">
                    <div className="shimmer h-3 w-12 rounded" />
                    <div className="shimmer h-3 w-12 rounded" />
                    <div className="shimmer h-3 w-12 rounded" />
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <div className="shimmer h-5 w-24 rounded" />
                    <div className="shimmer h-7 w-16 rounded-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#161b24]">
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          initialIndex={lightbox.index}
          roomName={lightbox.name}
          onClose={() => setLightbox(null)}
        />
      )}

      {bookingTarget && (
        <BookingModal
          room={bookingTarget}
          checkIn={checkIn}
          checkOut={checkOut}
          nights={nights}
          onClose={() => setBookingTarget(null)}
        />
      )}

      <div className="flex flex-col items-center p-5 gap-5">
        <h2 className="text-[#9c8251] text-xl">คอลเลกชันของเรา</h2>
        <h1 className={`${prompt.className} text-center text-white text-2xl sm:text-3xl md:text-4xl`}>ประเภทห้อง</h1>
        <p className="text-gray-500">ตั้งแต่ห้องมาตรฐานบรรยากาศอบอุ่นไปจนถึงเพนต์เฮาส์สุดกว้างขวาง ทุกห้องได้รับการออกแบบอย่างพิถีพิถัน</p>
      </div>

      <div className="max-w-3xl mx-auto mb-10 bg-[#161b24] border border-[#9c8251] rounded-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-gray-500 text-xs">เช็คอิน</label>
            <input
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value)
                if (checkOut && e.target.value >= checkOut) setCheckOut("")
              }}
              className="bg-[#161b24] border border-[#2a3347] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#9c8251]
              cursor-pointer
              "
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-gray-500 text-xs">
              เช็คเอาท์{nights > 0 && (
                <span className="ml-2 text-[#9c8251]">({nights} คืน)</span>
              )}
            </label>
            <input
              type="date"
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bg-[#161b24] border border-[#2a3347] rounded-sm px-3 py-2 text-white text-sm focus:outline-none focus:border-[#9c8251]
              cursor-pointer
              "
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-[#be964c] hover:bg-[#b8965c] disabled:opacity-50 text-black font-medium py-2 px-6 rounded-sm transition-all duration-300 text-sm 
            cursor-pointer active:scale-[0.95]
            "
          >
            {loading ? "กำลังค้นหา..." : "ค้นหาห้องว่าง"}
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
      </div>
      <div className="bg-[#0d1117] py-10 px-5">
        <div className="max-w-5xl mx-auto px-5 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allRooms.map((room) => {
            const availableCount = availableMap?.get(room.id)
            const isAvailable = availableCount !== undefined && availableCount > 0
            const isUnavailable = availableMap !== null && !availableMap.has(room.id)
            const hasImages = !!(room.cover_image_url || room.images?.length > 0)

            return (
              <div
                key={room.id}
                className={`bg-[#1e2535] border rounded-sm overflow-hidden transition-colors
                ${isUnavailable ? "border-[#2a3347] opacity-50" : "border-[#2a3347] hover:border-[#9c8251]"}`}
              >
                <div
                  className={`h-44 relative overflow-hidden ${hasImages ? "cursor-zoom-in" : ""}`}
                  onClick={() => openLightbox(room)}
                >
                  {room.cover_image_url ? (
                    <img src={room.cover_image_url} alt={room.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#242d3e] flex items-center justify-center">
                      <span className="text-gray-600 text-sm">{room.name}</span>
                    </div>
                  )}

                  {hasImages && (
                    <span className="absolute bottom-3 left-3 bg-black/60 text-white/70 text-xs px-2 py-0.5 rounded-sm">
                      🖼 {(room.cover_image_url ? 1 : 0) + (room.images?.length ?? 0)}  รูป
                    </span>
                  )}

                  {availableMap !== null && (
                    isAvailable ? (
                      <span className="absolute top-3 right-3 bg-emerald-900/80 text-emerald-400 text-xs px-2.5 py-1 rounded-sm">
                        ว่าง {availableCount} ห้อง
                      </span>
                    ) : (
                      <span className="absolute top-3 right-3 bg-red-900/80 text-red-400 text-xs px-2.5 py-1 rounded-sm">
                        ไม่ว่าง
                      </span>
                    )
                  )}
                </div>

                <div className="p-4">
                  <h3 className={`${prompt.className} text-[#e8e0d0] text-base font-semibold mb-1`}>
                    {room.name}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed mb-3">{room.description}</p>

                  <div className="flex gap-3 mb-4 text-gray-500 text-xs">
                    <span>👤 {room.capacity} คน</span>
                    <span>🛏 {room.beds} เตียง</span>
                    <span>📐 {room.area_sqm} m²</span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[#9c8251] font-semibold">
                        ฿{room.price_per_night.toLocaleString()}
                        <span className="text-gray-600 text-xs font-normal"> / คืน</span>
                      </p>
                      {nights > 0 && isAvailable && (
                        <p className="text-gray-600 text-xs mt-0.5">
                          รวม ฿{(room.price_per_night * nights).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <button
                      disabled={isUnavailable}
                      onClick={() => handleBookClick(room)}
                      className={`border text-xs px-3 py-1.5 rounded-sm transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed
                      ${!checkIn || !checkOut
                          ? "border-[#9c8251]/40 text-[#9c8251]/50 hover:border-[#9c8251] hover:text-[#9c8251]"
                          : "border-[#9c8251] text-[#9c8251] hover:bg-[#9c8251]/10"
                        }`}
                    >
                      จอง →
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
export default RoomsSection