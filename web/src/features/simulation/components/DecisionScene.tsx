import { cn } from "@/lib/utils"
import { fillTemplate, formatSignedMoney } from "@/features/simulation/format"
import type { SimulationAction, SimulationRun } from "@/features/simulation/types/simulationRun"
import { texts } from "@/i18n/texts"

const ACTIONS: SimulationAction[] = ["stop", "pack", "box"]

interface DecisionSceneProps {
  run: SimulationRun
  stepIndex: number
}

export function DecisionScene({ run, stepIndex }: DecisionSceneProps) {
  const step = run.steps[stepIndex]
  const labels = texts.simulation.decision

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-5">
      <header className="flex flex-col gap-1">
        <h3 className="font-display text-2xl leading-tight font-bold">{labels.title}</h3>
        <p className="font-sans text-base text-muted-foreground">
          {fillTemplate(labels.subtitleTemplate, { missing: step.missingBefore })}
        </p>
      </header>

      <ul className="flex flex-col gap-2">
        {ACTIONS.map((action, index) => {
          const isChosen = action === step.action
          const gain = step.expectedGain[action]
          return (
            <li
              key={action}
              style={{ animationDelay: `${index * 70}ms` }}
              className={cn(
                "flex items-center justify-between gap-4 rounded-xl border-2 px-4 py-3 motion-safe:animate-rise-in",
                isChosen ? "border-primary bg-felt-raised shadow-card" : "border-dashed border-playmat-stitch bg-felt-raised/45"
              )}
            >
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-display text-lg leading-tight font-bold">{labels.actions[action]}</span>
                {isChosen && (
                  <span className="rounded-full bg-primary px-2 py-0.5 font-sans text-xs font-bold text-primary-foreground">
                    {labels.chosen}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "nums font-display text-2xl leading-none font-extrabold",
                  gain > 0 ? "text-primary" : "text-muted-foreground"
                )}
              >
                {formatSignedMoney(gain)}
              </span>
            </li>
          )
        })}
      </ul>

      <p className="font-serif text-base leading-snug text-pretty text-foreground/85">{labels.formula}</p>
      {step.action === "stop" && (
        <p className="font-sans text-base font-medium">{fillTemplate(labels.stopNoteTemplate, { missing: step.missingBefore })}</p>
      )}
    </div>
  )
}
