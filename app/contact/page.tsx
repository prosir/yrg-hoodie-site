"use client"

import { useState, useEffect } from "react"
import { Instagram, Mail, MapPin, Phone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

interface SiteConfig {
  contactHeroImage: string
}

export default function ContactPage() {
  const [contactImage, setContactImage] = useState<string>("/motorcycle-hero.jpg")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch("/api/site-config")
        if (response.ok) {
          const data = await response.json()
          if (data.contactHeroImage) {
            setContactImage(data.contactHeroImage)
          }
        }
      } catch (error) {
        console.error("Error fetching contact image:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConfig()
  }, [])

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center">Contact</h1>
        <p className="text-center text-gray-600 mb-12">Neem contact met ons op of volg ons op social media</p>

        {/* Hero section */}
        <div className="relative w-full h-64 md:h-80 mb-12 rounded-xl overflow-hidden">
          <Image
            src={contactImage || "/placeholder.svg"}
            alt="YoungRidersOost motorrijders"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h2 className="text-white text-3xl md:text-4xl font-bold text-center px-4">Rij met ons mee!</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* About section */}
          <Card className="h-full">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="bg-primary/10 p-2 rounded-full mr-3">
                  <MapPin className="h-5 w-5 text-primary" />
                </span>
                Over YoungRidersOost
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                YoungRidersOost is door jonge rijders opgericht voor jonge rijders om een leuke, jonge groep te creëren.
                Ons doel is om motorrijders samen te brengen, nieuwe vriendschappen te laten ontstaan en gezamenlijk de
                passie voor motorrijden te delen.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Of je nu een beginnende rijder bent of al jaren ervaring hebt, bij YoungRidersOost is iedereen welkom.
                We organiseren regelmatig ritten en evenementen waar je andere motorliefhebbers kunt ontmoeten in een
                ontspannen sfeer.
              </p>
            </CardContent>
          </Card>

          {/* Social media section */}
          <Card className="h-full">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="bg-primary/10 p-2 rounded-full mr-3">
                  <Instagram className="h-5 w-5 text-primary" />
                </span>
                Volg ons op Instagram
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Blijf op de hoogte van onze laatste ritten, evenementen en nieuws door ons te volgen op Instagram. Deel
                je eigen ervaringen met de hashtag #YoungRidersOost!
              </p>
              <Link
                href="https://www.instagram.com/youngridersoost"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-lg hover:text-primary transition-colors p-4 border rounded-lg hover:border-primary hover:bg-primary/5"
              >
                <Instagram size={28} />
                <div>
                  <span className="font-medium block">@youngridersoost</span>
                  <span className="text-sm text-gray-500">Volg ons voor updates en foto's</span>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Contact methods */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-6">Neem contact met ons op</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <span className="bg-primary/10 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-primary" />
                </span>
                <div>
                  <h3 className="font-medium text-lg">E-mail</h3>
                  <p className="text-gray-600 mb-2">Stuur ons een bericht</p>
                  <a href="mailto:info@youngridersoost.nl" className="text-primary hover:underline">
                    info@youngridersoost.nl
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <span className="bg-primary/10 p-3 rounded-full">
                  <Phone className="h-6 w-6 text-primary" />
                </span>
                <div>
                  <h3 className="font-medium text-lg">Telefoon</h3>
                  <p className="text-gray-600 mb-2">Voor dringende vragen</p>
                  <a href="tel:+31612345678" className="text-primary hover:underline">
                    +31 6 12345678
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
