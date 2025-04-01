"use client"

import { useState, useEffect } from "react"

interface MotorcycleLoaderProps {
  isLoading: boolean
  progress: number
  onComplete?: () => void
}

export function MotorcycleLoader({ isLoading, progress, onComplete }: MotorcycleLoaderProps) {
  const [wheelieAngle, setWheelieAngle] = useState(0)

  // Update wheelie angle based on progress
  useEffect(() => {
    if (isLoading) {
      // As progress increases, the motorcycle does more of a wheelie (up to 25 degrees)
      setWheelieAngle(progress * 25)

      // Call onComplete when progress reaches 100%
      if (progress >= 1 && onComplete) {
        const timer = setTimeout(() => {
          onComplete()
        }, 500) // Give a little time to see the final wheelie

        return () => clearTimeout(timer)
      }
    } else {
      setWheelieAngle(0)
    }
  }, [isLoading, progress, onComplete])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div className="w-full max-w-md px-6 py-8 bg-card rounded-lg shadow-lg border">
        <h3 className="text-xl font-bold text-center mb-6 text-primary">Je bestelling wordt geplaatst</h3>

        {/* Progress bar */}
        <div className="h-2 w-full bg-secondary rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Motorcycle animation */}
        <div className="relative h-32 mb-4">
          <div
            className="absolute left-0 transition-all duration-300 ease-out"
            style={{
              transform: `translateX(${progress * 70}%) rotate(${wheelieAngle}deg)`,
              transformOrigin: "center bottom",
            }}
          >
            {/* Clean motorcycle SVG */}
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Rear wheel */}
              <circle cx="25" cy="60" r="15" fill="none" stroke="#333" strokeWidth="4" />
              <circle cx="25" cy="60" r="3" fill="#666" />
              {/* Front wheel */}
              <circle cx="90" cy="60" r="15" fill="none" stroke="#333" strokeWidth="4" />
              <circle cx="90" cy="60" r="3" fill="#666" />
              {/* Frame */}
              <path d="M25,60 L45,40 L70,40 L90,60" stroke="#444" strokeWidth="3" fill="none" />
              <path d="M45,40 L60,25" stroke="#444" strokeWidth="3" fill="none" />
              <path d="M70,40 L60,25" stroke="#444" strokeWidth="3" fill="none" />
              {/* Gas tank */}
              <path d="M45,40 L70,40 L65,30 L50,30 Z" fill="hsl(var(--primary))" />
              {/* Handlebars */}
              <path d="M90,60 L80,40" stroke="#444" strokeWidth="2" fill="none" />
              <path d="M80,40 L75,35" stroke="#444" strokeWidth="2" fill="none" />
              {/* Exhaust */}
              <path d="M45,40 L30,50 L20,50" stroke="#555" strokeWidth="2" fill="none" />
              {/* Seat */}
              <path d="M60,25 L70,35 L50,40 Z" fill="#333" />
              {/* Rider */}
              <circle cx="60" cy="20" r="6" fill="#444" /> {/* Helmet */}
              <path d="M60,26 L60,35" stroke="#444" strokeWidth="2" /> {/* Body */}
              <path d="M60,30 L67,37" stroke="#444" strokeWidth="2" /> {/* Arm */}
              <path d="M60,30 L53,37" stroke="#444" strokeWidth="2" /> {/* Arm */}
            </svg>
          </div>

          {/* Road with line */}
          <div className="absolute bottom-0 w-full h-2 bg-muted">
            <div className="absolute top-[-3px] w-full h-1 overflow-hidden">
              <div className="h-1 w-full flex items-center">
                <div className="h-[2px] bg-muted-foreground w-8 mx-2"></div>
                <div className="h-[2px] bg-muted-foreground w-8 mx-2"></div>
                <div className="h-[2px] bg-muted-foreground w-8 mx-2"></div>
                <div className="h-[2px] bg-muted-foreground w-8 mx-2"></div>
                <div className="h-[2px] bg-muted-foreground w-8 mx-2"></div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-muted-foreground font-medium">
          {progress < 0.3
            ? "Motor start..."
            : progress < 0.6
              ? "Bestelling verwerken..."
              : progress < 0.9
                ? "Bijna klaar..."
                : "Bestelling geplaatst! 🏍️"}
        </p>
      </div>
    </div>
  )
}

