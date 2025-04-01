import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "YoungRidersOost Admin",
  description: "Admin panel voor YoungRidersOost hoodies",
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <div className="bg-primary text-white py-3 px-4 text-center font-medium sticky top-0 z-50">
        Let op: Onze hoodies vallen 1 maat kleiner! Bestel 1 maat groter dan normaal. Voor over motorkleding adviseren
        we 2 maten groter te bestellen.
      </div>
      {children}
    </>
  )
}

