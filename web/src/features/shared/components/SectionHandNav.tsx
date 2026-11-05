import Link from "next/link"

import { cn } from "@/lib/utils"
import { MiniCard } from "@/features/shared/components/MiniCard"
import { formatSectionPosition, SECTIONS } from "@/features/shared/sections"
import { texts, type SectionKey } from "@/i18n/texts"

const FAN_STEP_DEGREES = 4
const FAN_CENTER = (SECTIONS.length - 1) / 2

interface SectionHandNavProps {
  currentKey: SectionKey
  className?: string
}

export function SectionHandNav({ currentKey, className }: SectionHandNavProps) {
  return (
    <nav aria-label={texts.section.handNavLabel} className={cn("flex flex-col items-center gap-1.5", className)}>
      <ul className="flex items-end">
        {SECTIONS.map((section, index) => {
          const isCurrent = section.key === currentKey
          return (
            <li key={section.key} className="-mx-1 origin-bottom" style={{ rotate: `${(index - FAN_CENTER) * FAN_STEP_DEGREES}deg` }}>
              <Link
                href={section.href}
                aria-label={`${texts.sections[section.key].title}, ${formatSectionPosition(index + 1)}`}
                aria-current={isCurrent ? "page" : undefined}
                className="group/mini block rounded-md p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-felt"
              >
                <MiniCard
                  section={section}
                  position={index + 1}
                  className={cn(
                    "w-10 transition-[translate,box-shadow] duration-200 ease-out motion-reduce:transition-none sm:w-11 short:w-9",
                    isCurrent ? "-translate-y-3 shadow-card-lifted" : "group-hover/mini:-translate-y-1.5"
                  )}
                />
              </Link>
            </li>
          )
        })}
      </ul>
      <p className="hidden font-sans text-xs text-muted-foreground md:block short:hidden">{texts.section.keyboardHint}</p>
    </nav>
  )
}
