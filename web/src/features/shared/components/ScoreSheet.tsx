import { cn } from "@/lib/utils"

export interface ScoreSheetColumn {
  key: string
  label: string
  numeric?: boolean
}

interface ScoreSheetProps {
  caption: string
  columns: ScoreSheetColumn[]
  rows: Record<string, string | number>[]
}

export function ScoreSheet({ caption, columns, rows }: ScoreSheetProps) {
  return (
    <div className="overflow-x-auto rounded-xl bg-mana-white p-1 text-mana-white-foreground shadow-card">
      <table className="w-full border-collapse font-sans text-base">
        <caption className="px-4 pt-3 pb-2 text-left font-display text-lg font-bold">{caption}</caption>
        <thead>
          <tr className="border-b-2 border-mana-white-foreground/25">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn("px-4 py-2 text-sm font-bold", column.numeric ? "text-right" : "text-left")}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-mana-white-foreground/12 last:border-b-0">
              {columns.map((column) => (
                <td key={column.key} className={cn("px-4 py-2", column.numeric && "nums text-right")}>
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
