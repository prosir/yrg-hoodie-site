"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Logo } from "@/components/logo"
import { getActiveCategories } from "@/lib/db-categories"
import { getActiveProducts, getFeaturedProducts } from "@/lib/db-products"
import { getSiteConfig } from "@/lib/site-config"
import type { ProductCategory } from "@/lib/db-categories"
import type { Product } from "@/lib/db-products"
import type { SiteConfig } from "@/lib/site-config"
import { Loader2 } from "lucide-react"

export default function Webshop() {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null)

  // Haal categorieën, producten en site-instellingen op bij het laden van de pagina
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)

        // Haal site-instellingen op
        const config = await getSiteConfig()
        setSiteConfig(config)

        // Als de webshop gesloten is, toon geen producten
        if (config.shopClosed) {
          setCategories([])
          setProducts([])
          setFeaturedProducts([])
          return
        }

        // Haal categorieën en producten op
        const [fetchedCategories, fetchedProducts, fetchedFeaturedProducts] = await Promise.all([
          getActiveCategories(),
          getActiveProducts(),
          getFeaturedProducts(),
        ])

        setCategories(fetchedCategories)
        setProducts(fetchedProducts)
        setFeaturedProducts(fetchedFeaturedProducts)
      } catch (error) {
        console.error("Fout bij het ophalen van webshop data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter producten op basis van geselecteerde categorie
  const filteredProducts = selectedCategory
    ? products.filter((product) => {
        const category = categories.find((cat) => cat.id === product.categoryId)
        return category && category.slug === selectedCategory
      })
    : products

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Navigation */}
      <header className="py-6 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Logo />
            <nav>
              <ul className="flex space-x-8">
                <li>
                  <Link href="/" className="text-gray-700 hover:text-olive-600 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/webshop" className="text-olive-600">
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
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Webshop Header */}
      <section className="py-12 bg-gradient-to-b from-white to-gray-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              YOUNG<span className="text-olive-600">RIDERS</span>OOST WEBSHOP
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ontdek onze exclusieve merchandise en rijd met stijl.
            </p>
          </motion.div>
        </div>
      </section>

      {isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-olive-600" />
        </div>
      ) : siteConfig?.shopClosed ? (
        <div className="py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Webshop tijdelijk gesloten</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Onze webshop is momenteel gesloten. Kom later terug voor nieuwe producten!
          </p>
        </div>
      ) : (
        <>
          {/* Category Filter */}
          {categories.length > 0 && (
            <section className="py-8 bg-gray-100">
              <div className="container mx-auto px-4">
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-6 py-2 rounded-full transition-colors ${
                      selectedCategory === null
                        ? "bg-olive-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Alle Producten
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.slug)}
                      className={`px-6 py-2 rounded-full transition-colors ${
                        selectedCategory === category.slug
                          ? "bg-olive-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Featured Products */}
          {featuredProducts.length > 0 && !selectedCategory && (
            <section className="py-12 bg-white">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold mb-8 text-center">Uitgelichte Producten</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {featuredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -10 }}
                      className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm group"
                    >
                      <div className="relative h-64 bg-gray-100 overflow-hidden">
                        <Image
                          src={
                            product.images && product.images.length > 0
                              ? product.images[0]
                              : "/placeholder.svg?height=400&width=400"
                          }
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-xl mb-2 text-gray-800">{product.name}</h3>
                        <div className="flex justify-between items-center">
                          <span className="text-olive-600 font-bold text-xl">€{product.price.toFixed(2)}</span>
                          <Link
                            href={`/webshop/product/${product.slug}`}
                            className="bg-olive-600 hover:bg-olive-700 text-white py-2 px-4 rounded-md transition-colors duration-300"
                          >
                            Bekijken
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Products */}
          <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
              {selectedCategory && (
                <h2 className="text-2xl font-bold mb-8 text-center">
                  {categories.find((cat) => cat.slug === selectedCategory)?.name || "Producten"}
                </h2>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                    className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm group"
                  >
                    <div className="relative h-64 bg-gray-100 overflow-hidden">
                      <Image
                        src={
                          product.images && product.images.length > 0
                            ? product.images[0]
                            : "/placeholder.svg?height=400&width=400"
                        }
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-xl mb-2 text-gray-800">{product.name}</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-olive-600 font-bold text-xl">€{product.price.toFixed(2)}</span>
                        <Link
                          href={`/webshop/product/${product.slug}`}
                          className="bg-olive-600 hover:bg-olive-700 text-white py-2 px-4 rounded-md transition-colors duration-300"
                        >
                          Bekijken
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Geen producten gevonden in deze categorie.</p>
                </div>
              )}
            </div>
          </section>

          {/* Size Information for Clothing */}
          {categories.some((cat) => cat.isClothing) && (
            <section className="py-12 bg-gradient-to-b from-gray-100 to-white">
              <div className="container mx-auto px-4">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold mb-4 text-olive-600 text-center">MAATINFORMATIE</h3>
                  <p className="mb-2 text-gray-700 text-center">Alle maten zijn beschikbaar: S, M, L, XL, XXL, XXXL</p>
                  <p className="font-medium text-gray-800 text-center">
                    <strong className="text-olive-600">Belangrijk:</strong> Onze hoodies vallen 1 maat kleiner! Bestel 1
                    maat groter dan je normaal draagt.
                  </p>
                  <p className="font-medium text-gray-800 mt-2 text-center">
                    Voor gebruik over motorkleding raden we aan om 2 maten groter te bestellen dan je gebruikelijke
                    maat.
                  </p>
                </div>
              </div>
            </section>
          )}
        </>
      )}

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
                    <Link href="/" className="text-gray-600 hover:text-olive-600 transition-colors">
                      Home
                    </Link>
                  </li>
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

