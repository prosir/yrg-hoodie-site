"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Download, Search, Filter, Printer } from "lucide-react"
import { useRouter } from "next/navigation"
import { getAllOrders } from "@/lib/db"
import type { Order } from "@/lib/db"

// Interface voor gegroepeerde bestellingen
interface OrderGroup {
  orderId: string
  date: string
  name: string
  email: string
  phone: string
  status: string
  items: Order[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const router = useRouter()

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        const allOrders = await getAllOrders()
        // Sort by date (newest first)
        const sortedOrders = allOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setOrders(sortedOrders)
      } catch (error) {
        console.error("Error loading orders:", error)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  // Filter orders based on search term and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm === "" ||
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Groepeer bestellingen op orderId
  const groupedOrders = filteredOrders.reduce<OrderGroup[]>((acc, order) => {
    const existingOrderIndex = acc.findIndex((group) => group.orderId === order.orderId)

    if (existingOrderIndex >= 0) {
      // Als de orderId al bestaat, voeg dit item toe aan de items array
      acc[existingOrderIndex].items.push(order)
    } else {
      // Anders maak een nieuwe groep met deze orderId
      acc.push({
        orderId: order.orderId,
        date: order.date,
        name: order.name,
        email: order.email,
        phone: order.phone,
        status: order.status,
        items: [order],
      })
    }

    return acc
  }, [])

  // Get counts for each status
  const statusCounts = {
    all: orders.length,
    nieuw: orders.filter((order) => order.status === "nieuw").length,
    betaald: orders.filter((order) => order.status === "betaald").length,
    besteld: orders.filter((order) => order.status === "besteld").length,
    verzonden: orders.filter((order) => order.status === "verzonden").length,
    afgehaald: orders.filter((order) => order.status === "afgehaald").length,
    geannuleerd: orders.filter((order) => order.status === "geannuleerd").length,
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "nieuw":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "betaald":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "besteld":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100"
      case "verzonden":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "afgehaald":
        return "bg-teal-100 text-teal-800 hover:bg-teal-100"
      case "geannuleerd":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  // Handle view order details
  const handleViewOrder = (orderId: string) => {
    router.push(`/admin/order-details/${orderId}`)
  }

  // Handle print orders
  const handlePrintOrders = () => {
    router.push("/admin/orders/print")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bestellingen</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrintOrders}>
            <Printer className="mr-2 h-4 w-4" />
            Afdrukken
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporteren
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle Bestellingen</CardTitle>
          <CardDescription>Bekijk en beheer alle bestellingen</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="all" className="relative">
                  Alle
                  <Badge variant="secondary" className="ml-2">
                    {statusCounts.all}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="nieuw" className="relative">
                  Nieuw
                  <Badge variant="secondary" className="ml-2">
                    {statusCounts.nieuw}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="betaald" className="relative">
                  Betaald
                  <Badge variant="secondary" className="ml-2">
                    {statusCounts.betaald}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="verzonden" className="relative">
                  Verzonden
                  <Badge variant="secondary" className="ml-2">
                    {statusCounts.verzonden}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Zoeken..."
                    className="pl-8 w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <span>Sorteren op</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Datum (nieuwste eerst)</SelectItem>
                    <SelectItem value="date-asc">Datum (oudste eerst)</SelectItem>
                    <SelectItem value="name-asc">Naam (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Naam (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="all" className="m-0">
              <OrdersTable
                orders={groupedOrders}
                loading={loading}
                getStatusBadgeColor={getStatusBadgeColor}
                formatDate={formatDate}
                handleViewOrder={handleViewOrder}
              />
            </TabsContent>
            <TabsContent value="nieuw" className="m-0">
              <OrdersTable
                orders={groupedOrders}
                loading={loading}
                getStatusBadgeColor={getStatusBadgeColor}
                formatDate={formatDate}
                handleViewOrder={handleViewOrder}
              />
            </TabsContent>
            <TabsContent value="betaald" className="m-0">
              <OrdersTable
                orders={groupedOrders}
                loading={loading}
                getStatusBadgeColor={getStatusBadgeColor}
                formatDate={formatDate}
                handleViewOrder={handleViewOrder}
              />
            </TabsContent>
            <TabsContent value="verzonden" className="m-0">
              <OrdersTable
                orders={groupedOrders}
                loading={loading}
                getStatusBadgeColor={getStatusBadgeColor}
                formatDate={formatDate}
                handleViewOrder={handleViewOrder}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

interface OrdersTableProps {
  orders: OrderGroup[]
  loading: boolean
  getStatusBadgeColor: (status: string) => string
  formatDate: (dateString: string) => string
  handleViewOrder: (orderId: string) => void
}

function OrdersTable({ orders, loading, getStatusBadgeColor, formatDate, handleViewOrder }: OrdersTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-olive-600"></div>
      </div>
    )
  }

  if (orders.length === 0) {
    return <div className="text-center py-12 text-gray-500">Geen bestellingen gevonden</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bestelnummer</TableHead>
            <TableHead>Datum</TableHead>
            <TableHead>Klant</TableHead>
            <TableHead>Producten</TableHead>
            <TableHead>Prijs</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Acties</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((orderGroup) => (
            <TableRow key={orderGroup.orderId}>
              <TableCell className="font-medium">{orderGroup.orderId}</TableCell>
              <TableCell>{formatDate(orderGroup.date)}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{orderGroup.name}</div>
                  <div className="text-sm text-gray-500">{orderGroup.email}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {orderGroup.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            item.color === "lilac"
                              ? "#c084fc"
                              : item.color === "ocean-blue"
                                ? "#60a5fa"
                                : item.color === "burgundy"
                                  ? "#ef4444"
                                  : item.color === "black"
                                    ? "#1f2937"
                                    : item.color === "olive"
                                      ? "#65a30d"
                                      : "#9ca3af",
                        }}
                      ></div>
                      <span>
                        Hoodie {item.size.toUpperCase()} {item.quantity > 1 ? `(${item.quantity}x)` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell>€{orderGroup.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</TableCell>
              <TableCell>
                <Badge className={getStatusBadgeColor(orderGroup.status)}>{orderGroup.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleViewOrder(orderGroup.orderId)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

