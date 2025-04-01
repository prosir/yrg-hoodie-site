import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getSiteConfig } from "@/lib/site-config"
import HomePage from "@/components/home-page"

export default async function Home() {
  // Haal de site configuratie op
  const config = await getSiteConfig()

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

  // Toon de normale homepage als we hier komen
  return <HomePage />
}

