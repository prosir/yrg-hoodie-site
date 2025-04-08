"use server"

import fs from "fs/promises"
import path from "path"

export type SiteConfig = {
  maintenanceMode: boolean
  shopClosed: boolean
  maintenancePassword: string
  homeHeroImage: string
  contactHeroImage: string
  logoPath: string
}

// Pad naar het JSON-bestand voor opslag
const CONFIG_FILE = path.join(process.cwd(), "data", "site-config.json")

// Zorg ervoor dat de data directory en bestand bestaan
async function ensureConfigFile() {
  const dataDir = path.join(process.cwd(), "data")
  try {
    await fs.access(dataDir)
  } catch (error) {
    // Als de directory niet bestaat, maak deze aan
    console.log("Data directory bestaat niet, wordt aangemaakt...")
    await fs.mkdir(dataDir, { recursive: true })
  }

  // Controleer of het bestand bestaat, zo niet, maak het aan
  try {
    await fs.access(CONFIG_FILE)
  } catch (error) {
    // Als het bestand niet bestaat, maak een nieuw bestand met standaard configuratie
    console.log("Site-config.json bestand bestaat niet, wordt aangemaakt...")
    const defaultConfig: SiteConfig = {
      maintenanceMode: false,
      shopClosed: false,
      maintenancePassword: "admin123",
      homeHeroImage: "/placeholder.svg?height=1080&width=1920",
      contactHeroImage: "/motorcycle-hero.jpg",
      logoPath: "/logo.png",
    }
    await fs.writeFile(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2), "utf8")
  }
}

// Haal de site configuratie op
export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    await ensureConfigFile()

    const data = await fs.readFile(CONFIG_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Fout bij het ophalen van site configuratie:", error)
    // Retourneer standaard configuratie bij een fout
    return {
      maintenanceMode: false,
      shopClosed: false,
      maintenancePassword: "admin123",
      homeHeroImage: "/placeholder.svg?height=1080&width=1920",
      contactHeroImage: "/motorcycle-hero.jpg",
      logoPath: "/logo.png",
    }
  }
}

// Update de onderhoudsmodus
export async function setMaintenanceMode(enabled: boolean): Promise<SiteConfig> {
  try {
    await ensureConfigFile()

    // Haal huidige configuratie op
    const config = await getSiteConfig()

    // Update de onderhoudsmodus
    config.maintenanceMode = enabled

    // Schrijf terug naar het bestand
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf8")

    return config
  } catch (error) {
    console.error("Fout bij het updaten van onderhoudsmodus:", error)
    throw error
  }
}

// Update de webshop status
export async function setShopClosed(closed: boolean): Promise<SiteConfig> {
  try {
    await ensureConfigFile()

    // Haal huidige configuratie op
    const config = await getSiteConfig()

    // Update de webshop status
    config.shopClosed = closed

    // Schrijf terug naar het bestand
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf8")

    return config
  } catch (error) {
    console.error("Fout bij het updaten van webshop status:", error)
    throw error
  }
}

// Update het onderhoudswachtwoord
export async function updateMaintenancePassword(password: string): Promise<SiteConfig> {
  try {
    await ensureConfigFile()

    // Haal huidige configuratie op
    const config = await getSiteConfig()

    // Update het wachtwoord
    config.maintenancePassword = password

    // Schrijf terug naar het bestand
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf8")

    return config
  } catch (error) {
    console.error("Fout bij het updaten van onderhoudswachtwoord:", error)
    throw error
  }
}

// Update de home hero afbeelding
export async function updateHomeHeroImage(imagePath: string): Promise<SiteConfig> {
  try {
    await ensureConfigFile()

    // Haal huidige configuratie op
    const config = await getSiteConfig()

    // Update de home hero afbeelding
    config.homeHeroImage = imagePath

    // Schrijf terug naar het bestand
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf8")

    return config
  } catch (error) {
    console.error("Fout bij het updaten van home hero afbeelding:", error)
    throw error
  }
}

// Update de contact hero afbeelding
export async function updateContactHeroImage(imagePath: string): Promise<SiteConfig> {
  try {
    await ensureConfigFile()

    // Haal huidige configuratie op
    const config = await getSiteConfig()

    // Update de contact hero afbeelding
    config.contactHeroImage = imagePath

    // Schrijf terug naar het bestand
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf8")

    return config
  } catch (error) {
    console.error("Fout bij het updaten van contact hero afbeelding:", error)
    throw error
  }
}

// Update het logo pad
export async function updateLogoPath(logoPath: string): Promise<SiteConfig> {
  try {
    await ensureConfigFile()

    // Haal huidige configuratie op
    const config = await getSiteConfig()

    // Update het logo pad
    config.logoPath = logoPath

    // Schrijf terug naar het bestand
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf8")

    return config
  } catch (error) {
    console.error("Fout bij het updaten van logo pad:", error)
    throw error
  }
}
