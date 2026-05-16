"use client"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"


type ActiveBooking = {
    booking_ref: string
    customer_full_name: string
    check_in: string
    check_out: string
}

type Room = {
    id: number
    room_number: string
    floor: number
    status: string
    category: { id: number; name: string }
    is_active: boolean
    active_booking: ActiveBooking | null
}

function getStatusClass(status: string) {
    switch (status) {
        case "OCC":
            return "bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/10"

        case "VAC":
            return "bg-green-500/15 text-green-400 border border-green-500/20"

        case "VAD":
            return "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"

        case "OOO":
            return "bg-red-500/15 text-red-400 border border-red-500/20"

        default:
            return "bg-gray-500/20 text-gray-300 border border-gray-500/20"
    }
}

const RoomClient = () => {
    const [rooms, setRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState({
        room_number: "",
        floor: "",
        category_id: "",
    })
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [updateOpen, setUpdateOpen] = useState(false)
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
    const [checkoutModal, setCheckoutModal] = useState<{
        open: boolean
        booking_ref: string | null
    }>({
        open: false,
        booking_ref: null,
    })

    useEffect(() => {
        async function fetchRooms() {
            try {
                const res = await fetch("/api/admin/rooms/all", {
                    credentials: "include",
                })
                const data = await res.json()
                setRooms(data)

            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        fetchRooms()
    }, [])

    useEffect(() => {
        async function fetchCategories() {
            const res = await fetch("/api/admin/roomcategory/all", {
                credentials: "include",
            })
            const data = await res.json()
            setCategories(data)
        }
        fetchCategories()
    }, [])

    async function updateStatus(id: number, status: string) {
        try {
            const res = await fetch(`/api/admin/rooms/${id}/status`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.detail || "update failed")
            }

            setRooms((prev) =>
                prev.map((room) =>
                    room.id === id
                        ? { ...room, status: result.status }
                        : room
                )
            )

        } catch (error) {
            console.log(error)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        try {
            setSubmitting(true)

            const res = await fetch("/api/admin/rooms", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    room_number: form.room_number,
                    floor: Number(form.floor) || 0,
                    category_id: Number(form.category_id),
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.detail || "error")

            const updated = await fetch("/api/admin/rooms", { credentials: "include" })
            const rooms = await updated.json()
            setRooms(rooms)

            setOpen(false)
            setForm({ room_number: "", floor: "", category_id: "" })
            toast.success("บันทึกเสร็จสิ้น")
        } catch (error: any) {
            console.log(error)
            toast.error(error.message || "เกิดข้อผิดพลาด")

        } finally {
            setSubmitting(false)
        }
    }

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedRoom) return
        try {
            setSubmitting(true)
            const res = await fetch(`/api/admin/rooms/${selectedRoom.id}`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    room_number: form.room_number,
                    floor: Number(form.floor),
                    category_id: Number(form.category_id),
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.detail || "error")

            const updated = await fetch("/api/admin/rooms", { credentials: "include" })
            setRooms(await updated.json())
            setUpdateOpen(false)
            toast.success("แก้ไขเสร็จสิ้น")
        } catch (error: any) {
            toast.error(error.message || "เกิดข้อผิดพลาด")
        } finally {
            setSubmitting(false)
        }
    }

    async function handleToggleActive(id: number, current: boolean) {
        if (!confirm(current ? "ต้องการปิดห้องนี้?" : "ต้องการเปิดห้องนี้?")) return
        try {
            const res = await fetch(`/api/admin/rooms/${id}`, {
                method: "DELETE",
                credentials: "include",
            })
            if (!res.ok) throw new Error("error")

            setRooms((prev) =>
                prev.map((r) =>
                    r.id === id ? { ...r, is_active: !current } : r
                )
            )
            toast.success(current ? "ปิดห้องแล้ว" : "เปิดห้องแล้ว")
        } catch {
            toast.error("เกิดข้อผิดพลาด")
        }
    }

    async function handleCheckout(booking_ref: string) {
        setCheckoutModal({
            open: true,
            booking_ref,
        })
    }

    async function confirmCheckout() {
        const booking_ref = checkoutModal.booking_ref
        if (!booking_ref) return

        try {
            const res = await fetch(`/api/admin/booking/${booking_ref}/checkout`, {
                method: "POST",
                credentials: "include",
            })

            const data = await res.json().catch(() => null)

            if (!res.ok) {
                throw new Error(data?.detail || "checkout failed")
            }

            toast.success("Checkout สำเร็จ")

            const updated = await fetch("/api/admin/rooms/all", {
                credentials: "include",
            })

            setRooms(await updated.json())

        } catch (error: any) {
            toast.error(error.message || "เกิดข้อผิดพลาด")
        } finally {
            setCheckoutModal({ open: false, booking_ref: null })
        }
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between">
                    <div className="mb-2 space-y-2">
                        <div className="h-8 w-40 bg-[#20252d] rounded-lg animate-pulse" />
                        <div className="h-4 w-28 bg-[#20252d] rounded-lg animate-pulse" />
                    </div>
                    <div className="h-10 w-24 bg-[#20252d] rounded-md animate-pulse" />
                </div>
                <div className="grid lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-[#171b21] border border-[#363a42] rounded-xl p-5">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <div className="h-6 w-32 bg-[#20252d] rounded-lg animate-pulse" />
                                    <div className="h-4 w-40 bg-[#20252d] rounded-lg animate-pulse" />
                                </div>
                                <div className="h-6 w-16 bg-[#20252d] rounded-full animate-pulse" />
                            </div>
                            <div className="mt-5 flex flex-wrap gap-2">
                                {[...Array(5)].map((_, j) => (
                                    <div key={j} className="h-9 w-20 bg-[#20252d] rounded-md animate-pulse" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between">
                <div className="mb-2">
                    <h1 className="text-2xl font-bold text-white">รายการห้อง</h1>

                    <p className="text-gray-500 mt-1">จัดการสถานะห้อง</p>
                </div>
                <button
                    onClick={() => setOpen(true)}
                    className="bg-amber-300 w-30 h-10 text-black 
                    rounded-md cursor-pointer hover:bg-amber-200 transition duration-300
                    active:scale-[0.9] duration-300
                ">+ เพิ่มห้อง</button>
            </div>

            {open && (
                <div
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex 
                items-center justify-center p-3">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-xl max-h-[95vh] overflow-y-auto
                        bg-[#171b21] border border-[#363a42] rounded-2xl shadow-2xl
                    ">
                        <div className="flex items-center justify-between px-4 py-4
                         border-b border-[#363a42]  bg-[#1d222b] sticky top-0 z-10
                        ">
                            <div>
                                <h2 className="text-xl font-bold text-white">เพิ่มห้อง</h2>
                                <p className="text-xs text-gray-500 mt-1">สร้างห้อง</p>
                            </div>

                            <button
                                onClick={() => setOpen(false)}
                                className=" w-8 h-8 rounded-full  bg-red-500/10  text-red-400
                            hover:bg-red-500/20 transition cursor-pointer flex items-center justify-center
                            text-sm
                            ">
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="p-4 sm:p-5 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-3">

                                <div>
                                    <label className="text-xs text-gray-400">เลขห้อง</label>
                                    <input
                                        type="text"
                                        name="room_number"
                                        value={form.room_number}
                                        onChange={(e) => setForm({ ...form, room_number: e.target.value })}
                                        className="w-full mt-1.5 bg-[#20252d] px-3 py-2.5 rounded-lg
                                        border border-[#363a42] text-white text-sm outline-none
                                        focus:border-amber-300 transition"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400">ชั้น</label>
                                    <input
                                        type="number"
                                        name="floor"
                                        value={form.floor}
                                        onChange={(e) => setForm({ ...form, floor: e.target.value })}
                                        className="w-full mt-1.5 bg-[#20252d] px-3 py-2.5 rounded-lg
                                    border border-[#363a42] text-white text-sm outline-none
                                    focus:border-amber-300 transition"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="text-xs text-gray-400">ประเภทห้อง</label>
                                    <select
                                        name="category_id"
                                        value={form.category_id}
                                        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                        className="w-full mt-1.5 bg-[#20252d] px-3 py-2.5 rounded-lg
                                        border border-[#363a42] text-white text-sm outline-none
                                        focus:border-amber-300 transition"
                                    >
                                        <option value="">เลือกประเภทห้อง</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                            </div>

                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2
                                pt-4 border-t border-[#363a42]
                            ">
                                <button
                                    onClick={() => setOpen(false)}
                                    className=" w-full sm:w-auto
                                rounded-lg  bg-red-500/10  text-red-400 px-2 py-2  hover:bg-red-500/20
                                transition cursor-pointer text-sm
                            " type="button">ยกเลิก</button>
                                <button
                                    disabled={submitting}
                                    className="w-full sm:w-auto px-4 py-2.5 rounded-lg
                                 bg-amber-300  text-black font-semibold  hover:bg-amber-200
                                 transition cursor-pointer text-sm
                                " type="submit">{submitting ? "กำลังสร้าง..." : "บันทึก"}</button>
                            </div>

                        </form>

                    </div>
                </div>
            )}



            <div className="grid lg:grid-cols-3 gap-4">
                {rooms.map((room) => (
                    <div key={room.id} className="bg-[#171b21] border border-[#363a42] rounded-xl p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-white text-xl font-bold">เลขห้อง {room.room_number}</h2>
                                <div className="flex gap-2">
                                    <p className="text-gray-500 text-sm">ชั้น {room.floor} |</p>
                                    <p className="text-gray-500 text-sm">ประเภท {room.category.name}</p>
                                </div>

                                {room.active_booking && (
                                    <div className="
                                            mt-3 overflow-hidden rounded-xl
                                            border border-[#2a2f3a]
                                            bg-[#1b1f27]
                                        ">
                                        <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2f3a]">

                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-amber-400/70" />
                                                <p className="text-[11px] font-medium tracking-wide text-gray-300 uppercase">
                                                    occupied
                                                </p>
                                            </div>

                                            <span className="text-[10px] text-gray-500">
                                                {room.active_booking.booking_ref}
                                            </span>
                                        </div>

                                        <div className="p-3 space-y-3">
                                            <div>
                                                <p className="text-[11px] text-gray-500 mb-1">Guest</p>
                                                <h3 className="text-white font-medium">
                                                    {room.active_booking.customer_full_name}
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-[#151922] border border-[#2a2f3a] rounded-lg p-2">
                                                    <p className="text-[10px] text-gray-500 mb-1">Check In</p>
                                                    <p className="text-xs text-gray-200">
                                                        {new Date(room.active_booking.check_in).toLocaleDateString("th-TH")}
                                                    </p>
                                                </div>

                                                <div className="bg-[#151922] border border-[#2a2f3a] rounded-lg p-2">
                                                    <p className="text-[10px] text-gray-500 mb-1">Check Out</p>
                                                    <p className="text-xs text-gray-200">
                                                        {new Date(room.active_booking.check_out).toLocaleDateString("th-TH")}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(room.status)}`}
                            >
                                {room.status}
                            </span>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                            {room.status === "OCC" && room.active_booking?.booking_ref && (
                                <button
                                    onClick={() => {
                                        if (!room.active_booking) return
                                        handleCheckout(room.active_booking.booking_ref)
                                    }}
                                    className="px-3 py-2 bg-blue-500/10 text-blue-400 rounded-md text-sm hover:bg-blue-500/20 cursor-pointer"
                                >
                                    Checkout
                                </button>
                            )}

                            {room.status !== "OCC" && (
                                <>
                                    <button
                                        onClick={() => updateStatus(room.id, "VAD")}
                                        className="px-3 py-2 bg-yellow-500/10 text-yellow-400 rounded-md text-sm hover:bg-yellow-500/20 cursor-pointer transition"
                                    >
                                        ว่าง/ไม่สะอาด
                                    </button>
                                    <button
                                        onClick={() => updateStatus(room.id, "VAC")}
                                        className="px-3 py-2 bg-green-500/10 text-green-400 rounded-md text-sm hover:bg-green-500/20 cursor-pointer transition"
                                    >
                                        ว่าง/สะอาด
                                    </button>
                                    <button
                                        onClick={() => updateStatus(room.id, "OOO")}
                                        className="px-3 py-2 bg-red-500/10 text-red-400 rounded-md text-sm hover:bg-red-500/20 cursor-pointer transition"
                                    >
                                        ปิดซ่อม
                                    </button>
                                </>
                            )}

                            <button
                                onClick={() => {
                                    setSelectedRoom(room)
                                    setUpdateOpen(true)
                                    setForm({
                                        room_number: room.room_number,
                                        floor: String(room.floor),
                                        category_id: String(room.category.id),
                                    })
                                }}
                                className="px-3 py-2 bg-blue-500/10 text-blue-400 rounded-md text-sm hover:bg-blue-500/20 cursor-pointer transition"
                            >
                                แก้ไข
                            </button>

                            <button
                                onClick={() => handleToggleActive(room.id, room.is_active)}
                                className={`px-3 py-2 rounded-md text-sm cursor-pointer transition ${room.is_active
                                    ? "bg-red-400/10 text-red-400 hover:bg-red-400/20"
                                    : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                    }`}
                            >
                                {room.is_active ? "ปิดห้อง" : "เปิดห้อง"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {checkoutModal.open && (
                <div
                    onClick={() => setCheckoutModal({ open: false, booking_ref: null })}
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-[#171b21] border border-[#363a42] rounded-2xl shadow-2xl"
                    >
                        <div className="p-5 border-b border-[#363a42] bg-[#1d222b] rounded-t-2xl">
                            <h2 className="text-lg font-bold text-white">
                                ยืนยันการ Checkout
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">
                                ต้องการเช็คเอาท์ห้องนี้ใช่หรือไม่?
                            </p>
                        </div>

                        <div className="p-5 space-y-3">
                            <div className="bg-[#20252d] border border-[#2a2f3a] rounded-lg p-3 text-sm text-gray-300">
                                Booking Ref:{" "}
                                <span className="text-amber-300 font-medium">
                                    {checkoutModal.booking_ref}
                                </span>
                            </div>

                            <p className="text-xs text-gray-500">
                                การดำเนินการนี้จะเปลี่ยนสถานะห้องและสิ้นสุดการเข้าพัก
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 p-4 border-t border-[#363a42]">
                            <button
                                onClick={() => setCheckoutModal({ open: false, booking_ref: null })}
                                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm"
                            >
                                ยกเลิก
                            </button>

                            <button
                                onClick={confirmCheckout}
                                className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-sm"
                            >
                                ยืนยัน Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {updateOpen && (
                <div
                    onClick={() => setUpdateOpen(false)}
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex 
                    items-center justify-center p-3">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-xl max-h-[95vh] overflow-y-auto
                        bg-[#171b21] border border-[#363a42] rounded-2xl shadow-2xl
                    ">
                        <div className="flex items-center justify-between px-4 py-4
                         border-b border-[#363a42]  bg-[#1d222b] sticky top-0 z-10
                        ">
                            <div>
                                <h2 className="text-xl font-bold text-white">แก้ไขห้อง</h2>
                                <p className="text-xs text-gray-500 mt-1">แก้ไขห้อง</p>
                            </div>

                            <button
                                onClick={() => setUpdateOpen(false)}
                                className=" w-8 h-8 rounded-full  bg-red-500/10  text-red-400
                            hover:bg-red-500/20 transition cursor-pointer flex items-center justify-center
                            text-sm
                            ">
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={handleUpdate}
                            className="p-4 sm:p-5 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-3">

                                <div>
                                    <label className="text-xs text-gray-400">เลขห้อง</label>
                                    <input
                                        type="text"
                                        name="room_number"
                                        value={form.room_number}
                                        onChange={(e) => setForm({ ...form, room_number: e.target.value })}
                                        className="w-full mt-1.5 bg-[#20252d] px-3 py-2.5 rounded-lg
                                        border border-[#363a42] text-white text-sm outline-none
                                        focus:border-amber-300 transition"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400">ชั้น</label>
                                    <input
                                        type="number"
                                        name="floor"
                                        value={form.floor}
                                        onChange={(e) => setForm({ ...form, floor: e.target.value })}
                                        className="w-full mt-1.5 bg-[#20252d] px-3 py-2.5 rounded-lg
                                    border border-[#363a42] text-white text-sm outline-none
                                    focus:border-amber-300 transition"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="text-xs text-gray-400">ประเภทห้อง</label>
                                    <select
                                        name="category_id"
                                        value={form.category_id}
                                        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                        className="w-full mt-1.5 bg-[#20252d] px-3 py-2.5 rounded-lg
                                        border border-[#363a42] text-white text-sm outline-none
                                        focus:border-amber-300 transition"
                                    >
                                        <option value="">เลือกประเภทห้อง</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                            </div>

                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2
                                pt-4 border-t border-[#363a42]
                            ">
                                <button
                                    onClick={() => setUpdateOpen(false)}
                                    className=" w-full sm:w-auto
                                rounded-lg  bg-red-500/10  text-red-400 px-2 py-2  hover:bg-red-500/20
                                transition cursor-pointer text-sm
                            " type="button">ยกเลิก</button>
                                <button
                                    disabled={submitting}
                                    className="w-full sm:w-auto px-4 py-2.5 rounded-lg
                                 bg-amber-300  text-black font-semibold  hover:bg-amber-200
                                 transition cursor-pointer text-sm
                                " type="submit">{submitting ? "กำลังแก้ไข..." : "บันทึก"}</button>
                            </div>

                        </form>

                    </div>
                </div>
            )}
        </div>
    )
}
export default RoomClient