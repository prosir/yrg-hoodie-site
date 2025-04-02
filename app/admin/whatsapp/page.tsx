"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, MessageSquare, Save, Plus, Trash, Send, Copy, Check, AlertCircle, Info } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { getAllOrders } from "@/lib/db"
import type { Order } from "@/lib/db"

// Type voor template
type Template = {
  id: string
  name: string
  template: string
}

export default function WhatsAppPage() {
  const [templates, setTemplates] = useState<Template[]>([
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

  const [editingTemplate, setEditingTemplate] = useState<Template>({
    id: "",
    name: "",
    template: "",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("templates")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [previewMessage, setPreviewMessage] = useState("")
  const [copied, setCopied] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Laad bestellingen
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        const allOrders = await getAllOrders()
        // Sorteer op datum (nieuwste eerst)
        const sortedOrders = allOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setOrders(sortedOrders)
      } catch (error) {
        console.error("Fout bij het laden van bestellingen:", error)
        toast({
          title: "Fout bij laden",
          description: "Er is een fout opgetreden bij het laden van bestellingen.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  // Laad templates uit localStorage
  useEffect(() => {
    const savedTemplates = localStorage.getItem("whatsapp-templates")
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates))
      } catch (error) {
        console.error("Fout bij het laden van templates:", error)
      }
    }
  }, [])

  // Sla templates op in localStorage
  useEffect(() => {
    localStorage.setItem("whatsapp-templates", JSON.stringify(templates))
  }, [templates])

  const handleEditTemplate = (index: number) => {
    setEditingTemplate(templates[index])
    setEditingIndex(index)
    setIsEditing(true)
  }

  const handleAddTemplate = () => {
    setEditingTemplate({ id: `template-${Date.now()}`, name: "", template: "" })
    setEditingIndex(null)
    setIsEditing(true)
  }

  const handleSaveTemplate = () => {
    if (!editingTemplate.name || !editingTemplate.template) {
      toast({
        title: "Vul alle velden in",
        description: "Zowel de naam als de inhoud van het template zijn verplicht.",
        variant: "destructive",
      })
      return
    }

    const newTemplates = [...templates]

    if (editingIndex !== null) {
      // Update existing template
      newTemplates[editingIndex] = editingTemplate
    } else {
      // Add new template
      newTemplates.push(editingTemplate)
    }

    setTemplates(newTemplates)
    setIsEditing(false)
    setEditingIndex(null)

    toast({
      title: "Template opgeslagen",
      description: "Je WhatsApp template is succesvol opgeslagen.",
    })
  }

  const handleDeleteTemplate = (index: number) => {
    const templateToDelete = templates[index]

    // Vraag om bevestiging
    if (confirm(`Weet je zeker dat je het template "${templateToDelete.name}" wilt verwijderen?`)) {
      const newTemplates = templates.filter((_, i) => i !== index)
      setTemplates(newTemplates)

      toast({
        title: "Template verwijderd",
        description: `Het template "${templateToDelete.name}" is verwijderd.`,
      })
    }
  }

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template)

    // Als er ook een bestelling is geselecteerd, genereer dan een preview
    if (selectedOrder) {
      setPreviewMessage(generateMessageFromTemplate(template, selectedOrder))
    }
  }

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order)

    // Als er ook een template is geselecteerd, genereer dan een preview
    if (selectedTemplate) {
      setPreviewMessage(generateMessageFromTemplate(selectedTemplate, order))
    }
  }

  // Genereer een bericht op basis van een template en een bestelling
  const generateMessageFromTemplate = (template: Template, order: Order): string => {
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    toast({
      title: "Gekopieerd!",
      description: "Bericht is gekopieerd naar je klembord.",
    })
  }

  const openWhatsApp = () => {
    if (!selectedOrder || !previewMessage) {
      toast({
        title: "Selecteer eerst een bestelling en template",
        description: "Je moet zowel een bestelling als een template selecteren om een WhatsApp bericht te sturen.",
        variant: "destructive",
      })
      return
    }

    // Verwijder eventuele ongeldige tekens uit het telefoonnummer
    const phoneNumber = selectedOrder.phone.replace(/[^0-9]/g, "")

    // Genereer WhatsApp URL
    const whatsappUrl = `https://wa.me/31${phoneNumber}?text=${encodeURIComponent(previewMessage)}`

    // Open WhatsApp in een nieuw tabblad
    window.open(whatsappUrl, "_blank")
  }

  // Filter orders op zoekterm
  const filteredOrders = orders.filter(
    (order) =>
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto p-4 py-8">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/admin">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar admin
        </Link>
      </Button>

      <Card className="mb-6">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <MessageSquare className="h-5 w-5 text-green-600" />
            WhatsApp Berichten Beheer
          </CardTitle>
          <CardDescription className="text-green-700">
            Beheer je WhatsApp berichtsjablonen en stuur berichten naar klanten
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="templates" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Templates Beheren
              </TabsTrigger>
              <TabsTrigger value="send" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Berichten Versturen
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Template naam</Label>
                    <Input
                      id="template-name"
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                      placeholder="Bijv. Bestelling ontvangen"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-content">Template inhoud</Label>
                    <Textarea
                      id="template-content"
                      value={editingTemplate.template}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, template: e.target.value })}
                      placeholder="Typ je bericht hier... Gebruik {{name}}, {{orderId}}, {{total}}, {{tracking}} als placeholders"
                      className="min-h-[150px]"
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      Beschikbare variabelen:
                    </div>
                    <ul className="text-sm space-y-1 text-blue-700">
                      <li>
                        <code className="bg-blue-100 px-1 py-0.5 rounded">{`{{name}}`}</code> - Naam van de klant
                      </li>
                      <li>
                        <code className="bg-blue-100 px-1 py-0.5 rounded">{`{{orderId}}`}</code> - Bestelnummer
                      </li>
                      <li>
                        <code className="bg-blue-100 px-1 py-0.5 rounded">{`{{total}}`}</code> - Totaalbedrag
                      </li>
                      <li>
                        <code className="bg-blue-100 px-1 py-0.5 rounded">{`{{tracking}}`}</code> - Tracking nummer
                      </li>
                      <li>
                        <code className="bg-blue-100 px-1 py-0.5 rounded">{`{{statusUrl}}`}</code> - Link naar de
                        order-status pagina
                      </li>
                    </ul>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Annuleren
                    </Button>
                    <Button onClick={handleSaveTemplate} className="bg-green-600 hover:bg-green-700">
                      <Save className="mr-2 h-4 w-4" />
                      Template opslaan
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-end mb-6">
                    <Button onClick={handleAddTemplate} className="bg-green-600 hover:bg-green-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Nieuw template
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {templates.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">Geen templates gevonden</h3>
                        <p className="text-gray-500 mb-4">Je hebt nog geen WhatsApp templates aangemaakt.</p>
                        <Button onClick={handleAddTemplate} className="bg-green-600 hover:bg-green-700">
                          <Plus className="mr-2 h-4 w-4" />
                          Eerste template aanmaken
                        </Button>
                      </div>
                    ) : (
                      templates.map((template, index) => (
                        <Card
                          key={template.id}
                          className="overflow-hidden border-green-200 hover:border-green-300 transition-colors"
                        >
                          <CardHeader className="bg-green-50 border-b border-green-200 py-3">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium text-green-800">{template.name}</h3>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditTemplate(index)}
                                  className="text-green-700 hover:text-green-800 hover:bg-green-100"
                                >
                                  Bewerken
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteTemplate(index)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4">
                            <p className="text-sm whitespace-pre-wrap">{template.template}</p>
                          </CardContent>
                          <CardFooter className="bg-gray-50 border-t py-2 px-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-auto text-green-700 border-green-200 hover:bg-green-50"
                              onClick={() => {
                                setActiveTab("send")
                                handleSelectTemplate(template)
                              }}
                            >
                              <Send className="mr-2 h-3 w-3" />
                              Gebruik dit template
                            </Button>
                          </CardFooter>
                        </Card>
                      ))
                    )}
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="send">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">1. Selecteer een template</h3>
                  <div className="space-y-2 mb-6">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${
                          selectedTemplate?.id === template.id
                            ? "bg-green-50 border-green-300"
                            : "hover:bg-gray-50 border-gray-200"
                        }`}
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-500 truncate">{template.template.substring(0, 60)}...</div>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-lg font-medium mb-4">2. Selecteer een bestelling</h3>
                  <div className="mb-4">
                    <Input
                      placeholder="Zoek op naam, bestelnummer, email of telefoon"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mb-2"
                    />
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <div className="max-h-[300px] overflow-y-auto">
                      {loading ? (
                        <div className="flex justify-center items-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                      ) : filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                          <div
                            key={order.id}
                            className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors ${
                              selectedOrder?.id === order.id ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"
                            }`}
                            onClick={() => handleSelectOrder(order)}
                          >
                            <div className="flex justify-between">
                              <div className="font-medium">{order.name}</div>
                              <div className="text-sm text-gray-500">{order.orderId}</div>
                            </div>
                            <div className="text-sm text-gray-500">{order.phone}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(order.date).toLocaleDateString("nl-NL")}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">Geen bestellingen gevonden</div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">3. Bericht preview</h3>

                  {selectedTemplate && selectedOrder ? (
                    <div className="space-y-4">
                      <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 min-h-[200px] whitespace-pre-wrap relative">
                        {previewMessage}

                        <div className="absolute top-2 right-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(previewMessage)}
                            className="h-8 w-8 p-0"
                          >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4 text-green-600" />
                          Geselecteerde bestelling
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Naam:</span> {selectedOrder.name}
                          </div>
                          <div>
                            <span className="text-gray-500">Bestelnummer:</span> {selectedOrder.orderId}
                          </div>
                          <div>
                            <span className="text-gray-500">Telefoon:</span> {selectedOrder.phone}
                          </div>
                          <div>
                            <span className="text-gray-500">Bedrag:</span> €{selectedOrder.price.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <Button onClick={openWhatsApp} className="w-full bg-green-600 hover:bg-green-700">
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
                          className="mr-2"
                        >
                          <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345z" />
                          <path d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.715 1.447h.006c9.6 0 16.028-9.174 16.028-16.012 0-4.23-1.986-8.072-5.565-10.334zm-5.518 22.311h-.005c-2.608-.001-5.17-.719-7.4-2.075l-.53-.315-5.49 1.431 1.456-5.283-.345-.552c-1.443-2.305-2.208-4.967-2.205-7.687.01-8.025 6.488-14.57 14.46-14.57 3.869 0 7.494 1.501 10.218 4.225 2.725 2.723 4.23 6.346 4.227 10.203-.006 8.018-6.484 14.563-14.385 14.563z" />
                        </svg>
                        WhatsApp bericht openen
                      </Button>
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Selecteer een template en bestelling</AlertTitle>
                      <AlertDescription>
                        Selecteer eerst een template en een bestelling om een preview van het bericht te zien.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

