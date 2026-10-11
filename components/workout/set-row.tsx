import { Check, X } from 'lucide-react'
import { Button, Stepper } from '@/components/system/ui'
import { TIME_STEP, WEIGHT_STEP } from '@/lib/constants'
import type { ExerciseType } from '@/lib/types'
import { cn } from '@/lib/utils'

export interface ActiveSet {
  reps: number
  weight: number
  done: boolean
}

export function SetRow({
  index,
  set,
  type,
  canRemove,
  onChange,
  onToggle,
  onRemove,
}: {
  index: number
  set: ActiveSet
  type: ExerciseType
  canRemove: boolean
  onChange: (patch: Partial<ActiveSet>) => void
  onToggle: () => void
  onRemove: () => void
}) {
  return (
    <li className={cn('flex flex-col gap-3 border bg-card p-3', set.done ? 'border-foreground/50' : 'border-border')}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Set {index + 1}</span>
        <div className="flex items-center gap-2">
          {canRemove && (
            <Button variant="ghost" size="icon" aria-label={`Remove set ${index + 1}`} onClick={onRemove}>
              <X />
            </Button>
          )}
          <button
            type="button"
            role="checkbox"
            aria-checked={set.done}
            onClick={onToggle}
            className={cn(
              'flex h-11 items-center gap-2 border px-3 font-display text-sm font-semibold uppercase tracking-wider',
              set.done ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:bg-secondary',
            )}
          >
            <span className={cn('flex size-5 items-center justify-center border', set.done ? 'border-background' : 'border-muted-foreground')}>
              {set.done && <Check className="size-3.5" aria-hidden />}
            </span>
            Set done
          </button>
        </div>
      </div>
      <div className={cn('grid gap-3', type === 'weight' ? 'grid-cols-2' : 'grid-cols-1')}>
        <Stepper
          label={type === 'time' ? 'Seconds' : 'Reps'}
          value={set.reps}
          step={type === 'time' ? TIME_STEP : 1}
          onChange={(reps) => onChange({ reps })}
        />
        {type === 'weight' && (
          <Stepper label="Weight" unit="kg" value={set.weight} step={WEIGHT_STEP} onChange={(weight) => onChange({ weight })} />
        )}
      </div>
    </li>
  )
}
