'use client'

import { useEffect, useState } from 'react'
import { Button, Panel } from '@/components/system/ui'
import { REST_PRESETS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const format = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export function RestTimer({
  endsAt,
  duration,
  onStart,
  onStop,
}: {
  endsAt: number | null
  duration: number
  onStart: (seconds: number) => void
  onStop: () => void
}) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!endsAt) return
    const tick = () => setNow(Date.now())
    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [endsAt])

  const remaining = endsAt ? Math.max(0, Math.ceil((endsAt - now) / 1000)) : duration
  const running = endsAt !== null && remaining > 0

  return (
    <Panel label="Rest timer" bodyClassName="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="font-display text-4xl font-bold tabular-nums" aria-live="polite">
          {endsAt && !running ? 'Ready' : format(remaining)}
        </p>
        {running && (
          <Button variant="outline" size="sm" onClick={onStop}>
            Stop
          </Button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {REST_PRESETS.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={duration === s}
            onClick={() => onStart(s)}
            className={cn(
              'h-11 border font-display text-sm font-semibold tabular-nums',
              duration === s ? 'border-foreground text-foreground' : 'border-border text-muted-foreground hover:bg-secondary',
            )}
          >
            {format(s)}
          </button>
        ))}
      </div>
    </Panel>
  )
}
