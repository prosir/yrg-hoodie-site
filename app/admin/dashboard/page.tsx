"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  ShoppingBag,
  Calendar,
  TrendingUp,
  Package,
  Clock,
  ArrowRight,
  ImageIcon,
  UserCog,
} from "lucide-react"
import { getAllOrders } from "@/lib/db"
import type { Order } from "@/lib/db"
import Link from "next/link"

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    newOrders: 0,
    paidOrders: 0,
    revenue: 0,
  })

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        const dbOrders = await getAllOrders()
        setOrders(dbOrders)

        // Calculate stats
        const newOrders = dbOrders.filter((order) => order.status === "nieuw").length
        const paidOrders = dbOrders.filter((order) => order.status === "betaald").length
        const revenue = dbOrders
          .filter((order) => order.status === "betaald")
          .reduce((sum, order) => sum + order.price, 0)

        setStats({
          totalOrders: dbOrders.length,
          newOrders,
          paidOrders,
          revenue,
        })
      } catch (error) {
        console.error("Failed to load orders:", error)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  // Get recent orders
  const recentOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString("nl-NL", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Totaal Bestellingen</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalOrders}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                <TrendingUp className="mr-1 h-3 w-3" />
                Alle tijd
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Nieuwe Bestellingen</p>
                <h3 className="text-2xl font-bold mt-1">{stats.newOrders}</h3>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                Wachtend op betaling
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Betaalde Bestellingen</p>
                <h3 className="text-2xl font-bold mt-1">{stats.paidOrders}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                Klaar voor verzending
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Totale Omzet</p>
                <h3 className="text-2xl font-bold mt-1">€{stats.revenue.toFixed(2)}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <BarChart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">
                Betaalde bestellingen
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Recente Bestellingen</CardTitle>
            <CardDescription>De laatste 5 bestellingen</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-olive-600"></div>
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-md border">
                        <ShoppingBag className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">{order.name}</p>
                        <p className="text-sm text-gray-500">
                          {order.color} - Maat {order.size.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={
                          order.status === "nieuw"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                            : order.status === "betaald"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : order.status === "verzonden"
                                ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }
                      >
                        {order.status}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">{new Date(order.date).toLocaleDateString("nl-NL")}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/orders">
                    Alle bestellingen bekijken
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Geen recente bestellingen gevonden</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Snelle Links</CardTitle>
            <CardDescription>Veelgebruikte acties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/orders">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Bestellingen beheren
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/rides/create">
                  <Calendar className="mr-2 h-4 w-4" />
                  Nieuwe rit aanmaken
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/rides">
                  <Calendar className="mr-2 h-4 w-4" />
                  Ritten beheren
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/albums/create">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Nieuw album aanmaken
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/hoodies/categories">
                  <Package className="mr-2 h-4 w-4" />
                  Hoodie categorieën
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/users">
                  <UserCog className="mr-2 h-4 w-4" />
                  Beheerders beheren
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

