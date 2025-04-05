import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "YoungRidersOost Admin",
  description: "Admin panel voor YoungRidersOost",
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className={`${inter.className} flex flex-col h-screen`}>
      <div className="flex h-[calc(100vh-48px)]">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

