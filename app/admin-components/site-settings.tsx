"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getSiteConfig, setMaintenanceMode, setShopClosed, updateMaintenancePassword } from "@/lib/site-config"
import type { SiteConfig } from "@/lib/site-config"

export function SiteSettings() {
  const [config, setConfig] = useState<SiteConfig>({
    maintenanceMode: false,
    shopClosed: false,
    maintenancePassword: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const { toast } = useToast()

  // Haal site-instellingen op bij het laden van de component
  useEffect(() => {
    async function fetchConfig() {
      try {
        setIsLoading(true)
        const fetchedConfig = await getSiteConfig()
        setConfig(fetchedConfig)
      } catch (error) {
        toast({
          title: "Fout bij het ophalen van site-instellingen",
          description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchConfig()
  }, [toast])

  const handleMaintenanceModeChange = async (enabled: boolean) => {
    try {
      setIsSaving(true)
      const updatedConfig = await setMaintenanceMode(enabled)
      setConfig(updatedConfig)

      toast({
        title: enabled ? "Onderhoudsmodus ingeschakeld" : "Onderhoudsmodus uitgeschakeld",
        description: enabled
          ? "De website is nu alleen toegankelijk met het onderhoudswachtwoord."
          : "De website is nu voor iedereen toegankelijk.",
      })
    } catch (error) {
      toast({
        title: "Fout bij het wijzigen van onderhoudsmodus",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleShopClosedChange = async (closed: boolean) => {
    try {
      setIsSaving(true)
      const updatedConfig = await setShopClosed(closed)
      setConfig(updatedConfig)

      toast({
        title: closed ? "Webshop gesloten" : "Webshop geopend",
        description: closed ? "De webshop is nu gesloten voor bezoekers." : "De webshop is nu geopend voor bezoekers.",
      })
    } catch (error) {
      toast({
        title: "Fout bij het wijzigen van webshop status",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (!newPassword) {
      toast({
        title: "Fout bij het wijzigen van wachtwoord",
        description: "Voer een nieuw wachtwoord in",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      const updatedConfig = await updateMaintenancePassword(newPassword)
      setConfig(updatedConfig)
      setNewPassword("")

      toast({
        title: "Wachtwoord bijgewerkt",
        description: "Het onderhoudswachtwoord is succesvol bijgewerkt.",
      })
    } catch (error) {
      toast({
        title: "Fout bij het wijzigen van wachtwoord",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Website Status</CardTitle>
          <CardDescription>Beheer de status van de website en webshop.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance-mode">Onderhoudsmodus</Label>
              <p className="text-sm text-gray-500">
                Wanneer ingeschakeld is de website alleen toegankelijk met het onderhoudswachtwoord.
              </p>
            </div>
            <Switch
              id="maintenance-mode"
              checked={config.maintenanceMode}
              onCheckedChange={handleMaintenanceModeChange}
              disabled={isSaving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="shop-closed">Webshop gesloten</Label>
              <p className="text-sm text-gray-500">
                Wanneer ingeschakeld is de webshop gesloten en kunnen er geen bestellingen worden geplaatst.
              </p>
            </div>
            <Switch
              id="shop-closed"
              checked={config.shopClosed}
              onCheckedChange={handleShopClosedChange}
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Onderhoudswachtwoord</CardTitle>
          <CardDescription>Wijzig het wachtwoord voor toegang tijdens onderhoud.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nieuw wachtwoord</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Voer een nieuw wachtwoord in"
            />
          </div>

          <Button onClick={handlePasswordUpdate} disabled={isSaving || !newPassword}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Wachtwoord bijwerken
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

