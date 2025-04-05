"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { getActiveCategories } from "@/lib/db-categories"
import { getActiveProducts, getFeaturedProducts } from "@/lib/db-products"
import { getSiteConfig } from "@/lib/site-config"
import type { ProductCategory } from "@/lib/db-categories"
import type { Product } from "@/lib/db-products"
import type { SiteConfig } from "@/lib/site-config"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Webshop() {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null)
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])

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

        // Check for low stock products
        const lowStock = fetchedProducts.filter((product) => {
          if (!product.sizes) return false
          // Check if any size has low stock (less than 3 items)
          return product.sizes.some((size) => size.stock > 0 && size.stock < 3)
        })
        setLowStockProducts(lowStock)
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

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="container mx-auto px-4 py-4">
          <Alert variant="warning" className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Let op: Sommige producten hebben nog maar beperkte voorraad beschikbaar!
            </AlertDescription>
          </Alert>
        </div>
      )}

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
                        {/* Low stock badge */}
                        {product.sizes && product.sizes.some((size) => size.stock > 0 && size.stock < 3) && (
                          <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                            Beperkte voorraad
                          </div>
                        )}
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
                      {/* Low stock badge */}
                      {product.sizes && product.sizes.some((size) => size.stock > 0 && size.stock < 3) && (
                        <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                          Beperkte voorraad
                        </div>
                      )}
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

      {/* Simple Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">&copy; {new Date().getFullYear()} YoungRidersOost. Alle rechten voorbehouden.</p>
        </div>
      </footer>
    </div>
  )
}

