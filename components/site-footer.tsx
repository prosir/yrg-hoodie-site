import { Heart } from "lucide-react"

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-100 py-6 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-700 text-sm">© {currentYear} YoungRidersOost. Alle rechten voorbehouden.</p>
          </div>
          <div className="flex items-center">
            <p className="text-gray-700 text-sm">
              Ontwikkeld met <Heart className="h-4 w-4 inline text-red-500 mx-1" /> door{" "}
              <span className="font-semibold">Jacco</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
