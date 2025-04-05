"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Plus, CalendarIcon, MapPin, Users, Clock, Edit, Trash2, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Dummy data for events
const initialEvents = [
  {
    id: "1",
    title: "Zomerbijeenkomst",
    date: "2025-07-15",
    time: "18:00",
    location: "Enschede, Marktplein",
    description: "Jaarlijkse zomerbijeenkomst met BBQ en gezelligheid.",
    maxParticipants: 30,
    registered: 12,
    status: "upcoming",
  },
  {
    id: "2",
    title: "Motorshow Bezoek",
    date: "2025-05-22",
    time: "10:00",
    location: "Utrecht, Jaarbeurs",
    description: "Gezamenlijk bezoek aan de jaarlijkse motorshow.",
    maxParticipants: 20,
    registered: 8,
    status: "upcoming",
  },
  {
    id: "3",
    title: "Technische Workshop",
    date: "2025-06-10",
    time: "14:00",
    location: "Hengelo, Werkplaats Motoren",
    description: "Workshop over basisonderhoud van je motor.",
    maxParticipants: 15,
    registered: 15,
    status: "full",
  },
  {
    id: "4",
    title: "Winterbijeenkomst",
    date: "2024-12-18",
    time: "19:00",
    location: "Enschede, Café De Motor",
    description: "Gezellige winterbijeenkomst met hapjes en drankjes.",
    maxParticipants: 25,
    registered: 0,
    status: "upcoming",
  },
]

export default function EventsPage() {
  const [events, setEvents] = useState(initialEvents)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<null | (typeof initialEvents)[0]>(null)
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: new Date(),
    time: "",
    location: "",
    description: "",
    maxParticipants: 20,
  })
  const { toast } = useToast()

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  // Handle add event
  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location) {
      toast({
        title: "Fout",
        description: "Vul alle verplichte velden in",
        variant: "destructive",
      })
      return
    }

    const id = Date.now().toString()
    const formattedDate = format(newEvent.date, "yyyy-MM-dd")

    setEvents([
      ...events,
      {
        ...newEvent,
        id,
        date: formattedDate,
        registered: 0,
        status: "upcoming",
      },
    ])
    setNewEvent({
      title: "",
      date: new Date(),
      time: "",
      location: "",
      description: "",
      maxParticipants: 20,
    })
    setIsDialogOpen(false)

    toast({
      title: "Evenement toegevoegd",
      description: `${newEvent.title} is succesvol toegevoegd.`,
    })
  }

  // Handle edit event
  const handleEditEvent = (event: (typeof events)[0]) => {
    setEditingEvent({
      ...event,
      date: event.date,
    })
  }

  // Handle save edit
  const handleSaveEdit = () => {
    if (!editingEvent) return

    setEvents(events.map((event) => (event.id === editingEvent.id ? editingEvent : event)))
    setEditingEvent(null)

    toast({
      title: "Evenement bijgewerkt",
      description: "Het evenement is succesvol bijgewerkt.",
    })
  }

  // Handle delete event
  const handleDeleteEvent = (id: string) => {
    const eventToDelete = events.find((event) => event.id === id)

    if (confirm(`Weet je zeker dat je ${eventToDelete?.title} wilt verwijderen?`)) {
      setEvents(events.filter((event) => event.id !== id))

      toast({
        title: "Evenement verwijderd",
        description: `${eventToDelete?.title} is succesvol verwijderd.`,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Evenementen</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nieuw Evenement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nieuw Evenement Toevoegen</DialogTitle>
              <DialogDescription>Voeg een nieuw evenement toe aan de kalender.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Bijv. Zomerbijeenkomst"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Datum</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newEvent.date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newEvent.date ? format(newEvent.date, "PPP", { locale: nl }) : "Selecteer datum"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newEvent.date}
                        onSelect={(date) => setNewEvent({ ...newEvent, date: date || new Date() })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Tijd</Label>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-gray-500" />
                    <Input
                      id="time"
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Locatie</Label>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Bijv. Enschede, Marktplein"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Beschrijving</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Beschrijf het evenement"
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Maximum aantal deelnemers</Label>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-gray-500" />
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={newEvent.maxParticipants}
                    onChange={(e) => setNewEvent({ ...newEvent, maxParticipants: Number.parseInt(e.target.value) })}
                    placeholder="Bijv. 20"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuleren
              </Button>
              <Button onClick={handleAddEvent}>Evenement Toevoegen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle Evenementen</CardTitle>
          <CardDescription>Bekijk en beheer alle evenementen van YoungRidersOost.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titel</TableHead>
                  <TableHead>Datum & Tijd</TableHead>
                  <TableHead>Locatie</TableHead>
                  <TableHead>Deelnemers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      {editingEvent?.id === event.id ? (
                        <Input
                          value={editingEvent.title}
                          onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                        />
                      ) : (
                        event.title
                      )}
                    </TableCell>
                    <TableCell>
                      {editingEvent?.id === event.id ? (
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                            <Input
                              type="date"
                              value={editingEvent.date}
                              onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                            />
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-gray-500" />
                            <Input
                              type="time"
                              value={editingEvent.time}
                              onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <Clock className="mr-2 h-4 w-4 text-gray-500" />
                            <span>{event.time}</span>
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingEvent?.id === event.id ? (
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                          <Input
                            value={editingEvent.location}
                            onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingEvent?.id === event.id ? (
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4 text-gray-500" />
                          <Input
                            type="number"
                            value={editingEvent.maxParticipants}
                            onChange={(e) =>
                              setEditingEvent({ ...editingEvent, maxParticipants: Number.parseInt(e.target.value) })
                            }
                            className="w-20"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4 text-gray-500" />
                          <span>
                            {event.registered} / {event.maxParticipants}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          event.status === "upcoming"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : event.status === "full"
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }
                      >
                        {event.status === "upcoming" ? "Aankomend" : event.status === "full" ? "Vol" : "Afgelopen"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {editingEvent?.id === event.id ? (
                        <Button size="sm" onClick={handleSaveEdit}>
                          <Save className="h-4 w-4 mr-1" />
                          Opslaan
                        </Button>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditEvent(event)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {events.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Geen evenementen gevonden. Voeg een nieuw evenement toe.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

