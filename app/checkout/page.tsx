"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, CheckCircle2, Copy, Check, Phone, Coins } from "lucide-react"
import { useCart } from "@/components/cart/cart-context"
import { useToast } from "@/components/ui/use-toast"
import { addOrder } from "@/lib/db"
import { MotorcycleLoader } from "@/components/motorcycle-loader"

const checkoutSchema = z.object({
  name: z.string().min(2, {
    message: "Naam moet minimaal 2 tekens bevatten.",
  }),
  email: z.string().email({
    message: "Voer een geldig e-mailadres in.",
  }),
  phone: z.string().min(10, {
    message: "Voer een geldig telefoonnummer in.",
  }),
  street: z.string().optional(),
  houseNumber: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "Je moet akkoord gaan met de voorwaarden om te bestellen.",
  }),
})

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [totalPrice, setTotalPrice] = useState(0)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const orderIdRef = useRef<HTMLParagraphElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      street: "",
      houseNumber: "",
      postalCode: "",
      city: "",
      notes: "",
      termsAccepted: false,
    },
  })

  // Simulate loading progress
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          const newProgress = prev + 0.05
          return newProgress > 1 ? 1 : newProgress
        })
      }, 150)

      return () => clearInterval(interval)
    }
  }, [isLoading])

  const handleLoadingComplete = () => {
    setIsLoading(false)
    setLoadingProgress(0)
    setIsSubmitted(true)
  }

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

  async function onSubmit(values: z.infer<typeof checkoutSchema>) {
    if (items.length === 0) {
      toast({
        title: "Winkelwagen is leeg",
        description: "Voeg producten toe aan je winkelwagen om te bestellen.",
        variant: "destructive",
      })
      return
    }

    // Start loading animation
    setIsLoading(true)
    setLoadingProgress(0)

    try {
      // Artificial delay to show the animation
      await new Promise((resolve) => setTimeout(resolve, 2500))

      // Genereer één gemeenschappelijk orderId voor alle items
      const commonOrderId = `ORDER-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`
      setOrderId(commonOrderId)
      console.log("Gegenereerd orderId:", commonOrderId)

      // Create order objects for each cart item
      for (const item of items) {
        // Create formatted address based on delivery method
        let formattedAddress = "Ophalen"
        if (item.delivery === "shipping") {
          formattedAddress = `${values.street} ${values.houseNumber}, ${values.postalCode} ${values.city}`
        }

        const orderData = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          address: formattedAddress,
          color: item.color,
          size: item.size,
          delivery: item.delivery,
          notes: values.notes,
          price: item.price + item.shippingCost,
          status: "nieuw",
          date: new Date().toISOString(),
          quantity: item.quantity, // Voeg quantity toe aan de bestelling
        }

        console.log("Bestelling wordt toegevoegd:", orderData)

        // Save the order with the common orderId
        try {
          await addOrder(orderData, commonOrderId)
          console.log("Bestelling succesvol toegevoegd")
        } catch (error) {
          console.error("Fout bij het toevoegen van bestelling:", error)
          throw error
        }
      }

      setTotalPrice(total)
      setCopied(false)
      clearCart() // Clear the cart after successful order

      toast({
        title: "Bestelling verzonden!",
        description: "Je bestelling is succesvol verzonden en opgeslagen op de server.",
      })

      // Toon de bevestigingspagina direct in plaats van redirect
      setIsSubmitted(true)

      // Redirect naar de order bevestigingspagina na een korte vertraging
      setTimeout(() => {
        router.push(`/order-confirmation/${commonOrderId}`)
      }, 1000)
    } catch (error) {
      console.error("Error saving order:", error)
      toast({
        title: "Fout bij verzenden",
        description: `Er is een fout opgetreden bij het opslaan van je bestelling: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Check if any items need shipping address
  const needsShippingAddress = items.some((item) => item.delivery === "shipping")

  if (isSubmitted) {
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

        <Button onClick={() => router.push("/")} className="w-full">
          Terug naar de homepage
        </Button>
      </div>
    )
  }

  if (items.length === 0) {
    router.push("/cart")
    return null
  }

  return (
    <>
      {isLoading && (
        <MotorcycleLoader isLoading={isLoading} progress={loadingProgress} onComplete={handleLoadingComplete} />
      )}

      <div className="container mx-auto px-4 py-12">
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

        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Afrekenen</h1>
            <Button variant="outline" onClick={() => router.push("/cart")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar winkelwagen
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Bestelgegevens</CardTitle>
                  <CardDescription>Vul je gegevens in om de bestelling af te ronden</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-6 bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-700">Zo werkt het bestellen</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      <p>1. Vul je gegevens in en klik op "Bestelling Verzenden"</p>
                      <p>2. Je ontvangt een bestelnummer dat je via WhatsApp moet doorsturen</p>
                      <p>3. Na ontvangst van je WhatsApp bericht sturen we je een Tikkie betaalverzoek</p>
                    </AlertDescription>
                  </Alert>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Volledige Naam</FormLabel>
                              <FormControl>
                                <Input placeholder="Jan Jansen" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>E-mail</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="jan@voorbeeld.nl" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefoonnummer</FormLabel>
                              <FormControl>
                                <Input placeholder="06-12345678" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Adresvelden tonen als verzending is geselecteerd */}
                      {needsShippingAddress && (
                        <div className="rounded-md border p-4">
                          <h3 className="text-md font-medium mb-4">Bezorgadres (voor verzending)</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="street"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Straat</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Hoofdstraat" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="houseNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Huisnummer</FormLabel>
                                  <FormControl>
                                    <Input placeholder="123A" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="postalCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Postcode</FormLabel>
                                  <FormControl>
                                    <Input placeholder="1234 AB" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Plaats</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Amsterdam" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Aanvullende Opmerkingen</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Speciale verzoeken of informatie over je bestelling"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="termsAccepted"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} id="terms" required />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel htmlFor="terms" className="font-medium text-foreground">
                                Ik ga akkoord met de voorwaarden (verplicht)
                              </FormLabel>
                              <FormDescription>
                                Ik begrijp dat dit geen officiële webshop is maar een groepsbestelling voor de
                                YoungRidersOost community. Er geldt geen retourrecht, geen omruilgarantie en geen andere
                                garantievoorwaarden conform artikel 7:5 lid 5 BW (Burgerlijk Wetboek) dat vrijstelling
                                biedt voor particuliere verkoop en niet-commerciële verkoop. Alle verkopen zijn finaal
                                en YoungRidersOost is geen bedrijf.
                              </FormDescription>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Belangrijk!</AlertTitle>
                        <AlertDescription>
                          Na het verzenden van je bestelling ontvang je een bestelnummer. Stuur dit nummer naar
                          06-44947194 via WhatsApp om je bestelling te voltooien en het Tikkie betaalverzoek te
                          ontvangen.
                        </AlertDescription>
                      </Alert>

                      <Button type="submit" className="w-full">
                        Bestelling Verzenden
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Samenvatting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.colorName} (Maat {item.size.toUpperCase()}) x{item.quantity}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {item.delivery === "pickup" ? "Ophalen" : "Verzenden (+€3.50)"}
                        </span>
                      </span>
                      <span>€{((item.price + item.shippingCost) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}

                  <Separator />

                  <div className="flex justify-between font-bold">
                    <span>Totaal</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>

                  <Alert className="mt-4 bg-yellow-50 border-yellow-200">
                    <Coins className="h-4 w-4 text-yellow-700" />
                    <AlertTitle className="text-yellow-800">Betaling via Tikkie</AlertTitle>
                    <AlertDescription className="text-yellow-800">
                      Na het plaatsen van je bestelling en het sturen van je bestelnummer via WhatsApp, ontvang je een
                      Tikkie betaalverzoek.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

