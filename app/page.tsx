import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ProductsPage } from "@/components/products-page"

export default async function Home() {
  // Haal de site configuratie op via de API
  const response = await fetch(
    `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/site-status`,
    {
      cache: "no-store",
    },
  )

  const config = await response.json()

  // Controleer of we in onderhoudsmodus zijn
  if (config.maintenanceMode) {
    // Controleer of er een bypass cookie is
    const cookieStore = cookies()
    const bypassCookie = cookieStore.get("maintenance_bypass")

    // Als er geen bypass cookie is, redirect naar maintenance
    if (!bypassCookie || bypassCookie.value !== "true") {
      redirect("/maintenance")
    }
  }

  // Controleer of de webshop gesloten is
  if (config.shopClosed) {
    redirect("/shop-closed")
  }

  // Toon de producten pagina als we hier komen
  return <ProductsPage />
}

