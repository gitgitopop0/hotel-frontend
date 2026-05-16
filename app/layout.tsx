import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "react-hot-toast"

export const metadata: Metadata = {
  title: "Hotel",
  description: "Hotel Booking System",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="bg-[#0f1318]">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#171b21",
              color: "#fff",
              border: "1px solid #363a42",
            },
          }}
        />
      </body>
    </html>
  )
}