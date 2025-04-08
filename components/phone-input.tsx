"use client"

import type React from "react"
import { Input } from "@/components/ui/input"

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
  onChange: (value: string) => void
}

export function PhoneInput({ value, onChange, ...props }: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value

    // Verwijder alle niet-numerieke tekens behalve +
    newValue = newValue.replace(/[^\d+]/g, "")

    // Als het nummer begint met 0, vervang door +31
    if (newValue.startsWith("0")) {
      newValue = "+31" + newValue.substring(1)
    }

    // Als het nummer begint met 31, voeg + toe
    if (newValue.startsWith("31") && !newValue.startsWith("+")) {
      newValue = "+" + newValue
    }

    // Als er nog geen landcode is, voeg +31 toe
    if (newValue && !newValue.startsWith("+")) {
      newValue = "+31" + newValue
    }

    onChange(newValue)
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <span className="text-gray-400">🇳🇱</span>
      </div>
      <Input
        type="tel"
        value={value}
        onChange={handleChange}
        className="bg-gray-800 border-gray-700 text-white pl-10"
        {...props}
      />
    </div>
  )
}
