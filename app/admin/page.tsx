"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertCircle,
  Copy,
  Check,
  Printer,
  ShoppingBag,
  Settings,
  ShieldAlert,
  NavigationOffIcon as ShoppingCartOff,
  ExternalLink,
  Package,
  CreditCard,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getAllOrders, updateOrder, updateOrderStatus } from "@/lib/db"
import type { Order } from "@/lib/db"
import Link from "next/link"
import { PrintTable } from "@/components/print-table"
import { useRouter } from "next/navigation"

// Type voor gegroepeerde bestellingen
type GroupedOrder = {
  color: string
  size: string
  count: number
  isCrew: boolean
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("orders")
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrder[]>([])
  const printRef = useRef<HTMLDivElement>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const router = useRouter()

  // Check if already logged in via session cookie
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/check-session")
        const data = await response.json()

        if (data.authenticated) {
          setIsLoggedIn(true)
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setCheckingSession(false)
      }
    }

    checkSession()
  }, [])

  // Load orders from server
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        const dbOrders = await getAllOrders()
        setOrders(dbOrders)
        setFilteredOrders(dbOrders)

        // Groepeer bestellingen voor de samenvatting
        groupOrdersBySizeAndColor(dbOrders)
      } catch (error) {
        console.error("Failed to load orders:", error)
        toast({
          title: "Fout bij laden",
          description: "Er is een fout opgetreden bij het laden van bestellingen.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (isLoggedIn) {
      loadOrders()
    }
  }, [isLoggedIn])

  // Groepeer bestellingen op maat en kleur
  const groupOrdersBySizeAndColor = (orderList: Order[]) => {
    // Filter alleen betaalde bestellingen
    const paidOrders = orderList.filter((order) => order.status === "betaald")

    // Groepeer op kleur, maat en crew status
    const grouped: Record<string, GroupedOrder> = {}

    paidOrders.forEach((order) => {
      const key = `${order.color}-${order.size}-${order.isCrew ? "crew" : "regular"}`
      const quantity = order.quantity || 1

      if (!grouped[key]) {
        grouped[key] = {
          color: order.color,
          size: order.size,
          count: 0,
          isCrew: !!order.isCrew,
        }
      }

      // Voeg de quantity toe in plaats van altijd 1
      grouped[key].count += quantity
    })

    // Converteer naar array en sorteer
    const groupedArray = Object.values(grouped).sort((a, b) => {
      // Sorteer eerst op crew/regular
      if (a.isCrew !== b.isCrew) return a.isCrew ? -1 : 1

      // Dan op kleur
      if (a.color !== b.color) return a.color.localeCompare(b.color)

      // Dan op maat (speciale sortering voor maten)
      const sizeOrder = { s: 1, m: 2, l: 3, xl: 4, xxl: 5, xxxl: 6 }
      const aSize = a.size.toLowerCase()
      const bSize = b.size.toLowerCase()

      return (sizeOrder[aSize as keyof typeof sizeOrder] || 99) - (sizeOrder[bSize as keyof typeof sizeOrder] || 99)
    })

    setGroupedOrders(groupedArray)
  }

  // Filter orders when search term or status filter changes
  useEffect(() => {
    let result = orders

    if (searchTerm) {
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.phone.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter)
    }

    setFilteredOrders(result)
  }, [orders, searchTerm, statusFilter])

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoginError("")

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success) {
        setIsLoggedIn(true)
      } else {
        setLoginError("Ongeldige inloggegevens")
      }
    } catch (error) {
      console.error("Login error:", error)
      setLoginError("Er is een fout opgetreden bij het inloggen")
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      })

      setIsLoggedIn(false)
      router.push("/admin")
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Fout bij uitloggen",
        description: "Er is een fout opgetreden bij het uitloggen.",
        variant: "destructive",
      })
    }
  }

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderToUpdate = orders.find((order) => order.id === orderId)

      if (orderToUpdate) {
        const updatedOrder = { ...orderToUpdate, status: newStatus }

        // Update via server action
        await updateOrder(updatedOrder)

        // Update local state
        const updatedOrders = orders.map((order) => (order.id === orderId ? updatedOrder : order))

        setOrders(updatedOrders)
        groupOrdersBySizeAndColor(updatedOrders)

        // Toon een melding op basis van de nieuwe status
        if (newStatus === "betaald") {
          toast({
            title: "Betaling geregistreerd",
            description: `Bestelling ${orderId} is gemarkeerd als betaald en toegevoegd aan de bestellijst.`,
          })
        } else {
          toast({
            title: "Status bijgewerkt",
            description: `Bestelling ${orderId} is nu ${newStatus}`,
          })
        }
      }
    } catch (error) {
      console.error("Failed to update order status:", error)
      toast({
        title: "Fout bij bijwerken",
        description: "Er is een fout opgetreden bij het bijwerken van de status.",
        variant: "destructive",
      })
    }
  }

  // Update status voor alle bestellingen met hetzelfde orderId
  const handleUpdateOrderGroupStatus = async (orderId: string, newStatus: string) => {
    try {
      // Update via server action
      await updateOrderStatus(orderId, newStatus)

      // Update local state
      const updatedOrders = orders.map((order) => {
        if (order.orderId === orderId) {
          return { ...order, status: newStatus }
        }
        return order
      })

      setOrders(updatedOrders)
      setFilteredOrders(updatedOrders.filter((order) => statusFilter === "all" || order.status === statusFilter))
      groupOrdersBySizeAndColor(updatedOrders)

      toast({
        title: "Status bijgewerkt",
        description: `Alle bestellingen met ordernummer ${orderId} zijn bijgewerkt naar ${newStatus}.`,
      })
    } catch (error) {
      console.error("Failed to update order group status:", error)
      toast({
        title: "Fout bij bijwerken",
        description: "Er is een fout opgetreden bij het bijwerken van de status.",
        variant: "destructive",
      })
    }
  }

  // Markeer bestelling als besteld bij leverancier
  const markAsOrderedFromSupplier = async (orderId: string) => {
    try {
      const orderToUpdate = orders.find((order) => order.id === orderId)

      if (orderToUpdate) {
        const updatedOrder = {
          ...orderToUpdate,
          orderedFromSupplier: !orderToUpdate.orderedFromSupplier,
          status: !orderToUpdate.orderedFromSupplier ? "besteld" : orderToUpdate.status,
        }

        // Update via server action
        await updateOrder(updatedOrder)

        // Update local state
        const updatedOrders = orders.map((order) => (order.id === orderId ? updatedOrder : order))

        setOrders(updatedOrders)

        toast({
          title: updatedOrder.orderedFromSupplier ? "Besteld bij leverancier" : "Markering verwijderd",
          description: updatedOrder.orderedFromSupplier
            ? `Bestelling ${orderId} is gemarkeerd als besteld bij leverancier.`
            : `Bestelling ${orderId} is niet meer gemarkeerd als besteld bij leverancier.`,
        })
      }
    } catch (error) {
      console.error("Failed to update supplier order status:", error)
      toast({
        title: "Fout bij bijwerken",
        description: "Er is een fout opgetreden bij het bijwerken van de leveranciersstatus.",
        variant: "destructive",
      })
    }
  }

  // Markeer alle bestellingen met hetzelfde orderId als besteld bij leverancier
  const markOrderGroupAsOrderedFromSupplier = async (orderId: string) => {
    try {
      // Haal alle bestellingen op met dit orderId
      const orderGroup = orders.filter((order) => order.orderId === orderId)

      // Update elke bestelling in de groep
      for (const order of orderGroup) {
        const updatedOrder = {
          ...order,
          orderedFromSupplier: true,
          status: "besteld",
        }

        // Update via server action
        await updateOrder(updatedOrder)
      }

      // Update local state
      const updatedOrders = orders.map((order) => {
        if (order.orderId === orderId) {
          return {
            ...order,
            orderedFromSupplier: true,
            status: "besteld",
          }
        }
        return order
      })

      setOrders(updatedOrders)
      setFilteredOrders(updatedOrders.filter((order) => statusFilter === "all" || order.status === statusFilter))

      toast({
        title: "Besteld bij leverancier",
        description: `Alle bestellingen met ordernummer ${orderId} zijn gemarkeerd als besteld bij leverancier.`,
      })
    } catch (error) {
      console.error("Failed to update supplier order status for group:", error)
      toast({
        title: "Fout bij bijwerken",
        description: "Er is een fout opgetreden bij het bijwerken van de leveranciersstatus.",
        variant: "destructive",
      })
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Copy order ID to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    setTimeout(() => setCopiedId(null), 2000)

    toast({
      title: "Gekopieerd!",
      description: "ID is gekopieerd naar je klembord.",
    })
  }

  // Print de bestellijst
  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML
      const originalContents = document.body.innerHTML

      document.body.innerHTML = `
    <html>
      <head>
        <title>YoungRidersOost Bestellijst</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 1.5cm;
            }
          }
          
          body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.5;
          }
          
          .print-container {
            max-width: 100%;
            margin: 0 auto;
          }
          
          .print-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #1e40af;
          }
          
          .logo {
            font-size: 26px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
          }
          
          .subtitle {
            font-size: 16px;
            color: #666;
          }
          
          h1 {
            font-size: 22px;
            color: #1e40af;
            text-align: center;
            margin: 20px 0;
          }
          
          h2 {
            font-size: 18px;
            color: #1e40af;
            margin: 15px 0;
          }
          
          h3 {
            font-size: 16px;
            color: #1e40af;
            margin: 10px 0;
          }
          
          .summary-info {
            background-color: #f5f7ff;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
            border: 1px solid #dde5fd;
          }
          
          .summary-info p {
            margin: 5px 0;
            font-size: 14px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 14px;
          }
          
          th {
            background-color: #f0f4ff;
            color: #1e40af;
            font-weight: bold;
            text-align: left;
            padding: 10px;
            border: 1px solid #dde5fd;
          }
          
          td {
            padding: 10px;
            border: 1px solid #dde5fd;
            vertical-align: top;
          }
          
          tr:nth-child(even) {
            background-color: #f9faff;
          }
          
          .crew-row {
            background-color: #effaf0;
          }
          
          .table-footer {
            background-color: #f0f4ff;
            font-weight: bold;
          }
          
          .totals {
            margin-top: 20px;
            padding: 15px;
            background-color: #f5f7ff;
            border: 1px solid #dde5fd;
            border-radius: 6px;
          }
          
          .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
          }
          
          .grid > div {
            background-color: white;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid #dde5fd;
            text-align: center;
          }
          
          .uppercase {
            text-transform: uppercase;
            font-size: 12px;
            color: #666;
          }
          
          .text-3xl {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin: 5px 0;
          }
          
          .text-green-600 {
            color: #059669;
          }
          
          .text-xs {
            font-size: 11px;
            color: #999;
          }
          
          .print-footer {
            margin-top: 40px;
            font-size: 12px;
            color: #666;
            text-align: center;
            border-top: 1px solid #dde5fd;
            padding-top: 20px;
          }
          
          .print-date {
            font-style: italic;
            margin-top: 10px;
          }
          
          /* Hide all shadow effects when printing */
          @media print {
            .shadow-sm, .shadow, .shadow-md, .shadow-lg {
              box-shadow: none !important;
            }
            
            /* Ensure page breaks don't happen in the middle of items */
            tr {
              page-break-inside: avoid;
            }
            
            .totals {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="print-header">
            <div class="logo">YoungRidersOost</div>
            <div class="subtitle">Officiële Merchandise - Bestellijst voor Leverancier</div>
          </div>
          
          <h1>Samenvatting Betaalde Bestellingen</h1>
          
          ${printContents}
          
          <div class="print-footer">
            <div>YoungRidersOost Bestellijst</div>
            <div class="print-date">Afgedrukt op: ${new Date().toLocaleDateString("nl-NL", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</div>
          </div>
        </div>
      </body>
    </html>
  `

      window.print()
      document.body.innerHTML = originalContents

      // Herlaad de pagina na het printen om de state te herstellen
      window.location.reload()
    }
  }

  // Bereken totalen voor de samenvatting
  const calculateTotals = () => {
    const totalItems = groupedOrders.reduce((sum, group) => sum + group.count, 0)
    const crewItems = groupedOrders.filter((g) => g.isCrew).reduce((sum, group) => sum + group.count, 0)
    const regularItems = totalItems - crewItems

    return { totalItems, crewItems, regularItems }
  }

  // Vertaal kleurnamen naar Nederlands
  const translateColor = (color: string) => {
    const colorMap: Record<string, string> = {
      lilac: "Lila",
      "ocean-blue": "Oceaanblauw",
      burgundy: "Bordeauxrood",
      black: "Zwart",
      olive: "Olijfgroen",
    }

    return colorMap[color] || color
  }

  // Groepeer bestellingen op orderId
  const getOrderGroups = () => {
    const orderGroups: Record<string, Order[]> = {}

    orders.forEach((order) => {
      if (!orderGroups[order.orderId]) {
        orderGroups[order.orderId] = []
      }
      orderGroups[order.orderId].push(order)
    })

    // Sorteer op datum (nieuwste eerst)
    return Object.entries(orderGroups)
      .map(([orderId, orders]) => {
        // Tel het totale aantal items op basis van quantity
        const totalItems = orders.reduce((sum, order) => sum + (order.quantity || 1), 0)

        return {
          orderId,
          orders,
          date: orders[0].date,
          status: orders[0].status,
          customer: orders[0].name,
          totalItems: totalItems,
          totalPrice: orders.reduce((sum, order) => sum + order.price * (order.quantity || 1), 0),
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  // Show loading state while checking session
  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/20 p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Log in om bestellingen te beheren</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Fout</AlertTitle>
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Gebruikersnaam
                </label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Wachtwoord
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Inloggen
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { totalItems, crewItems, regularItems } = calculateTotals()
  const orderGroups = getOrderGroups()

  return (
    <div className="container mx-auto p-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>YoungRidersOost Admin Panel</CardTitle>
              <CardDescription>Beheer alle bestellingen</CardDescription>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Uitloggen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="order-groups" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="order-groups" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Bestellingen
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Bestellijst
              </TabsTrigger>
            </TabsList>

            <TabsContent value="order-groups">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Zoek op ID, naam, email of telefoon"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-64">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter op status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle statussen</SelectItem>
                      <SelectItem value="nieuw">Nieuw</SelectItem>
                      <SelectItem value="betaald">Betaald</SelectItem>
                      <SelectItem value="besteld">Besteld bij leverancier</SelectItem>
                      <SelectItem value="verzonden">Verzonden</SelectItem>
                      <SelectItem value="afgehaald">Afgehaald</SelectItem>
                      <SelectItem value="geannuleerd">Geannuleerd</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableCaption>Bestellingen gegroepeerd op bestelnummer</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Klant</TableHead>
                        <TableHead>Datum</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aantal items</TableHead>
                        <TableHead>Totaalbedrag</TableHead>
                        <TableHead className="text-right">Acties</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderGroups.length > 0 ? (
                        orderGroups
                          .filter(
                            (group) =>
                              statusFilter === "all" ||
                              group.status === statusFilter ||
                              group.orders.some((order) => order.status === statusFilter),
                          )
                          .filter(
                            (group) =>
                              !searchTerm ||
                              group.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              group.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              group.orders.some(
                                (order) =>
                                  order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  order.phone.toLowerCase().includes(searchTerm.toLowerCase()),
                              ),
                          )
                          .map((group) => (
                            <TableRow key={group.orderId}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-1">
                                  <span>{group.orderId}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => copyToClipboard(group.orderId)}
                                  >
                                    {copiedId === group.orderId ? (
                                      <Check className="h-3 w-3" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>{group.customer}</TableCell>
                              <TableCell>{formatDate(group.date)}</TableCell>
                              <TableCell>
                                <div
                                  className={`text-sm rounded-md px-2 py-1 text-white text-center ${
                                    group.status === "nieuw"
                                      ? "bg-blue-500"
                                      : group.status === "betaald"
                                        ? "bg-green-500"
                                        : group.status === "besteld"
                                          ? "bg-yellow-500"
                                          : group.status === "verzonden"
                                            ? "bg-purple-500"
                                            : group.status === "afgehaald"
                                              ? "bg-green-700"
                                              : "bg-red-500"
                                  }`}
                                >
                                  {group.status === "nieuw"
                                    ? "Nieuw"
                                    : group.status === "betaald"
                                      ? "Betaald"
                                      : group.status === "besteld"
                                        ? "Besteld bij leverancier"
                                        : group.status === "verzonden"
                                          ? "Verzonden"
                                          : group.status === "afgehaald"
                                            ? "Afgehaald"
                                            : "Geannuleerd"}
                                </div>
                              </TableCell>
                              <TableCell>{group.totalItems}</TableCell>
                              <TableCell>€{group.totalPrice.toFixed(2)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => router.push(`/admin/order-details/${group.orderId}`)}
                                  >
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    Details
                                  </Button>

                                  <div className="flex flex-col gap-1">
                                    <Button
                                      size="sm"
                                      variant={group.status === "betaald" ? "default" : "outline"}
                                      onClick={() => handleUpdateOrderGroupStatus(group.orderId, "betaald")}
                                      className="flex items-center"
                                    >
                                      <CreditCard className="h-4 w-4 mr-1" />
                                      Betaald
                                    </Button>

                                    <Button
                                      size="sm"
                                      variant={group.status === "besteld" ? "default" : "outline"}
                                      onClick={() => markOrderGroupAsOrderedFromSupplier(group.orderId)}
                                      className="flex items-center"
                                    >
                                      <Package className="h-4 w-4 mr-1" />
                                      Besteld
                                    </Button>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            Geen bestellingen gevonden
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="mt-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Bestellingen per Order ID</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">
                      Bestellingen worden nu gegroepeerd op bestelnummer. Klik op "Details" om alle items in een
                      bestelling te bekijken.
                    </p>
                    <p>
                      Je kunt de status van alle items in een bestelling tegelijk bijwerken met de knoppen "Betaald" en
                      "Besteld".
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="summary">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold">Bestellijst voor Leverancier</h2>
                <Button onClick={handlePrint} className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Afdrukken
                </Button>
              </div>

              <div className="bg-card p-4 rounded-md border" ref={printRef}>
                <PrintTable
                  groupedOrders={groupedOrders}
                  totalItems={totalItems}
                  crewItems={crewItems}
                  regularItems={regularItems}
                />
              </div>

              <div className="mt-6">
                <Alert className="bg-secondary/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Bestellijst Instructies</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">
                      Deze lijst toont alle betaalde bestellingen gegroepeerd per type, kleur en maat.
                    </p>
                    <p className="mb-2">
                      Gebruik de "Afdrukken" knop om een printbare versie te genereren voor je leverancier.
                    </p>
                    <p>
                      Markeer bestellingen als "Besteld" in het bestellingenoverzicht nadat je ze bij de leverancier
                      hebt besteld.
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Totaal aantal bestellingen: {filteredOrders.length}</p>
          </div>
        </CardFooter>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Link href="/admin/site-settings">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" /> Website Instellingen
              </CardTitle>
              <CardDescription>Beheer de status van de website</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Zet de website in onderhoudsmodus of sluit de webshop voor nieuwe bestellingen.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Instellingen Beheren</Button>
            </CardFooter>
          </Card>
        </Link>

        <Link href="/admin/site-settings">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-500" /> Onderhoudsmodus
              </CardTitle>
              <CardDescription>Zet de site in onderhoudsmodus</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Activeer onderhoudsmodus om tijdelijk alle toegang tot de website te blokkeren met een wachtwoord.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">
                Onderhoudsmodus Beheren
              </Button>
            </CardFooter>
          </Card>
        </Link>

        <Link href="/admin/site-settings">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCartOff className="h-5 w-5 text-destructive" /> Webshop Sluiten
              </CardTitle>
              <CardDescription>Tijdelijk sluiten voor bestellingen</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sluit alleen de webshop voor nieuwe bestellingen, terwijl de rest van de site toegankelijk blijft.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">
                Webshop Status Beheren
              </Button>
            </CardFooter>
          </Card>
        </Link>
      </div>
    </div>
  )
}

