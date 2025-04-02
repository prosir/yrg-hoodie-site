"use server"

import fs from "fs/promises"
import path from "path"

export type SiteConfig = {
  maintenanceMode: boolean
  shopClosed: boolean
  maintenancePassword: string
}

// We gebruiken een absolute pad voor de config file
const CONFIG_FILE = path.join(process.cwd(), "data", "site-config.json")

// Initialize with default values
const DEFAULT_CONFIG: SiteConfig = {
  maintenanceMode: false,
  shopClosed: false,
  maintenancePassword: "youngriders2025",
}

// Ensure data directory and config file exist
async function ensureConfig() {
  const dataDir = path.join(process.cwd(), "data")

  try {
    await fs.access(dataDir)
  } catch (error) {
    await fs.mkdir(dataDir, { recursive: true })
  }

  try {
    await fs.access(CONFIG_FILE)
  } catch (error) {
    // If file doesn't exist, create it with default config
    await fs.writeFile(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), "utf8")
  }
}

// Get current site configuration
export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    await ensureConfig()

    try {
      const data = await fs.readFile(CONFIG_FILE, "utf8")
      return JSON.parse(data)
    } catch (error) {
      console.error("Error reading site config:", error)
      return DEFAULT_CONFIG
    }
  } catch (error) {
    console.error("Error ensuring config directory:", error)
    return DEFAULT_CONFIG
  }
}

// Set site maintenance mode
export async function setMaintenanceMode(enabled: boolean): Promise<SiteConfig> {
  try {
    await ensureConfig()

    try {
      const config = await getSiteConfig()
      const updatedConfig = { ...config, maintenanceMode: enabled }

      await fs.writeFile(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2), "utf8")
      return updatedConfig
    } catch (error) {
      console.error("Error setting maintenance mode:", error)
      throw new Error("Failed to update site configuration")
    }
  } catch (error) {
    console.error("Error ensuring config directory:", error)
    throw new Error("Failed to access configuration directory")
  }
}

// Set shop closed status
export async function setShopClosed(closed: boolean): Promise<SiteConfig> {
  try {
    await ensureConfig()

    try {
      const config = await getSiteConfig()
      const updatedConfig = { ...config, shopClosed: closed }

      await fs.writeFile(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2), "utf8")
      return updatedConfig
    } catch (error) {
      console.error("Error setting shop closed status:", error)
      throw new Error("Failed to update site configuration")
    }
  } catch (error) {
    console.error("Error ensuring config directory:", error)
    throw new Error("Failed to access configuration directory")
  }
}

// Update maintenance password
export async function updateMaintenancePassword(password: string): Promise<SiteConfig> {
  try {
    await ensureConfig()

    try {
      const config = await getSiteConfig()
      const updatedConfig = { ...config, maintenancePassword: password }

      await fs.writeFile(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2), "utf8")
      return updatedConfig
    } catch (error) {
      console.error("Error updating maintenance password:", error)
      throw new Error("Failed to update maintenance password")
    }
  } catch (error) {
    console.error("Error ensuring config directory:", error)
    throw new Error("Failed to access configuration directory")
  }
}

