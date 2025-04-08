"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

// Define types for our data
interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  [key: string]: any
}

interface Ride {
  id: string
  title: string
  date: string
  time: string
  distance: string
  image: string
  [key: string]: any
}

interface SiteConfig {
  homeHeroImage: string
}

export default function Home() {
  const [isMounted, setIsMounted] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [rides, setRides] = useState<Ride[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    homeHeroImage: "/placeholder.svg?height=1080&width=1920",
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])

  useEffect(() => {
    setIsMounted(true)

    async function fetchData() {
      try {
        setIsLoading(true)

        // Fetch site configuration
        const configResponse = await fetch("/api/site-config")
        if (configResponse.ok) {
          const configData = await configResponse.json()
          setSiteConfig(configData)
        }

        // Fetch products from our API endpoint
        const productsResponse = await fetch("/api/featured-products")
        const productsData = await productsResponse.json()
        setProducts(productsData)

        // Fetch rides from our API endpoint
        const ridesResponse = await fetch("/api/featured-rides")
        const ridesData = await ridesResponse.json()
        setRides(ridesData)

        // Fetch recent orders
        const ordersResponse = await fetch("/api/recent-orders")
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json()
          setRecentOrders(ordersData)
        }
      } catch (error) {
        console.error("Error fetching data for homepage:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src={siteConfig.homeHeroImage || "/placeholder.svg"}
            alt="Motorcycle riders"
            fill
            className="object-cover brightness-90"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 h-[calc(100vh-80px)] flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-6xl md:text-8xl font-extrabold mb-6 leading-tight text-gray-800">
              YOUNG<span className="text-olive-600 inline-block">RIDERS</span>OOST
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-2xl">
              Dé motorclub voor jonge rijders in Oost-Nederland. Ontdek onze ritten, merchandise en meer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/webshop"
                  className="inline-block bg-olive-600 hover:bg-olive-700 text-white font-bold py-4 px-8 rounded-md transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  WEBSHOP
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/rides"
                  className="inline-block bg-transparent hover:bg-olive-50 text-olive-700 border-2 border-olive-600 font-bold py-4 px-8 rounded-md transition-all duration-300"
                >
                  RITTEN
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Compact */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Premium Merchandise",
                description: "Exclusieve hoodies en meer voor onze leden en supporters.",
                icon: (
                  <svg className="w-8 h-8 text-olive-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                ),
                link: "/webshop",
              },
              {
                title: "Motorritten",
                description: "Regelmatige ritten door het mooie Oost-Nederlandse landschap.",
                icon: (
                  <svg className="w-8 h-8 text-olive-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                ),
                link: "/rides",
              },
              {
                title: "Community",
                description: "Word deel van onze groeiende gemeenschap van jonge motorrijders.",
                icon: (
                  <svg className="w-8 h-8 text-olive-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                ),
                link: "/gallery",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-lg border border-gray-200 hover:border-olive-600 transition-colors duration-300 shadow-sm"
              >
                <div className="flex items-center mb-4">
                  {feature.icon}
                  <h3 className="text-xl font-bold ml-3 text-gray-800">{feature.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <Link href={feature.link} className="text-olive-600 hover:text-olive-700 font-medium flex items-center">
                  Meer info
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Merchandise Preview */}
      <section className="py-16 bg-gradient-to-b from-gray-100 to-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              ONZE <span className="text-olive-600">MERCHANDISE</span>
            </h2>
            <Link href="/webshop" className="text-olive-600 hover:text-olive-700 font-medium flex items-center">
              Naar de webshop
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-olive-600" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-lg overflow-hidden group shadow-md border border-gray-200"
                >
                  <Link href={`/webshop/product/${product.slug}`}>
                    <div className="relative h-48">
                      <Image
                        src={
                          product.images && product.images.length > 0
                            ? product.images[0]
                            : "/placeholder.svg?height=300&width=300"
                        }
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-center text-gray-800">{product.name}</h3>
                      <p className="text-center text-olive-600 font-bold mt-1">€{product.price.toFixed(2)}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Er zijn momenteel geen producten beschikbaar.</p>
            </div>
          )}

          {products.length > 0 && (
            <div className="mt-10 text-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/webshop"
                  className="inline-block bg-olive-600 hover:bg-olive-700 text-white font-bold py-3 px-6 rounded-md transition-all duration-300"
                >
                  BEKIJK ALLE PRODUCTEN
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
