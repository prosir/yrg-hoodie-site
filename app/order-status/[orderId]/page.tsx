"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, Package, Truck, CreditCard, ShoppingBag, Calendar, Phone, Mail, ExternalLink } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getOrdersByOrderId, getOrderTotal } from "@/lib/db"
import type { Order } from "@/lib/db"

// Vervang de OrderProgressBar component met een eenvoudigere versie zonder voortgangsbalk
function OrderProgressBar({ status }: { status: string }) {
  // Bepaal de voortgang op basis van de status
  const getProgress = () => {
    switch (status) {
      case "nieuw":
        return 1
      case "betaald":
        return 2
      case "besteld":
        return 3
      case "verzonden":
      case "afgehaald":
        return 4
      default:
        return 1
    }
  }

  const progress = getProgress()

  return (
    <div className="w-full py-8">
      <div className="flex justify-between items-center">
        {/* Stap 1: Bestelling geplaatst */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
              progress >= 1 ? "bg-primary text-white shadow-lg" : "bg-gray-200 text-gray-400"
            }`}
          >
            <div className={`${progress === 1 ? "animate-pulse" : ""}`}>
              <ShoppingBag className="h-5 w-5" />
            </div>
            {progress === 1 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            )}
          </div>
          <span className="text-xs mt-2 text-center font-medium">
            Bestelling
            <br />
            geplaatst
          </span>
        </div>

        {/* Stap 2: Betaling ontvangen */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
              progress >= 2 ? "bg-primary text-white shadow-lg" : "bg-gray-200 text-gray-400"
            }`}
          >
            <div className={`${progress === 2 ? "animate-pulse" : ""}`}>
              <CreditCard className="h-5 w-5" />
            </div>
            {progress === 2 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            )}
          </div>
          <span className="text-xs mt-2 text-center font-medium">
            Betaling
            <br />
            ontvangen
          </span>
        </div>

        {/* Stap 3: Bestelling bij leverancier */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
              progress >= 3 ? "bg-primary text-white shadow-lg" : "bg-gray-200 text-gray-400"
            }`}
          >
            <div className={`${progress === 3 ? "animate-pulse" : ""}`}>
              <Package className="h-5 w-5" />
            </div>
            {progress === 3 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            )}
          </div>
          <span className="text-xs mt-2 text-center font-medium">
            Besteld bij
            <br />
            leverancier
          </span>
        </div>

        {/* Stap 4: Verzonden/Afgehaald */}
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
              progress >= 4 ? "bg-primary text-white shadow-lg" : "bg-gray-200 text-gray-400"
            }`}
          >
            <div className={`${progress === 4 ? "animate-pulse" : ""}`}>
              <Truck className="h-5 w-5" />
            </div>
            {progress === 4 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            )}
          </div>
          <span className="text-xs mt-2 text-center font-medium">
            Verzonden/
            <br />
            Afgehaald
          </span>
        </div>
      </div>
    </div>
  )
}

export default function OrderStatusPage({ params }: { params: { orderId: string } }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const { orderId } = params

  useEffect(() => {
    async function loadOrderData() {
      try {
        setLoading(true)
        console.log("Laden van bestellingsgegevens voor orderId:", orderId)

        // Haal alle bestellingen op met dit orderId
        const orderData = await getOrdersByOrderId(orderId)
        console.log("Opgehaalde bestellingen:", orderData)
        setOrders(orderData)

        // Bereken het totaalbedrag
        const total = await getOrderTotal(orderId)
        console.log("Berekend totaalbedrag:", total)
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

  // Vertaal status naar Nederlands
  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      nieuw: "Bestelling geplaatst",
      betaald: "Betaling ontvangen",
      besteld: "Besteld bij leverancier",
      verzonden: "Verzonden",
      afgehaald: "Afgehaald",
      geannuleerd: "Geannuleerd",
    }

    return statusMap[status] || status
  }

  // Bepaal de status kleur
  const getStatusColor = (status: string) => {
    switch (status) {
      case "nieuw":
        return "bg-blue-100 text-blue-800"
      case "betaald":
        return "bg-green-100 text-green-800"
      case "besteld":
        return "bg-yellow-100 text-yellow-800"
      case "verzonden":
        return "bg-purple-100 text-purple-800"
      case "afgehaald":
        return "bg-green-100 text-green-800"
      case "geannuleerd":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Formateer datum
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Navigatie balk */}
        <header className="border-b py-6 mb-8">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary">YoungRidersOost</h1>
            </Link>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <nav>
                <ul className="flex space-x-6">
                  <li>
                    <Link href="/#hoodies" className="text-muted-foreground hover:text-primary transition-colors">
                      Hoodies
                    </Link>
                  </li>
                  <li>
                    <Link href="/#info" className="text-muted-foreground hover:text-primary transition-colors">
                      Info
                    </Link>
                  </li>
                  <li>
                    <Link href="/#crew" className="text-muted-foreground hover:text-primary transition-colors">
                      Crew
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </header>

        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Navigatie balk */}
        <header className="border-b py-6 mb-8">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary">YoungRidersOost</h1>
            </Link>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <nav>
                <ul className="flex space-x-6">
                  <li>
                    <Link href="/#hoodies" className="text-muted-foreground hover:text-primary transition-colors">
                      Hoodies
                    </Link>
                  </li>
                  <li>
                    <Link href="/#info" className="text-muted-foreground hover:text-primary transition-colors">
                      Info
                    </Link>
                  </li>
                  <li>
                    <Link href="/#crew" className="text-muted-foreground hover:text-primary transition-colors">
                      Crew
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </header>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Bestelling niet gevonden</AlertTitle>
          <AlertDescription>
            We konden geen bestelling vinden met dit bestelnummer. Controleer of je het juiste bestelnummer hebt
            ingevoerd.
          </AlertDescription>
        </Alert>

        <Button onClick={() => router.push("/")} className="w-full mt-6">
          Terug naar de homepage
        </Button>
      </div>
    )
  }

  // Haal klantgegevens uit de eerste bestelling
  const customerInfo = orders[0]
  const orderStatus = customerInfo.status

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Navigatie balk */}
      <header className="border-b py-6 mb-8">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary">YoungRidersOost</h1>
          </Link>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <Link href="/#hoodies" className="text-muted-foreground hover:text-primary transition-colors">
                    Hoodies
                  </Link>
                </li>
                <li>
                  <Link href="/#info" className="text-muted-foreground hover:text-primary transition-colors">
                    Info
                  </Link>
                </li>
                <li>
                  <Link href="/#crew" className="text-muted-foreground hover:text-primary transition-colors">
                    Crew
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <Card className="mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold">Bestelling {orderId}</h1>
              <p className="text-sm text-muted-foreground">Geplaatst op {formatDate(customerInfo.date)}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderStatus)}`}>
              {translateStatus(orderStatus)}
            </div>
          </div>
        </div>
        <CardContent className="pt-6">
          {/* Voortgangsbalk */}
          <OrderProgressBar status={orderStatus} />

          <div className="mt-6 space-y-6">
            {/* Klantgegevens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-secondary/20 p-4 rounded-md">
                <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Contactgegevens
                </h3>
                <p className="text-sm">{customerInfo.name}</p>
                <p className="text-sm flex items-center gap-1 mt-1">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  {customerInfo.email}
                </p>
                <p className="text-sm flex items-center gap-1 mt-1">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  {customerInfo.phone}
                </p>
              </div>

              <div className="bg-secondary/20 p-4 rounded-md">
                <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Bestelgegevens
                </h3>
                <p className="text-sm">Bestelnummer: {orderId}</p>
                <p className="text-sm">Datum: {formatDate(customerInfo.date)}</p>
                <p className="text-sm">Bezorging: {customerInfo.delivery === "pickup" ? "Ophalen" : "Verzenden"}</p>
                {customerInfo.delivery === "shipping" && <p className="text-sm mt-1">Adres: {customerInfo.address}</p>}
              </div>
            </div>

            {/* Bestelde producten */}
            <div>
              <h3 className="text-sm font-medium mb-2">Bestelde producten</h3>
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
                  {/* Groepeer items per kleur en maat */}
                  {Object.values(
                    orders.reduce<Record<string, { order: Order; count: number }>>((acc, order) => {
                      const key = `${order.color}-${order.size}-${order.delivery}`
                      if (!acc[key]) {
                        acc[key] = { order, count: order.quantity || 1 }
                      } else {
                        acc[key].count += order.quantity || 1
                      }
                      return acc
                    }, {}),
                  ).map(({ order, count }, index) => (
                    <TableRow key={index}>
                      <TableCell>{translateColor(order.color)} Hoodie</TableCell>
                      <TableCell>{order.size.toUpperCase()}</TableCell>
                      <TableCell>{count}</TableCell>
                      <TableCell>{order.delivery === "pickup" ? "Ophalen" : "Verzenden"}</TableCell>
                      <TableCell className="text-right">€{(order.price * count).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-between items-center mt-4 p-3 bg-secondary/30 rounded-md">
                <span className="font-medium">Totaalbedrag:</span>
                <span className="font-bold">€{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Status updates */}
            <div>
              <h3 className="text-sm font-medium mb-2">Status updates</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-md">
                  <div className="relative">
                    <ShoppingBag className="h-5 w-5 text-blue-500 mt-0.5" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-blue-700">Bestelling geplaatst</p>
                    <p className="text-sm text-blue-600">{formatDate(customerInfo.date)}</p>
                  </div>
                </div>

                {orderStatus === "betaald" ||
                orderStatus === "besteld" ||
                orderStatus === "verzonden" ||
                orderStatus === "afgehaald" ? (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-md">
                    <div className="relative">
                      <CreditCard className="h-5 w-5 text-green-500 mt-0.5" />
                      {orderStatus === "betaald" && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-green-700">Betaling ontvangen</p>
                      <p className="text-sm text-green-600">Je betaling is succesvol verwerkt</p>
                    </div>
                  </div>
                ) : null}

                {orderStatus === "besteld" || orderStatus === "verzonden" || orderStatus === "afgehaald" ? (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-md">
                    <div className="relative">
                      <Package className="h-5 w-5 text-yellow-500 mt-0.5" />
                      {orderStatus === "besteld" && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-yellow-700">Besteld bij leverancier</p>
                      <p className="text-sm text-yellow-600">Je bestelling is doorgegeven aan onze leverancier</p>
                    </div>
                  </div>
                ) : null}

                {orderStatus === "verzonden" || orderStatus === "afgehaald" ? (
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-md">
                    <div className="relative">
                      <Truck className="h-5 w-5 text-purple-500 mt-0.5" />
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-purple-700">
                        {orderStatus === "verzonden" ? "Verzonden" : "Afgehaald"}
                      </p>
                      <p className="text-sm text-purple-600">
                        {orderStatus === "verzonden" ? "Je bestelling is verzonden" : "Je bestelling is afgehaald"}
                      </p>
                      {customerInfo.trackingNumber && (
                        <div className="mt-2">
                          <p className="text-sm text-purple-600 mb-1">Tracking: {customerInfo.trackingNumber}</p>
                          <a
                            href={`https://vintedgo.com/nl/tracking/${customerInfo.trackingNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-md transition-colors"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Volg je pakket
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-secondary/10 border-t p-4">
          <Button onClick={() => router.push("/")} className="w-full">
            Terug naar de homepage
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

