"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Copy, Check, Phone, Coins, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getOrdersByOrderId, getOrderTotal } from "@/lib/db"
import type { Order } from "@/lib/db"

export default function OrderConfirmationPage({ params }: { params: { orderId: string } }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const orderIdRef = useRef<HTMLParagraphElement>(null)
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

  const copyOrderId = () => {
    if (orderIdRef.current) {
      const text = orderIdRef.current.innerText
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      toast({
        title: "Gekopieerd!",
        description: "Bestelnummer is gekopieerd naar je klembord.",
      })
    }
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
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
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Alert className="bg-green-50 border-green-200 mb-6">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <AlertTitle className="text-xl font-bold text-green-700">Bestelling Succesvol Verzonden!</AlertTitle>
        <AlertDescription className="text-green-700">
          <p className="font-medium mb-2">Je bestelling is verzonden en wordt verwerkt.</p>
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Stuur je bestelnummer via WhatsApp
          </CardTitle>
          <CardDescription>
            Om je bestelling af te ronden, stuur het onderstaande bestelnummer naar 06-44947194 via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <div className="flex items-center justify-between p-5 bg-secondary rounded-md">
              <p ref={orderIdRef} className="text-2xl font-bold text-center text-primary">
                {orderId}
              </p>
              <Button variant="outline" onClick={copyOrderId} className="flex items-center gap-1">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Gekopieerd!" : "Kopieer"}
              </Button>
            </div>
          </div>

          <Alert variant="default" className="mb-4">
            <Coins className="h-4 w-4" />
            <AlertTitle>Betaling via Tikkie</AlertTitle>
            <AlertDescription>
              <p>
                Na ontvangst van je WhatsApp bericht sturen we je een <strong>Tikkie betaalverzoek</strong> om de
                betaling af te ronden.
              </p>
              <p className="mt-2">
                Totaalbedrag: <strong className="text-primary text-lg">€{totalPrice.toFixed(2)}</strong>
              </p>
            </AlertDescription>
          </Alert>

          <div className="mt-4 space-y-2">
            <p className="font-bold text-center text-primary text-lg">BELANGRIJK:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Kopieer het bestelnummer hierboven</li>
              <li>Stuur het naar 06-44947194 via WhatsApp</li>
              <li>Betaal via het Tikkie betaalverzoek dat je ontvangt</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Bestellingsoverzicht</CardTitle>
          <CardDescription>
            Bestelling voor {customerInfo.name} ({customerInfo.email})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Klantgegevens</h3>
              <div className="bg-secondary/30 p-3 rounded-md">
                <p>
                  <strong>Naam:</strong> {customerInfo.name}
                </p>
                <p>
                  <strong>E-mail:</strong> {customerInfo.email}
                </p>
                <p>
                  <strong>Telefoon:</strong> {customerInfo.phone}
                </p>
                {customerInfo.delivery === "shipping" && (
                  <p>
                    <strong>Adres:</strong> {customerInfo.address}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Bestelde producten</h3>
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
                      <TableCell>{translateColor(order.color)} Hoodie</TableCell>
                      <TableCell>{order.size.toUpperCase()}</TableCell>
                      <TableCell>{count}</TableCell>
                      <TableCell>{order.delivery === "pickup" ? "Ophalen" : "Verzenden"}</TableCell>
                      <TableCell className="text-right">€{(order.price * count).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator />

            <div className="flex justify-between font-bold text-lg">
              <span>Totaalbedrag:</span>
              <span>€{totalPrice.toFixed(2)}</span>
            </div>

            {customerInfo.notes && (
              <div>
                <h3 className="font-medium mb-2">Opmerkingen</h3>
                <div className="bg-secondary/30 p-3 rounded-md">
                  <p>{customerInfo.notes}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => router.push("/")} className="w-full">
        Terug naar de homepage
      </Button>
    </div>
  )
}

