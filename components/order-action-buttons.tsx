"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart4, CheckCircle, FileText, ArrowLeft, MessageSquare, Send } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { updateOrderStatus } from "@/lib/db"
import type { Order } from "@/lib/db"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface OrderActionButtonsProps {
  order: Order
  onStatusChange?: (newStatus: string) => void
  onTrackingClick?: () => void
}

export function OrderActionButtons({ order, onStatusChange, onTrackingClick }: OrderActionButtonsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()
  const [templates, setTemplates] = useState<any[]>([])

  // Laad templates uit localStorage
  useEffect(() => {
    const savedTemplates = localStorage.getItem("whatsapp-templates")
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates))
      } catch (error) {
        console.error("Fout bij het laden van templates:", error)
        // Als er geen templates zijn of er is een fout, gebruik standaard templates
        setTemplates([
          {
            id: "template-1",
            name: "Bestelling ontvangen",
            template:
              "Hallo {{name}}, bedankt voor je bestelling bij YoungRidersOost! Je bestelnummer is {{orderId}}. Het totaalbedrag is €{{total}}. Je ontvangt binnenkort een Tikkie betaalverzoek.\n\nBekijk je bestelling hier: {{statusUrl}}",
          },
          {
            id: "template-2",
            name: "Betaling ontvangen",
            template:
              "Hallo {{name}}, we hebben je betaling van €{{total}} ontvangen voor bestelling {{orderId}}. Bedankt! We houden je op de hoogte van de status van je bestelling.\n\nBekijk je bestelling hier: {{statusUrl}}",
          },
          {
            id: "template-3",
            name: "Bestelling verzonden",
            template:
              "Hallo {{name}}, je YoungRidersOost hoodie is verzonden! Je kunt je pakket volgen met het volgende tracking nummer: {{tracking}}. Volg je pakket hier: https://vintedgo.com/nl/tracking/{{tracking}}\n\nBekijk je bestelling hier: {{statusUrl}}",
          },
          {
            id: "template-4",
            name: "Bestelling klaar voor afhalen",
            template:
              "Hallo {{name}}, je YoungRidersOost hoodie is klaar om afgehaald te worden! Neem contact op om een afspraak te maken.\n\nBekijk je bestelling hier: {{statusUrl}}",
          },
        ])
      }
    } else {
      // Standaard templates als er nog geen zijn opgeslagen
      setTemplates([
        {
          id: "template-1",
          name: "Bestelling ontvangen",
          template:
            "Hallo {{name}}, bedankt voor je bestelling bij YoungRidersOost! Je bestelnummer is {{orderId}}. Het totaalbedrag is €{{total}}. Je ontvangt binnenkort een Tikkie betaalverzoek.\n\nBekijk je bestelling hier: {{statusUrl}}",
        },
        {
          id: "template-2",
          name: "Betaling ontvangen",
          template:
            "Hallo {{name}}, we hebben je betaling van €{{total}} ontvangen voor bestelling {{orderId}}. Bedankt! We houden je op de hoogte van de status van je bestelling.\n\nBekijk je bestelling hier: {{statusUrl}}",
        },
        {
          id: "template-3",
          name: "Bestelling verzonden",
          template:
            "Hallo {{name}}, je YoungRidersOost hoodie is verzonden! Je kunt je pakket volgen met het volgende tracking nummer: {{tracking}}. Volg je pakket hier: https://vintedgo.com/nl/tracking/{{tracking}}\n\nBekijk je bestelling hier: {{statusUrl}}",
        },
        {
          id: "template-4",
          name: "Bestelling klaar voor afhalen",
          template:
            "Hallo {{name}}, je YoungRidersOost hoodie is klaar om afgehaald te worden! Neem contact op om een afspraak te maken.\n\nBekijk je bestelling hier: {{statusUrl}}",
        },
      ])
    }
  }, [])

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true)

      // Update the order status
      await updateOrderStatus(order.orderId, newStatus)

      toast({
        title: `Status bijgewerkt naar ${newStatus}`,
        description: `Bestelling ${order.orderId} is nu gemarkeerd als ${newStatus}.`,
      })

      // Notify parent component
      if (onStatusChange) {
        onStatusChange(newStatus)
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Fout bij bijwerken",
        description: "Er is een fout opgetreden bij het bijwerken van de status.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Genereer een bericht op basis van een template en een bestelling
  const generateMessageFromTemplate = (template: any): string => {
    let message = template.template

    // Vervang placeholders
    message = message.replace(/{{name}}/g, order.name)
    message = message.replace(/{{orderId}}/g, order.orderId)
    message = message.replace(/{{total}}/g, order.price.toFixed(2))

    // Tracking nummer (indien beschikbaar)
    if (order.trackingNumber) {
      message = message.replace(/{{tracking}}/g, order.trackingNumber)
    } else {
      message = message.replace(/{{tracking}}/g, "[tracking nummer niet beschikbaar]")
    }

    // Status URL
    const statusUrl = `${window.location.origin}/order-status/${order.orderId}`
    message = message.replace(/{{statusUrl}}/g, statusUrl)

    return message
  }

  const sendWhatsAppMessage = (template: any) => {
    // Genereer het bericht
    const message = generateMessageFromTemplate(template)

    // Verwijder eventuele ongeldige tekens uit het telefoonnummer
    const phoneNumber = order.phone.replace(/[^0-9]/g, "")

    // Genereer WhatsApp URL
    const whatsappUrl = `https://wa.me/31${phoneNumber}?text=${encodeURIComponent(message)}`

    // Open WhatsApp in een nieuw tabblad
    window.open(whatsappUrl, "_blank")

    toast({
      title: "WhatsApp geopend",
      description: `WhatsApp wordt geopend met het bericht "${template.name}" voor ${order.name}.`,
    })
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-blue-50 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <BarChart4 className="h-5 w-5 text-blue-600" />
          Bestellingsbeheer
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="w-full h-10 text-xs sm:text-sm bg-green-50 hover:bg-green-100 border-green-200"
            onClick={() => handleStatusChange("afgehaald")}
            disabled={isUpdating}
          >
            <CheckCircle className="mr-1 h-4 w-4 text-green-600 flex-shrink-0" />
            <span className="truncate">Markeren als afgehaald</span>
          </Button>

          <Button
            variant="outline"
            className="w-full h-10 text-xs sm:text-sm bg-blue-50 hover:bg-blue-100 border-blue-200"
            onClick={() => handleStatusChange("betaald")}
            disabled={isUpdating}
          >
            <FileText className="mr-1 h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="truncate">Markeren als betaald</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="w-full h-10 text-xs sm:text-sm bg-amber-50 hover:bg-amber-100 border-amber-200"
            onClick={onTrackingClick}
            disabled={order.delivery !== "shipping" || isUpdating}
          >
            <svg
              className="mr-1 h-4 w-4 text-amber-600 flex-shrink-0"
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 2.5C3 2.22386 3.22386 2 3.5 2H11.5C11.7761 2 12 2.22386 12 2.5V13.5C12 13.7761 11.7761 14 11.5 14H3.5C3.22386 14 3 13.7761 3 13.5V2.5ZM3.5 1C2.67157 1 2 1.67157 2 2.5V13.5C2 14.3284 2.67157 15 3.5 15H11.5C12.3284 15 13 14.3284 13 13.5V2.5C13 1.67157 12.3284 1 11.5 1H3.5ZM4.5 4C4.22386 4 4 4.22386 4 4.5C4 4.77614 4.22386 5 4.5 5H10.5C10.7761 5 11 4.77614 11 4.5C11 4.22386 10.7761 4 10.5 4H4.5ZM4.5 7C4.22386 7 4 7.22386 4 7.5C4 7.77614 4.22386 8 4.5 8H10.5C10.7761 8 11 7.77614 11 7.5C11 7.22386 10.7761 7 10.5 7H4.5ZM4.5 10C4.22386 10 4 10.2239 4 10.5C4 10.7761 4.22386 11 4.5 11H10.5C10.7761 11 11 10.7761 11 10.5C11 10.2239 10.7761 10 10.5 10H4.5Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
            <span className="truncate">VintedGO tracking</span>
          </Button>

          <Button
            variant="outline"
            className="w-full h-10 text-xs sm:text-sm"
            onClick={() => router.push("/admin")}
            disabled={isUpdating}
          >
            <ArrowLeft className="mr-1 h-4 w-4 flex-shrink-0" />
            <span className="truncate">Terug naar bestellingen</span>
          </Button>
        </div>

        {/* WhatsApp berichten sectie */}
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
            <MessageSquare className="h-4 w-4 text-green-600 flex-shrink-0" />
            WhatsApp Berichten
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="w-full h-9 text-xs sm:text-sm justify-start text-green-700 border-green-200 hover:bg-green-100"
              onClick={() =>
                sendWhatsAppMessage(templates.find((t) => t.name === "Bestelling ontvangen") || templates[0])
              }
            >
              <Send className="mr-1 h-3 w-3 flex-shrink-0" />
              <span className="truncate">Bestelling ontvangen</span>
            </Button>

            <Button
              variant="outline"
              className="w-full h-9 text-xs sm:text-sm justify-start text-green-700 border-green-200 hover:bg-green-100"
              onClick={() =>
                sendWhatsAppMessage(templates.find((t) => t.name === "Betaling ontvangen") || templates[1])
              }
            >
              <Send className="mr-1 h-3 w-3 flex-shrink-0" />
              <span className="truncate">Betaling ontvangen</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button
              variant="outline"
              className="w-full h-9 text-xs sm:text-sm justify-start text-green-700 border-green-200 hover:bg-green-100"
              onClick={() =>
                sendWhatsAppMessage(templates.find((t) => t.name === "Bestelling verzonden") || templates[2])
              }
              disabled={!order.trackingNumber && order.delivery === "shipping"}
            >
              <Send className="mr-1 h-3 w-3 flex-shrink-0" />
              <span className="truncate">Bestelling verzonden</span>
            </Button>

            <Button
              variant="outline"
              className="w-full h-9 text-xs sm:text-sm justify-start text-green-700 border-green-200 hover:bg-green-100"
              onClick={() =>
                sendWhatsAppMessage(templates.find((t) => t.name === "Bestelling klaar voor afhalen") || templates[3])
              }
            >
              <Send className="mr-1 h-3 w-3 flex-shrink-0" />
              <span className="truncate">Klaar voor afhalen</span>
            </Button>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-9 text-xs sm:text-sm mt-2 text-green-700 border-green-200 hover:bg-green-100"
              >
                <MessageSquare className="mr-1 h-4 w-4 flex-shrink-0" />
                Alle templates...
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h3 className="font-medium">Alle WhatsApp templates</h3>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {templates.map((template) => (
                    <Button
                      key={template.id}
                      variant="ghost"
                      className="w-full justify-start text-left"
                      onClick={() => sendWhatsAppMessage(template)}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {template.name}
                    </Button>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-2" onClick={() => router.push("/admin/whatsapp")}>
                  Templates beheren
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  )
}

