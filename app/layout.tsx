import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Chakra_Petch, Inter } from 'next/font/google'
import { BottomNav, SideNav } from '@/components/system/nav'
import { StoreProvider } from '@/lib/store'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const chakra = Chakra_Petch({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-chakra',
})

export const metadata: Metadata = {
  title: 'SYSTEM — Hunter Workout Tracker',
  description: 'Clear your daily quests, log your sets, and level up your Hunter.',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#121318',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${chakra.variable}`}>
      <body className="antialiased">
        <StoreProvider>
          <div className="min-h-dvh md:pl-56">
            <SideNav />
            <main className="mx-auto w-full max-w-2xl px-4 pb-28 pt-6 md:pb-12 md:pt-10">{children}</main>
            <BottomNav />
          </div>
        </StoreProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
