"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Printer } from "lucide-react"
import { useRouter } from "next/navigation"
import { getAllOrders } from "@/lib/db"
import type { Order } from "@/lib/db"
import { PrintTable } from "@/components/print-table"

export default function PrintOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("betaald")
  const router = useRouter()

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        const allOrders = await getAllOrders()
        setOrders(allOrders)
      } catch (error) {
        console.error("Error loading orders:", error)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  // Filter orders based on status
  const filteredOrders = orders.filter((order) => {
    return statusFilter === "all" || order.status === statusFilter
  })

  // Group orders by color, size, and type (crew or regular)
  const groupedOrders = filteredOrders.reduce<
    {
      color: string
      size: string
      count: number
      isCrew: boolean
    }[]
  >((acc, order) => {
    const existingGroup = acc.find(
      (group) => group.color === order.color && group.size === order.size && group.isCrew === !!order.isCrew,
    )

    if (existingGroup) {
      existingGroup.count += order.quantity || 1
    } else {
      acc.push({
        color: order.color,
        size: order.size,
        count: order.quantity || 1,
        isCrew: !!order.isCrew,
      })
    }

    return acc
  }, [])

  // Sort grouped orders by type, color, and size
  groupedOrders.sort((a, b) => {
    // First sort by type (crew first)
    if (a.isCrew !== b.isCrew) {
      return a.isCrew ? -1 : 1
    }

    // Then sort by color
    if (a.color !== b.color) {
      return a.color.localeCompare(b.color)
    }

    // Then sort by size (S, M, L, XL, XXL, XXXL)
    const sizeOrder = { s: 1, m: 2, l: 3, xl: 4, xxl: 5, xxxl: 6 }
    return sizeOrder[a.size as keyof typeof sizeOrder] - sizeOrder[b.size as keyof typeof sizeOrder]
  })

  // Calculate totals
  const totalItems = groupedOrders.reduce((sum, group) => sum + group.count, 0)
  const crewItems = groupedOrders.filter((group) => group.isCrew).reduce((sum, group) => sum + group.count, 0)
  const regularItems = groupedOrders.filter((group) => !group.isCrew).reduce((sum, group) => sum + group.count, 0)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 print:p-0 print:m-0">
      <div className="flex justify-between items-center print:hidden">
        <Button variant="outline" onClick={() => router.push("/admin/orders")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar bestellingen
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Afdrukken
        </Button>
      </div>

      <Card className="print:shadow-none print:border-0">
        <CardHeader className="print:hidden">
          <CardTitle>Bestellijst voor Leverancier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 print:hidden">
            <div className="flex items-center gap-4">
              <div className="w-[200px]">
                <label className="text-sm font-medium mb-1 block">Filter op status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle bestellingen</SelectItem>
                    <SelectItem value="nieuw">Nieuw</SelectItem>
                    <SelectItem value="betaald">Betaald</SelectItem>
                    <SelectItem value="besteld">Besteld</SelectItem>
                    <SelectItem value="verzonden">Verzonden</SelectItem>
                    <SelectItem value="afgehaald">Afgehaald</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">
                  Totaal aantal items: <strong>{totalItems}</strong> (Crew: {crewItems}, Regulier: {regularItems})
                </p>
                <p className="text-sm text-gray-500">
                  Gefilterd op status: <strong>{statusFilter === "all" ? "Alle bestellingen" : statusFilter}</strong>
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12 print:hidden">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-olive-600"></div>
            </div>
          ) : (
            <PrintTable
              groupedOrders={groupedOrders}
              totalItems={totalItems}
              crewItems={crewItems}
              regularItems={regularItems}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

