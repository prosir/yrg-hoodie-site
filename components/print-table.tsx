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

  return (
    <div>
      <table className="w-full border-collapse mb-4">
        <thead>
          <tr>
            <th className="border p-2 text-left">Type</th>
            <th className="border p-2 text-left">Kleur</th>
            <th className="border p-2 text-left">Maat</th>
            <th className="border p-2 text-right">Aantal</th>
          </tr>
        </thead>
        <tbody>
          {groupedOrders.length > 0 ? (
            groupedOrders.map((group, index) => (
              <tr key={index} className={group.isCrew ? "crew-row" : ""}>
                <td className="border p-2">{group.isCrew ? "CREW" : "Regulier"}</td>
                <td className="border p-2">{translateColor(group.color)}</td>
                <td className="border p-2">{group.size.toUpperCase()}</td>
                <td className="border p-2 text-right">{group.count}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="border p-2 text-center">
                Geen betaalde bestellingen gevonden
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="totals">
        <table className="totals-table">
          <tbody>
            <tr className="table-footer">
              <td>Totaal aantal hoodies:</td>
              <td>{totalItems}</td>
            </tr>
            <tr>
              <td>Reguliere hoodies:</td>
              <td>{regularItems}</td>
            </tr>
            <tr>
              <td>Crew hoodies:</td>
              <td>{crewItems}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

