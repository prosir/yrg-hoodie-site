"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/admin/login")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-olive-600 mb-4"></div>
            <p className="text-lg">Doorverwijzen naar login pagina...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

