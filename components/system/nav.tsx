'use client'

import { Activity, Dumbbell, Swords } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/', label: 'Status', icon: Activity },
  { href: '/quests', label: 'Quests', icon: Swords },
  { href: '/exercises', label: 'Exercises', icon: Dumbbell },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  if (href === '/quests' && pathname.startsWith('/workout')) return true
  return pathname.startsWith(href)
}

export function SideNav() {
  const pathname = usePathname()
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-56 flex-col border-r border-border bg-card md:flex">
      <div className="border-b border-border px-5 py-5">
        <p className="font-display text-xl font-bold tracking-[0.3em]">SYSTEM</p>
        <p className="mt-1 text-xs text-muted-foreground">Hunter training log</p>
      </div>
      <nav aria-label="Main" className="flex flex-col py-3">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex h-12 items-center gap-3 border-l-2 px-5 font-display text-sm font-semibold uppercase tracking-wider',
                active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              '-mt-px flex h-16 flex-col items-center justify-center gap-1 border-t-2 font-display text-xs font-semibold uppercase tracking-wider',
              active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground',
            )}
          >
            <Icon className="size-5" aria-hidden />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
