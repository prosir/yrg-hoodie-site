import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SiteConfigProvider } from "@/components/site-config-provider"
import { CartProvider } from "@/components/cart/cart-context"
import { getSiteConfig } from "@/lib/site-config"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "YoungRidersOost Hoodies",
  description: "Bestel je officiële YoungRidersOost hoodie",
  generator: "v0.dev",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Haal de site configuratie op
  const config = await getSiteConfig()

  return (
    <html lang="nl">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <SiteConfigProvider config={config}>
            <CartProvider>
              <div className="bg-primary text-white py-3 px-4 text-center font-medium sticky top-0 z-50">
                Let op: Onze hoodies vallen 1 maat kleiner! Bestel 1 maat groter dan normaal. Voor over motorkleding
                adviseren we 2 maten groter te bestellen.
              </div>
              {children}
              <Toaster />
            </CartProvider>
          </SiteConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

import "./globals.css"



import './globals.css'