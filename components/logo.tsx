"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

export function Logo() {
  const [logoPath, setLogoPath] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchLogo() {
      try {
        const response = await fetch("/api/site-config")
        if (response.ok) {
          const data = await response.json()
          setLogoPath(data.logoPath)
        }
      } catch (error) {
        console.error("Error fetching logo:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogo()
  }, [])

  if (isLoading) {
    return (
      <Link href="/" className="flex items-center">
        <span className="text-xl font-bold">
          YOUNG<span className="text-olive-600">RIDERS</span>OOST
        </span>
      </Link>
    )
  }

  return (
    <Link href="/" className="flex items-center">
      {logoPath ? (
        <div className="relative h-10 w-32">
          <Image
            src={logoPath || "/placeholder.svg"}
            alt="YoungRidersOost Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      ) : (
        <span className="text-xl font-bold">
          YOUNG<span className="text-olive-600">RIDERS</span>OOST
        </span>
      )}
    </Link>
  )
}
