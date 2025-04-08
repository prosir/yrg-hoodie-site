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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Mail, Phone, Edit, Trash2, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Dummy data for members
const initialMembers = [
  {
    id: "1",
    name: "Jan Jansen",
    email: "jan@example.com",
    phone: "06-12345678",
    motorcycle: "Kawasaki Ninja 400",
    role: "member",
    joinDate: "2023-05-15",
  },
  {
    id: "2",
    name: "Lisa de Vries",
    email: "lisa@example.com",
    phone: "06-23456789",
    motorcycle: "Yamaha MT-07",
    role: "admin",
    joinDate: "2022-08-10",
  },
  {
    id: "3",
    name: "Pieter Bakker",
    email: "pieter@example.com",
    phone: "06-34567890",
    motorcycle: "Honda CBR500R",
    role: "member",
    joinDate: "2023-11-22",
  },
  {
    id: "4",
    name: "Sophie Visser",
    email: "sophie@example.com",
    phone: "06-45678901",
    motorcycle: "KTM Duke 390",
    role: "crew",
    joinDate: "2023-03-05",
  },
  {
    id: "5",
    name: "Thomas Smit",
    email: "thomas@example.com",
    phone: "06-56789012",
    motorcycle: "Suzuki SV650",
    role: "member",
    joinDate: "2024-01-18",
  },
]

export default function MembersPage() {
  const [members, setMembers] = useState(initialMembers)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<null | (typeof initialMembers)[0]>(null)
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    motorcycle: "",
    role: "member",
  })
  const { toast } = useToast()

  // Filter members based on search term and role
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      searchTerm === "" ||
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.motorcycle.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || member.role === roleFilter

    return matchesSearch && matchesRole
  })

  // Get counts for each role
  const roleCounts = {
    all: members.length,
    member: members.filter((member) => member.role === "member").length,
    crew: members.filter((member) => member.role === "crew").length,
    admin: members.filter((member) => member.role === "admin").length,
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  // Handle add member
  const handleAddMember = () => {
    if (!newMember.name || !newMember.email || !newMember.phone) {
      toast({
        title: "Fout",
        description: "Vul alle verplichte velden in",
        variant: "destructive",
      })
      return
    }

    const id = Date.now().toString()
    const joinDate = new Date().toISOString().split("T")[0]

    setMembers([...members, { ...newMember, id, joinDate }])
    setNewMember({
      name: "",
      email: "",
      phone: "",
      motorcycle: "",
      role: "member",
    })
    setIsDialogOpen(false)

    toast({
      title: "Lid toegevoegd",
      description: `${newMember.name} is succesvol toegevoegd als lid.`,
    })
  }

  // Handle edit member
  const handleEditMember = (member: (typeof members)[0]) => {
    setEditingMember({ ...member })
  }

  // Handle save edit
  const handleSaveEdit = () => {
    if (!editingMember) return

    setMembers(members.map((member) => (member.id === editingMember.id ? editingMember : member)))
    setEditingMember(null)

    toast({
      title: "Lid bijgewerkt",
      description: "De gegevens van het lid zijn succesvol bijgewerkt.",
    })
  }

  // Handle delete member
  const handleDeleteMember = (id: string) => {
    const memberToDelete = members.find((member) => member.id === id)

    if (confirm(`Weet je zeker dat je ${memberToDelete?.name} wilt verwijderen?`)) {
      setMembers(members.filter((member) => member.id !== id))

      toast({
        title: "Lid verwijderd",
        description: `${memberToDelete?.name} is succesvol verwijderd.`,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Leden</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nieuw Lid
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nieuw Lid Toevoegen</DialogTitle>
              <DialogDescription>Voeg een nieuw lid toe aan YoungRidersOost.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Naam</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="Volledige naam"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="E-mailadres"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefoonnummer</Label>
                <Input
                  id="phone"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  placeholder="Telefoonnummer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motorcycle">Motor</Label>
                <Input
                  id="motorcycle"
                  value={newMember.motorcycle}
                  onChange={(e) => setNewMember({ ...newMember, motorcycle: e.target.value })}
                  placeholder="Merk en model"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select value={newMember.role} onValueChange={(value) => setNewMember({ ...newMember, role: value })}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecteer een rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Lid</SelectItem>
                    <SelectItem value="crew">Crew</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuleren
              </Button>
              <Button onClick={handleAddMember}>Lid Toevoegen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle Leden</CardTitle>
          <CardDescription>Bekijk en beheer alle leden van YoungRidersOost.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={roleFilter} onValueChange={setRoleFilter}>
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="all" className="relative">
                  Alle
                  <Badge variant="secondary" className="ml-2">
                    {roleCounts.all}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="member" className="relative">
                  Leden
                  <Badge variant="secondary" className="ml-2">
                    {roleCounts.member}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="crew" className="relative">
                  Crew
                  <Badge variant="secondary" className="ml-2">
                    {roleCounts.crew}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="admin" className="relative">
                  Admins
                  <Badge variant="secondary" className="ml-2">
                    {roleCounts.admin}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Zoeken..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <TabsContent value="all" className="m-0">
              <MembersTable
                members={filteredMembers}
                formatDate={formatDate}
                handleEditMember={handleEditMember}
                handleDeleteMember={handleDeleteMember}
                editingMember={editingMember}
                setEditingMember={setEditingMember}
                handleSaveEdit={handleSaveEdit}
              />
            </TabsContent>
            <TabsContent value="member" className="m-0">
              <MembersTable
                members={filteredMembers}
                formatDate={formatDate}
                handleEditMember={handleEditMember}
                handleDeleteMember={handleDeleteMember}
                editingMember={editingMember}
                setEditingMember={setEditingMember}
                handleSaveEdit={handleSaveEdit}
              />
            </TabsContent>
            <TabsContent value="crew" className="m-0">
              <MembersTable
                members={filteredMembers}
                formatDate={formatDate}
                handleEditMember={handleEditMember}
                handleDeleteMember={handleDeleteMember}
                editingMember={editingMember}
                setEditingMember={setEditingMember}
                handleSaveEdit={handleSaveEdit}
              />
            </TabsContent>
            <TabsContent value="admin" className="m-0">
              <MembersTable
                members={filteredMembers}
                formatDate={formatDate}
                handleEditMember={handleEditMember}
                handleDeleteMember={handleDeleteMember}
                editingMember={editingMember}
                setEditingMember={setEditingMember}
                handleSaveEdit={handleSaveEdit}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

interface MembersTableProps {
  members: any[]
  formatDate: (dateString: string) => string
  handleEditMember: (member: any) => void
  handleDeleteMember: (id: string) => void
  editingMember: any
  setEditingMember: (member: any) => void
  handleSaveEdit: () => void
}

function MembersTable({
  members,
  formatDate,
  handleEditMember,
  handleDeleteMember,
  editingMember,
  setEditingMember,
  handleSaveEdit,
}: MembersTableProps) {
  if (members.length === 0) {
    return <div className="text-center py-12 text-gray-500">Geen leden gevonden</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Naam</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Motor</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Lid sinds</TableHead>
            <TableHead className="text-right">Acties</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">
                {editingMember?.id === member.id ? (
                  <Input
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  />
                ) : (
                  member.name
                )}
              </TableCell>
              <TableCell>
                {editingMember?.id === member.id ? (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <Input
                        value={editingMember.email}
                        onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <Input
                        value={editingMember.phone}
                        onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{member.email}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{member.phone}</span>
                    </div>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {editingMember?.id === member.id ? (
                  <Input
                    value={editingMember.motorcycle}
                    onChange={(e) => setEditingMember({ ...editingMember, motorcycle: e.target.value })}
                  />
                ) : (
                  member.motorcycle
                )}
              </TableCell>
              <TableCell>
                {editingMember?.id === member.id ? (
                  <Select
                    value={editingMember.role}
                    onValueChange={(value) => setEditingMember({ ...editingMember, role: value })}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Selecteer een rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Lid</SelectItem>
                      <SelectItem value="crew">Crew</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    className={
                      member.role === "admin"
                        ? "bg-purple-100 text-purple-800 hover:bg-purple-100"
                        : member.role === "crew"
                          ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                          : "bg-green-100 text-green-800 hover:bg-green-100"
                    }
                  >
                    {member.role === "admin" ? "Admin" : member.role === "crew" ? "Crew" : "Lid"}
                  </Badge>
                )}
              </TableCell>
              <TableCell>{formatDate(member.joinDate)}</TableCell>
              <TableCell className="text-right">
                {editingMember?.id === member.id ? (
                  <Button size="sm" onClick={handleSaveEdit}>
                    <Save className="h-4 w-4 mr-1" />
                    Opslaan
                  </Button>
                ) : (
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditMember(member)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
