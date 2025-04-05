"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, ShoppingBag, Calendar, ImageIcon, Package, UserCog, Settings } from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname.startsWith(href)
  }

  return (
    <div className="hidden lg:flex flex-col w-64 border-r bg-gray-50 border-gray-200 py-4">
      <div className="px-6 py-4">
        <h2 className="text-lg font-semibold">Admin Menu</h2>
      </div>
      <nav className="flex-1">
        <ul className="space-y-1">
          <li>
            <Link
              href="/admin/dashboard"
              className={`flex items-center px-6 py-3 hover:bg-gray-100 transition-colors ${
                isActive("/admin/dashboard") ? "bg-gray-100 font-medium" : ""
              }`}
            >
              <BarChart className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/admin/orders"
              className={`flex items-center px-6 py-3 hover:bg-gray-100 transition-colors ${
                isActive("/admin/orders") ? "bg-gray-100 font-medium" : ""
              }`}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Bestellingen
            </Link>
          </li>
          <li>
            <Link
              href="/admin/rides"
              className={`flex items-center px-6 py-3 hover:bg-gray-100 transition-colors ${
                isActive("/admin/rides") ? "bg-gray-100 font-medium" : ""
              }`}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Ritten
            </Link>
          </li>
          <li>
            <Link
              href="/admin/albums"
              className={`flex items-center px-6 py-3 hover:bg-gray-100 transition-colors ${
                isActive("/admin/albums") ? "bg-gray-100 font-medium" : ""
              }`}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Albums
            </Link>
          </li>
          <li>
            <Link
              href="/admin/hoodies"
              className={`flex items-center px-6 py-3 hover:bg-gray-100 transition-colors ${
                isActive("/admin/hoodies") ? "bg-gray-100 font-medium" : ""
              }`}
            >
              <Package className="mr-2 h-4 w-4" />
              Webshop
            </Link>
          </li>
          <li>
            <Link
              href="/admin/users"
              className={`flex items-center px-6 py-3 hover:bg-gray-100 transition-colors ${
                isActive("/admin/users") ? "bg-gray-100 font-medium" : ""
              }`}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Beheerders
            </Link>
          </li>
          <li>
            <Link
              href="/admin/settings"
              className={`flex items-center px-6 py-3 hover:bg-gray-100 transition-colors ${
                isActive("/admin/settings") ? "bg-gray-100 font-medium" : ""
              }`}
            >
              <Settings className="mr-2 h-4 w-4" />
              Instellingen
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}

