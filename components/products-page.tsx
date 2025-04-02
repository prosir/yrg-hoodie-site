"use client"

import { useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { CartButton } from "@/components/cart/cart-button"
import { initDatabase } from "@/lib/db"
import Link from "next/link"

const products = [
  {
    color: "lilac",
    colorName: "Lilac",
    image: "/lilac.jpeg?height=400&width=400",
    price: 50,
  },
  {
    color: "ocean-blue",
    colorName: "Ocean Blue",
    image: "/Blue_ocean.jpeg?height=400&width=400",
    price: 50,
  },
  {
    color: "burgundy",
    colorName: "Burgundy",
    image: "/red.jpeg?height=400&width=400",
    price: 50,
  },
  {
    color: "black",
    colorName: "Zwart",
    image: "/zwart.jpeg?height=400&width=400",
    price: 50,
  },
]

export function ProductsPage() {
  // Initialiseer de database bij het laden van de pagina
  useEffect(() => {
    initDatabase()
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b py-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary">YoungRidersOost</h1>
          </Link>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <a href="#hoodies" className="text-muted-foreground hover:text-primary transition-colors">
                    Hoodies
                  </a>
                </li>
                <li>
                  <a href="#info" className="text-muted-foreground hover:text-primary transition-colors">
                    Info
                  </a>
                </li>
                <li>
                  <a href="#crew" className="text-muted-foreground hover:text-primary transition-colors">
                    Crew
                  </a>
                </li>
              </ul>
            </nav>
            <CartButton />
          </div>
        </div>
      </header>

      <section id="hoodies" className="py-16 container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-4 text-foreground">Onze Hoodies</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Laat zien dat je bij de YoungRidersOost hoort met onze stijlvolle hoodies!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.color}
              color={product.color}
              colorName={product.colorName}
              image={product.image}
              price={product.price}
            />
          ))}
        </div>

        <div id="info" className="mt-12 bg-secondary/30 p-6 rounded-lg border">
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

      <section id="crew" className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-4 text-foreground">Crew Toegang</h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ben je crew lid? Neem contact op voor speciale crew toegang en exclusieve Olive hoodies.
          </p>

          <div className="max-w-md mx-auto bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-3">Crew Informatie</h3>
            <p className="text-muted-foreground mb-4">
              Crew leden kunnen contact opnemen via WhatsApp voor toegang tot de exclusieve Olive hoodies.
            </p>
            <p className="font-medium">
              Telefoon: <span className="text-primary">06-44947194</span>
            </p>
          </div>
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

