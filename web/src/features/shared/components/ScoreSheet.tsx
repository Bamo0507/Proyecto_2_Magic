import { cn } from "@/lib/utils"

export interface ScoreSheetColumn {
  key: string
  label: string
  numeric?: boolean
  // The column that carries the point of the table is set in the display face so it reads first
  emphasis?: boolean
}

interface ScoreSheetProps {
  caption: string
  columns: ScoreSheetColumn[]
  rows: Record<string, string | number>[]
  footnote?: string
  className?: string
}

export function ScoreSheet({ caption, columns, rows, footnote, className }: ScoreSheetProps) {
  return (
    <div className={cn("overflow-x-auto rounded-sm bg-card-paper p-1 text-card-ink shadow-card", className)}>
      <table className="w-full border-collapse font-sans text-base">
        <caption className="px-4 pt-3 pb-2 text-left font-display text-lg font-bold">{caption}</caption>
        <thead>
          <tr className="border-b-2 border-card-ink/25">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn("px-4 py-2 text-base font-bold", column.numeric ? "text-right" : "text-left")}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-card-ink/12 last:border-b-0">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "px-4 py-2",
                    column.numeric && "nums text-right whitespace-nowrap",
                    column.emphasis && "font-display text-xl font-extrabold"
                  )}
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {footnote && (
        <p className="border-t border-dashed border-card-ink/25 px-4 pt-2 pb-3 font-sans text-base leading-snug">{footnote}</p>
      )}
    </div>
  )
}
