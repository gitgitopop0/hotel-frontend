import AdminSidebar from "@/components/admin/AdminSidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0f1318]">
      <AdminSidebar />
      <main className="flex-1 p-6 text-white overflow-auto md:ml-56 pt-14 md:pt-6">
        {children}
      </main>
    </div>
  )
}