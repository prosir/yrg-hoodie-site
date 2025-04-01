"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { updateTrackingNumber, markTrackingAsSent } from "@/lib/db"
import type { Order } from "@/lib/db"

interface TrackingDialogProps {
  order: Order
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedOrder: Order) => void
}

export function TrackingDialog({ order, isOpen, onClose, onSuccess }: TrackingDialogProps) {
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!trackingNumber.trim()) {
      toast({
        title: "Fout",
        description: "Voer een geldig tracking nummer in",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Update tracking nummer in de database
      const updatedOrder = await updateTrackingNumber(order.id, trackingNumber)

      toast({
        title: "Tracking nummer bijgewerkt",
        description: `Tracking nummer voor bestelling ${order.id} is bijgewerkt.`,
      })

      onSuccess(updatedOrder)
      onClose()
    } catch (error) {
      console.error("Fout bij het updaten van tracking nummer:", error)
      toast({
        title: "Fout bij bijwerken",
        description: "Er is een fout opgetreden bij het bijwerken van het tracking nummer.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendTracking = () => {
    if (!order.trackingNumber) {
      toast({
        title: "Geen tracking nummer",
        description: "Voeg eerst een tracking nummer toe voordat je het verstuurt.",
        variant: "destructive",
      })
      return
    }

    // Genereer WhatsApp link met tracking informatie voor Vinted GO
    const message = `Hallo ${order.name}, je YoungRidersOost hoodie is verzonden! We hebben het dichtsbijzijnde pakketpunt geselecteerd en je pakket is ook verzekerd. Je kunt je pakket volgen met het volgende Vinted GO tracking nummer: ${order.trackingNumber}. Volg je pakket hier: https://vintedgo.com/nl/tracking/${order.trackingNumber}`
    const whatsappUrl = `https://wa.me/31${order.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`

    // Open WhatsApp in een nieuw tabblad
    window.open(whatsappUrl, "_blank")

    // Markeer tracking als verzonden
    markTrackingAsSent(order.id)
      .then((updatedOrder) => {
        toast({
          title: "Tracking info klaar om te versturen",
          description: "WhatsApp is geopend met het tracking bericht.",
        })
        onSuccess(updatedOrder)
      })
      .catch((error) => {
        console.error("Fout bij het markeren van tracking als verzonden:", error)
      })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Vinted GO Tracking Toevoegen</DialogTitle>
          <DialogDescription>Voeg een Vinted GO tracking nummer toe voor bestelling {order.id}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tracking" className="text-right">
                Tracking #
              </Label>
              <Input
                id="tracking"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Vinted GO tracking nummer"
                className="col-span-3"
              />
            </div>

            {order.trackingNumber && (
              <div className="bg-secondary/30 p-3 rounded-md text-sm">
                <p className="font-medium">Tracking link:</p>
                <a
                  href={`https://vintedgo.com/nl/tracking/${order.trackingNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline break-all"
                >
                  https://vintedgo.com/nl/tracking/{order.trackingNumber}
                </a>
                <p className="mt-2 text-muted-foreground">
                  {order.trackingSent
                    ? "✓ Tracking informatie is al verstuurd via WhatsApp"
                    : "Tracking informatie is nog niet verstuurd"}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {order.trackingNumber && (
              <Button type="button" variant="secondary" onClick={handleSendTracking} className="w-full sm:w-auto">
                Verstuur Vinted GO tracking via WhatsApp
              </Button>
            )}
                          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? "Opslaan..." : "Vinted GO Tracking Opslaan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}