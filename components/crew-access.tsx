"use client"

import { useState, useRef, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Copy, Check } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addOrder } from "@/lib/db"
import { MotorcycleLoader } from "@/components/motorcycle-loader"
import Image from "next/image"

const accessSchema = z.object({
  accessCode: z.string().min(1, {
    message: "Toegangscode is verplicht",
  }),
})

const crewFormSchema = z.object({
  name: z.string().min(2, {
    message: "Naam moet minimaal 2 tekens bevatten.",
  }),
  email: z.string().email({
    message: "Voer een geldig e-mailadres in.",
  }),
  phone: z.string().min(10, {
    message: "Voer een geldig telefoonnummer in.",
  }),
  size: z.string().min(1, {
    message: "Geef een maat op.",
  }),
  delivery: z.enum(["pickup", "shipping"], {
    required_error: "Selecteer een bezorgmethode.",
  }),
})

export default function CrewAccess() {
  const [accessGranted, setAccessGranted] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [totalPrice, setTotalPrice] = useState(0)
  const [copied, setCopied] = useState(false)
  const orderIdRef = useRef<HTMLParagraphElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Base price is €0 for crew
  const basePrice = 0
  const shippingCost = 3.5

  const accessForm = useForm<z.infer<typeof accessSchema>>({
    resolver: zodResolver(accessSchema),
    defaultValues: {
      accessCode: "",
    },
  })

  const crewForm = useForm<z.infer<typeof crewFormSchema>>({
    resolver: zodResolver(crewFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      size: "",
      delivery: "pickup",
    },
  })

  // Watch the delivery method to calculate price
  const deliveryMethod = crewForm.watch("delivery")

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

  function onAccessSubmit(values: z.infer<typeof accessSchema>) {
    if (values.accessCode === "2025-crew-youngridersoost-cfxo") {
      setAccessGranted(true)
    } else {
      accessForm.setError("accessCode", {
        type: "manual",
        message: "Ongeldige toegangscode",
      })
    }
  }

  async function onCrewSubmit(values: z.infer<typeof crewFormSchema>) {
    // Start loading animation
    setIsLoading(true)
    setLoadingProgress(0)

    // Calculate final price
    const finalPrice = values.delivery === "shipping" ? basePrice + shippingCost : basePrice

    // Create order object
    const orderData = {
      ...values,
      color: "olive", // Crew color is always olive
      price: finalPrice,
      status: "nieuw",
      date: new Date().toISOString(),
      isCrew: true,
      address: "Crew lid", // Default address for crew
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
        title: "Crew bestelling verzonden!",
        description: "Je crew bestelling is succesvol verzonden en opgeslagen op de server.",
      })
    } catch (error) {
      console.error("Error saving crew order:", error)
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
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Crew Bestelling Verzonden!</AlertTitle>
          <AlertDescription>
            <p>
              Je crew bestelling is verzonden. <strong className="text-primary">Stuur een WhatsApp</strong> naar{" "}
              <strong className="text-primary">06-47619606</strong> met je crew bestelnummer:
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
            <p className="mt-2 text-sm text-muted-foreground">Neem contact op als je vragen hebt over je bestelling.</p>
            <p className="mt-4 font-medium text-primary">
              BELANGRIJK: Kopieer het bestelnummer hierboven en stuur het via WhatsApp!
            </p>
          </AlertDescription>
        </Alert>
        <Button onClick={() => setIsSubmitted(false)} className="w-full">
          Plaats Nog Een Crew Bestelling
        </Button>
      </div>
    )
  }

  if (!accessGranted) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Alleen Toegang Voor Crew</AlertTitle>
          <AlertDescription>
            Dit gedeelte is alleen toegankelijk voor YoungRidersOost crew leden. Voer je toegangscode in om verder te
            gaan.
          </AlertDescription>
        </Alert>

        <Form {...accessForm}>
          <form onSubmit={accessForm.handleSubmit(onAccessSubmit)} className="space-y-6">
            <FormField
              control={accessForm.control}
              name="accessCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Toegangscode</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Voer crew toegangscode in" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Toegang Tot Crew Formulier
            </Button>
          </form>
        </Form>
      </div>
    )
  }

  return (
    <>
      {isLoading && (
        <MotorcycleLoader isLoading={isLoading} progress={loadingProgress} onComplete={handleLoadingComplete} />
      )}

      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Crew Toegang Verleend</AlertTitle>
          <AlertDescription>
            Welkom, crew lid! Vul het onderstaande formulier in om je crew hoodie (Olive kleur) te bestellen.
          </AlertDescription>
        </Alert>

        <div className="mt-4 mb-6 bg-olive-50 p-4 rounded-lg border border-olive-200">
          <h3 className="text-lg font-semibold mb-2 text-olive-800">Crew Hoodie - Olive</h3>
          <div className="relative h-64 bg-olive-50/50 rounded-md overflow-hidden mb-3">
            <Image src="/olive.jpeg?height=400&width=400" alt="Olive Crew Hoodie" fill className="object-cover" />
          </div>
          <p className="text-olive-700">
            De exclusieve Olive hoodie is alleen beschikbaar voor crew leden en heeft het YoungRidersOost logo.
          </p>
          <p className="text-olive-700 mt-2 font-medium">
            Let op: Ook deze hoodies vallen 1 maat kleiner! Bestel 1 maat groter dan normaal.
          </p>
        </div>

        <Form {...crewForm}>
          <form onSubmit={crewForm.handleSubmit(onCrewSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={crewForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volledige Naam</FormLabel>
                    <FormControl>
                      <Input placeholder="Je naam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={crewForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Je e-mail" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={crewForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefoonnummer</FormLabel>
                    <FormControl>
                      <Input placeholder="Je telefoonnummer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={crewForm.control}
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="p-4 bg-secondary/50 border border-olive-500/30 rounded-md">
              <p className="font-medium text-olive-700">Crew Hoodie Kleur: Olive</p>
              <p className="text-sm text-muted-foreground">
                De crew hoodie is alleen beschikbaar in de kleur Olive en is exclusief voor crew leden.
              </p>
            </div>

            <FormField
              control={crewForm.control}
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
                        <RadioGroupItem value="pickup" id="crew-pickup" />
                        <Label htmlFor="crew-pickup">Ophalen (Gratis)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="shipping" id="crew-shipping" />
                        <Label htmlFor="crew-shipping">Verzending (+€{shippingCost.toFixed(2)})</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Crew Bestelling Verzenden
            </Button>
          </form>
        </Form>
      </div>
    </>
  )
}

