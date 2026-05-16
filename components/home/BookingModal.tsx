"use client"
import { useState, useEffect, useCallback } from "react"
import { Prompt } from "next/font/google"

const prompt = Prompt({ subsets: ["thai"], weight: ["300", "400", "600", "700"] })

interface RoomCategory {
    id: number
    name: string
    price_per_night: number
    capacity: number
    beds: number
    area_sqm: number
    cover_image_url: string | null
}

interface GuestData {
    full_name: string
    email: string
    phone: string
    id_card: string
    num_guests: number
    special_request: string
}

interface BookingResult {
    booking_ref: string
    lock_expires_at: string
    total_price: number
    room_id: number
}

type Step = "summary" | "guest" | "payment" | "success"
type PaymentMethod = "CASH" | "CREDIT_CARD" | "BANK_TRANSFER"

const STEPS: { key: Step; label: string }[] = [
    { key: "summary", label: "สรุป" },
    { key: "guest", label: "ข้อมูล" },
    { key: "payment", label: "ชำระเงิน" },
    { key: "success", label: "เสร็จสิ้น" },
]

const StepIndicator = ({ current }: { current: Step }) => {
    const currentIdx = STEPS.findIndex((s) => s.key === current)
    return (
        <div className="flex items-center gap-0 mb-6">
            {STEPS.map((s, i) => (
                <div key={s.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                        <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300
              ${i < currentIdx ? "bg-[#9c8251] text-black" :
                                    i === currentIdx ? "bg-[#be964c] text-black ring-2 ring-[#be964c]/30" :
                                        "bg-[#2a3347] text-gray-500"}`}
                        >
                            {i < currentIdx ? "✓" : i + 1}
                        </div>
                        <span className={`text-[10px] ${i === currentIdx ? "text-[#9c8251]" : "text-gray-600"}`}>
                            {s.label}
                        </span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div className={`flex-1 h-px mx-1 mb-4 transition-all duration-500
              ${i < currentIdx ? "bg-[#9c8251]" : "bg-[#2a3347]"}`}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}

const BookingStepSummary = ({
    room, checkIn, checkOut, nights,
    onNext, onClose,
}: {
    room: RoomCategory
    checkIn: string
    checkOut: string
    nights: number
    onNext: () => void
    onClose: () => void
}) => (
    <div className="flex flex-col gap-4">
        <div>
            <p className="text-[#9c8251] text-xs mb-1">ห้องที่เลือก</p>
            <h3 className={`${prompt.className} text-white text-lg font-semibold`}>{room.name}</h3>
        </div>

        {room.cover_image_url && (
            <img src={room.cover_image_url} alt={room.name}
                className="w-full h-36 object-cover rounded-sm opacity-80" />
        )}

        <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#161b24] rounded-sm p-3">
                <p className="text-gray-600 text-xs mb-1">เช็คอิน</p>
                <p className="text-white text-sm font-medium">{checkIn}</p>
                <p className="text-gray-600 text-[10px]">14:00 น.</p>
            </div>
            <div className="bg-[#161b24] rounded-sm p-3">
                <p className="text-gray-600 text-xs mb-1">เช็คเอาท์</p>
                <p className="text-white text-sm font-medium">{checkOut}</p>
                <p className="text-gray-600 text-[10px]">12:00 น.</p>
            </div>
        </div>

        <div className="flex gap-3 text-xs text-gray-500">
            <span>👤 {room.capacity} คน</span>
            <span>🛏 {room.beds} เตียง</span>
            <span>📐 {room.area_sqm} m²</span>
        </div>

        <div className="border-t border-[#2a3347] pt-3 flex justify-between items-end">
            <div>
                <p className="text-gray-600 text-xs">ราคารวม ({nights} คืน)</p>
                <p className={`${prompt.className} text-[#be964c] text-xl font-semibold`}>
                    ฿{(room.price_per_night * nights).toLocaleString()}
                </p>
                <p className="text-gray-600 text-xs">฿{room.price_per_night.toLocaleString()} / คืน</p>
            </div>
        </div>

        <div className="flex gap-2 pt-1">
            <button onClick={onClose}
                className="flex-1 border border-[#2a3347] text-gray-500 py-2.5 rounded-sm text-sm hover:border-gray-500 transition-colors cursor-pointer">
                ยกเลิก
            </button>
            <button onClick={onNext}
                className="flex-1 bg-[#be964c] hover:bg-[#b8965c] text-black font-medium py-2.5 rounded-sm text-sm transition-colors cursor-pointer active:scale-[0.98]">
                ถัดไป →
            </button>
        </div>
    </div>
)

interface FieldProps {
    label: string
    id: string
    type?: string
    required?: boolean
    value: string
    onChange: (v: string) => void
    error?: string
    placeholder?: string
}

const Field = ({
    label,
    id,
    type = "text",
    required = false,
    value,
    onChange,
    error,
    placeholder,
}: FieldProps) => (
    <div className="flex flex-col gap-1">
        <label className="text-gray-500 text-xs">
            {label} {required && <span className="text-[#be964c]">*</span>}
        </label>

        <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`bg-[#161b24] border rounded-sm px-3 py-2 text-white text-sm focus:outline-none transition-colors
      ${error
                    ? "border-red-500/60"
                    : "border-[#2a3347] focus:border-[#9c8251]"
                }`}
        />

        {error && (
            <p className="text-red-400 text-[10px]">{error}</p>
        )}
    </div>
)

const BookingStepGuest = ({
    room,
    onNext, onBack,
}: {
    room: RoomCategory
    onNext: (data: GuestData) => void
    onBack: () => void
}) => {
    type GuestErrors = Partial<Record<keyof GuestData, string>>

    const [form, setForm] = useState<GuestData>({
        full_name: "", email: "", phone: "", id_card: "",
        num_guests: 1, special_request: "",
    })

    const [errors, setErrors] = useState<GuestErrors>({})

    const set = (k: keyof GuestData, v: string | number) =>
        setForm((p) => ({ ...p, [k]: v }))

    const validate = (): GuestErrors => {
        const e: GuestErrors = {}
        if (!form.full_name.trim()) e.full_name = "กรุณากรอกชื่อ-นามสกุล"
        if (!form.email.trim()) {
            e.email = "กรุณากรอกอีเมล"
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            e.email = "รูปแบบอีเมลไม่ถูกต้อง"
        }
        return e
    }

    const handleNext = () => {
        const e = validate()
        if (Object.keys(e).length) { setErrors(e); return }
        onNext(form)
    }

    return (
        <div className="flex flex-col gap-3">
            <div>
                <h3 className="text-white font-semibold text-sm mb-0.5">ข้อมูลผู้เข้าพัก</h3>
                <p className="text-gray-600 text-xs">กรอกข้อมูลสำหรับการเช็คอิน</p>
            </div>

            <Field label="ชื่อ-นามสกุล" id="full_name" required
                value={form.full_name} onChange={(v) => set("full_name", v)}
                error={errors.full_name} />

            <Field label="อีเมล" id="email" type="email" required
                value={form.email} onChange={(v) => set("email", v)}
                error={errors.email} />

            <Field label="เบอร์โทรศัพท์" id="phone"
                value={form.phone} onChange={(v) => set("phone", v)} placeholder="08X-XXX-XXXX" />

            <Field label="เลขบัตรประชาชน / พาสปอร์ต" id="id_card"
                value={form.id_card} onChange={(v) => set("id_card", v)} />

            <div className="flex flex-col gap-1">
                <label className="text-gray-500 text-xs">จำนวนผู้เข้าพัก</label>
                <select value={form.num_guests} onChange={(e) => set("num_guests", Number(e.target.value))}
                    className="bg-[#161b24] border border-[#2a3347] rounded-sm px-3 py-2 text-white text-sm focus:outline-none focus:border-[#9c8251] cursor-pointer">
                    {Array.from({ length: room.capacity }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n} คน</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-gray-500 text-xs">ความต้องการพิเศษ (ถ้ามี)</label>
                <textarea value={form.special_request} onChange={(e) => set("special_request", e.target.value)}
                    rows={2} placeholder="เช่น ต้องการเตียงเสริม, ชั้นสูง..."
                    className="bg-[#161b24] border border-[#2a3347] rounded-sm px-3 py-2 text-white text-sm focus:outline-none focus:border-[#9c8251] resize-none"
                />
            </div>

            <div className="flex gap-2 pt-1">
                <button onClick={onBack}
                    className="flex-1 border border-[#2a3347] text-gray-500 py-2.5 rounded-sm text-sm hover:border-gray-500 transition-colors cursor-pointer">
                    ← ย้อนกลับ
                </button>
                <button onClick={handleNext}
                    className="flex-1 bg-[#be964c] hover:bg-[#b8965c] text-black font-medium py-2.5 rounded-sm text-sm transition-colors cursor-pointer active:scale-[0.98]">
                    ถัดไป →
                </button>
            </div>
        </div>
    )
}

const useCountdown = (expiresAt: string | null) => {
    const [remaining, setRemaining] = useState<number | null>(null)

    useEffect(() => {
        if (!expiresAt) return
        const tick = () => {
            const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now())
            setRemaining(diff)
        }
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [expiresAt])

    const mins = Math.floor((remaining ?? 0) / 60000)
    const secs = Math.floor(((remaining ?? 0) % 60000) / 1000)

    const isExpired = remaining !== null && remaining === 0 && !!expiresAt

    const isUrgent =
        remaining !== null &&
        remaining < 5 * 60 * 1000 &&
        remaining > 0

    return { mins, secs, isExpired, isUrgent, remaining }
}

const BookingStepPayment = ({
    booking, nights, room,
    onSuccess, onBack, onExpired,
}: {
    booking: BookingResult
    nights: number
    room: RoomCategory
    onSuccess: () => void
    onBack: () => void
    onExpired: () => void
}) => {
    const [method, setMethod] = useState<PaymentMethod>("BANK_TRANSFER")
    const [txId, setTxId] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const { mins, secs, isExpired, isUrgent } = useCountdown(booking.lock_expires_at)

    useEffect(() => { if (isExpired) onExpired() }, [isExpired])

    const methods: { key: PaymentMethod; label: string; icon: string }[] = [
        { key: "BANK_TRANSFER", label: "โอนเงิน", icon: "🏦" },
        { key: "CREDIT_CARD", label: "บัตรเครดิต", icon: "💳" },
        { key: "CASH", label: "ชำระที่เคาน์เตอร์", icon: "💵" },
    ]

    const handlePay = async () => {
        if (method === "CREDIT_CARD" && !txId.trim()) {
            setError("กรุณากรอก Transaction ID")
            return
        }
        setLoading(true)
        setError("")
        try {

            const createRes = await fetch(
                `/api/client/payment/${booking.booking_ref}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        method,
                    }),
                }
            )

            const createData = await createRes.json()

            if (!createRes.ok) {
                setError(createData.detail || "สร้างรายการชำระเงินไม่สำเร็จ")
                return
            }

            const successRes = await fetch(
                `/api/client/payment/${booking.booking_ref}/succes`,
                {
                    method: "POST",
                }
            )

            const successData = await successRes.json()

            if (!successRes.ok) {
                setError(successData.detail || "ยืนยันการชำระเงินไม่สำเร็จ")
                return
            }

            onSuccess()

        } catch (error) {
            console.log(error)
            setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className={`flex items-center justify-between rounded-sm px-4 py-3 border
        ${isUrgent ? "bg-red-900/20 border-red-500/40" : "bg-[#161b24] border-[#2a3347]"}`}>
                <div>
                    <p className="text-gray-500 text-xs">ห้องถูกจองไว้ชั่วคราว</p>
                    <p className="text-gray-400 text-xs">กรุณาชำระเงินก่อนหมดเวลา</p>
                </div>
                <div className="text-right">
                    <p className={`font-mono text-xl font-bold ${isUrgent ? "text-red-400" : "text-[#be964c]"}`}>
                        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                    </p>
                    <p className="text-gray-600 text-[10px]">นาที</p>
                </div>
            </div>

            <div className="bg-[#161b24] rounded-sm p-3 text-sm">
                <div className="flex justify-between text-gray-500 mb-1">
                    <span>{room.name} × {nights} คืน</span>
                    <span>฿{Number(booking.total_price || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-white font-semibold border-t border-[#2a3347] pt-2 mt-2">
                    <span>ยอดรวม</span>
                    <span className="text-[#be964c]"> ฿{Number(booking.total_price || 0).toLocaleString()}</span>
                </div>
            </div>

            <div>
                <p className="text-gray-500 text-xs mb-2">เลือกวิธีชำระเงิน</p>
                <div className="grid grid-cols-3 gap-2">
                    {methods.map((m) => (
                        <button key={m.key} onClick={() => setMethod(m.key)}
                            className={`flex flex-col items-center gap-1.5 py-3 rounded-sm border text-xs transition-all cursor-pointer
              ${method === m.key ? "border-[#9c8251] bg-[#9c8251]/10 text-[#be964c]" : "border-[#2a3347] text-gray-500 hover:border-[#9c8251]/40"}`}>
                            <span className="text-lg">{m.icon}</span>
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            {method === "CREDIT_CARD" && (
                <div className="flex flex-col gap-1">
                    <label className="text-gray-500 text-xs">Transaction ID <span className="text-[#be964c]">*</span></label>
                    <input value={txId} onChange={(e) => setTxId(e.target.value)}
                        placeholder="TXN-XXXXXXXXXX"
                        className="bg-[#161b24] border border-[#2a3347] rounded-sm px-3 py-2 text-white text-sm focus:outline-none focus:border-[#9c8251]"
                    />
                </div>
            )}

            {method === "BANK_TRANSFER" && (
                <div className="bg-[#161b24] rounded-sm p-3 border border-[#2a3347]">
                    <p className="text-gray-500 text-xs mb-2">ข้อมูลบัญชีสำหรับโอน</p>
                    <p className="text-white text-sm font-medium">ธนาคารกสิกรไทย</p>
                    <p className="text-[#be964c] font-mono text-sm">XXX-X-XXXXX-X</p>
                    <p className="text-gray-500 text-xs mt-1">ชื่อบัญชี: บริษัท โรงแรม จำกัด</p>
                </div>
            )}

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <div className="flex gap-2">
                <button onClick={onBack} disabled={loading}
                    className="flex-1 border border-[#2a3347] text-gray-500 py-2.5 rounded-sm text-sm hover:border-gray-500 transition-colors cursor-pointer disabled:opacity-50">
                    ← ย้อนกลับ
                </button>
                <button onClick={handlePay} disabled={loading || isExpired}
                    className="flex-1 bg-[#be964c] hover:bg-[#b8965c] text-black font-medium py-2.5 rounded-sm text-sm transition-colors cursor-pointer active:scale-[0.98] disabled:opacity-50">
                    {loading ? "กำลังดำเนินการ..." : "ยืนยันชำระเงิน"}
                </button>
            </div>
        </div>
    )
}

const BookingStepSuccess = ({
    booking, room, checkIn, checkOut, nights, onClose,
}: {
    booking: BookingResult
    room: RoomCategory
    checkIn: string
    checkOut: string
    nights: number
    onClose: () => void
}) => (
    <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-center text-3xl">
            ✓
        </div>
        <div>
            <h3 className={`${prompt.className} text-white text-xl font-semibold mb-1`}>จองสำเร็จแล้ว</h3>
            <p className="text-gray-500 text-sm">ขอบคุณสำหรับการจอง</p>
        </div>

        <div className="bg-[#161b24] rounded-sm p-4 w-full border border-[#2a3347]">
            <p className="text-gray-500 text-xs mb-1">รหัสการจอง</p>
            <p className="text-[#be964c] font-mono text-2xl font-bold tracking-widest">
                {booking.booking_ref}
            </p>
        </div>

        <div className="w-full bg-[#161b24] rounded-sm p-3 border border-[#2a3347] text-sm text-left">
            <div className="flex justify-between py-1.5 border-b border-[#2a3347]">
                <span className="text-gray-500">ห้อง</span>
                <span className="text-white">{room.name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#2a3347]">
                <span className="text-gray-500">เช็คอิน</span>
                <span className="text-white">{checkIn} (14:00)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#2a3347]">
                <span className="text-gray-500">เช็คเอาท์</span>
                <span className="text-white">{checkOut} (12:00)</span>
            </div>
            <div className="flex justify-between py-1.5">
                <span className="text-gray-500">ยอดรวม</span>
                <span className="text-[#be964c] font-semibold">฿{booking.total_price.toLocaleString()}</span>
            </div>
        </div>

        <p className="text-gray-600 text-xs">กรุณาเก็บรหัสการจองไว้เป็นหลักฐาน</p>

        <button onClick={onClose}
            className="w-full bg-[#be964c] hover:bg-[#b8965c] text-black font-medium py-2.5 rounded-sm text-sm transition-colors cursor-pointer">
            เสร็จสิ้น
        </button>
    </div>
)

interface BookingModalProps {
    room: RoomCategory
    checkIn: string
    checkOut: string
    nights: number
    onClose: () => void
}

const BookingModal = ({ room, checkIn, checkOut, nights, onClose }: BookingModalProps) => {
    const [step, setStep] = useState<Step>("summary")
    const [guestData, setGuestData] = useState<GuestData | null>(null)
    const [booking, setBooking] = useState<BookingResult | null>(null)
    const [bookingLoading, setBookingLoading] = useState(false)
    const [bookingError, setBookingError] = useState("")

    const handleGuestNext = useCallback(async (data: GuestData) => {
        setGuestData(data)
        setBookingLoading(true)
        setBookingError("")

        try {
            const res = await fetch("/api/client/booking", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    category_id: room.id,
                    customer: {
                        full_name: data.full_name,
                        email: data.email,
                        phone: data.phone || undefined,
                        id_card: data.id_card || undefined,
                    },
                    check_in: `${checkIn}T14:00:00+07:00`,
                    check_out: `${checkOut}T12:00:00+07:00`,
                    num_guests: data.num_guests,
                    special_request: data.special_request || undefined,
                }),
            })

            const result = await res.json()

            console.log(result)

            if (!res.ok) {
                setBookingError(result.detail || "เกิดข้อผิดพลาด กรุณาลองใหม่")
                return
            }

            setBooking(result.booking || result.data || result)

            setStep("payment")

        } catch (error) {
            console.log(error)
            setBookingError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้")
        } finally {
            setBookingLoading(false)
        }
    }, [room.id, checkIn, checkOut])

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center px-4 pt-24 pb-6 overflow-y-auto"
            onClick={step !== "success" ? onClose : undefined}>
            <div
                className="bg-[#1e2535] border border-[#9c8251]/30 rounded-sm w-full max-w-md max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[#9c8251] text-xs tracking-widest uppercase">การจองห้องพัก</p>
                        {step !== "success" && (
                            <button onClick={onClose}
                                className="text-gray-600 hover:text-gray-400 w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors cursor-pointer">
                                ✕
                            </button>
                        )}
                    </div>

                    <StepIndicator current={step} />

                    {step === "summary" && (
                        <BookingStepSummary
                            room={room} checkIn={checkIn} checkOut={checkOut} nights={nights}
                            onNext={() => setStep("guest")} onClose={onClose}
                        />
                    )}

                    {step === "guest" && (
                        <>
                            {bookingError && (
                                <div className="mb-3 bg-red-900/20 border border-red-500/30 rounded-sm px-3 py-2">
                                    <p className="text-red-400 text-xs">{bookingError}</p>
                                </div>
                            )}
                            {bookingLoading ? (
                                <div className="flex flex-col items-center gap-3 py-10">
                                    <div className="w-8 h-8 border-2 border-[#9c8251] border-t-transparent rounded-full animate-spin" />
                                    <p className="text-gray-500 text-sm">กำลังจองห้อง...</p>
                                </div>
                            ) : (
                                <BookingStepGuest
                                    room={room}
                                    onNext={handleGuestNext}
                                    onBack={() => setStep("summary")}
                                />
                            )}
                        </>
                    )}

                    {step === "payment" && booking && (
                        <BookingStepPayment
                            booking={booking} nights={nights} room={room}
                            onSuccess={() => setStep("success")}
                            onBack={() => setStep("guest")}
                            onExpired={() => {
                                setBooking(null)
                                setStep("guest")
                                setBookingError("หมดเวลาจอง กรุณากรอกข้อมูลใหม่อีกครั้ง")
                            }}
                        />
                    )}

                    {step === "success" && booking && (
                        <BookingStepSuccess
                            booking={booking} room={room}
                            checkIn={checkIn} checkOut={checkOut} nights={nights}
                            onClose={onClose}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default BookingModal
