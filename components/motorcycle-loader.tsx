"use client"

import { useState, useEffect } from "react"

interface SimpleLoaderProps {
  isLoading: boolean
  progress: number
  onComplete?: () => void
}

export function MotorcycleLoader({ isLoading, progress, onComplete }: SimpleLoaderProps) {
  const [showThanks, setShowThanks] = useState(false)
  const [thanksOpacity, setThanksOpacity] = useState(0)

  // Update state based on progress
  useEffect(() => {
    if (isLoading) {
      // Als de voortgang 100% bereikt, toon de dankboodschap
      if (progress >= 1) {
        // Begin met het fade-in effect van de bedankboodschap
        setShowThanks(true)

        // Fade-in effect voor de bedankboodschap
        const fadeInInterval = setInterval(() => {
          setThanksOpacity((prev) => {
            const newOpacity = Math.min(1, prev + 0.05)
            if (newOpacity >= 1) {
              clearInterval(fadeInInterval)
              // Wacht nog even voordat we de loader verbergen
              setTimeout(() => {
                if (onComplete) {
                  onComplete()
                }
              }, 1500)
            }
            return newOpacity
          })
        }, 50)

        return () => {
          clearInterval(fadeInInterval)
        }
      }
    } else {
      setShowThanks(false)
      setThanksOpacity(0)
    }
  }, [isLoading, progress, onComplete])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div className="w-full max-w-md px-6 py-8 bg-card rounded-lg shadow-lg border">
        <h3 className="text-xl font-bold text-center mb-6 text-primary">
          {progress < 1 ? "Je bestelling wordt geplaatst" : "Bestelling voltooid!"}
        </h3>

        {/* Voortgangsbalk */}
        <div className="h-2 w-full bg-secondary rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Animatiecontainer */}
        <div className="relative h-48 mb-4 overflow-hidden">
          {/* Asfaltweg met middenstreep */}
          <div className="absolute bottom-0 w-full h-12 bg-gray-700">
            {/* Middenstreep van de weg */}
            <div
              className="absolute top-6 left-0 w-[400%] h-1 flex items-center transition-transform duration-500 ease-linear"
              style={{ transform: `translateX(-${progress * 60}%)` }}
            >
              {[...Array(20)].map((_, i) => (
                <div key={i} className="h-full bg-yellow-400 w-12 mx-8"></div>
              ))}
            </div>
          </div>

          {/* Dankboodschap die fade-in doet als progress = 100% */}
          {showThanks && (
            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
              style={{ opacity: thanksOpacity }}
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold text-primary mb-2">YoungRidersOost</h3>
                <p className="text-xl">bedankt je voor je bestelling!</p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-muted-foreground font-medium">
          {progress < 0.3
            ? "Bestelling voorbereiden..."
            : progress < 0.6
              ? "Bestelling verwerken..."
              : progress < 0.9
                ? "Bijna klaar..."
                : "Bestelling geplaatst!"}
        </p>
      </div>
    </div>
  )
}

