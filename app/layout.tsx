import type { Metadata } from 'next'
import { Inconsolata } from 'next/font/google'
import { ViewTransitions } from 'next-view-transitions'
import './globals.css'

const inconsolata = Inconsolata({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-inconsolata',
})

export const metadata: Metadata = {
  title: 'Igor Kolesnik — Product Designer',
  description: 'UI/UX Design, Web Design, Web Development, Branding',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inconsolata.variable}>
      <body><ViewTransitions>{children}</ViewTransitions></body>
    </html>
  )
}
