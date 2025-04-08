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

  return (
    <div className="w-64 bg-gray-100 h-full overflow-y-auto border-r">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Admin Panel</h1>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm rounded-md ${
                isActive(item.href)
                  ? "bg-gray-200 text-gray-900"
                  : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
