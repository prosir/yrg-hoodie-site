"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [username, setUsername] = useState("")

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/admin/check-session")
        const data = await response.json()

        if (data.authenticated) {
          setUsername(data.username)
        }
      } catch (err) {
        setError("Failed to check session")
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      {error ? (
        <div className="rounded-md bg-red-100 p-4 text-red-700">{error}</div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-lg">Welcome, {username || "Admin"}!</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <h2 className="mb-2 text-lg font-semibold">Orders</h2>
              <p className="text-3xl font-bold">0</p>
            </Card>

            <Card className="p-6">
              <h2 className="mb-2 text-lg font-semibold">Products</h2>
              <p className="text-3xl font-bold">0</p>
            </Card>

            <Card className="p-6">
              <h2 className="mb-2 text-lg font-semibold">Members</h2>
              <p className="text-3xl font-bold">0</p>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

