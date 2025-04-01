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
import { AlertCircle, CheckCircle2, Copy, Check } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { addOrder } from "@/lib/db"
import { MotorcycleLoader } from "@/components/motorcycle-loader"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Naam moet minimaal 2 tekens bevatten.",
  }),
  email: z.string().email({
    message: "Voer een geldig e-mailadres in.",
  }),
  phone: z.string().min(10, {
    message: "Voer een geldig telefoonnummer in.",
  }),
  address: z.string().min(5, {
    message: "Voer je volledige adres in.",
  }),
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
})

export default function OrderForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [totalPrice, setTotalPrice] = useState(0)
  const [copied, setCopied] = useState(false)
  const orderIdRef = useRef<HTMLParagraphElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      delivery: "pickup",
      notes: "",
    },
  })

  // Watch the delivery method to calculate price
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

    // Create order object
    const orderData = {
      ...values,
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

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertTitle>Bestelling Succesvol Verzonden!</AlertTitle>
          <AlertDescription>
            <p>
              Je bestelling is verzonden. <strong className="text-primary">Stuur een WhatsApp</strong> naar{" "}
              <strong className="text-primary">06-47619606</strong> met je bestelnummer:
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adres</FormLabel>
                  <FormControl>
                    <Input placeholder="Je volledige adres" {...field} />
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
                  <FormLabel>Maat</FormLabel>
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
                        Verzending (+€{shippingCost.toFixed(2)}) - Totaal €{(basePrice + shippingCost).toFixed(2)}
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Belangrijk!</AlertTitle>
            <AlertDescription>
              Na het verzenden van je bestelling ontvang je een bestelnummer. Stuur dit nummer naar 06-47619606 via
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

