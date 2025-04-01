import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Phone } from "lucide-react"
import Link from "next/link"

export default function ShopClosedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-0 left-0 right-0 bg-destructive/80 text-white py-3 px-4 text-center font-medium">
        Webshop Gesloten
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <ShoppingBag className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-center">YoungRidersOost</CardTitle>
          <CardDescription className="text-center">
            Onze webshop is momenteel gesloten voor nieuwe bestellingen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p>
            Dank voor je interesse in onze hoodies! Helaas is het op dit moment niet mogelijk om een bestelling te
            plaatsen.
          </p>
          <p className="font-medium">De bestellingen zullen binnenkort weer worden geopend. Kom later terug!</p>

          <div className="flex items-center justify-center mt-6 p-4 bg-muted rounded-lg">
            <Phone className="h-5 w-5 mr-2 text-primary" />
            <span>Voor vragen: 06-44947194</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/admin">
            <Button variant="outline">Admin Login</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

