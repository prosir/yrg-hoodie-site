"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Settings, ShieldAlert, NavigationOffIcon as ShoppingCartOff, CheckCircle, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

// Type voor site configuratie
type SiteConfig = {
  maintenanceMode: boolean
  shopClosed: boolean
  maintenancePassword?: string
}

export function SiteSettings() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [passwordChanged, setPasswordChanged] = useState(false)

  // Laad de instellingen bij het laden van de component
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true)

        // Haal de instellingen op van de API
        const response = await fetch("/api/admin/site-settings")

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const config = await response.json()

        // Haal het opgeslagen wachtwoord op uit localStorage (als het bestaat)
        const savedPassword = localStorage.getItem("maintenance_password")
        if (savedPassword) {
          config.maintenancePassword = savedPassword
        } else {
          config.maintenancePassword = "youngriders2025" // Standaard wachtwoord
        }

        setSiteConfig(config)
      } catch (error) {
        console.error("Failed to load site configuration:", error)
        toast({
          title: "Fout bij laden",
          description: "Er is een fout opgetreden bij het laden van de site-instellingen.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  // Functie om de onderhoudsmodus in/uit te schakelen
  const handleMaintenanceToggle = async (checked: boolean) => {
    if (!siteConfig) return

    try {
      setUpdating(true)

      // Update de API
      const response = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "setMaintenanceMode",
          value: checked,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const updatedConfig = await response.json()

      // Update de lokale state
      setSiteConfig((prev) => ({
        ...prev!,
        maintenanceMode: checked,
      }))

      toast({
        title: checked ? "Onderhoudsmodus ingeschakeld" : "Onderhoudsmodus uitgeschakeld",
        description: checked
          ? "De website is nu in onderhoudsmodus. Alleen geautoriseerde gebruikers hebben toegang."
          : "De website is nu weer toegankelijk voor iedereen.",
      })
    } catch (error) {
      console.error("Failed to toggle maintenance mode:", error)
      toast({
        title: "Fout bij bijwerken",
        description: "Er is een fout opgetreden bij het wijzigen van de onderhoudsmodus.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  // Functie om de webshop te sluiten/openen
  const handleShopClosedToggle = async (checked: boolean) => {
    if (!siteConfig) return

    try {
      setUpdating(true)

      // Update de API
      const response = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "setShopClosed",
          value: checked,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const updatedConfig = await response.json()

      // Update de lokale state
      setSiteConfig((prev) => ({
        ...prev!,
        shopClosed: checked,
      }))

      toast({
        title: checked ? "Webshop gesloten" : "Webshop geopend",
        description: checked
          ? "De webshop is nu gesloten voor nieuwe bestellingen."
          : "De webshop is nu weer open voor bestellingen.",
      })
    } catch (error) {
      console.error("Failed to toggle shop closed status:", error)
      toast({
        title: "Fout bij bijwerken",
        description: "Er is een fout opgetreden bij het wijzigen van de webshop status.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  // Functie om het onderhoudswachtwoord bij te werken
  const handlePasswordUpdate = async () => {
    if (!siteConfig || !newPassword) return

    try {
      setUpdating(true)

      // Update de API
      const response = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updateMaintenancePassword",
          value: newPassword,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Sla het wachtwoord op in localStorage
      localStorage.setItem("maintenance_password", newPassword)

      // Update de lokale state
      setSiteConfig((prev) => ({
        ...prev!,
        maintenancePassword: newPassword,
      }))

      setPasswordChanged(true)
      setNewPassword("")

      toast({
        title: "Wachtwoord bijgewerkt",
        description: "Het onderhoudswachtwoord is succesvol bijgewerkt.",
      })

      // Reset the success message after 5 seconds
      setTimeout(() => setPasswordChanged(false), 5000)
    } catch (error) {
      console.error("Failed to update maintenance password:", error)
      toast({
        title: "Fout bij bijwerken",
        description: "Er is een fout opgetreden bij het bijwerken van het wachtwoord.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> Website Instellingen
          </CardTitle>
          <CardDescription>Bezig met laden...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  if (!siteConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> Website Instellingen
          </CardTitle>
          <CardDescription>Beheer de status van de website</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fout bij laden</AlertTitle>
            <AlertDescription>
              De site-instellingen konden niet worden geladen. Vernieuw de pagina om het opnieuw te proberen.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" /> Website Instellingen
        </CardTitle>
        <CardDescription>Beheer de status van de website</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between bg-muted/40 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <ShieldAlert className={siteConfig.maintenanceMode ? "text-amber-500" : "text-muted-foreground"} />
                <div>
                  <Label htmlFor="maintenance-mode" className="text-base">
                    Onderhoudsmodus
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Zet de hele website in onderhoudsmodus. Alleen toegankelijk met wachtwoord.
                  </p>
                </div>
              </div>
              <Switch
                id="maintenance-mode"
                checked={siteConfig.maintenanceMode}
                onCheckedChange={handleMaintenanceToggle}
                disabled={updating}
              />
            </div>

            <div className="flex items-center justify-between bg-muted/40 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <ShoppingCartOff className={siteConfig.shopClosed ? "text-destructive" : "text-muted-foreground"} />
                <div>
                  <Label htmlFor="shop-closed" className="text-base">
                    Webshop Sluiten
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Sluit de webshop voor nieuwe bestellingen zonder de hele site te blokkeren.
                  </p>
                </div>
              </div>
              <Switch
                id="shop-closed"
                checked={siteConfig.shopClosed}
                onCheckedChange={handleShopClosedToggle}
                disabled={updating}
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Onderhoudswachtwoord Wijzigen</h3>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Nieuw wachtwoord voor onderhoudsmodus"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button onClick={handlePasswordUpdate} disabled={!newPassword || updating} className="w-full">
                Wachtwoord Bijwerken
              </Button>

              {passwordChanged && (
                <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Wachtwoord succesvol bijgewerkt</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        {siteConfig.maintenanceMode && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Website in onderhoudsmodus</AlertTitle>
            <AlertDescription>
              De website is momenteel in onderhoudsmodus. Bezoekers krijgen een wachtwoordscherm te zien.
            </AlertDescription>
          </Alert>
        )}

        {siteConfig.shopClosed && !siteConfig.maintenanceMode && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Webshop gesloten</AlertTitle>
            <AlertDescription>
              De webshop is momenteel gesloten. Bezoekers kunnen geen nieuwe bestellingen plaatsen.
            </AlertDescription>
          </Alert>
        )}

        {!siteConfig.maintenanceMode && !siteConfig.shopClosed && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-600">Website volledig operationeel</AlertTitle>
            <AlertDescription>
              De website en webshop zijn volledig operationeel en toegankelijk voor alle bezoekers.
            </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  )
}

