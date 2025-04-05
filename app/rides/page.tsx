"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

// Definieer het type voor een rit
interface Ride {
  id: string
  title: string
  date: string
  time: string
  startLocation: string
  distance: string
  description: string
  image: string
  spots: number
  registered: number
  active: boolean
  requireAccessCode?: boolean
}

// Definieer het type voor een deelnemer
interface Participant {
  firstName: string
  lastName: string
  email: string
  phone: string
  motorcycle: string
  comments?: string
  accessCode?: string
}

export default function Rides() {
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null)
  const [formData, setFormData] = useState<Participant>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    motorcycle: "",
    comments: "",
    accessCode: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const { toast } = useToast()

  // Haal ritten op bij het laden van de pagina
  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await fetch("/api/rides/public")
        if (!response.ok) {
          throw new Error("Kon ritten niet ophalen")
        }
        const data = await response.json()
        setRides(data)
      } catch (error) {
        console.error("Fout bij het ophalen van ritten:", error)
        toast({
          title: "Fout",
          description: "Er is een fout opgetreden bij het ophalen van de ritten.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRides()
  }, [toast])

  const handleRegister = (ride: Ride) => {
    setSelectedRide(ride)
    setShowForm(true)
    // Reset form data
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      motorcycle: "",
      comments: "",
      accessCode: "",
    })
    setAcceptTerms(false)

    // Scroll naar het formulier
    setTimeout(() => {
      document.getElementById("registration-form")?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Speciale behandeling voor telefoonnummer
    if (name === "phone") {
      let formattedPhone = value.replace(/\s+/g, "")

      // Verwijder alle niet-numerieke tekens behalve +
      formattedPhone = formattedPhone.replace(/[^\d+]/g, "")

      // Als het nummer met 0 begint, vervang door +31
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "+31" + formattedPhone.substring(1)
      }

      // Als het nummer met 31 begint zonder +, voeg + toe
      if (formattedPhone.startsWith("31") && !formattedPhone.startsWith("+")) {
        formattedPhone = "+" + formattedPhone
      }

      // Als er nog geen landcode is, voeg +31 toe
      if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+31" + formattedPhone
      }

      setFormData({ ...formData, [name]: formattedPhone })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptTerms) {
      toast({
        title: "Voorwaarden",
        description: "Je moet akkoord gaan met de voorwaarden om je aan te melden.",
        variant: "destructive",
      })
      return
    }

    if (!selectedRide) return

    setIsSubmitting(true)

    try {
      // Valideer de invoer
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.motorcycle) {
        throw new Error("Vul alle verplichte velden in")
      }

      // Controleer of er een toegangscode nodig is
      if (selectedRide.requireAccessCode && !formData.accessCode) {
        throw new Error("Deze rit vereist een toegangscode")
      }

      // Stuur de aanmelding naar de API
      const response = await fetch(`/api/rides/${selectedRide.id}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Er is een fout opgetreden bij het aanmelden")
      }

      // Update de lokale staat van de rit
      setRides(rides.map((ride) => (ride.id === selectedRide.id ? { ...ride, registered: ride.registered + 1 } : ride)))

      toast({
        title: "Aanmelding succesvol",
        description: "Je bent succesvol aangemeld voor de rit. Je ontvangt binnenkort een bevestiging per e-mail.",
      })

      // Reset het formulier
      setShowForm(false)
      setSelectedRide(null)
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        motorcycle: "",
        comments: "",
        accessCode: "",
      })
      setAcceptTerms(false)
    } catch (error) {
      toast({
        title: "Fout",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Formateer datum voor weergave
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }
    return new Date(dateString).toLocaleDateString("nl-NL", options)
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Rides Header */}
      <section className="py-12 bg-gradient-to-b from-white to-gray-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ONZE <span className="text-olive-600">RITTEN</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Bekijk en meld je aan voor onze geplande motorritten.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Rides List */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-olive-600" />
              <span className="ml-2 text-lg">Ritten laden...</span>
            </div>
          ) : rides.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-4">Geen ritten gepland</h2>
              <p className="text-gray-600">
                Er zijn momenteel geen ritten gepland. Kom later terug voor nieuwe ritten.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rides.map((ride, index) => (
                <motion.div
                  key={ride.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-md group hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48">
                    <Image
                      src={ride.image || "/placeholder.svg?height=600&width=800"}
                      alt={ride.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-olive-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                      {ride.spots - ride.registered} plekken over
                    </div>
                    {ride.requireAccessCode && (
                      <div className="absolute top-4 left-4 bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                        Code vereist
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2 text-gray-800">{ride.title}</h3>
                    <div className="flex items-center text-gray-600 mb-1">
                      <Calendar className="w-4 h-4 mr-2 text-olive-600" />
                      {formatDate(ride.date)} - {ride.time}
                    </div>
                    <div className="flex items-center text-gray-600 mb-1">
                      <MapPin className="w-4 h-4 mr-2 text-olive-600" />
                      {ride.startLocation}
                    </div>
                    <div className="flex items-center text-gray-600 mb-4">
                      <Clock className="w-4 h-4 mr-2 text-olive-600" />
                      {ride.distance}
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{ride.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <Users className="w-4 h-4 inline mr-1 text-olive-600" />
                        <span className="font-bold text-gray-800">{ride.registered}</span> / {ride.spots} aanmeldingen
                      </div>
                      <Button
                        onClick={() => handleRegister(ride)}
                        className="bg-olive-600 hover:bg-olive-700 text-white"
                        disabled={ride.registered >= ride.spots}
                      >
                        {ride.registered >= ride.spots ? "Vol" : "Aanmelden"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Registration Form */}
      {showForm && selectedRide && (
        <section id="registration-form" className="py-12 bg-gray-100">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto bg-white p-8 rounded-lg border border-gray-200 shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Aanmelden voor: <span className="text-olive-600">{selectedRide.title}</span>
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-700">
                      Voornaam *
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="border-gray-300 focus:border-olive-500 focus:ring-olive-500"
                      placeholder="Voornaam"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-700">
                      Achternaam *
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="border-gray-300 focus:border-olive-500 focus:ring-olive-500"
                      placeholder="Achternaam"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="border-gray-300 focus:border-olive-500 focus:ring-olive-500"
                      placeholder="jouw@email.nl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700">
                      Telefoonnummer *
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">🇳🇱</span>
                      </div>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10 border-gray-300 focus:border-olive-500 focus:ring-olive-500"
                        placeholder="+31 6 12345678"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">Formaat: +31 6 12345678 (wordt automatisch gecorrigeerd)</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motorcycle" className="text-gray-700">
                    Motor *
                  </Label>
                  <Input
                    id="motorcycle"
                    name="motorcycle"
                    value={formData.motorcycle}
                    onChange={handleInputChange}
                    className="border-gray-300 focus:border-olive-500 focus:ring-olive-500"
                    placeholder="Merk en model (bijv. Honda CBR650R)"
                    required
                  />
                </div>

                {selectedRide.requireAccessCode && (
                  <div className="space-y-2">
                    <Label htmlFor="accessCode" className="text-gray-700">
                      Toegangscode *
                    </Label>
                    <Input
                      id="accessCode"
                      name="accessCode"
                      value={formData.accessCode}
                      onChange={handleInputChange}
                      className="border-gray-300 focus:border-olive-500 focus:ring-olive-500"
                      placeholder="Voer de toegangscode in"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Deze rit vereist een toegangscode. Vraag de code aan de organisator.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="comments" className="text-gray-700">
                    Opmerkingen
                  </Label>
                  <Textarea
                    id="comments"
                    name="comments"
                    value={formData.comments}
                    onChange={handleInputChange}
                    className="border-gray-300 focus:border-olive-500 focus:ring-olive-500"
                    placeholder="Eventuele opmerkingen..."
                    rows={4}
                  />
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    className="data-[state=checked]:bg-olive-600 data-[state=checked]:border-olive-600"
                    required
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-600 leading-tight">
                    Ik ga akkoord met de voorwaarden en rij op eigen risico. Ik begrijp dat YoungRidersOost niet
                    aansprakelijk is voor eventuele schade of letsel tijdens de rit.
                  </Label>
                </div>
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setSelectedRide(null)
                    }}
                    className="border-olive-600 text-olive-600 hover:bg-olive-50"
                  >
                    Annuleren
                  </Button>
                  <Button type="submit" className="bg-olive-600 hover:bg-olive-700 text-white" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Aanmelden...
                      </>
                    ) : (
                      "Aanmelden"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  )
}

