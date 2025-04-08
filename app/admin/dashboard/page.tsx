import Link from "next/link"
import { getAllOrders } from "@/lib/db"
import { getAllRides } from "@/lib/db-rides"
import { getAllProducts } from "@/lib/db-products"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Bike, Package, Calendar, TrendingUp } from "lucide-react"

export default async function DashboardPage() {
  // Fetch data
  const orders = await getAllOrders()
  const rides = await getAllRides()
  const products = await getAllProducts()

  // Calculate stats
  const totalOrders = orders.length
  const totalRides = rides.length
  const totalProducts = products.length
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

  // Get upcoming rides
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcomingRides = rides
    .filter((ride) => new Date(ride.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  // Get recent orders
  const recentOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Welkom bij het YRG admin panel</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Totaal Bestellingen</CardTitle>
            <ShoppingCart className="h-4 w-4 text-olive-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-gray-500">
              <Link href="/admin/orders" className="text-olive-600 hover:underline">
                Bekijk alle bestellingen
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Totaal Ritten</CardTitle>
            <Bike className="h-4 w-4 text-olive-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRides}</div>
            <p className="text-xs text-gray-500">
              <Link href="/admin/rides" className="text-olive-600 hover:underline">
                Bekijk alle ritten
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Totaal Producten</CardTitle>
            <Package className="h-4 w-4 text-olive-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-gray-500">
              <Link href="/admin/products" className="text-olive-600 hover:underline">
                Bekijk alle producten
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Totale Omzet</CardTitle>
            <TrendingUp className="h-4 w-4 text-olive-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500">Alle bestellingen</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Komende Ritten</CardTitle>
            <CardDescription>De eerstvolgende geplande ritten</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingRides.length > 0 ? (
              <div className="space-y-4">
                {upcomingRides.map((ride) => (
                  <div key={ride.id} className="flex items-center gap-4 border-b pb-4 last:border-0">
                    <div className="rounded-full bg-olive-100 p-2">
                      <Calendar className="h-4 w-4 text-olive-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{ride.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(ride.date).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Link href={`/admin/rides/edit/${ride.id}`} className="text-sm text-olive-600 hover:underline">
                      Details
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Geen komende ritten gepland</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recente Bestellingen</CardTitle>
            <CardDescription>De meest recente bestellingen</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-4 border-b pb-4 last:border-0">
                    <div className="rounded-full bg-olive-100 p-2">
                      <ShoppingCart className="h-4 w-4 text-olive-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-sm text-gray-500">
                        €{order.totalAmount?.toFixed(2)} - {new Date(order.date).toLocaleDateString("nl-NL")}
                      </p>
                    </div>
                    <Link href={`/admin/order-details/${order.id}`} className="text-sm text-olive-600 hover:underline">
                      Details
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Geen recente bestellingen</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
