"use client"

import type React from "react"
import { createContext, useContext } from "react"
import type { SiteConfig } from "@/lib/site-config"

type SiteConfigContextType = {
  config: SiteConfig
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined)

export function SiteConfigProvider({
  children,
  config,
}: {
  children: React.ReactNode
  config: SiteConfig
}) {
  return <SiteConfigContext.Provider value={{ config }}>{children}</SiteConfigContext.Provider>
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext)
  if (context === undefined) {
    throw new Error("useSiteConfig must be used within a SiteConfigProvider")
  }
  return context
}
