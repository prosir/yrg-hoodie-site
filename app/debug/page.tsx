"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function DebugPage() {
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [filePath, setFilePath] = useState<string | null>(null)

  // Functie om orders.json te laden
  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await fetch("/api/debug")
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setOrders(data.orders || [])
        setFilePath(data.path)
        setSuccess(`Bestellingen succesvol geladen. Aantal: ${data.count}`)
      }
    } catch (error) {
      setError(`Fout bij het laden van bestellingen: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  // Functie om een testbestelling toe te voegen
  const addTestOrder = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await fetch("/api/test-order")
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setSuccess(`Testbestelling succesvol toegevoegd: ${data.order.id}`)
        // Herlaad de bestellingen
        loadOrders()
      }
    } catch (error) {
      setError(`Fout bij het toevoegen van testbestelling: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  // Laad bestellingen bij het laden van de pagina
  useEffect(() => {
    loadOrders()
  }, [])

  return (
    <div className="container mx-auto p-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Debug Pagina</CardTitle>
          <CardDescription>Bekijk en test de bestellingenfunctionaliteit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Fout</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-700">Succes</AlertTitle>
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          {filePath && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Bestandslocatie</AlertTitle>
              <AlertDescription>{filePath}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button onClick={loadOrders} disabled={loading}>
              {loading ? "Laden..." : "Bestellingen Herladen"}
            </Button>
            <Button onClick={addTestOrder} disabled={loading} variant="outline">
              {loading ? "Toevoegen..." : "Testbestelling Toevoegen"}
            </Button>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Bestellingen ({orders.length})</h3>
            {orders.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Naam
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Datum
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.orderId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.color} ({order.size.toUpperCase()})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${
                                order.status === "nieuw"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "betaald"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "verzonden"
                                      ? "bg-purple-100 text-purple-800"
                                      : order.status === "afgehaald"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.date).toLocaleString("nl-NL")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-md">
                <p className="text-gray-500">Geen bestellingen gevonden</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/admin">
            <Button variant="outline">Terug naar Admin</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

