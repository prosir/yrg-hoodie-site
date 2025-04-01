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
import { AlertCircle, Copy, Check, Printer, FileText, ShoppingBag, Truck } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getAllOrders, updateOrder } from "@/lib/db"
import type { Order } from "@/lib/db"
import { TrackingDialog } from "@/components/tracking-dialog"

// Voeg de import toe aan het begin van het bestand
import { PrintTable } from "@/components/print-table"

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
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

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

      if (!grouped[key]) {
        grouped[key] = {
          color: order.color,
          size: order.size,
          count: 0,
          isCrew: !!order.isCrew,
        }
      }

      grouped[key].count += 1
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
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple admin authentication - in a real app, this would be handled securely on the server
    if (username === "admin" && password === "youngriders2025") {
      setIsLoggedIn(true)
      setLoginError("")
    } else {
      setLoginError("Ongeldige inloggegevens")
    }
  }

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
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

  // Markeer bestelling als besteld bij leverancier
  const markAsOrderedFromSupplier = async (orderId: string) => {
    try {
      const orderToUpdate = orders.find((order) => order.id === orderId)

      if (orderToUpdate) {
        const updatedOrder = {
          ...orderToUpdate,
          orderedFromSupplier: !orderToUpdate.orderedFromSupplier,
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

  // Open tracking dialog
  const openTrackingDialog = (order: Order) => {
    setSelectedOrder(order)
    setTrackingDialogOpen(true)
  }

  // Handle tracking update success
  const handleTrackingSuccess = (updatedOrder: Order) => {
    // Update orders array with the updated order
    const updatedOrders = orders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
    setOrders(updatedOrders)
    setFilteredOrders(updatedOrders.filter((order) => statusFilter === "all" || order.status === statusFilter))
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
            
            .crew-row {
              background-color: #effaf0;
            }
            
            .table-footer {
              background-color: #f0f4ff;
              font-weight: bold;
            }
            
            .totals {
              margin-top: 20px;
              border-top: 1px solid #dde5fd;
              padding-top: 10px;
            }
            
            .totals-table {
              width: 60%;
              margin: 0 0 0 auto;
              border-collapse: collapse;
            }
            
            .totals-table td {
              padding: 8px;
              border: 1px solid #dde5fd;
            }
            
            .totals-table td:first-child {
              text-align: right;
              font-weight: bold;
              width: 70%;
            }
            
            .totals-table td:last-child {
              text-align: center;
              width: 30%;
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
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="print-header">
              <div class="logo">YoungRidersOost</div>
              <div class="subtitle">Officiële Merchandise - Bestellijst voor Leverancier</div>
            </div>
            
            <h1>Samenvatting Betaalde Bestellingen</h1>
            
            <div class="summary-info">
              <p>Deze lijst bevat alle betaalde bestellingen gegroepeerd per type, kleur en maat.</p>
              <p>Gebruik deze lijst om alle benodigde hoodies bij de leverancier te bestellen.</p>
            </div>
            
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

  return (
    <div className="container mx-auto p-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>YoungRidersOost Admin Panel</CardTitle>
              <CardDescription>Beheer alle bestellingen</CardDescription>
            </div>
            <Button onClick={() => setIsLoggedIn(false)} variant="outline">
              Uitloggen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="orders" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Bestellingen
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Bestellijst
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
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
                    <TableCaption>
                      Handmatige verwerking van bestellingen - Sturen Tikkies & Verzend Tracking
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Order ID</TableHead>
                        <TableHead className="w-[150px]">Datum</TableHead>
                        <TableHead>Klant</TableHead>
                        <TableHead className="w-[100px]">Telefoon</TableHead>
                        <TableHead className="w-[100px]">Kleur/Maat</TableHead>
                        <TableHead className="w-[100px]">Prijs</TableHead>
                        <TableHead className="w-[150px]">Status</TableHead>
                        <TableHead className="text-right">Acties</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                          <TableRow key={order.id} className={order.orderedFromSupplier ? "bg-blue-50" : ""}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-1">
                                <span>{order.id}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => copyToClipboard(order.id)}
                                >
                                  {copiedId === order.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(order.date)}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{order.name}</div>
                                <div className="text-sm text-muted-foreground">{order.email}</div>
                                <div className="text-xs text-muted-foreground">
                                  {order.delivery === "pickup" ? "Ophalen" : "Verzenden"}
                                  {order.address && `: ${order.address}`}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs"
                                onClick={() =>
                                  window.open(
                                    `https://wa.me/31${order.phone.replace(/[^0-9]/g, "")}?text=Hallo ${order.name}, bedankt voor je YoungRidersOost bestelling. Je ordernummer is ${order.id}.`,
                                    "_blank",
                                  )
                                }
                              >
                                {order.phone}
                              </Button>
                            </TableCell>
                            <TableCell>
                              {translateColor(order.color)}
                              <br />
                              <span className="text-sm text-muted-foreground">Maat: {order.size.toUpperCase()}</span>
                            </TableCell>
                            <TableCell>€{order.price.toFixed(2)}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <div
                                  className={`text-sm rounded-md px-2 py-1 text-white ${
                                    order.status === "nieuw"
                                      ? "bg-blue-500"
                                      : order.status === "betaald"
                                        ? "bg-green-500"
                                        : order.status === "verzonden"
                                          ? "bg-purple-500"
                                          : order.status === "afgehaald"
                                            ? "bg-green-700"
                                            : "bg-red-500"
                                  }`}
                                >
                                  {order.status === "nieuw"
                                    ? "Nieuw"
                                    : order.status === "betaald"
                                      ? "Betaald"
                                      : order.status === "verzonden"
                                        ? "Verzonden"
                                        : order.status === "afgehaald"
                                          ? "Afgehaald"
                                          : "Geannuleerd"}
                                </div>
                                <div className="flex gap-1">
                                  {order.isCrew && (
                                    <div className="text-xs bg-yellow-500 text-white rounded-md px-2 py-1">CREW</div>
                                  )}
                                  {order.orderedFromSupplier && (
                                    <div className="text-xs bg-blue-500 text-white rounded-md px-2 py-1">BESTELD</div>
                                  )}
                                  {order.trackingNumber && (
                                    <div className="text-xs bg-green-600 text-white rounded-md px-2 py-1">TRACKING</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant={order.status === "betaald" ? "default" : "outline"}
                                  onClick={() => updateOrderStatus(order.id, "betaald")}
                                >
                                  Betaald
                                </Button>

                                {order.delivery === "shipping" ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant={order.status === "verzonden" ? "default" : "outline"}
                                      onClick={() => updateOrderStatus(order.id, "verzonden")}
                                    >
                                      Verzonden
                                    </Button>

                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="bg-green-50 hover:bg-green-100 border-green-200"
                                      onClick={() => openTrackingDialog(order)}
                                    >
                                      <Truck className="h-4 w-4 mr-1" />
                                      {order.trackingNumber ? "Tracking" : "DHL"}
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant={order.status === "afgehaald" ? "default" : "outline"}
                                    onClick={() => updateOrderStatus(order.id, "afgehaald")}
                                  >
                                    Afgehaald
                                  </Button>
                                )}

                                {order.status === "betaald" && (
                                  <Button
                                    size="sm"
                                    variant={order.orderedFromSupplier ? "default" : "outline"}
                                    className={order.orderedFromSupplier ? "bg-blue-500 hover:bg-blue-600" : ""}
                                    onClick={() => markAsOrderedFromSupplier(order.id)}
                                  >
                                    Besteld
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
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
                  <AlertTitle>Server Opslag & DHL Tracking</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">
                      Bestellingen worden nu opgeslagen op de server in plaats van in de browser. Dit betekent dat de
                      gegevens beschikbaar zijn vanaf elk apparaat en niet verloren gaan wanneer de browser cache wordt
                      gewist.
                    </p>
                    <p>
                      Je kunt nu ook DHL tracking nummers toevoegen aan verzonden bestellingen en deze direct via
                      WhatsApp naar klanten sturen.
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

      {/* Tracking Dialog */}
      {selectedOrder && (
        <TrackingDialog
          order={selectedOrder}
          isOpen={trackingDialogOpen}
          onClose={() => setTrackingDialogOpen(false)}
          onSuccess={handleTrackingSuccess}
        />
      )}
    </div>
  )
}

