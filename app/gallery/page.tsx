"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Logo } from "@/components/logo"

export default function Gallery() {
  const [filter, setFilter] = useState("all")

  // Gallery data - in a real implementation this would come from a database or API
  const galleryItems = [
    { id: 1, category: "rides", title: "Twente Tour 2024", image: "/placeholder.svg?height=600&width=800" },
    { id: 2, category: "rides", title: "Veluwe Rit", image: "/placeholder.svg?height=600&width=800" },
    { id: 3, category: "events", title: "Zomerbijeenkomst", image: "/placeholder.svg?height=600&width=800" },
    { id: 4, category: "members", title: "Nieuwe leden", image: "/placeholder.svg?height=600&width=800" },
    { id: 5, category: "rides", title: "Achterhoek Avontuur", image: "/placeholder.svg?height=600&width=800" },
    { id: 6, category: "events", title: "BBQ Meetup", image: "/placeholder.svg?height=600&width=800" },
    { id: 7, category: "members", title: "Groepsfoto", image: "/placeholder.svg?height=600&width=800" },
    { id: 8, category: "rides", title: "Duitsland Weekend", image: "/placeholder.svg?height=600&width=800" },
    { id: 9, category: "events", title: "Winterbijeenkomst", image: "/placeholder.svg?height=600&width=800" },
    { id: 10, category: "members", title: "Nieuwe motoren", image: "/placeholder.svg?height=600&width=800" },
    { id: 11, category: "rides", title: "Rondje IJsselmeer", image: "/placeholder.svg?height=600&width=800" },
    { id: 12, category: "events", title: "Motorshow Bezoek", image: "/placeholder.svg?height=600&width=800" },
  ]

  // Filter gallery items based on selected category
  const filteredItems = filter === "all" ? galleryItems : galleryItems.filter((item) => item.category === filter)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <header className="py-6 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Logo />
            <nav>
              <ul className="flex space-x-8">
                <li>
                  <Link href="/" className="text-white hover:text-red-500 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/webshop" className="text-white hover:text-red-500 transition-colors">
                    Webshop
                  </Link>
                </li>
                <li>
                  <Link href="/gallery" className="text-red-500">
                    Galerij
                  </Link>
                </li>
                <li>
                  <Link href="/rides" className="text-white hover:text-red-500 transition-colors">
                    Ritten
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Gallery Header */}
      <section className="py-12 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ONZE <span className="text-red-600">GALERIJ</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Bekijk foto's van onze ritten, evenementen en leden.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-2 rounded-full transition-colors ${
                filter === "all" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Alle Foto's
            </button>
            <button
              onClick={() => setFilter("rides")}
              className={`px-6 py-2 rounded-full transition-colors ${
                filter === "rides" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Ritten
            </button>
            <button
              onClick={() => setFilter("events")}
              className={`px-6 py-2 rounded-full transition-colors ${
                filter === "events" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Evenementen
            </button>
            <button
              onClick={() => setFilter("members")}
              className={`px-6 py-2 rounded-full transition-colors ${
                filter === "members" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              Leden
            </button>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-12 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative group overflow-hidden rounded-lg"
              >
                <div className="relative h-64 md:h-80">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg">{item.title}</h3>
                    <span className="text-sm text-gray-300 capitalize">{item.category}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Geen foto's gevonden in deze categorie.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <Link href="/" className="text-3xl font-bold text-red-600">
                YoungRidersOost
              </Link>
              <p className="mt-2 text-gray-400">Dé motorclub voor jonge rijders in Oost-Nederland</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Navigatie</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/" className="text-gray-400 hover:text-red-500 transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/webshop" className="text-gray-400 hover:text-red-500 transition-colors">
                      Webshop
                    </Link>
                  </li>
                  <li>
                    <Link href="/gallery" className="text-gray-400 hover:text-red-500 transition-colors">
                      Galerij
                    </Link>
                  </li>
                  <li>
                    <Link href="/rides" className="text-gray-400 hover:text-red-500 transition-colors">
                      Ritten
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Contact</h3>
                <ul className="space-y-2">
                  <li className="text-gray-400">Telefoon: 06-44947194</li>
                  <li className="text-gray-400">WhatsApp: 06-44947194</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Volg Ons</h3>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.48 10.5H14V7.5C14 6.12 14.34 5.25 16.5 5.25H18.75V1.5H14C9.75 1.5 7.5 3.75 7.5 7.5V10.5H4.5V15H7.5V22.5H14V15H17.25L18.48 10.5Z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-500">
              &copy; {new Date().getFullYear()} YoungRidersOost. Alle rechten voorbehouden.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

