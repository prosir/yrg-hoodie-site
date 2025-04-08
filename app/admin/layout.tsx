import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AdminSidebar } from "@/components/admin-sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for YRG Hoodie Site",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The middleware will handle authentication
  return (
    <div className={`flex h-screen bg-gray-50 ${inter.className}`}>
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
