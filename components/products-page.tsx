"use client"

import { useEffect, useState } from "react"
import { ProductCard } from "@/components/product-card"
import { CartButton } from "@/components/cart/cart-button"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Star, Zap } from "lucide-react"
import { Logo } from "@/components/logo"

const products = [
  {
    color: "lilac",
    colorName: "Lilac",
    image: "/lilac.jpeg?height=400&width=400",
    price: 100,
  },
  {
    color: "ocean-blue",
    colorName: "Ocean Blue",
    image: "/Blue_ocean.jpeg?height=400&width=400",
    price: 100,
  },
  {
    color: "burgundy",
    colorName: "Burgundy",
    image: "/red.jpeg?height=400&width=400",
    price: 100,
  },
  {
    color: "black",
    colorName: "Zwart",
    image: "/zwart.jpeg?height=400&width=400",
    price: 100,
  },
]

export function ProductsPage() {
  const [isLoading, setIsLoading] = useState(true)

  // Initialize any necessary data
  useEffect(() => {
    // Simulate initialization without calling potentially problematic functions
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-olive-600"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white text-gray-800">
      {/* Hero Section with Motorcycle Background */}
      <div className="relative h-screen">
        <div className="absolute inset-0 z-0">
          <Image
            src="/placeholder.svg?height=1080&width=1920"
            alt="Motorcycle riders"
            fill
            className="object-cover brightness-90 bg-gray-100"
            priority
          />
        </div>

        <header className="relative z-10 border-b border-gray-200 py-6">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
            <Logo />
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <nav>
                <ul className="flex space-x-6">
                  <li>
                    <a href="#hoodies" className="text-gray-700 hover:text-olive-600 transition-colors">
                      Hoodies
                    </a>
                  </li>
                  <li>
                    <a href="#info" className="text-gray-700 hover:text-olive-600 transition-colors">
                      Info
                    </a>
                  </li>
                  <li>
                    <a href="#crew" className="text-gray-700 hover:text-olive-600 transition-colors">
                      Crew
                    </a>
                  </li>
                </ul>
              </nav>
              <CartButton />
            </div>
          </div>
        </header>

        <div className="relative z-10 container mx-auto px-4 h-[calc(100vh-80px)] flex flex-col justify-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4 text-gray-800">
              RIDE WITH <span className="text-olive-600">STYLE</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-700">
              Premium hoodies voor echte motorrijders. Exclusief ontworpen voor de YoungRidersOost community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-olive-600 hover:bg-olive-700 text-white border-0" asChild>
                <a href="#hoodies">
                  BEKIJK COLLECTIE
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-olive-600 text-olive-600 hover:bg-olive-50">
                <a href="#crew">CREW TOEGANG</a>
              </Button>
            </div>
          </div>
        </div>

        {/* Animated scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <svg className="w-6 h-6 text-olive-600" fill="none" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">WAAROM ONZE HOODIES?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm transform transition-all duration-300 hover:scale-105">
              <div className="bg-olive-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Premium Kwaliteit</h3>
              <p className="text-gray-600">
                Gemaakt van hoogwaardige materialen voor maximaal comfort tijdens het rijden.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm transform transition-all duration-300 hover:scale-105">
              <div className="bg-olive-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Exclusief Design</h3>
              <p className="text-gray-600">
                Unieke ontwerpen exclusief voor YoungRidersOost leden. Laat zien dat je bij de club hoort.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm transform transition-all duration-300 hover:scale-105">
              <div className="bg-olive-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Perfect voor Rijders</h3>
              <p className="text-gray-600">
                Ontworpen met motorrijders in gedachten. Comfortabel onder of over je motorkleding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="hoodies" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">ONZE HOODIES</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Laat zien dat je bij de YoungRidersOost hoort met onze premium hoodies! Elke hoodie is €100 en een
            investering in stijl en kwaliteit.
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

          <div id="info" className="mt-12 bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-olive-600 text-center">MAATINFORMATIE</h3>
            <p className="mb-2 text-gray-700 text-center">Alle maten zijn beschikbaar: S, M, L, XL, XXL, XXXL</p>
            <p className="font-medium text-gray-800 text-center">
              <strong className="text-olive-600">Belangrijk:</strong> Onze hoodies vallen 1 maat kleiner! Bestel 1 maat
              groter dan je normaal draagt.
            </p>
            <p className="font-medium text-gray-800 mt-2 text-center">
              Voor gebruik over motorkleding raden we aan om 2 maten groter te bestellen dan je gebruikelijke maat.
            </p>
          </div>
        </div>
      </section>

      {/* Crew Section */}
      <section id="crew" className="py-16 bg-gradient-to-b from-gray-100 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">CREW TOEGANG</h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Ben je crew lid? Neem contact op voor speciale crew toegang en exclusieve Olive hoodies.
          </p>

          <div className="max-w-md mx-auto bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold mb-3 text-olive-600">CREW INFORMATIE</h3>
            <p className="text-gray-600 mb-4">
              Crew leden kunnen contact opnemen via WhatsApp voor toegang tot de exclusieve Olive hoodies.
            </p>
            <p className="font-medium text-gray-800">
              Telefoon: <span className="text-olive-600">06-44947194</span>
            </p>
            <Button className="w-full mt-4 bg-olive-600 hover:bg-olive-700 text-white" asChild>
              <Link href="/crew">CREW TOEGANG</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <Logo />
              <p className="mt-2 text-gray-600">Officiële Merchandise</p>
            </div>
            <div className="mt-6 md:mt-0">
              <h3 className="text-lg font-bold text-gray-800">Contact</h3>
              <p className="mt-2 text-gray-600">Telefoon: 06-44947194</p>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} YoungRidersOost. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
