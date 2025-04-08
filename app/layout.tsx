import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/components/cart/cart-context"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "YoungRidersOost | Premium Motorcycle Hoodies",
  description: "Exclusieve hoodies voor de YoungRidersOost motorclub. Ontdek onze premium collectie en rijd met stijl.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nl" className="scroll-smooth">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <div className="bg-olive-600 text-white py-3 px-4 text-center font-medium sticky top-0 z-50">
            Let op: Onze hoodies vallen 1 maat kleiner! Bestel 1 maat groter dan normaal. Voor over motorkleding
            adviseren we 2 maten groter te bestellen.
          </div>
          <CartProvider>
            <SiteNavbar />
            <main className="flex-grow">{children}</main>
            <SiteFooter />
          </CartProvider>
        </div>
      </body>
    </html>
  )
}


import './globals.css'