import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/ui/Navbar'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'TalentDash — Career Intelligence Platform for India',
    template: '%s | TalentDash',
  },
  description:
    'TalentDash is a career intelligence platform with structured salary data, company reviews, and interview experiences for Indian tech professionals.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://talentdash.in'),
  openGraph: {
    siteName: 'TalentDash',
    type: 'website',
  },
}

import Sidebar from '@/components/ui/Sidebar'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-white text-[#222222] antialiased min-h-screen flex">
        <Sidebar />
        <main className="flex-1 ml-[280px] bg-white min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
