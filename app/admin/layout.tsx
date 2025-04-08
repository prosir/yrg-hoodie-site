import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AdminSidebar } from "@/components/admin-sidebar"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for YRG Hoodie Site",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is logged in
  const session = await getSession()

  // If not authenticated, redirect to login
  if (!session) {
    redirect("/admin/login")
  }

  return (
    <div className={`flex h-screen bg-gray-50 ${inter.className}`}>
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
