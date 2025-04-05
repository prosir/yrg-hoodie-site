"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Trash, Edit, UserCog } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Checkbox } from "@/components/ui/checkbox"

interface User {
  id: string
  username: string
  permissions: string[]
  createdAt: string
}

const availablePermissions = [
  { id: "dashboard", label: "Dashboard" },
  { id: "orders", label: "Bestellingen" },
  { id: "rides", label: "Ritten" },
  { id: "albums", label: "Albums" },
  { id: "hoodies", label: "Hoodies" },
  { id: "users", label: "Gebruikers" },
  { id: "settings", label: "Instellingen" },
]

export default function UsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    password: "",
    permissions: [] as string[],
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      // In een echte applicatie zou je hier een API call doen
      // Voor nu gebruiken we dummy data
      const dummyUsers: User[] = [
        {
          id: "1",
          username: "admin",
          permissions: ["dashboard", "orders", "rides", "albums", "hoodies", "users", "settings"],
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          username: "moderator",
          permissions: ["dashboard", "orders", "rides"],
          createdAt: new Date().toISOString(),
        },
      ]
      setUsers(dummyUsers)
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het ophalen van de gebruikers",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        permissions: [...prev.permissions, permission],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((p) => p !== permission),
      }))
    }
  }

  const handleAddUser = () => {
    setIsEditMode(false)
    setFormData({
      id: "",
      username: "",
      password: "",
      permissions: [],
    })
    setIsDialogOpen(true)
  }

  const handleEditUser = (user: User) => {
    setIsEditMode(true)
    setFormData({
      id: user.id,
      username: user.username,
      password: "",
      permissions: user.permissions,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!userToDelete) return

    try {
      setIsSubmitting(true)
      // In een echte applicatie zou je hier een API call doen
      // Voor nu simuleren we het verwijderen
      setUsers(users.filter((user) => user.id !== userToDelete))
      toast({
        title: "Gebruiker verwijderd",
        description: "De gebruiker is succesvol verwijderd",
      })
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verwijderen van de gebruiker",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Valideer de invoer
      if (!formData.username) {
        throw new Error("Gebruikersnaam is verplicht")
      }

      if (!isEditMode && !formData.password) {
        throw new Error("Wachtwoord is verplicht")
      }

      if (formData.permissions.length === 0) {
        throw new Error("Selecteer ten minste één permissie")
      }

      // In een echte applicatie zou je hier een API call doen
      // Voor nu simuleren we het toevoegen/bewerken
      if (isEditMode) {
        setUsers(
          users.map((user) =>
            user.id === formData.id
              ? {
                  ...user,
                  username: formData.username,
                  permissions: formData.permissions,
                }
              : user,
          ),
        )
        toast({
          title: "Gebruiker bijgewerkt",
          description: "De gebruiker is succesvol bijgewerkt",
        })
      } else {
        const newUser: User = {
          id: Date.now().toString(),
          username: formData.username,
          permissions: formData.permissions,
          createdAt: new Date().toISOString(),
        }
        setUsers([...users, newUser])
        toast({
          title: "Gebruiker toegevoegd",
          description: "De nieuwe gebruiker is succesvol toegevoegd",
        })
      }

      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Fout",
        description: error instanceof Error ? error.message : "Er is een onbekende fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Beheerders</h1>
        <Button onClick={handleAddUser}>
          <Plus className="mr-2 h-4 w-4" />
          Nieuwe beheerder
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Beheerders</CardTitle>
          <CardDescription>Beheer de toegang tot het admin paneel</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserCog className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">Geen beheerders gevonden</p>
              <Button onClick={handleAddUser} variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Nieuwe beheerder toevoegen
              </Button>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gebruikersnaam</TableHead>
                    <TableHead>Permissies</TableHead>
                    <TableHead>Aangemaakt op</TableHead>
                    <TableHead className="text-right">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.permissions.map((permission) => (
                            <Badge key={permission} variant="outline" className="bg-gray-100">
                              {availablePermissions.find((p) => p.id === permission)?.label || permission}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString("nl-NL")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteClick(user.id)}
                            disabled={user.username === "admin"} // Voorkom verwijderen van hoofdadmin
                          >
                            <Trash className="h-4 w-4" />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Beheerder bewerken" : "Nieuwe beheerder toevoegen"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Bewerk de gegevens van de beheerder" : "Voeg een nieuwe beheerder toe aan het systeem"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="username">Gebruikersnaam</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="gebruikersnaam"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Wachtwoord{" "}
                  {isEditMode && <span className="text-gray-500">(leeg laten om ongewijzigd te houden)</span>}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required={!isEditMode}
                />
              </div>

              <div className="space-y-2">
                <Label>Permissies</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`permission-${permission.id}`}
                        checked={formData.permissions.includes(permission.id)}
                        onCheckedChange={(checked) => handlePermissionChange(permission.id, checked === true)}
                      />
                      <Label htmlFor={`permission-${permission.id}`} className="cursor-pointer">
                        {permission.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuleren
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Opslaan" : "Toevoegen"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Weet je zeker dat je deze beheerder wilt verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Deze actie kan niet ongedaan worden gemaakt. De beheerder verliest alle toegang tot het admin paneel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

