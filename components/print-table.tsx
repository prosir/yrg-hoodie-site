type GroupedOrder = {
  color: string
  size: string
  count: number
  isCrew: boolean
}

type PrintTableProps = {
  groupedOrders: GroupedOrder[]
  totalItems: number
  crewItems: number
  regularItems: number
}

export function PrintTable({ groupedOrders, totalItems, crewItems, regularItems }: PrintTableProps) {
  // Vertaal kleurnamen naar Nederlands
  const translateColor = (color: string) => {
    const colorMap: Record<string, string> = {
      lilac: "Lila",
      "ocean-blue": "Oceaanblauw",
      burgundy: "Bordeauxrood",
      black: "Zwart",
      olive: "Olijfgroen",
    }

    return colorMap[color] || color
  }

  // Get color class based on hoodie color
  const getColorClass = (color: string) => {
    const colorClasses: Record<string, string> = {
      lilac: "bg-purple-50 text-purple-800 border-purple-200",
      "ocean-blue": "bg-blue-50 text-blue-800 border-blue-200",
      burgundy: "bg-red-50 text-red-800 border-red-200",
      black: "bg-gray-50 text-gray-800 border-gray-200",
      olive: "bg-green-50 text-green-800 border-green-200",
    }

    return colorClasses[color] || "bg-gray-50 text-gray-800 border-gray-200"
  }

  return (
    <div className="print-container">
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm print:shadow-none">
        <h2 className="text-lg font-bold text-blue-800 mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z"
              clipRule="evenodd"
            />
          </svg>
          Bestellijst voor Leverancier
        </h2>
        <p className="text-blue-700">
          Deze lijst bevat alle betaalde bestellingen gegroepeerd per type, kleur en maat.
        </p>
      </div>

      <table className="w-full border-collapse mb-6 shadow-sm print:shadow-none">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-3 text-left font-bold text-gray-700 uppercase tracking-wider">
              Type
            </th>
            <th className="border border-gray-300 p-3 text-left font-bold text-gray-700 uppercase tracking-wider">
              Kleur
            </th>
            <th className="border border-gray-300 p-3 text-left font-bold text-gray-700 uppercase tracking-wider">
              Maat
            </th>
            <th className="border border-gray-300 p-3 text-right font-bold text-gray-700 uppercase tracking-wider">
              Aantal
            </th>
          </tr>
        </thead>
        <tbody>
          {groupedOrders.length > 0 ? (
            groupedOrders.map((group, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} ${group.isCrew ? "border-l-4 border-l-green-500" : ""} hover:bg-gray-100 transition-colors duration-150 ease-in-out`}
              >
                <td className="border border-gray-300 p-3">
                  <div className="flex items-center">
                    {group.isCrew ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                        CREW
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                        Regulier
                      </span>
                    )}
                  </div>
                </td>
                <td className="border border-gray-300 p-3">
                  <div
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium ${getColorClass(group.color)}`}
                  >
                    {translateColor(group.color)}
                  </div>
                </td>
                <td className="border border-gray-300 p-3 font-medium">{group.size.toUpperCase()}</td>
                <td className="border border-gray-300 p-3 text-right font-bold text-lg">{group.count}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="border p-4 text-center text-gray-500 italic">
                Geen betaalde bestellingen gevonden
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="totals bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm print:shadow-none">
        <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"
              clipRule="evenodd"
            />
            <path d="M10 4a1 1 0 011 1v4.586l2.707 2.707a1 1 0 01-1.414 1.414l-3-3A1 1 0 019 10V5a1 1 0 011-1z" />
          </svg>
          Samenvatting
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm flex flex-col items-center justify-center">
            <span className="text-sm text-gray-500 uppercase tracking-wide">Totaal aantal</span>
            <span className="text-3xl font-bold text-blue-600">{totalItems}</span>
            <span className="text-xs text-gray-400">hoodies</span>
          </div>

          <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm flex flex-col items-center justify-center">
            <span className="text-sm text-gray-500 uppercase tracking-wide">Reguliere hoodies</span>
            <span className="text-3xl font-bold text-blue-600">{regularItems}</span>
            <span className="text-xs text-gray-400">stuks</span>
          </div>

          <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm flex flex-col items-center justify-center">
            <span className="text-sm text-gray-500 uppercase tracking-wide">Crew hoodies</span>
            <span className="text-3xl font-bold text-green-600">{crewItems}</span>
            <span className="text-xs text-gray-400">stuks</span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-gray-500 text-sm print:mt-8">
        <p>YoungRidersOost Bestellijst • Afgedrukt op: {new Date().toLocaleDateString("nl-NL")}</p>
      </div>
    </div>
  )
}

