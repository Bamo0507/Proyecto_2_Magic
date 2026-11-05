import { CardHand } from "@/features/home/components/CardHand"
import { PlaymatBackground } from "@/features/shared/components/PlaymatBackground"
import { PlaymatStitch } from "@/features/shared/components/PlaymatStitch"
import { SiteFooter } from "@/features/shared/components/SiteFooter"
import { TopBar } from "@/features/shared/components/TopBar"
import { texts } from "@/i18n/texts"

export function HomePage() {
  return (
    <main className="relative isolate flex min-h-dvh w-full max-w-full flex-col overflow-x-hidden md:h-dvh md:min-h-[42rem]">
      <PlaymatBackground />
      <PlaymatStitch />
      <TopBar />

      <section className="mat-padding mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-10 pt-6 md:min-h-0 md:gap-3 short:gap-2 short:pt-2">
        <header className="flex w-full max-w-5xl shrink-0 flex-col items-center gap-3 text-center short:gap-1.5">
          <h1 className="font-display text-[clamp(2.25rem,min(5.5vw,8vh),4.75rem)] leading-none font-extrabold tracking-[-0.015em]">
            {texts.home.title}
          </h1>
          <p className="max-w-[60ch] font-serif text-lg leading-relaxed text-pretty text-foreground/75 italic md:text-xl short:max-w-none short:text-lg short:leading-snug">
            {texts.home.subtitle}
          </p>
        </header>

        <CardHand />
      </section>

      <SiteFooter />
    </main>
  )
}
