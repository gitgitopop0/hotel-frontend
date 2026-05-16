"use client"
import { useAuthStore } from "@/lib/stores/authStore"
import { useState, useEffect } from "react"
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Cell
} from "recharts"

import { LineChart, Line } from "recharts"

type DashboardData = {
    occupancy_rate: number
    revenue_today: number
    revenue_month: number
    total_bookings_today: number
    total_rooms: number
    available_rooms: number
    occupied_rooms: number
    vad_rooms: number
    ooo_rooms: number
    avg_daily_rate: number
    revpar: number
}

function Metric({
    label,
    value,
}: {
    label: string
    value: string
}) {
    return (
        <div className="flex justify-between items-center border-b border-[#2a2f39] pb-3">
            <span className="text-gray-400">{label}</span>

            <span className="text-white font-semibold">
                {value}
            </span>
        </div>
    )
}

type Room = {
    id: number
    room_number: string
    floor: number
    status: string
}

type BookingDaily = {
    date: string
    bookings: number
}

const DashboardClient = () => {
    const user = useAuthStore((s) => s.user)
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [rooms, setRooms] = useState<Room[]>([])
    const [bookingTrend, setBookingTrend] = useState<BookingDaily[]>([])

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const res = await fetch("/api/admin/dashboard")
                const result = await res.json()

                setData(result)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        fetchDashboard()
    }, [])

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
            }
        }

        fetchRooms()
    }, [])

    useEffect(() => {
        async function fetchBookingTrend() {
            try {
                const res = await fetch("/api/admin/dashboard/bookings-daily")
                const data = await res.json()
                setBookingTrend(data)
            } catch (err) {
                console.log(err)
            }
        }

        fetchBookingTrend()
    }, [])

    if (loading) {
        return (
            <div className="space-y-6">

                <div className="space-y-2">
                    <div className="h-8 w-56 bg-[#20252d] rounded-lg animate-pulse" />
                    <div className="h-4 w-72 bg-[#20252d] rounded-lg animate-pulse" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-[#171b21] border border-[#363a42] rounded-xl p-5 space-y-2">
                            <div className="h-4 w-24 bg-[#20252d] rounded-lg animate-pulse" />
                            <div className="h-9 w-16 bg-[#20252d] rounded-lg animate-pulse" />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-[#171b21] border border-[#363a42] rounded-xl p-5 space-y-4">
                        <div className="h-5 w-24 bg-[#20252d] rounded-lg animate-pulse" />
                        <div className="h-[300px] bg-[#20252d] rounded-lg animate-pulse" />
                    </div>
                    <div className="bg-[#171b21] border border-[#363a42] rounded-xl p-5 space-y-5">
                        <div className="h-5 w-32 bg-[#20252d] rounded-lg animate-pulse" />
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex justify-between border-b border-[#2a2f39] pb-3">
                                <div className="h-4 w-32 bg-[#20252d] rounded-lg animate-pulse" />
                                <div className="h-4 w-16 bg-[#20252d] rounded-lg animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#171b21] border border-[#363a42] rounded-xl p-5 space-y-4">
                    <div className="h-5 w-24 bg-[#20252d] rounded-lg animate-pulse" />
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-[#1f242d] rounded-lg">
                            <div className="space-y-1">
                                <div className="h-4 w-24 bg-[#20252d] rounded-lg animate-pulse" />
                                <div className="h-3 w-16 bg-[#20252d] rounded-lg animate-pulse" />
                            </div>
                            <div className="h-6 w-12 bg-[#20252d] rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }
    if (!data) {
        return <div className="text-red-400">โหลดข้อมูลไม่สำเร็จ</div>
    }

    const roomChart = [
        { name: "Available", value: data.available_rooms },
        { name: "Occupied", value: data.occupied_rooms },
        { name: "VAD", value: data.vad_rooms },
        { name: "OOO", value: data.ooo_rooms },
    ]


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-6">Welcom Back {user?.username}</h1>
                <p className="text-gray-500 mt-1">
                    Hotel management dashboard overview
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "ห้องทั้งหมด", value: data.total_rooms },
                    { label: "การจองวันนี้", value: data.total_bookings_today },
                    { label: "รายได้วันนี้", value: `${data.revenue_today}` },
                    { label: "รายได้เดือนนี้", value: `${data.revenue_month}` },
                ].map((card) => (
                    <div key={card.label}
                        className="bg-[#171b21] border border-[#363a42] rounded-xl p-5">
                        <p className="text-gray-400 text-sm">{card.label}</p>
                        <p className="text-white text-3xl font-bold mt-1">{card.value}</p>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-[#171b21] border border-[#363a42] rounded-xl p-5">
                    <h2>สถานะห้อง</h2>

                    <ResponsiveContainer width={"100%"} height={300}>
                        <BarChart data={roomChart} margin={{ top: 20, right: 30, left: 0, bottom: 20 }} barCategoryGap="25%">
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#363a42" opacity={0.3} />
                            <XAxis dataKey={"name"} axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                dy={10} />
                            <YAxis axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                contentStyle={{
                                    backgroundColor: '#1f242d',
                                    border: '1px solid #363a42',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                                }}
                                labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                                itemStyle={{ color: '#c9a96e', fontSize: '14px', fontWeight: 'bold' }}
                            />
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#c9a96e" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#c9a96e" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={100} animationDuration={1200}>
                                {roomChart.map((entry, index) => {
                                    const colors = {
                                        Available: '#10b981',
                                        Occupied: '#3b82f6',
                                        VAD: '#f59e0b',
                                        OOO: '#ef4444'
                                    };
                                    return (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={colors[entry.name as keyof typeof colors] || '#c9a96e'}
                                        />
                                    );
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-[#171b21] border border-[#363a42] rounded-xl p-5">
                    <h2 className="text-white text-lg font-semibold mb-4">Hotel Metrics</h2>

                    <div className="space-y-5">
                        <Metric
                            label="Occupancy Rate"
                            value={`${data.occupancy_rate}%`}
                        />
                        <Metric
                            label="ADR"
                            value={`${data.avg_daily_rate}%`}
                        />
                        <Metric
                            label="RevPAR"
                            value={`${data.revpar}%`}
                        />
                        <Metric
                            label="Available Rooms"
                            value={`${data.available_rooms}%`}
                        />
                        <Metric
                            label="Occupied Rooms"
                            value={`${data.occupied_rooms}%`}
                        />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-[#171b21] border border-[#363a42] rounded-xl p-5">
                    <h2 className="text-white font-semibold mb-4">Room List</h2>

                    <div className="grid gap-3">
                        {rooms.slice(0, 6).map((room) => (
                            <div
                                key={room.id}
                                className="flex justify-between items-center p-3 bg-[#1f242d] rounded-lg"
                            >
                                <div>
                                    <p className="text-white font-medium">
                                        Room {room.room_number}
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                        Floor {room.floor}
                                    </p>
                                </div>

                                <span
                                    className={`px-2 py-1 rounded text-xs ${room.status === "VAC"
                                        ? "bg-cyan-500/15 text-cyan-400"
                                        : room.status === "VAD"
                                            ? "bg-yellow-500/15 text-yellow-400"
                                            : room.status === "OOO"
                                                ? "bg-red-500/15 text-red-400"
                                                : "bg-green-500/15 text-green-400"
                                        }`}
                                >
                                    {room.status}
                                </span>
                            </div>
                        ))}
                    </div>

                </div>
                <div className="bg-[#171b21] border border-[#363a42] rounded-xl p-5">
                    <h2 className="text-white text-lg font-semibold mb-4">
                        Bookings Trend (7 Days)
                    </h2>

                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={bookingTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2f39" />

                            <XAxis
                                dataKey="date"
                                tick={{ fill: "#9ca3af", fontSize: 12 }}
                            />

                            <YAxis
                                tick={{ fill: "#9ca3af", fontSize: 12 }}
                            />

                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1f242d",
                                    border: "1px solid #363a42",
                                    borderRadius: 8,
                                    color: "#fff",
                                }}
                            />

                            <Line
                                type="monotone"
                                dataKey="bookings"
                                stroke="#c9a96e"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
    function Metric({
        label,
        value,
    }: {
        label: string
        value: string
    }) {
        return (
            <div className="flex justify-between items-center border-b border-[#2a2f39] pb-3">
                <span className="text-gray-400">{label}</span>

                <span className="text-white font-semibold">
                    {value}
                </span>
            </div>
        )
    }
}
export default DashboardClient