"use client"

import { useState, useRef, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Copy, Check, Info } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { addOrder } from "@/lib/db"
import { MotorcycleLoader } from "@/components/motorcycle-loader"
import Image from "next/image"

const formSchema = z
  .object({
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
    color: z.string({
      required_error: "Selecteer een kleur.",
    }),
    size: z.string({
      required_error: "Selecteer een maat.",
    }),
    delivery: z.enum(["pickup", "shipping"], {
      required_error: "Selecteer een bezorgmethode.",
    }),
    notes: z.string().optional(),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "Je moet akkoord gaan met de voorwaarden om te bestellen.",
    }),
  })
  .refine(
    (data) => {
      // Als verzenden is geselecteerd, controleer of alle adresvelden zijn ingevuld
      if (data.delivery === "shipping") {
        return !!data.street && !!data.houseNumber && !!data.postalCode && !!data.city
      }
      return true
    },
    {
      message: "Vul alle adresgegevens in voor verzending",
      path: ["delivery"],
    },
  )

export default function OrderForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [totalPrice, setTotalPrice] = useState(0)
  const [copied, setCopied] = useState(false)
  const [showSizeChart, setShowSizeChart] = useState(false)
  const orderIdRef = useRef<HTMLParagraphElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      street: "",
      houseNumber: "",
      postalCode: "",
      city: "",
      delivery: "pickup",
      notes: "",
      termsAccepted: false,
    },
  })

  // Watch the delivery method to calculate price and show/hide address fields
  const deliveryMethod = form.watch("delivery")

  // Base price is €50
  const basePrice = 50
  const shippingCost = 3.5

  // Calculate total price when delivery method changes
  useEffect(() => {
    setTotalPrice(deliveryMethod === "shipping" ? basePrice + shippingCost : basePrice)
  }, [deliveryMethod])

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Start loading animation
    setIsLoading(true)
    setLoadingProgress(0)

    // Calculate final price
    const finalPrice = values.delivery === "shipping" ? basePrice + shippingCost : basePrice

    // Create order object with formatted address
    let formattedAddress = "Ophalen"

    if (values.delivery === "shipping") {
      formattedAddress = `${values.street} ${values.houseNumber}, ${values.postalCode} ${values.city}`
    }

    const orderData = {
      ...values,
      address: formattedAddress,
      price: finalPrice,
      status: "nieuw",
      date: new Date().toISOString(),
    }

    try {
      // Artificial delay to show the animation
      await new Promise((resolve) => setTimeout(resolve, 2500))

      // Sla de bestelling op via de server action
      const newOrder = await addOrder(orderData)

      setOrderId(newOrder.id)
      setTotalPrice(finalPrice)
      setCopied(false)

      toast({
        title: "Bestelling verzonden!",
        description: "Je bestelling is succesvol verzonden en opgeslagen op de server.",
      })
    } catch (error) {
      console.error("Error saving order:", error)
      toast({
        title: "Fout bij verzenden",
        description: "Er is een fout opgetreden bij het opslaan van je bestelling. Probeer het opnieuw.",
        variant: "destructive",
      })
    }
  }

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

  const toggleSizeChart = () => {
    setShowSizeChart(!showSizeChart)
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertTitle>Bestelling Succesvol Verzonden!</AlertTitle>
          <AlertDescription>
            <p>
              Je bestelling is verzonden. <strong className="text-primary">Stuur een WhatsApp</strong> naar{" "}
              <strong className="text-primary">06-44947194</strong> met je bestelnummer:
            </p>

            <div className="relative mt-4 mb-4">
              <div className="flex items-center justify-between p-3 bg-secondary rounded-md">
                <p ref={orderIdRef} className="text-xl font-bold text-center text-primary">
                  {orderId}
                </p>
                <Button variant="outline" size="sm" onClick={copyOrderId} className="flex items-center gap-1">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Gekopieerd!" : "Kopieer"}
                </Button>
              </div>
            </div>

            <p className="mt-2">
              Totaalbedrag: <strong className="text-primary">€{totalPrice.toFixed(2)}</strong>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Je ontvangt een Tikkie-betaalverzoek nadat je WhatsApp bericht is ontvangen.
            </p>
            <p className="mt-4 font-medium text-primary">
              BELANGRIJK: Kopieer het bestelnummer hierboven en stuur het via WhatsApp!
            </p>
          </AlertDescription>
        </Alert>
        <Button onClick={() => setIsSubmitted(false)} className="w-full">
          Plaats Nog Een Bestelling
        </Button>
      </div>
    )
  }

  return (
    <>
      {isLoading && (
        <MotorcycleLoader isLoading={isLoading} progress={loadingProgress} onComplete={handleLoadingComplete} />
      )}

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

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hoodie Kleur</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer een kleur" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="lilac">Lilac</SelectItem>
                      <SelectItem value="ocean-blue">Ocean Blue</SelectItem>
                      <SelectItem value="burgundy">Burgundy</SelectItem>
                      <SelectItem value="black">Zwart</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Maat
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={toggleSizeChart}
                      className="h-6 w-6 p-0 rounded-full"
                    >
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Bekijk maattabel</span>
                    </Button>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer een maat" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="s">S</SelectItem>
                      <SelectItem value="m">M</SelectItem>
                      <SelectItem value="l">L</SelectItem>
                      <SelectItem value="xl">XL</SelectItem>
                      <SelectItem value="xxl">XXL</SelectItem>
                      <SelectItem value="xxxl">XXXL</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Let op: Onze hoodies vallen 1 maat kleiner! Bestel 1 maat groter dan normaal. Voor over motorkleding
                    adviseren we 2 maten groter te bestellen.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {showSizeChart && (
            <div className="rounded-md border p-4 mt-2 mb-4">
              <h3 className="text-lg font-medium mb-3">Maattabel YoungRidersOost Hoodies</h3>
              <div className="relative h-72 bg-background rounded-md overflow-hidden">
                <Image src="/size-chart.jpg" alt="Maattabel voor hoodies" fill className="object-contain" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Tip: Voor normaal gebruik, neem één maat groter dan je gebruikelijke maat. Voor over motorkleding, neem
                twee maten groter.
              </p>
            </div>
          )}

          <FormField
            control={form.control}
            name="delivery"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Bezorgmethode</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup">Ophalen (€{basePrice.toFixed(2)})</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="shipping" id="shipping" />
                      <Label htmlFor="shipping">
                        Verzending via Vinted GO (+€{shippingCost.toFixed(2)}) - Totaal €
                        {(basePrice + shippingCost).toFixed(2)}
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Adresvelden tonen als verzending is geselecteerd */}
          {deliveryMethod === "shipping" && (
            <div className="rounded-md border p-4">
              <h3 className="text-md font-medium mb-4">Bezorgadres</h3>
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

          <Alert variant="default" className="bg-muted/40">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Informatie over verzending</AlertTitle>
            <AlertDescription>
              <p className="mb-1">
                Bij verzending wordt je pakket verzonden via Vinted GO naar het dichtstbijzijnde pakketpunt.
              </p>
              <p>Je pakket is verzekerd en je ontvangt een track & trace code zodra het onderweg is.</p>
            </AlertDescription>
          </Alert>

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
                    Ik begrijp dat dit geen officiële webshop is maar een groepsbestelling voor de YoungRidersOost
                    community. Er geldt geen retourrecht, geen omruilgarantie en geen andere garantievoorwaarden conform
                    artikel 7:5 lid 5 BW (Burgerlijk Wetboek) dat vrijstelling biedt voor particuliere verkoop en
                    niet-commerciële verkoop. Alle verkopen zijn finaal en YoungRidersOost is geen bedrijf.
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
              Na het verzenden van je bestelling ontvang je een bestelnummer. Stuur dit nummer naar 06-44947194 via
              WhatsApp om je bestelling te voltooien.
            </AlertDescription>
          </Alert>

          <Button type="submit" className="w-full">
            Bestelling Verzenden
          </Button>
        </form>
      </Form>
    </>
  )
}
