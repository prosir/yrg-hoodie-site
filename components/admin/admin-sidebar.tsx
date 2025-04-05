"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  ShoppingBag,
  Settings,
  ImageIcon,
  MapPin,
  Calendar,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen)
  }

  const navItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/admin/dashboard",
    },
    {
      title: "Bestellingen",
      icon: <ShoppingBag className="h-5 w-5" />,
      href: "/admin/orders",
    },
    {
      title: "Hoodies",
      icon: <ShoppingBag className="h-5 w-5" />,
      href: "/admin/hoodies",
      subItems: [
        {
          title: "Categorieën",
          href: "/admin/hoodies/categories",
        },
        {
          title: "Producten",
          href: "/admin/hoodies/products",
        },
      ],
    },
    {
      title: "Ritten",
      icon: <MapPin className="h-5 w-5" />,
      href: "/admin/rides",
      subItems: [
        {
          title: "Alle ritten",
          href: "/admin/rides",
        },
        {
          title: "Rit aanmaken",
          href: "/admin/rides/create",
        },
      ],
    },
    {
      title: "Albums",
      icon: <ImageIcon className="h-5 w-5" />,
      href: "/admin/albums",
      subItems: [
        {
          title: "Alle albums",
          href: "/admin/albums",
        },
        {
          title: "Album aanmaken",
          href: "/admin/albums/create",
        },
      ],
    },
    {
      title: "Evenementen",
      icon: <Calendar className="h-5 w-5" />,
      href: "/admin/events",
    },
    // {
    //   title: "Leden",
    //   icon: <Users className="h-5 w-5" />,
    //   href: "/admin/members",
    // },
    {
      title: "Instellingen",
      icon: <Settings className="h-5 w-5" />,
      href: "/admin/settings",
    },
  ]

  // Check if a path is active
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  // Check if a nav item with subitems is active
  const hasActiveChild = (item: any) => {
    return item.subItems?.some((subItem: any) => isActive(subItem.href))
  }

  // Toggle expanded state for nav items with children
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-16 left-4 z-50 md:hidden bg-white shadow-md rounded-full"
        onClick={toggleMobileSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay for mobile */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 z-50 
          ${collapsed ? "w-20" : "w-64"} 
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 fixed md:relative h-[calc(100vh-48px)]`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and collapse button */}
          <div className="flex items-center justify-between p-4 border-b">
            {!collapsed && (
              <Link href="/admin/dashboard" className="font-bold text-xl text-olive-600">
                YoungRiders
              </Link>
            )}
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden md:flex">
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className={`flex items-center py-2 px-3 rounded-md transition-colors ${
                      isActive(item.href) || hasActiveChild(item)
                        ? "bg-olive-50 text-olive-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      if (item.subItems) {
                        toggleExpanded(item.title)
                      }
                    }}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {item.subItems && (
                          <ChevronRight
                            className={`h-4 w-4 transition-transform ${expandedItems[item.title] ? "rotate-90" : ""}`}
                          />
                        )}
                      </>
                    )}
                  </Link>

                  {/* Subitems */}
                  {!collapsed && item.subItems && expandedItems[item.title] && (
                    <ul className="mt-1 ml-6 space-y-1">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.title}>
                          <Link
                            href={subItem.href}
                            className={`block py-2 px-3 rounded-md transition-colors ${
                              isActive(subItem.href) ? "bg-olive-50 text-olive-700" : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {subItem.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className={`w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 ${
                collapsed ? "px-3" : ""
              }`}
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span className="ml-3">Uitloggen</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}

