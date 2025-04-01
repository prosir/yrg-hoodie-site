"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export default function MaintenancePage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password.trim()) {
      setError("Voer een toegangscode in")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")

      const response = await fetch("/api/check-maintenance-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (data.success) {
        // De cookie wordt automatisch ingesteld door de API route
        router.push("/")
        router.refresh() // Ververs de pagina om de nieuwe cookie te gebruiken
      } else {
        setError("Ongeldige toegangscode")
      }
    } catch (error) {
      setError("Er is een fout opgetreden bij het controleren van de toegangscode")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-0 left-0 right-0 bg-primary text-white py-3 px-4 text-center font-medium">
        Website in Onderhoud
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">YoungRidersOost</CardTitle>
          <CardDescription className="text-center">
            Deze website is momenteel in onderhoud. Voer de toegangscode in om toegang te krijgen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Fout</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Toegangscode
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Voer de toegangscode in"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Bezig..." : "Toegang Verkrijgen"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-center text-muted-foreground w-full">
            Neem contact op met de beheerder als je toegang nodig hebt.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

