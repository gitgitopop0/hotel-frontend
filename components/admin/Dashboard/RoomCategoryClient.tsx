"use client"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"

type Image = {
    id: number
    image_url: string
}

type Category = {
    id: number
    name: string
    description: string
    price_per_night: number
    capacity: number
    beds: number
    area_sqm: number
    amenities: string
    cover_image_url: string | null
    is_active: boolean
    images: Image[]
}

const RoomCategoryClient = () => {

    const [form, setForm] = useState({
        name: "",
        description: "",
        price_per_night: "",
        capacity: "",
        beds: "",
        area_sqm: "",
        amenities: ""
    })


    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [coverImage, setCoverImage] = useState<File | null>(null)
    const [uploadOpen, setUploadOpen] = useState(false)
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
    const [galleryImage, setGalleryImage] = useState<File | null>(null)
    const [galleryOpen, setGalleryOpen] = useState(false)
    const [viewGalleryOpen, setViewGalleryOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const fetchCategories = async () => {
        try {
            setLoading(true)

            const res = await fetch("/api/admin/roomcategory/all")
            const data = await res.json()

            setCategories(data)

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {

            setLoading(true)

            const res = await fetch("/api/admin/roomcategory", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...form,
                    price_per_night: Number(form.price_per_night) || 0,
                    capacity: Number(form.capacity) || 0,
                    beds: Number(form.beds) || 0,
                    area_sqm: Number(form.area_sqm) || 0,
                })
            })

            if (!res.ok) {
                throw new Error("create failed")
            }

            await fetchCategories()

            setOpen(false)

            setForm({
                name: "",
                description: "",
                price_per_night: "",
                capacity: "",
                beds: "",
                area_sqm: "",
                amenities: ""
            })

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const createFormData = () => {

        const formData = new FormData()

        formData.append("name", form.name)
        formData.append("description", form.description)
        formData.append("price_per_night", form.price_per_night)
        formData.append("capacity", form.capacity)
        formData.append("beds", form.beds)
        formData.append("area_sqm", form.area_sqm)
        formData.append("amenities", form.amenities)

        if (coverImage) {
            formData.append("cover_image", coverImage)
        }

        return formData
    }

    const handleUploadCover = async (categoryId: number) => {

        if (!coverImage) {
            toast.error("กรุณาเลือกรูป")
            return
        }

        try {

            setLoading(true)

            const formData = new FormData()

            formData.append("file", coverImage)

            const res = await fetch(
                `/api/admin/roomcategory/${categoryId}/cover`,
                {
                    method: "POST",
                    body: formData
                }
            )

            const data = await res.json()

            if (!res.ok) {

                let errorMessage = "upload failed"

                if (typeof data.detail === "string") {
                    errorMessage = data.detail
                }

                if (Array.isArray(data.detail)) {
                    errorMessage = data.detail[0]?.msg
                }

                throw new Error(errorMessage)
            }

            await fetchCategories()

            setCoverImage(null)

            toast.success("อัปโหลดสำเร็จ")

        } catch (error: any) {
            console.log(error)
            toast.error(error.message)
        }
        finally {
            setLoading(false)
        }
    }

    const handleUploadGallery = async (categoryId: number) => {

        if (!galleryImage) {
            toast.error("กรุณาเลือกรูป")
            return
        }

        try {

            setLoading(true)

            const formData = new FormData()

            formData.append("file", galleryImage)

            const res = await fetch(
                `/api/admin/roomcategory/${categoryId}/images`,
                {
                    method: "POST",
                    body: formData
                }
            )

            const data = await res.json()

            if (!res.ok) {

                let errorMessage = "upload failed"

                if (typeof data.detail === "string") {
                    errorMessage = data.detail
                }

                if (Array.isArray(data.detail)) {
                    errorMessage = data.detail[0]?.msg
                }

                throw new Error(errorMessage)
            }

            await fetchCategories()

            setGalleryImage(null)

            toast.success("เพิ่มรูปสำเร็จ")

        } catch (error: any) {

            console.log(error)
            toast.error(error.message)

        } finally {
            setLoading(false)
        }
    }

    const handleDeleteImage = async (categoryId: number, imageId: number) => {
        const res = await fetch(
            `/api/admin/roomcategory/${categoryId}/images/${imageId}`,
            {
                method: "DELETE",
            }
        )

        const data = await res.json()

        if (!res.ok) throw new Error(data.detail || "delete failed")

        await fetchCategories()
        toast.success("ลบรูปสำเร็จ")
    }

    const openEditModal = (category: Category) => {
        setEditId(category.id)

        setForm({
            name: category.name,
            description: category.description,
            price_per_night: String(category.price_per_night),
            capacity: String(category.capacity),
            beds: String(category.beds),
            area_sqm: String(category.area_sqm),
            amenities: category.amenities
        })

        setEditOpen(true)
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!editId) return

        try {
            setLoading(true)

            const res = await fetch(`/api/admin/roomcategory/${editId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: form.name,
                    description: form.description,
                    price_per_night: Number(form.price_per_night) || 0,
                    capacity: Number(form.capacity) || 0,
                    beds: Number(form.beds) || 0,
                    area_sqm: Number(form.area_sqm) || 0,
                    amenities: form.amenities
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.detail || "update failed")
            }

            toast.success("อัปเดตสำเร็จ")

            setEditOpen(false)
            setEditId(null)
            await fetchCategories()

        } catch (err: any) {
            console.log(err)
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const toggleActive = async (id: number, current: boolean) => {
        try {
            setLoading(true)


            const res = await fetch(`/api/admin/roomcategory/active/${id}`, {
                method: "PUT"
            })

            const data = await res.json()

            toast.success(
                data.is_active ? "เปิดใช้งานแล้ว" : "ปิดใช้งานแล้ว"
            )

            await fetchCategories()


        } catch (err: any) {
            console.log(err)
            toast.error(err.message || "error")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-5">

                <div className="flex flex-col sm:flex-row justify-between">
                    <div className="mb-2 space-y-2">
                        <div className="h-8 w-36 bg-[#20252d] rounded-lg animate-pulse" />
                        <div className="h-4 w-28 bg-[#20252d] rounded-lg animate-pulse" />
                    </div>
                    <div className="h-10 w-44 bg-[#20252d] rounded-sm animate-pulse" />
                </div>


                <div className="grid lg:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-[#171b21] border border-[#363a42] rounded-xl overflow-hidden">

                            <div className="w-full h-[220px] bg-[#20252d] animate-pulse" />

                            <div className="p-5 space-y-5">

                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-2">
                                        <div className="h-6 w-32 bg-[#20252d] rounded-lg animate-pulse" />
                                        <div className="h-4 w-48 bg-[#20252d] rounded-lg animate-pulse" />
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <div className="h-6 w-20 bg-[#20252d] rounded-lg animate-pulse" />
                                        <div className="h-3 w-10 bg-[#20252d] rounded-lg animate-pulse" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {[...Array(3)].map((_, j) => (
                                        <div key={j} className="bg-[#20252d] rounded-lg p-3 border border-[#363a42] space-y-2">
                                            <div className="h-3 w-12 bg-[#2a313b] rounded animate-pulse" />
                                            <div className="h-4 w-16 bg-[#2a313b] rounded animate-pulse" />
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {[...Array(4)].map((_, j) => (
                                        <div key={j} className="h-7 w-16 bg-[#20252d] rounded-md animate-pulse" />
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {[...Array(5)].map((_, j) => (
                                        <div key={j} className="h-9 w-20 bg-[#20252d] rounded-md animate-pulse" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-5">

            <div className="flex flex-col sm:flex-row justify-between">
                <div className="mb-2">
                    <h1 className="text-2xl text-white font-bold">
                        ประเภทห้อง
                    </h1>

                    <p className="text-gray-500 mt-1">
                        จัดการประเภทห้อง
                    </p>
                </div>

                <button
                    onClick={() => setOpen(true)}
                    className="
                    bg-amber-300
                    w-[180px]
                    h-[40px]
                    px-4
                    py-1
                    text-black
                    rounded-sm
                    hover:bg-amber-200
                    transition
                    duration-300
                    cursor-pointer
                "
                >
                    + เพิ่มประเภทห้อง
                </button>
            </div>
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    className="
                            fixed inset-0 z-50
                            bg-black/70 backdrop-blur-sm
                            flex items-center justify-center
                            p-3
                        "
                >

                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="
                                w-full
                                max-w-xl
                                max-h-[95vh]
                                overflow-y-auto
                                bg-[#171b21]
                                border border-[#363a42]
                                rounded-2xl
                                shadow-2xl
                            "
                    >

                        <div
                            className="
                                flex items-center justify-between
                                px-4 py-4
                                border-b border-[#363a42]
                                bg-[#1d222b]
                                sticky top-0 z-10
                            "
                        >

                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    เพิ่มประเภทห้อง
                                </h2>

                                <p className="text-xs text-gray-500 mt-1">
                                    สร้าง category ห้องพักใหม่
                                </p>
                            </div>

                            <button
                                onClick={() => setOpen(false)}
                                className="
                                    w-8 h-8
                                    rounded-full
                                    bg-red-500/10
                                    text-red-400
                                    hover:bg-red-500/20
                                    transition
                                    cursor-pointer
                                    flex items-center justify-center
                                    text-sm
                                "
                            >
                                ✕
                            </button>

                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="p-4 sm:p-5 space-y-4"
                        >

                            <div className="grid sm:grid-cols-2 gap-3">

                                <div className="sm:col-span-2">
                                    <label className="text-xs text-gray-400">
                                        ชื่อประเภทห้อง
                                    </label>

                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Deluxe Room"
                                        className="
                                            w-full mt-1.5
                                            px-3 py-2.5
                                            rounded-lg
                                            bg-[#20252d]
                                            border border-[#363a42]
                                            text-white text-sm
                                            outline-none
                                            focus:border-amber-300
                                            transition
                                        "
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="text-xs text-gray-400">
                                        รายละเอียด
                                    </label>

                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                description: e.target.value
                                            })
                                        }
                                        placeholder="ห้องพักวิวเมือง พร้อม wifi และ smart tv"
                                        rows={3}
                                        className="
                                            w-full mt-1.5
                                            px-3 py-2.5
                                            rounded-lg
                                            bg-[#20252d]
                                            border border-[#363a42]
                                            text-white text-sm
                                            outline-none
                                            resize-none
                                            focus:border-amber-300
                                            transition
                                        "
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400">
                                        ราคา / คืน
                                    </label>

                                    <input
                                        type="number"
                                        name="price_per_night"
                                        value={form.price_per_night}
                                        onChange={handleChange}
                                        placeholder="1200"
                                        className="
                                            w-full mt-1.5
                                            px-3 py-2.5
                                            rounded-lg
                                            bg-[#20252d]
                                            border border-[#363a42]
                                            text-white text-sm
                                            outline-none
                                        "
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400">
                                        จำนวนคน
                                    </label>

                                    <input
                                        type="number"
                                        name="capacity"
                                        value={form.capacity}
                                        onChange={handleChange}
                                        placeholder="2"
                                        className="
                                            w-full mt-1.5
                                            px-3 py-2.5
                                            rounded-lg
                                            bg-[#20252d]
                                            border border-[#363a42]
                                            text-white text-sm
                                            outline-none
                                        "
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400">
                                        เตียง
                                    </label>

                                    <input
                                        type="number"
                                        name="beds"
                                        value={form.beds}
                                        onChange={handleChange}
                                        placeholder="1"
                                        className="
                                            w-full mt-1.5
                                            px-3 py-2.5
                                            rounded-lg
                                            bg-[#20252d]
                                            border border-[#363a42]
                                            text-white text-sm
                                            outline-none
                                        "
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400">
                                        พื้นที่ (m²)
                                    </label>

                                    <input
                                        type="number"
                                        name="area_sqm"
                                        value={form.area_sqm}
                                        onChange={handleChange}
                                        placeholder="24"
                                        className="
                                            w-full mt-1.5
                                            px-3 py-2.5
                                            rounded-lg
                                            bg-[#20252d]
                                            border border-[#363a42]
                                            text-white text-sm
                                            outline-none
                                        "
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="text-xs text-gray-400">
                                        สิ่งอำนวยความสะดวก
                                    </label>

                                    <input
                                        name="amenities"
                                        value={form.amenities}
                                        onChange={handleChange}
                                        placeholder="wifi,tv,aircon"
                                        className="
                                            w-full mt-1.5
                                            px-3 py-2.5
                                            rounded-lg
                                            bg-[#20252d]
                                            border border-[#363a42]
                                            text-white text-sm
                                            outline-none
                                             "
                                    />

                                    <p className="text-[11px] text-gray-500 mt-1.5">
                                        คั่นด้วย comma เช่น wifi,tv,aircon
                                    </p>
                                </div>

                            </div>

                            <div
                                className="
                                    flex flex-col-reverse sm:flex-row
                                    justify-end gap-2
                                    pt-4
                                    border-t border-[#363a42]
                                "
                            >

                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="
                                        w-full sm:w-auto
                                        px-4 py-2.5
                                        rounded-lg
                                        bg-red-500/10
                                        text-red-400
                                        hover:bg-red-500/20
                                        transition
                                        cursor-pointer
                                        text-sm
                                    "
                                >
                                    ยกเลิก
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="
                                    w-full sm:w-auto
                                    px-4 py-2.5
                                    rounded-lg
                                    bg-amber-300
                                    text-black
                                    font-semibold
                                    hover:bg-amber-200
                                    transition
                                    cursor-pointer
                                    text-sm
                                "
                                >
                                    {loading ? "กำลังสร้าง..." : "บันทึก"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-4 ">

                {categories.map((category) => (

                    <div
                        key={category.id}
                        className="
                        bg-[#171b21]
                        border border-[#363a42]
                        rounded-xl
                        overflow-hidden
                    "
                    >

                        <div className="relative">

                            <img
                                src={
                                    category.cover_image_url ||
                                    "https://placehold.co/600x400"
                                }
                                alt={category.name}
                                className="w-full h-[220px] object-cover"
                            />

                            <div className="absolute top-3 right-3">

                                <span
                                    className={`
                                    px-3 py-1 rounded-full text-xs font-semibold
                                    ${category.is_active
                                            ? "bg-green-500/15 text-green-400"
                                            : "bg-red-500/15 text-red-400"
                                        }
                                `}
                                >
                                    {category.is_active
                                        ? "ACTIVE"
                                        : "DISABLED"}
                                </span>

                            </div>

                        </div>

                        <div className="p-5">

                            <div className="flex justify-between items-start gap-4">

                                <div>

                                    <h2 className="text-white text-xl font-bold">
                                        {category.name}
                                    </h2>

                                    <p className="text-gray-500 text-sm mt-1">
                                        {category.description || "ไม่มีรายละเอียด"}
                                    </p>

                                </div>

                                <div className="text-right">

                                    <p className="text-amber-300 text-xl font-bold">
                                        ฿{category.price_per_night}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        / คืน
                                    </p>

                                </div>

                            </div>

                            <div className="grid grid-cols-3 gap-3 mt-5">

                                <div className="bg-[#20252d] rounded-lg p-3 border border-[#363a42]">
                                    <p className="text-gray-500 text-xs">
                                        Capacity
                                    </p>

                                    <p className="text-white font-semibold mt-1">
                                        {category.capacity} คน
                                    </p>
                                </div>

                                <div className="bg-[#20252d] rounded-lg p-3 border border-[#363a42]">
                                    <p className="text-gray-500 text-xs">
                                        Beds
                                    </p>

                                    <p className="text-white font-semibold mt-1">
                                        {category.beds}
                                    </p>
                                </div>

                                <div className="bg-[#20252d] rounded-lg p-3 border border-[#363a42]">
                                    <p className="text-gray-500 text-xs">
                                        Area
                                    </p>

                                    <p className="text-white font-semibold mt-1">
                                        {category.area_sqm}m²
                                    </p>
                                </div>

                            </div>

                            <div className="flex flex-wrap gap-2 mt-5">

                                {category.amenities
                                    ?.split(",")
                                    .map((item, index) => (
                                        <span
                                            key={index}
                                            className="
                                            px-3 py-1 rounded-md text-xs
                                            bg-[#20252d]
                                            border border-[#363a42]
                                            text-gray-300
                                        "
                                        >
                                            {item}
                                        </span>
                                    ))}

                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">

                                <button
                                    onClick={() => openEditModal(category)}
                                    className="
                                    px-3 py-2 bg-amber-500/10 text-amber-400
                                    rounded-md text-sm
                                    hover:bg-amber-500/20
                                    transition
                                    cursor-pointer
                                "
                                >
                                    แก้ไข
                                </button>

                                <button
                                    onClick={() => {
                                        setSelectedCategoryId(category.id)
                                        setViewGalleryOpen(true)
                                    }}
                                    className="
                                    px-3 py-2 bg-blue-500/10 text-blue-400
                                    rounded-md text-sm
                                    hover:bg-blue-500/20
                                    transition
                                    cursor-pointer
                                "
                                >
                                    แกลเลอรี่ ({category.images.length})
                                </button>

                                <button
                                    onClick={() => {
                                        setSelectedCategoryId(category.id)
                                        setGalleryOpen(true)
                                    }}
                                    className="
                                    px-3 py-2 bg-purple-500/10 text-purple-400
                                    rounded-md text-sm
                                    hover:bg-purple-500/20
                                    transition
                                    cursor-pointer
                                "
                                >
                                    + เพิ่มรูป
                                </button>

                                <button
                                    onClick={() => {
                                        setSelectedCategoryId(category.id)
                                        setUploadOpen(true)
                                    }}
                                    className="
                                    px-3 py-2 bg-pink-500/10 text-pink-400
                                    rounded-md text-sm
                                    hover:bg-pink-500/20
                                    transition
                                    cursor-pointer
                                "
                                >
                                    รูปปก
                                </button>

                                <button
                                    onClick={() => toggleActive(category.id, category.is_active)}
                                    className="
                                        px-3 py-2 bg-red-500/10 text-red-400
                                        rounded-md text-sm
                                        hover:bg-red-500/20
                                        transition
                                        cursor-pointer
                                    "
                                >
                                    {category.is_active ? "ปิดการใช้งาน" : "เปิดการใช้งาน"}
                                </button>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

            {uploadOpen && (
                <div
                    onClick={() => {
                        setUploadOpen(false)
                        setCoverImage(null)
                    }}
                    className="
            fixed inset-0 z-50
            bg-black/70 backdrop-blur-sm
            flex items-center justify-center
            p-4
        "
                >

                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="
                w-full max-w-2xl
                bg-[#171b21]
                border border-[#363a42]
                rounded-2xl
                overflow-hidden
                shadow-2xl
            "
                    >

                        <div
                            className="
                    flex items-center justify-between
                    px-5 py-4
                    border-b border-[#363a42]
                    bg-[#1d222b]
                "
                        >

                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    จัดการรูปปกห้อง
                                </h2>

                                <p className="text-xs text-gray-500 mt-1">
                                    อัปโหลด เปลี่ยน หรือลบรูปปก
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setUploadOpen(false)
                                    setCoverImage(null)
                                }}
                                className="
                        w-8 h-8
                        rounded-full
                        bg-red-500/10
                        text-red-400
                        hover:bg-red-500/20
                        transition
                        cursor-pointer
                    "
                            >
                                ✕
                            </button>

                        </div>


                        <div className="p-5 grid lg:grid-cols-2 gap-5">

                            <div>

                                <h3 className="text-white font-semibold mb-3">
                                    รูปปัจจุบัน
                                </h3>

                                {categories.find(
                                    (c) => c.id === selectedCategoryId
                                )?.cover_image_url ? (

                                    <div className="space-y-3">

                                        <img
                                            src={
                                                categories.find(
                                                    (c) => c.id === selectedCategoryId
                                                )?.cover_image_url || ""
                                            }
                                            alt="current"
                                            className="
                                    w-full
                                    h-64
                                    object-cover
                                    rounded-xl
                                    border border-[#363a42]
                                "
                                        />

                                        <button
                                            onClick={async () => {

                                                if (!selectedCategoryId) return

                                                try {

                                                    setLoading(true)

                                                    const res = await fetch(
                                                        `/api/admin/roomcategory/${selectedCategoryId}/cover`,
                                                        {
                                                            method: "DELETE"
                                                        }
                                                    )

                                                    const data = await res.json()

                                                    if (!res.ok) {
                                                        throw new Error(
                                                            data.detail || "delete failed"
                                                        )
                                                    }

                                                    await fetchCategories()

                                                    toast.success("ลบรูปสำเร็จ")

                                                } catch (error: any) {

                                                    console.log(error)
                                                    toast.error("ลบรูปไม่สำเร็จสำเร็จ")

                                                } finally {
                                                    setLoading(false)
                                                }
                                            }}
                                            className="
                                    w-full
                                    px-4 py-2.5
                                    rounded-lg
                                    bg-red-500/10
                                    text-red-400
                                    hover:bg-red-500/20
                                    transition
                                    cursor-pointer
                                "
                                        >
                                            ลบรูปปัจจุบัน
                                        </button>

                                    </div>

                                ) : (

                                    <div
                                        className="
                                h-64
                                rounded-xl
                                border border-dashed border-[#363a42]
                                bg-[#20252d]
                                flex items-center justify-center
                                text-gray-500 text-sm
                            "
                                    >
                                        ยังไม่มีรูปปก
                                    </div>

                                )}

                            </div>

                            <div>

                                <h3 className="text-white font-semibold mb-3">
                                    อัปโหลดรูปใหม่
                                </h3>

                                <div
                                    className="
                            border-2 border-dashed border-[#363a42]
                            rounded-xl
                            p-4
                            bg-[#20252d]
                        "
                                >

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setCoverImage(
                                                e.target.files?.[0] || null
                                            )
                                        }
                                        className="
                                w-full
                                text-sm text-gray-300
                                file:mr-4
                                file:px-4
                                file:py-2
                                file:rounded-lg
                                file:border-0
                                file:bg-amber-300
                                file:text-black
                                file:cursor-pointer
                            "
                                    />

                                    {!coverImage && (
                                        <div className="mt-6 text-center text-gray-500 text-sm">
                                            เลือกรูปภาพใหม่
                                        </div>
                                    )}

                                    {coverImage && (
                                        <div className="mt-5 space-y-3">

                                            <img
                                                src={URL.createObjectURL(coverImage)}
                                                alt="preview"
                                                className="
                                        w-full
                                        h-52
                                        object-cover
                                        rounded-xl
                                        border border-[#363a42]
                                    "
                                            />

                                            <div className="flex items-center justify-between">

                                                <div>
                                                    <p className="text-sm text-white">
                                                        {coverImage.name}
                                                    </p>

                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {(
                                                            coverImage.size /
                                                            1024 /
                                                            1024
                                                        ).toFixed(2)} MB
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        setCoverImage(null)
                                                    }
                                                    className="
                                            px-3 py-2
                                            rounded-lg
                                            bg-red-500/10
                                            text-red-400
                                            hover:bg-red-500/20
                                            transition
                                            text-sm
                                            cursor-pointer
                                        "
                                                >
                                                    ลบ
                                                </button>

                                            </div>

                                        </div>
                                    )}

                                </div>

                                <div className="flex justify-end gap-2 mt-5">

                                    <button
                                        onClick={() => {
                                            setUploadOpen(false)
                                            setCoverImage(null)
                                        }}
                                        className="
                                px-4 py-2.5
                                rounded-lg
                                bg-[#20252d]
                                text-gray-300
                                hover:bg-[#2a313b]
                                transition
                                cursor-pointer
                            "
                                    >
                                        ยกเลิก
                                    </button>

                                    <button
                                        disabled={!coverImage || loading}
                                        onClick={() => {
                                            if (selectedCategoryId) {
                                                handleUploadCover(
                                                    selectedCategoryId
                                                )
                                            }
                                        }}
                                        className="
                                px-5 py-2.5
                                rounded-lg
                                bg-amber-300
                                text-black
                                font-semibold
                                hover:bg-amber-200
                                transition
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                                cursor-pointer
                            "
                                    >
                                        {loading
                                            ? "กำลังอัปโหลด..."
                                            : "อัปโหลด"}
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>
            )}

            {galleryOpen && (
                <div
                    onClick={() => {
                        setGalleryOpen(false)
                        setGalleryImage(null)
                    }}
                    className="
            fixed inset-0 z-50
            bg-black/70 backdrop-blur-sm
            flex items-center justify-center
            p-4
        "
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="
                w-full max-w-2xl
                bg-[#171b21]
                border border-[#363a42]
                rounded-2xl
                overflow-hidden
                shadow-2xl
            "
                    >

                        <div
                            className="
                    flex items-center justify-between
                    px-5 py-4
                    border-b border-[#363a42]
                    bg-[#1d222b]
                "
                        >
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    เพิ่มรูปแกลเลอรี่
                                </h2>

                                <p className="text-xs text-gray-500 mt-1">
                                    อัปโหลดรูปเพิ่มให้ประเภทห้อง
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setGalleryOpen(false)
                                    setGalleryImage(null)
                                }}
                                className="
                        w-8 h-8
                        rounded-full
                        bg-red-500/10
                        text-red-400
                        hover:bg-red-500/20
                        transition
                        cursor-pointer
                    "
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-5 space-y-5">

                            <div
                                className="
                        border-2 border-dashed border-[#363a42]
                        rounded-xl
                        p-4
                        bg-[#20252d]
                    "
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setGalleryImage(e.target.files?.[0] || null)
                                    }
                                    className="
                            w-full
                            text-sm text-gray-300
                            file:mr-4
                            file:px-4
                            file:py-2
                            file:rounded-lg
                            file:border-0
                            file:bg-amber-300
                            file:text-black
                            file:cursor-pointer
                        "
                                />

                                {!galleryImage && (
                                    <div className="mt-6 text-center text-gray-500 text-sm">
                                        เลือกรูปเพื่อเพิ่ม
                                    </div>
                                )}

                                {galleryImage && (
                                    <div className="mt-5 space-y-3">

                                        <img
                                            src={URL.createObjectURL(galleryImage)}
                                            alt="preview"
                                            className="
                                    w-full
                                    h-60
                                    object-cover
                                    rounded-xl
                                    border border-[#363a42]
                                "
                                        />

                                        <div className="flex items-center justify-between">

                                            <div>
                                                <p className="text-sm text-white">
                                                    {galleryImage.name}
                                                </p>

                                                <p className="text-xs text-gray-500 mt-1">
                                                    {(galleryImage.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => setGalleryImage(null)}
                                                className="
                                        px-3 py-2
                                        rounded-lg
                                        bg-red-500/10
                                        text-red-400
                                        hover:bg-red-500/20
                                        transition
                                        text-sm
                                    "
                                            >
                                                ลบ
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2">

                                <button
                                    onClick={() => {
                                        setGalleryOpen(false)
                                        setGalleryImage(null)
                                    }}
                                    className="
                            px-4 py-2.5
                            rounded-lg
                            bg-[#20252d]
                            text-gray-300
                            hover:bg-[#2a313b]
                            transition
                        "
                                >
                                    ยกเลิก
                                </button>

                                <button
                                    disabled={!galleryImage || loading}
                                    onClick={() => {
                                        if (selectedCategoryId) {
                                            handleUploadGallery(selectedCategoryId)
                                        }
                                    }}
                                    className="
                            px-5 py-2.5
                            rounded-lg
                            bg-amber-300
                            text-black
                            font-semibold
                            hover:bg-amber-200
                            transition
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                        "
                                >
                                    {loading ? "กำลังอัปโหลด..." : "เพิ่มรูป"}
                                </button>

                            </div>

                        </div>

                    </div>
                </div>
            )}

            {viewGalleryOpen && (
                <div
                    onClick={() => setViewGalleryOpen(false)}
                    className="
            fixed inset-0 z-50
            bg-black/70 backdrop-blur-sm
            flex items-center justify-center
            p-4
        "
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="
                w-full max-w-4xl
                bg-[#171b21]
                border border-[#363a42]
                rounded-2xl
                overflow-hidden
            "
                    >
                        <div className="flex justify-between px-5 py-4 border-b border-[#363a42] bg-[#1d222b]">
                            <div>
                                <h2 className="text-white text-xl font-bold">
                                    รูปทั้งหมด
                                </h2>
                                <p className="text-gray-500 text-xs mt-1">
                                    ดูรูปทั้งหมดของประเภทห้อง
                                </p>
                            </div>

                            <button
                                onClick={() => setViewGalleryOpen(false)}
                                className="text-red-400 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-5">

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

                                {categories
                                    .find(c => c.id === selectedCategoryId)
                                    ?.images.map(img => (
                                        <div key={img.id} className="relative group">

                                            <img
                                                src={img.image_url}
                                                className="
                                        w-full h-40
                                        object-cover
                                        rounded-lg
                                        border border-[#363a42]
                                    "
                                            />

                                            <button
                                                onClick={() => {
                                                    if (!selectedCategoryId) return
                                                    handleDeleteImage(selectedCategoryId, img.id)
                                                }}
                                                className="
                                        absolute top-2 right-2
                                        bg-red-500/80
                                        text-white text-xs
                                        px-2 py-1
                                        rounded
                                        hover:bg-red-300 transition duration-300 cursor-pointer
                                    "
                                            >
                                                ลบ
                                            </button>

                                        </div>
                                    ))
                                }

                            </div>

                            {categories.find(c => c.id === selectedCategoryId)
                                ?.images.length === 0 && (
                                    <div className="text-center text-gray-500 py-10">
                                        ไม่มีรูปในแกลเลอรี่
                                    </div>
                                )}

                        </div>
                    </div>
                </div>
            )}

            {editOpen && (
                <div
                    onClick={() => setEditOpen(false)}
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-xl bg-[#171b21] border border-[#363a42] rounded-2xl shadow-2xl overflow-hidden"
                    >

                        <div className="flex items-center justify-between px-5 py-4 bg-[#1d222b] border-b border-[#363a42]">
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    แก้ไขประเภทห้อง
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    ปรับข้อมูลห้องพัก
                                </p>
                            </div>

                            <button
                                onClick={() => setEditOpen(false)}
                                className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={handleUpdate}
                            className="p-5 space-y-4"
                        >

                            <div className="grid grid-cols-2 gap-3">

                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="ชื่อประเภทห้อง"
                                    className="col-span-2 w-full px-3 py-2.5 bg-[#20252d] text-white rounded-lg border border-[#363a42] focus:border-amber-300 outline-none"
                                />

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({ ...form, description: e.target.value })
                                    }
                                    placeholder="รายละเอียด"
                                    className="col-span-2 w-full px-3 py-2.5 bg-[#20252d] text-white rounded-lg border border-[#363a42] focus:border-amber-300 outline-none resize-none"
                                    rows={3}
                                />

                                <input
                                    name="price_per_night"
                                    value={form.price_per_night}
                                    onChange={handleChange}
                                    type="number"
                                    placeholder="ราคา / คืน"
                                    className="px-3 py-2.5 bg-[#20252d] text-white rounded-lg border border-[#363a42] focus:border-amber-300 outline-none"
                                />

                                <input
                                    name="capacity"
                                    value={form.capacity}
                                    onChange={handleChange}
                                    type="number"
                                    placeholder="จำนวนคน"
                                    className="px-3 py-2.5 bg-[#20252d] text-white rounded-lg border border-[#363a42] focus:border-amber-300 outline-none"
                                />

                                <input
                                    name="beds"
                                    value={form.beds}
                                    onChange={handleChange}
                                    type="number"
                                    placeholder="เตียง"
                                    className="px-3 py-2.5 bg-[#20252d] text-white rounded-lg border border-[#363a42] focus:border-amber-300 outline-none"
                                />

                                <input
                                    name="area_sqm"
                                    value={form.area_sqm}
                                    onChange={handleChange}
                                    type="number"
                                    placeholder="พื้นที่ (m²)"
                                    className="px-3 py-2.5 bg-[#20252d] text-white rounded-lg border border-[#363a42] focus:border-amber-300 outline-none"
                                />

                                <input
                                    name="amenities"
                                    value={form.amenities}
                                    onChange={handleChange}
                                    placeholder="wifi,tv,aircon"
                                    className="col-span-2 w-full px-3 py-2.5 bg-[#20252d] text-white rounded-lg border border-[#363a42] focus:border-amber-300 outline-none"
                                />

                            </div>

                            <p className="text-xs text-gray-500">
                                * คั่น amenities ด้วย comma เช่น wifi,tv,aircon
                            </p>

                            <div className="flex justify-end gap-2 pt-3 border-t border-[#363a42]">

                                <button
                                    type="button"
                                    onClick={() => setEditOpen(false)}
                                    className="px-4 py-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                                >
                                    ยกเลิก
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-5 py-2.5 rounded-lg bg-amber-300 text-black font-semibold hover:bg-amber-200 transition disabled:opacity-50 cursor-pointer"
                                >
                                    {loading ? "กำลังบันทึก..." : "บันทึก"}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

        </div>
    )
}

export default RoomCategoryClient