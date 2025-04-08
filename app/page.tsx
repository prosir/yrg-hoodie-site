"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Bike, ShoppingBag, Calendar } from "lucide-react"

export default function HomePage() {
  const [upcomingRides, setUpcomingRides] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch upcoming rides
        const ridesResponse = await fetch("/api/rides")
        const ridesData = await ridesResponse.json()

        // Filter for upcoming rides and sort by date
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const upcoming = ridesData
          .filter((ride) => new Date(ride.date) >= today)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3)

        setUpcomingRides(upcoming)

        // Fetch featured products
        const productsResponse = await fetch("/api/featured-products")
        const productsData = await productsResponse.json()
        setFeaturedProducts(productsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-background.jpg"
            alt="YRG Motorcycle Club"
            fill
            className="object-cover opacity-40"
            priority
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Welkom bij YRG Motorcycle Club</h1>
            <p className="text-xl mb-8">
              Ontdek de vrijheid van het rijden en sluit je aan bij onze gemeenschap van motorliefhebbers.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/rides"
                className="bg-olive-600 hover:bg-olive-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                Bekijk onze ritten
              </Link>
              <Link
                href="/webshop"
                className="bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-md font-medium transition-colors"
              >
                Bezoek de webshop
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Rides Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Komende Ritten</h2>
            <Link href="/rides" className="text-olive-600 hover:text-olive-700 font-medium">
              Alle ritten bekijken
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : upcomingRides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingRides.map((ride) => (
                <motion.div
                  key={ride.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <Calendar className="h-5 w-5 text-olive-600 mr-2" />
                      <span className="text-gray-600">
                        {new Date(ride.date).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{ride.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{ride.description}</p>
                    <Link
                      href={`/rides/${ride.id}`}
                      className="inline-flex items-center text-olive-600 hover:text-olive-700 font-medium"
                    >
                      <Bike className="h-4 w-4 mr-1" />
                      Meer informatie
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Er zijn momenteel geen ritten gepland.</p>
              <Link href="/contact" className="text-olive-600 hover:text-olive-700 font-medium">
                Neem contact op voor meer informatie
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Uitgelichte Producten</h2>
            <Link href="/webshop" className="text-olive-600 hover:text-olive-700 font-medium">
              Alle producten bekijken
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden group"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src={product.imageUrl || "/images/product-placeholder.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-1">{product.name}</h3>
                    <p className="text-olive-600 font-medium mb-3">€{product.price.toFixed(2)}</p>
                    <Link
                      href={`/webshop/product/${product.id}`}
                      className="inline-flex items-center text-olive-600 hover:text-olive-700 font-medium"
                    >
                      <ShoppingBag className="h-4 w-4 mr-1" />
                      Bekijk product
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Er zijn momenteel geen uitgelichte producten.</p>
              <Link href="/webshop" className="text-olive-600 hover:text-olive-700 font-medium">
                Bekijk alle producten
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Community Section */}
      <section className="py-16 bg-olive-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Word lid van onze gemeenschap</h2>
            <p className="text-lg mb-8">
              YRG Motorcycle Club is meer dan alleen motorrijden. Het is een gemeenschap van gelijkgestemde mensen die
              hun passie voor motoren delen.
            </p>
            <Link
              href="/contact"
              className="bg-white text-olive-700 hover:bg-gray-100 px-6 py-3 rounded-md font-medium transition-colors inline-block"
            >
              Neem contact op
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
