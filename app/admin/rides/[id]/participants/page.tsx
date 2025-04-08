"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, Printer, Trash, Search, Download } from "lucide-react"
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

interface Participant {
  id: string
  rideId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  motorcycle: string
  comments?: string
  registeredAt: string
}

interface Ride {
  id: string
  title: string
  date: string
  time: string
  startLocation: string
}

export default function ParticipantsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [ride, setRide] = useState<Ride | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [participantToDelete, setParticipantToDelete] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredParticipants(participants)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredParticipants(
        participants.filter(
          (p) =>
            p.firstName.toLowerCase().includes(query) ||
            p.lastName.toLowerCase().includes(query) ||
            p.email.toLowerCase().includes(query) ||
            p.phone.includes(query) ||
            p.motorcycle.toLowerCase().includes(query),
        ),
      )
    }
  }, [searchQuery, participants])

  const fetchData = async () => {
    try {
      setIsLoading(true)

      // Haal de rit op
      const rideResponse = await fetch(`/api/rides?id=${params.id}`)
      if (!rideResponse.ok) {
        throw new Error("Rit niet gevonden")
      }
      const rideData = await rideResponse.json()
      setRide(rideData)

      // Haal de deelnemers op
      const participantsResponse = await fetch(`/api/rides/${params.id}/participants`)
      if (!participantsResponse.ok) {
        throw new Error("Kon deelnemers niet ophalen")
      }
      const participantsData = await participantsResponse.json()
      setParticipants(participantsData)
      setFilteredParticipants(participantsData)
    } catch (error) {
      toast({
        title: "Fout",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      })
      router.push("/admin/rides")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setParticipantToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!participantToDelete) return

    try {
      setIsDeleting(participantToDelete)
      const response = await fetch(`/api/rides/${params.id}/participants?participantId=${participantToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Fout bij het verwijderen van de deelnemer")
      }

      toast({
        title: "Deelnemer verwijderd",
        description: "De deelnemer is succesvol verwijderd",
      })

      // Update de lijst met deelnemers
      setParticipants(participants.filter((p) => p.id !== participantToDelete))

      // Update ook de rit (aantal aanmeldingen -1)
      const rideResponse = await fetch(`/api/rides?id=${params.id}`)
      if (rideResponse.ok) {
        const rideData = await rideResponse.json()
        setRide(rideData)
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
      setDeleteDialogOpen(false)
      setParticipantToDelete(null)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    // Maak CSV inhoud
    const headers = ["Voornaam", "Achternaam", "Email", "Telefoon", "Motor", "Opmerkingen", "Aangemeld op"]
    const rows = filteredParticipants.map((p) => [
      p.firstName,
      p.lastName,
      p.email,
      p.phone,
      p.motorcycle,
      p.comments || "",
      format(parseISO(p.registeredAt), "d MMMM yyyy HH:mm", { locale: nl }),
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    // Maak een downloadbare link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `deelnemers-${ride?.title.toLowerCase().replace(/\s+/g, "-")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "d MMMM yyyy HH:mm", { locale: nl })
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
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug
          </Button>
          <h1 className="text-2xl font-bold">Deelnemers</h1>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exporteren
          </Button>
          <Button variant="outline" onClick={handlePrint} className="print:hidden">
            <Printer className="mr-2 h-4 w-4" />
            Printen
          </Button>
        </div>
      </div>

      {ride && (
        <div className="print:mb-8">
          <h2 className="text-xl font-semibold">{ride.title}</h2>
          <p className="text-gray-500">
            {ride.date && format(parseISO(ride.date), "d MMMM yyyy", { locale: nl })} - {ride.time} -{" "}
            {ride.startLocation}
          </p>
        </div>
      )}

      <div className="flex items-center space-x-2 print:hidden">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="Zoeken op naam, email, telefoon of motor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardHeader className="print:hidden">
          <CardTitle>Deelnemerslijst</CardTitle>
          <CardDescription>{filteredParticipants.length} deelnemers gevonden</CardDescription>
        </CardHeader>
        <CardContent ref={printRef} id="printRef">
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Geen deelnemers gevonden.</p>
            </div>
          ) : (
            <div className="border rounded-md print:border-none">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Naam</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Motor</TableHead>
                    <TableHead>Aangemeld op</TableHead>
                    <TableHead className="print:hidden">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParticipants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <div className="font-medium">
                          {participant.firstName} {participant.lastName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{participant.email}</div>
                        <div className="text-sm text-gray-500">{participant.phone}</div>
                      </TableCell>
                      <TableCell>{participant.motorcycle}</TableCell>
                      <TableCell>{formatDate(participant.registeredAt)}</TableCell>
                      <TableCell className="print:hidden">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClick(participant.id)}
                          disabled={isDeleting === participant.id}
                        >
                          {isDeleting === participant.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4" />
                          )}
                        </Button>
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
            <AlertDialogTitle>Weet je zeker dat je deze deelnemer wilt verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Deze actie kan niet ongedaan worden gemaakt. De deelnemer wordt permanent verwijderd.
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

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printRef, #printRef * {
            visibility: visible;
          }
          #printRef {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
