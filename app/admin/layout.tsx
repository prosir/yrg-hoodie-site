import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import { AdminSidebar } from "@/components/admin-sidebar"
import { cookies } from "next/headers"
import { validateSession } from "@/lib/auth"
import { redirect } from "next/navigation"

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
  // Check if the current path is the login page
  const isLoginPage = children.toString().includes("LoginPage")
  
  // If on login page, don't check authentication
  if (isLoginPage) {
    return <div className={`min-h-screen bg-gray-50 ${inter.className}`}>{children}</div>
  }
  
  // Check if user is logged in
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get("session")?.value
  const isAuthenticated = sessionCookie ? await validateSession(sessionCookie) : false

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    redirect("/admin/login")
  }

  return (
    <div className={`flex h-screen bg-gray-50 ${inter.className}`}>
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
