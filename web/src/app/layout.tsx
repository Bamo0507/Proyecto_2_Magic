import type { Metadata } from "next"
import { Alegreya, Alegreya_Sans } from "next/font/google"

import { texts } from "@/i18n/texts"
import "./globals.css"

const alegreya = Alegreya({
  variable: "--font-alegreya",
  subsets: ["latin"],
  style: ["normal", "italic"],
})

const alegreyaSans = Alegreya_Sans({
  variable: "--font-alegreya-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
})

export const metadata: Metadata = {
  title: {
    default: texts.app.title,
    template: texts.app.titleTemplate,
  },
  description: texts.app.description,
}

// Marks the document as script-enabled before hydration, so the dealt cards start hidden only when the deal can run
const MARK_SCRIPT_ENABLED = "document.documentElement.classList.add('js')"

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`dark ${alegreya.variable} ${alegreyaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: MARK_SCRIPT_ENABLED }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
