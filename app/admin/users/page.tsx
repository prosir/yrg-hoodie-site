"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [formError, setFormError] = useState("")

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("/api/admin/users")

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          // If not JSON, get the text and log it
          const text = await response.text()
          console.error("Non-JSON response:", text)
          throw new Error("Invalid response format")
        }

        const data = await response.json()
        setUsers(data)
      } catch (err) {
        console.error("Failed to fetch users:", err)
        setError("Failed to load users. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Create user
  const handleCreateUser = async (e) => {
    e.preventDefault()
    setFormError("")

    if (!username || !password) {
      setFormError("Username and password are required")
      return
    }

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          name: name || username,
          permissions: ["dashboard"], // Basic permission
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create user")
      }

      const newUser = await response.json()

      // Update users list
      setUsers([...users, newUser])

      // Reset form
      setUsername("")
      setPassword("")
      setName("")
      setShowForm(false)
    } catch (err) {
      setFormError(err.message || "Failed to create user")
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "Add User"}</Button>
      </div>

      {error && <div className="mb-6 rounded-md bg-red-100 p-4 text-red-700">{error}</div>}

      {showForm && (
        <Card className="mb-6 p-6">
          <h2 className="mb-4 text-xl font-semibold">Create New User</h2>

          {formError && <div className="mb-4 rounded-md bg-red-100 p-3 text-red-700">{formError}</div>}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Display Name (Optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit">Create User</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          users.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{user.name || user.username}</h3>
                  <p className="text-sm text-gray-500">Username: {user.username}</p>
                  <p className="text-sm text-gray-500">Permissions: {user.permissions?.join(", ") || "None"}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
