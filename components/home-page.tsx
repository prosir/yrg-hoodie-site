"use client"

import { useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OrderForm from "@/components/order-form"
import CrewAccess from "@/components/crew-access"
import { initDatabase } from "@/lib/db"

export default function HomePage() {
  // Initialiseer de database bij het laden van de pagina
  useEffect(() => {
    initDatabase()
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b py-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
          <h1 className="text-2xl font-bold text-primary">YoungRidersOost</h1>
          <nav className="mt-4 md:mt-0">
            <ul className="flex space-x-6">
              <li>
                <a href="#hoodies" className="text-muted-foreground hover:text-primary transition-colors">
                  Hoodies
                </a>
              </li>
              <li>
                <a href="#order" className="text-muted-foreground hover:text-primary transition-colors">
                  Bestellen
                </a>
              </li>
              <li>
                <a href="#crew" className="text-muted-foreground hover:text-primary transition-colors">
                  Crew
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <section id="hoodies" className="py-16 container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-4 text-foreground">Onze Hoodies</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Laat zien dat je bij de YoungRidersOost hoort met onze stijlvolle hoodies!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
            <div className="h-64 bg-secondary/30 relative overflow-hidden">
              <Image src="/lilac.jpeg?height=400&width=400" alt="Lilac Hoodie" fill className="object-cover" />
            </div>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-foreground">Lilac</h3>
              <p className="text-muted-foreground mt-2">Stijlvolle lila hoodie met YoungRidersOost logo</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
            <div className="h-64 bg-secondary/30 relative overflow-hidden">
              <Image
                src="/Blue_ocean.jpeg?height=400&width=400"
                alt="Ocean Blue Hoodie"
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-foreground">Ocean Blue</h3>
              <p className="text-muted-foreground mt-2">Oceaanblauw hoodie met YoungRidersOost logo</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
            <div className="h-64 bg-secondary/30 relative overflow-hidden">
              <Image src="/red.jpeg?height=400&width=400" alt="Burgundy Hoodie" fill className="object-cover" />
            </div>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-foreground">Burgundy</h3>
              <p className="text-muted-foreground mt-2">Rijke bordeauxrode hoodie met YoungRidersOost logo</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
            <div className="h-64 bg-secondary/30 relative overflow-hidden">
              <Image src="/zwart.jpeg?height=400&width=400" alt="Black Hoodie" fill className="object-cover" />
            </div>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold text-foreground">Zwart</h3>
              <p className="text-muted-foreground mt-2">Klassieke zwarte hoodie met YoungRidersOost logo</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 bg-secondary/30 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Maatinformatie</h3>
          <p className="mb-2 text-muted-foreground">Alle maten zijn beschikbaar: S, M, L, XL, XXL, XXXL</p>
          <p className="font-medium text-primary">
            <strong>Belangrijk:</strong> Onze hoodies vallen 1 maat kleiner! Bestel 1 maat groter dan je normaal draagt.
          </p>
          <p className="font-medium text-primary mt-2">
            Voor gebruik over motorkleding raden we aan om 2 maten groter te bestellen dan je gebruikelijke maat.
          </p>
        </div>
      </section>

      <section id="order" className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-4 text-foreground">Bestel Je Hoodie</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Kies je favoriete kleur en maat, en rij binnenkort in stijl met je YoungRidersOost hoodie!
          </p>

          <Tabs defaultValue="regular" className="max-w-3xl mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="regular">Normale Bestelling</TabsTrigger>
              <TabsTrigger value="crew">Crew Toegang</TabsTrigger>
            </TabsList>
            <TabsContent value="regular">
              <Card>
                <CardContent className="pt-6">
                  <OrderForm />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="crew">
              <Card>
                <CardContent className="pt-6">
                  <CrewAccess />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <footer className="bg-secondary/10 border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-primary">YoungRidersOost</h2>
              <p className="mt-2 text-muted-foreground">Officiële Merchandise</p>
            </div>
            <div className="mt-6 md:mt-0">
              <h3 className="text-lg font-semibold text-foreground">Contact</h3>
              <p className="mt-2 text-muted-foreground">Telefoon: 06-44947194</p>
            </div>
          </div>
          <div className="mt-8 text-center text-muted-foreground text-sm">
            <p>&copy; {new Date().getFullYear()} YoungRidersOost. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

