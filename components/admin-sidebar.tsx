"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Bike,
  Package,
  Tag,
  Users,
  Settings,
  ImageIcon,
  ShieldAlert,
  MessageSquare,
  LogOut,
} from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/")
  }

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      title: "Bestellingen",
      href: "/admin/orders",
      icon: <ShoppingCart className="h-4 w-4" />,
    },
    {
      title: "Ritten",
      href: "/admin/rides",
      icon: <Bike className="h-4 w-4" />,
    },
    {
      title: "Albums",
      href: "/admin/albums",
      icon: <ImageIcon className="h-4 w-4" />,
    },
    {
      title: "Producten",
      href: "/admin/products",
      icon: <Package className="h-4 w-4" />,
    },
    {
      title: "Categorieën",
      href: "/admin/hoodies/categories",
      icon: <Tag className="h-4 w-4" />,
    },
    {
      title: "Leden",
      href: "/admin/members",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Site Instellingen",
      href: "/admin/site-settings",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      title: "Site Afbeeldingen",
      href: "/admin/site-images",
      icon: <ImageIcon className="h-4 w-4" />,
    },
    {
      title: "Gebruikers",
      href: "/admin/users",
      icon: <ShieldAlert className="h-4 w-4" />,
    },
    {
      title: "WhatsApp",
      href: "/admin/whatsapp",
      icon: <MessageSquare className="h-4 w-4" />,
    },
  ]

  const handleLogout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
    })
    window.location.href = "/admin/login"
  }

  return (
    <div className="w-64 bg-white h-full overflow-y-auto border-r border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-center text-olive-600">Admin Panel</h1>
      </div>
      <div className="p-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                isActive(item.href)
                  ? "bg-olive-100 text-olive-700 font-medium"
                  : "text-gray-600 hover:bg-olive-50 hover:text-olive-600"
              }`}
            >
              <span className={`mr-3 ${isActive(item.href) ? "text-olive-600" : "text-gray-500"}`}>{item.icon}</span>
              <span>{item.title}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm rounded-md text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors mt-4"
          >
            <span className="mr-3 text-gray-500">
              <LogOut className="h-4 w-4" />
            </span>
            <span>Uitloggen</span>
          </button>
        </nav>
      </div>
    </div>
  )
}
