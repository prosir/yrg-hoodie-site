"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Logo } from "@/components/logo"
import { CartButton } from "@/components/cart/cart-button"

export function SiteNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  // Don't show navbar on admin pages
  if (pathname.startsWith("/admin")) {
    return null
  }

  const isActive = (path: string) => {
    return pathname === path || (path !== "/" && pathname.startsWith(path))
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/webshop", label: "Webshop" },
    { href: "/gallery", label: "Galerij" },
    { href: "/rides", label: "Ritten" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <header className="py-6 border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`transition-colors ${
                      isActive(link.href) ? "text-olive-600 font-medium" : "text-gray-700 hover:text-olive-600"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Cart Button */}
          <div className="hidden md:block">
            <CartButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-[calc(4.5rem+3rem)] left-0 right-0 bg-white z-50 border-b border-gray-200 shadow-lg">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block py-2 ${isActive(link.href) ? "text-olive-600 font-medium" : "text-gray-700"}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-4 border-t border-gray-100">
                <CartButton />
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}
