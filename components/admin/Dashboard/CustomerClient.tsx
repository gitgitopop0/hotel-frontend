"use client"
import { useState, useEffect } from "react"

type Customer = {
  id: number
  full_name: string
  email: string
  phone: string
  id_card: string
  created_at: string
}

const CustomerClient = () => {
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด")
  const [search, setSearch] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 400)

    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    const controller = new AbortController()

    async function fetchCustomers() {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          page: page.toString(),
          search,
          status: statusFilter === "ทั้งหมด" ? "" : statusFilter,
        })

        const res = await fetch(`/api/admin/customer?${params}`, {
          signal: controller.signal,
        })

        if (!res.ok) {
          throw new Error("Server response error")
        }

        const data = await res.json()

        setCustomers(Array.isArray(data) ? data : (data.data ?? []))
        setTotalPages(data.total_pages ?? 1)
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(err)
          setError("ไม่สามารถโหลดข้อมูลได้")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()

    return () => controller.abort()
  }, [page, search, statusFilter])

  const isLastPage = page >= totalPages
  const isFirstPage = page <= 1

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer Management</h1>
          <p className="text-gray-600">This is the customer management section.</p>
        </div>
        <div className="flex items-center space-x-2 my-2 sm:mt-0">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ค้นหา customer..."
            className="flex-1 bg-[#20252d] border border-[#363a42]
            rounded-lg px-4 py-2.5 text-sm text-white outline-none
            focus:border-amber-300 transition"
          />
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-[#363a42] w-full">
        <table className="w-full text-left bg-[#171b20] text-sm text-white">
          <thead >
            <tr className="text-gray-400 bg-[#20252d]">
              <th className="px-4 py-3">ชื่อ</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">เบอร์โทร</th>
              <th className="px-4 py-3">เลขบัตรประชาชน</th>
              <th className="px-4 py-3">วันที่สมัคร</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-t border-[#363a42] animate-pulse">
                  <td className="px-4 py-3">
                    <div className="h-4 w-40 bg-gray-700 rounded"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-52 bg-gray-700 rounded"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-24 bg-gray-700 rounded"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-32 bg-gray-700 rounded"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-36 bg-gray-700 rounded"></div>
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-red-400">
                  {error}
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">
                  ไม่มีข้อมูล
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="border-t border-[#363a42]">
                  <td className="px-4 py-3">{customer.full_name}</td>
                  <td className="px-4 py-3">{customer.email}</td>
                  <td className="px-4 py-3">{customer.phone}</td>
                  <td className="px-4 py-3">{customer.id_card}</td>
                  <td className="px-4 py-3">
                    {new Date(customer.created_at).toLocaleDateString("th-TH")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

      </div>
      <div className="flex items-center justify-end gap-3 pt-6">

        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={isFirstPage}
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
          onClick={() => {
            if (isLastPage) return
            setPage((p) => p + 1)
          }}
          disabled={isLastPage}
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
export default CustomerClient