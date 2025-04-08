"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Save, RefreshCw, User, Lock, Globe, ShieldAlert } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { SiteSettings } from "@/app/admin-components/site-settings"

export default function SettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSaveSettings = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Instellingen opgeslagen",
        description: "De instellingen zijn succesvol opgeslagen.",
      })
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Instellingen</h1>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Algemeen
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Beveiliging
          </TabsTrigger>
          <TabsTrigger value="site" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Website
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Algemene Instellingen</CardTitle>
              <CardDescription>Beheer de algemene instellingen van de applicatie.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteName">Website Naam</Label>
                <Input id="siteName" defaultValue="YoungRidersOost" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact E-mail</Label>
                <Input id="contactEmail" type="email" defaultValue="info@youngridersoost.nl" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Telefoonnummer</Label>
                <Input id="contactPhone" defaultValue="06-44947194" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">E-mail Notificaties</Label>
                  <p className="text-sm text-muted-foreground">Ontvang e-mails bij nieuwe bestellingen</p>
                </div>
                <Switch id="notifications" defaultChecked />
              </div>

              <Separator />

              <Button onClick={handleSaveSettings} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Opslaan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Instellingen Opslaan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Instellingen</CardTitle>
              <CardDescription>Beheer je account instellingen.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Gebruikersnaam</Label>
                <Input id="username" defaultValue="admin" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" defaultValue="admin@youngridersoost.nl" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Naam</Label>
                <Input id="name" defaultValue="Administrator" />
              </div>

              <Separator />

              <Button onClick={handleSaveSettings} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Opslaan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Account Opslaan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Beveiligingsinstellingen</CardTitle>
              <CardDescription>Beheer je wachtwoord en beveiligingsinstellingen.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Huidig Wachtwoord</Label>
                <Input id="currentPassword" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nieuw Wachtwoord</Label>
                <Input id="newPassword" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Bevestig Nieuw Wachtwoord</Label>
                <Input id="confirmPassword" type="password" />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Belangrijk</AlertTitle>
                <AlertDescription>
                  Zorg ervoor dat je wachtwoord minimaal 8 tekens bevat, inclusief hoofdletters, kleine letters, cijfers
                  en speciale tekens.
                </AlertDescription>
              </Alert>

              <Separator />

              <Button onClick={handleSaveSettings} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Opslaan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Wachtwoord Wijzigen
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="site" className="space-y-6">
          <SiteSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
