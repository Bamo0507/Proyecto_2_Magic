"use client"

import { useId, type ReactNode } from "react"

import type { ManaColor } from "@/features/shared/types/section"
import type { SectionKey } from "@/i18n/texts"

const INK = "var(--card-ink)"
const PAPER = "var(--card-paper)"
const SUIT = "var(--card-suit)"

interface SceneProps {
  hatch: string
}

function GroundShadow({ hatch, width = 22 }: SceneProps & { width?: number }) {
  return <ellipse cx="50" cy="85" rx={width} ry="2.6" fill={hatch} stroke="none" />
}

function OpenedPack({ hatch }: SceneProps) {
  const pack = "M34 30 L38 26 L42 30 L46 26 L50 30 L54 26 L58 30 L62 26 L66 30 L64 82 L36 82 Z"
  return (
    <>
      <GroundShadow hatch={hatch} />
      <rect x="43" y="6" width="14" height="20" rx="1.5" transform="rotate(-16 50 30)" fill={PAPER} />
      <rect x="43" y="6" width="14" height="20" rx="1.5" transform="rotate(16 50 30)" fill={PAPER} />
      <rect x="43" y="4" width="14" height="20" rx="1.5" fill={PAPER} />
      <rect x="46" y="7.5" width="8" height="10" rx="0.8" fill={SUIT} strokeWidth={0.9} />
      <path d={pack} fill={PAPER} />
      <path d="M56 30 L66 30 L64 82 L55 82 Z" fill={hatch} stroke="none" />
      <path d={pack} />
      <path d="M40 46 H58 M40 52 H52" strokeWidth={0.9} />
    </>
  )
}

function Target({ hatch }: SceneProps) {
  return (
    <>
      <GroundShadow hatch={hatch} width={18} />
      <circle cx="50" cy="44" r="24" fill={PAPER} />
      <path d="M62 23.2 A24 24 0 0 1 62 64.8 A30 30 0 0 0 62 23.2 Z" fill={hatch} stroke="none" />
      <circle cx="50" cy="44" r="24" />
      <circle cx="50" cy="44" r="15" fill={SUIT} />
      <circle cx="50" cy="44" r="6" fill={PAPER} />
      <path d="M88 6 L53 41" strokeWidth={2} />
      <path d="M53 41 L59 39 L55 35 Z" fill={INK} />
      <path d="M88 6 L81 6 L84 10 Z M88 6 L88 13 L84 10 Z" fill={PAPER} strokeWidth={0.9} />
    </>
  )
}

function SheetsIntoPack({ hatch }: SceneProps) {
  const rows = [
    { y: 10, xs: [27.5, 39.5, 51.5, 63.5] },
    { y: 24, xs: [33.5, 45.5, 57.5] },
    { y: 38, xs: [39.5, 51.5] },
  ]
  const pack = "M38 54 L41 51 L44 54 L47 51 L50 54 L53 51 L56 54 L59 51 L62 54 L61 84 L39 84 Z"
  return (
    <>
      <GroundShadow hatch={hatch} width={16} />
      <path d="M32 22 L41 52 M68 22 L59 52" strokeWidth={0.9} strokeDasharray="1 1.8" />
      {rows.flatMap((row, rowIndex) =>
        row.xs.map((x, columnIndex) => (
          <rect
            key={`${rowIndex}-${columnIndex}`}
            x={x}
            y={row.y}
            width="9"
            height="12"
            rx="1"
            fill={rowIndex === 1 && columnIndex === 1 ? SUIT : PAPER}
            strokeWidth={1.2}
          />
        ))
      )}
      <path d={pack} fill={PAPER} />
      <path d="M54 54 L62 54 L61 84 L53 84 Z" fill={hatch} stroke="none" />
      <path d={pack} />
    </>
  )
}

function Hourglass({ hatch }: SceneProps) {
  const bulbs = "M37 13 H63 C63 30 53 36 50 46 C47 36 37 30 37 13 Z M37 79 H63 C63 62 53 56 50 46 C47 56 37 62 37 79 Z"
  return (
    <>
      <GroundShadow hatch={hatch} />
      <path d={bulbs} fill={PAPER} />
      <path d="M41 21 H59 C58 29 52 34 50 40 C48 34 42 29 41 21 Z" fill={SUIT} />
      <path d="M40 79 C43 70 47 66 50 64 C53 66 57 70 60 79 Z" fill={SUIT} />
      <path d="M56 13 H63 C63 30 53 36 50 46 Z M56 79 H63 C63 62 53 56 50 46 Z" fill={hatch} stroke="none" />
      <path d="M50 41 V63" strokeWidth={0.9} strokeDasharray="1 1.8" />
      <path d={bulbs} />
      <path d="M34 14 V78 M66 14 V78" />
      <rect x="29" y="7" width="42" height="6" rx="1" fill={INK} />
      <rect x="29" y="79" width="42" height="6" rx="1" fill={INK} />
    </>
  )
}

function Dice({ hatch }: SceneProps) {
  return (
    <>
      <GroundShadow hatch={hatch} width={26} />
      <rect x="62" y="10" width="12" height="17" rx="1.5" transform="rotate(18 68 18)" fill={SUIT} />
      <path d="M40 44 L52 50 L40 56 L28 50 Z M28 50 L40 56 V70 L28 64 Z" fill={PAPER} />
      <path d="M40 56 L52 50 V64 L40 70 Z" fill={PAPER} />
      <path d="M40 56 L52 50 V64 L40 70 Z" fill={hatch} stroke="none" />
      <path d="M40 44 L52 50 L40 56 L28 50 Z M28 50 L40 56 V70 L28 64 Z M40 56 L52 50 V64 L40 70 Z" />
      <circle cx="40" cy="50" r="2.2" fill={INK} stroke="none" />
      <circle cx="32" cy="56" r="2" fill={INK} stroke="none" />
      <circle cx="36" cy="64" r="2" fill={INK} stroke="none" />
      <path d="M66 48 L75 52.5 L66 57 L57 52.5 Z M57 52.5 L66 57 V67 L57 62.5 Z" fill={PAPER} />
      <path d="M66 57 L75 52.5 V62.5 L66 67 Z" fill={PAPER} />
      <path d="M66 57 L75 52.5 V62.5 L66 67 Z" fill={hatch} stroke="none" />
      <path d="M66 48 L75 52.5 L66 57 L57 52.5 Z M57 52.5 L66 57 V67 L57 62.5 Z M66 57 L75 52.5 V62.5 L66 67 Z" />
      <circle cx="66" cy="52.5" r="1.8" fill={INK} stroke="none" />
      <circle cx="61.5" cy="59.5" r="1.6" fill={INK} stroke="none" />
    </>
  )
}

function CoinStacks({ hatch }: SceneProps) {
  const stacks = [
    { x: 26, coins: 14 },
    { x: 42, coins: 10 },
    { x: 58, coins: 7 },
    { x: 74, coins: 4 },
  ]
  return (
    <>
      <GroundShadow hatch={hatch} width={34} />
      {stacks.flatMap((stack, stackIndex) =>
        Array.from({ length: stack.coins }, (unused, coinIndex) => {
          const isHighlighted = stackIndex === stacks.length - 1 && coinIndex === stack.coins - 1
          return (
            <ellipse
              key={`${stack.x}-${coinIndex}`}
              cx={stack.x}
              cy={82 - coinIndex * 4}
              rx="7"
              ry="2.5"
              fill={isHighlighted ? SUIT : PAPER}
              strokeWidth={1.1}
            />
          )
        })
      )}
    </>
  )
}

function Balance({ hatch }: SceneProps) {
  return (
    <>
      <GroundShadow hatch={hatch} width={14} />
      <path d="M50 16 V80" strokeWidth={2} />
      <path d="M38 84 H62 L58 79 H42 Z" fill={INK} />
      <path d="M18 24 H82" strokeWidth={2} />
      <circle cx="50" cy="24" r="3" fill={INK} />
      <path d="M18 24 L9 50 M18 24 L27 50 M82 24 L73 50 M82 24 L91 50" strokeWidth={0.9} />
      <rect x="12.5" y="34" width="11" height="15" rx="1.2" fill={SUIT} />
      <ellipse cx="82" cy="47" rx="6" ry="2" fill={PAPER} strokeWidth={1.1} />
      <ellipse cx="82" cy="44" rx="6" ry="2" fill={PAPER} strokeWidth={1.1} />
      <ellipse cx="82" cy="41" rx="6" ry="2" fill={PAPER} strokeWidth={1.1} />
      <path d="M7 50 H29 C27 56 9 56 7 50 Z M71 50 H93 C91 56 73 56 71 50 Z" fill={PAPER} />
    </>
  )
}

const SCENE_BY_SECTION: Record<SectionKey, (props: SceneProps) => ReactNode> = {
  problem: OpenedPack,
  objectives: Target,
  model: SheetsIntoPack,
  technique: Hourglass,
  simulation: Dice,
  results: CoinStacks,
  validation: Balance,
}

interface CardArtProps {
  sectionKey: SectionKey
  className?: string
}

export function CardArt({ sectionKey, className }: CardArtProps) {
  // The hand and the mobile grid render the same cards twice, so each pattern needs its own id or the hatch would
  // point at the copy that is hidden
  const hatchId = `hatch-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const Scene = SCENE_BY_SECTION[sectionKey]
  return (
    <svg
      viewBox="0 0 100 92"
      className={className}
      fill="none"
      stroke={INK}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <defs>
        <pattern id={hatchId} width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0 V2.4" stroke={INK} strokeWidth={0.75} />
        </pattern>
      </defs>
      <circle cx="50" cy="44" r="36.5" strokeWidth={0.6} />
      <circle cx="50" cy="44" r="33" fill={SUIT} strokeWidth={1.2} />
      <Scene hatch={`url(#${hatchId})`} />
    </svg>
  )
}

const SUIT_PATH_BY_COLOR: Record<ManaColor, string> = {
  white: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18Z",
  blue: "M3 8 H21 A9 9 0 0 1 3 8 Z",
  green: "M12 2.5 L20.5 7.25 V16.75 L12 21.5 L3.5 16.75 V7.25 Z",
  black: "M4.5 4.5 H19.5 V19.5 H4.5 Z",
  red: "M12 1.5 L21.5 18.5 H2.5 Z",
  gold: "M12 2 L14.8 9.2 L22 12 L14.8 14.8 L12 22 L9.2 14.8 L2 12 L9.2 9.2 Z",
  colorless: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18Z M12 8a4 4 0 1 1 0 8a4 4 0 1 1 0-8Z",
}

interface SuitGlyphProps {
  color: ManaColor
  className?: string
}

export function SuitGlyph({ color, className }: SuitGlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" fillRule="evenodd" aria-hidden>
      <path d={SUIT_PATH_BY_COLOR[color]} />
    </svg>
  )
}
