"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Users, Trash, Edit } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format, parseISO } from "date-fns"
import { nl } from "date-fns/locale"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Ride {
  id: string
  title: string
  date: string
  time: string
  startLocation: string
  distance: string
  description: string
  image: string
  spots: number
  registered: number
  active: boolean
}

export default function RidesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [rides, setRides] = useState<Ride[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [rideToDelete, setRideToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchRides()
  }, [])

  const fetchRides = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/rides")

      if (!response.ok) {
        throw new Error("Fout bij het ophalen van ritten")
      }

      const data = await response.json()
      setRides(data)
    } catch (error) {
      toast({
        title: "Fout",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setRideToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!rideToDelete) return

    try {
      setIsDeleting(rideToDelete)
      const response = await fetch(`/api/rides?id=${rideToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Fout bij het verwijderen van de rit")
      }

      toast({
        title: "Rit verwijderd",
        description: "De rit is succesvol verwijderd",
      })

      // Ververs de lijst met ritten
      fetchRides()
    } catch (error) {
      toast({
        title: "Fout",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
      setDeleteDialogOpen(false)
      setRideToDelete(null)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "d MMMM yyyy", { locale: nl })
    } catch (error) {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ritten Beheer</h1>
        <Button asChild>
          <Link href="/admin/rides/create">
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe Rit
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle Ritten</CardTitle>
          <CardDescription>Beheer alle geplande motorritten.</CardDescription>
        </CardHeader>
        <CardContent>
          {rides.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Er zijn nog geen ritten aangemaakt.</p>
              <Button asChild>
                <Link href="/admin/rides/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Eerste Rit Aanmaken
                </Link>
              </Button>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titel</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Locatie</TableHead>
                    <TableHead>Deelnemers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rides.map((ride) => (
                    <TableRow key={ride.id}>
                      <TableCell className="font-medium">{ride.title}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{formatDate(ride.date)}</span>
                          <span className="text-sm text-gray-500">{ride.time}</span>
                        </div>
                      </TableCell>
                      <TableCell>{ride.startLocation}</TableCell>
                      <TableCell>
                        <span className="flex items-center">
                          <Users className="mr-1 h-4 w-4 text-gray-500" />
                          {ride.registered} / {ride.spots}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ride.active ? "success" : "secondary"}>
                          {ride.active ? "Actief" : "Inactief"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/rides/edit/${ride.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteClick(ride.id)}
                            disabled={isDeleting === ride.id}
                          >
                            {isDeleting === ride.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Weet je zeker dat je deze rit wilt verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Deze actie kan niet ongedaan worden gemaakt. Alle gegevens van deze rit, inclusief aanmeldingen, worden
              permanent verwijderd.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

