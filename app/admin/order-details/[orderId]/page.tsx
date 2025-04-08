"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowLeft, Phone, Mail, MapPin, FileText, Copy, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getOrdersByOrderId, getOrderTotal, updateOrderStatus } from "@/lib/db"
import type { Order } from "@/lib/db"
import { TrackingDialog } from "@/components/tracking-dialog"
import { OrderActionButtons } from "@/components/order-action-buttons"

export default function OrderDetailsPage({ params }: { params: { orderId: string } }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<string>("")
  const [updating, setUpdating] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { orderId } = params

  // Voeg deze state toe binnen de component
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Voeg deze functies toe binnen de component
  const openTrackingDialog = (order: Order) => {
    setSelectedOrder(order)
    setTrackingDialogOpen(true)
  }

  const handleTrackingSuccess = (updatedOrder: Order) => {
    // Update orders array with the updated order
    const updatedOrders = orders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
    setOrders(updatedOrders)
  }

  useEffect(() => {
    async function loadOrderData() {
      try {
        setLoading(true)
        // Haal alle bestellingen op met dit orderId
        const orderData = await getOrdersByOrderId(orderId)
        setOrders(orderData)

        // Stel de huidige status in
        if (orderData.length > 0) {
          setStatus(orderData[0].status)
        }

        // Bereken het totaalbedrag
        const total = await getOrderTotal(orderId)
        setTotalPrice(total)
      } catch (error) {
        console.error("Fout bij het laden van bestellingsgegevens:", error)
        toast({
          title: "Fout bij laden",
          description: "Er is een fout opgetreden bij het laden van de bestellingsgegevens.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadOrderData()
  }, [orderId, toast])

  // Vertaal kleurnamen naar Nederlands
  const translateColor = (color: string, colorName?: string) => {
    // If colorName is provided, use it
    if (colorName) return colorName

    const colorMap: Record<string, string> = {
      lilac: "Lila",
      "ocean-blue": "Oceaanblauw",
      burgundy: "Bordeauxrood",
      black: "Zwart",
      olive: "Olijfgroen",
    }

    return colorMap[color] || color
  }

  // Status bijwerken
  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true)
      await updateOrderStatus(orderId, newStatus)
      setStatus(newStatus)

      toast({
        title: "Status bijgewerkt",
        description: `De status van bestelling ${orderId} is bijgewerkt naar ${newStatus}.`,
      })

      // Update de orders array met de nieuwe status
      setOrders(orders.map((order) => ({ ...order, status: newStatus })))
    } catch (error) {
      console.error("Fout bij het bijwerken van de status:", error)
      toast({
        title: "Fout bij bijwerken",
        description: "Er is een fout opgetreden bij het bijwerken van de status.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    toast({
      title: "Gekopieerd!",
      description: "Tekst is gekopieerd naar je klembord.",
    })
  }

  // Genereer WhatsApp link
  const generateWhatsAppLink = () => {
    if (orders.length === 0) return "#"

    const customerInfo = orders[0]
    const phoneNumber = customerInfo.phone.replace(/[^0-9]/g, "")
    const statusUrl = `${window.location.origin}/order-status/${orderId}`
    const message = `Hallo ${customerInfo.name}, bedankt voor je bestelling bij YoungRidersOost! Je bestelnummer is ${orderId}. Het totaalbedrag is €${totalPrice.toFixed(2)}. Je ontvangt binnenkort een Tikkie betaalverzoek.

Bekijk je bestelling hier: ${statusUrl}`

    return `https://wa.me/31${phoneNumber}?text=${encodeURIComponent(message)}`
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto p-4 py-8">
        <Button variant="outline" onClick={() => router.push("/admin")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar admin
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Bestelling niet gevonden</AlertTitle>
          <AlertDescription>
            We konden geen bestelling vinden met dit bestelnummer. Controleer of je het juiste bestelnummer hebt
            ingevoerd.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Haal klantgegevens uit de eerste bestelling
  const customerInfo = orders[0]

  // Groepeer items per kleur en maat
  const groupedItems = Object.values(
    orders.reduce<Record<string, { order: Order; count: number }>>((acc, order) => {
      const key = `${order.color}-${order.size}-${order.delivery}`
      if (!acc[key]) {
        acc[key] = { order, count: order.quantity || 1 }
      } else {
        acc[key].count += order.quantity || 1
      }
      return acc
    }, {}),
  )

  return (
    <div className="container mx-auto p-4 py-8">
      <Button variant="outline" onClick={() => router.push("/admin")} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Terug naar admin
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Bestelling {orderId}
                  </CardTitle>
                  <CardDescription>Geplaatst op {new Date(customerInfo.date).toLocaleString("nl-NL")}</CardDescription>
                </div>
                <Badge
                  className={
                    status === "nieuw"
                      ? "bg-blue-500"
                      : status === "betaald"
                        ? "bg-green-500"
                        : status === "verzonden"
                          ? "bg-purple-500"
                          : status === "afgehaald"
                            ? "bg-green-700"
                            : "bg-red-500"
                  }
                >
                  {status === "nieuw"
                    ? "Nieuw"
                    : status === "betaald"
                      ? "Betaald"
                      : status === "verzonden"
                        ? "Verzonden"
                        : status === "afgehaald"
                          ? "Afgehaald"
                          : "Geannuleerd"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Klantgegevens
                  </h3>
                  <div className="bg-secondary/30 p-4 rounded-md">
                    <p className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Naam:</span>
                      {customerInfo.name}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-auto"
                        onClick={() => copyToClipboard(customerInfo.name)}
                      >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </p>
                    <p className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{customerInfo.email}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-auto"
                        onClick={() => copyToClipboard(customerInfo.email)}
                      >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{customerInfo.phone}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-auto"
                        onClick={() => copyToClipboard(customerInfo.phone)}
                      >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </p>
                    <div className="mt-4">
                      <a
                        href={generateWhatsAppLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-md text-sm hover:bg-green-600 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="white"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345z" />
                          <path d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.715 1.447h.006c9.6 0 16.028-9.174 16.028-16.012 0-4.23-1.986-8.072-5.565-10.334zm-5.518 22.311h-.005c-2.608-.001-5.17-.719-7.4-2.075l-.53-.315-5.49 1.431 1.456-5.283-.345-.552c-1.443-2.305-2.208-4.967-2.205-7.687.01-8.025 6.488-14.57 14.46-14.57 3.869 0 7.494 1.501 10.218 4.225 2.725 2.723 4.23 6.346 4.227 10.203-.006 8.018-6.484 14.563-14.385 14.563z" />
                        </svg>
                        WhatsApp bericht sturen
                      </a>
                    </div>
                  </div>
                </div>

                {customerInfo.delivery === "shipping" && (
                  <div>
                    <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Bezorgadres
                    </h3>
                    <div className="bg-secondary/30 p-4 rounded-md">
                      <p>{customerInfo.address}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-auto"
                        onClick={() => copyToClipboard(customerInfo.address)}
                      >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bestelde producten */}
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Bestelde producten
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Maat</TableHead>
                      <TableHead>Aantal</TableHead>
                      <TableHead>Bezorging</TableHead>
                      <TableHead className="text-right">Prijs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedItems.map(({ order, count }, index) => (
                      <TableRow key={index}>
                        <TableCell>{translateColor(order.color, order.colorName)} Hoodie</TableCell>
                        <TableCell>{order.size.toUpperCase()}</TableCell>
                        <TableCell>{count}</TableCell>
                        <TableCell>{order.delivery === "pickup" ? "Ophalen" : "Verzenden"}</TableCell>
                        <TableCell className="text-right">€{(order.price * count).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-between items-center mt-4 p-3 bg-secondary/50 rounded-md">
                  <span className="font-bold text-lg">Totaalbedrag:</span>
                  <span className="font-bold text-lg">€{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {customerInfo.notes && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Opmerkingen</h3>
                  <div className="bg-secondary/30 p-4 rounded-md">
                    <p>{customerInfo.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          {/* Nieuwe OrderActionButtons component */}
          <OrderActionButtons
            order={customerInfo}
            onStatusChange={handleStatusChange}
            onTrackingClick={() => openTrackingDialog(customerInfo)}
          />
        </div>
      </div>

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
