"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Logo } from "@/components/logo"

export default function Home() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
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
            src="/placeholder.svg?height=1080&width=1920"
            alt="Motorcycle riders"
            fill
            className="object-cover brightness-90"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white"></div>
        </div>

        {/* Navigation */}
        <header className="relative z-10 py-6">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Logo />
              </motion.div>

              <motion.nav
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <ul className="flex space-x-8">
                  <li>
                    <Link href="/webshop" className="text-gray-700 hover:text-olive-600 transition-colors">
                      Webshop
                    </Link>
                  </li>
                  <li>
                    <Link href="/gallery" className="text-gray-700 hover:text-olive-600 transition-colors">
                      Galerij
                    </Link>
                  </li>
                  <li>
                    <Link href="/rides" className="text-gray-700 hover:text-olive-600 transition-colors">
                      Ritten
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-gray-700 hover:text-olive-600 transition-colors">
                      Contact
                    </Link>
                  </li>
                </ul>
              </motion.nav>
            </div>
          </div>
        </header>

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

      {/* Latest Rides Preview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              KOMENDE <span className="text-olive-600">RITTEN</span>
            </h2>
            <Link href="/rides" className="text-olive-600 hover:text-olive-700 font-medium flex items-center">
              Alle ritten bekijken
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Twente Tour",
                date: "15 April 2025",
                time: "10:00",
                distance: "180 km",
                image: "/placeholder.svg?height=300&width=500",
              },
              {
                title: "Veluwe Rit",
                date: "29 April 2025",
                time: "09:30",
                distance: "210 km",
                image: "/placeholder.svg?height=300&width=500",
              },
              {
                title: "Achterhoek Avontuur",
                date: "10 Mei 2025",
                time: "10:30",
                distance: "160 km",
                image: "/placeholder.svg?height=300&width=500",
              },
            ].map((ride, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg overflow-hidden group shadow-md border border-gray-200"
              >
                <div className="relative h-48">
                  <Image
                    src={ride.image || "/placeholder.svg"}
                    alt={ride.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2 text-gray-800">{ride.title}</h3>
                  <div className="flex items-center text-gray-600 mb-1">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {ride.date} - {ride.time}
                  </div>
                  <div className="flex items-center text-gray-600 mb-4">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    {ride.distance}
                  </div>
                  <Link
                    href="/rides"
                    className="bg-olive-600 hover:bg-olive-700 text-white py-2 px-4 rounded-md inline-block transition-colors duration-300"
                  >
                    Aanmelden
                  </Link>
                </div>
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Lilac Hoodie", image: "/placeholder.svg?height=300&width=300" },
              { name: "Ocean Blue Hoodie", image: "/placeholder.svg?height=300&width=300" },
              { name: "Burgundy Hoodie", image: "/placeholder.svg?height=300&width=300" },
              { name: "Zwarte Hoodie", image: "/placeholder.svg?height=300&width=300" },
            ].map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-lg overflow-hidden group shadow-md border border-gray-200"
              >
                <div className="relative h-48">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-center text-gray-800">{product.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>

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
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <Logo />
              <p className="mt-2 text-gray-600">Dé motorclub voor jonge rijders in Oost-Nederland</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Navigatie</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/webshop" className="text-gray-600 hover:text-olive-600 transition-colors">
                      Webshop
                    </Link>
                  </li>
                  <li>
                    <Link href="/gallery" className="text-gray-600 hover:text-olive-600 transition-colors">
                      Galerij
                    </Link>
                  </li>
                  <li>
                    <Link href="/rides" className="text-gray-600 hover:text-olive-600 transition-colors">
                      Ritten
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-gray-600 hover:text-olive-600 transition-colors">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Contact</h3>
                <ul className="space-y-2">
                  <li className="text-gray-600">Telefoon: 06-44947194</li>
                  <li className="text-gray-600">WhatsApp: 06-44947194</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Volg Ons</h3>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-olive-600 hover:bg-olive-600 hover:text-white transition-colors border border-olive-600"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.48 10.5H14V7.5C14 6.12 14.34 5.25 16.5 5.25H18.75V1.5H14C9.75 1.5 7.5 3.75 7.5 7.5V10.5H4.5V15H7.5V22.5H14V15H17.25L18.48 10.5Z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-olive-600 hover:bg-olive-600 hover:text-white transition-colors border border-olive-600"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-500">
              &copy; {new Date().getFullYear()} YoungRidersOost. Alle rechten voorbehouden.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

