import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, MapPin, Users } from "lucide-react"

// Remove the import for recent orders if it exists
// import { getRecentOrders } from "@/lib/db-orders" or similar

export default async function HomePage() {
  // Fetch featured rides and products
  const featuredRidesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/featured-rides`, {
    cache: "no-store",
  })
  const featuredRides = await featuredRidesResponse.json()

  const featuredProductsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/featured-products`, {
    cache: "no-store",
  })
  const featuredProducts = await featuredProductsResponse.json()

  // Remove any code that fetches recent orders
  // const recentOrdersResponse = await fetch...
  // const recentOrders = await...

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <section>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome to Motorcycle Club</h1>
              <p className="text-muted-foreground">Explore our upcoming rides and shop for merchandise.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/rides">
                <Button>View All Rides</Button>
              </Link>
              <Link href="/webshop">
                <Button variant="outline">Visit Shop</Button>
              </Link>
            </div>
          </div>

          <Tabs defaultValue="rides" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="rides">Featured Rides</TabsTrigger>
              <TabsTrigger value="products">Featured Products</TabsTrigger>
            </TabsList>

            <TabsContent value="rides" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredRides.map((ride) => (
                  <Card key={ride.id}>
                    <CardHeader className="pb-2">
                      <CardTitle>{ride.title}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          <span>{new Date(ride.date).toLocaleDateString()}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video relative rounded-md overflow-hidden mb-2">
                        {ride.image ? (
                          <Image
                            src={ride.image || "/placeholder.svg"}
                            alt={ride.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <MapPin className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="line-clamp-2 text-sm">{ride.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/rides/${ride.id}`} className="w-full">
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredProducts.map((product) => (
                  <Card key={product.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{product.name}</CardTitle>
                      <CardDescription>${product.price.toFixed(2)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-square relative rounded-md overflow-hidden mb-2">
                        {product.image ? (
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted" />
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/webshop/product/${product.slug}`} className="w-full">
                        <Button variant="outline" className="w-full">
                          View Product
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Recent Orders section has been removed */}

        <section className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">About Our Club</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <p className="mb-4">
                    Our motorcycle club is dedicated to bringing together riders of all experience levels for exciting
                    adventures and community events.
                  </p>
                  <p>Join us for weekly rides, special events, and connect with fellow motorcycle enthusiasts.</p>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <Users className="h-8 w-8" />
                    <span className="text-xl font-bold">Join our community today!</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/contact" className="w-full">
                <Button className="w-full">Contact Us</Button>
              </Link>
            </CardFooter>
          </Card>
        </section>
      </div>
    </div>
  )
}
