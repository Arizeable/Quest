import { Stepper } from '@/components/system/ui'
import { TIME_STEP, WEIGHT_STEP } from '@/lib/constants'
import { setXp } from '@/lib/game'
import type { ExerciseType, SetPlan } from '@/lib/types'
import { cn } from '@/lib/utils'

export const planXp = (type: ExerciseType, plan: SetPlan) =>
  Math.floor(plan.sets) * setXp(type, plan.reps, type === 'weight' ? plan.weight : 0)

export function PlanFields({ type, plan, onChange }: { type: ExerciseType; plan: SetPlan; onChange: (p: SetPlan) => void }) {
  const xp = planXp(type, plan)
  return (
    <div className="flex flex-col gap-3">
      <div className={cn('grid gap-3', type === 'weight' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2')}>
        <Stepper label="Sets" value={plan.sets} min={1} onChange={(sets) => onChange({ ...plan, sets: Math.round(sets) })} />
        <Stepper
          label={type === 'time' ? 'Seconds' : 'Reps'}
          value={plan.reps}
          min={1}
          step={type === 'time' ? TIME_STEP : 1}
          onChange={(reps) => onChange({ ...plan, reps })}
        />
        {type === 'weight' && (
          <Stepper label="Weight" unit="kg" value={plan.weight} step={WEIGHT_STEP} onChange={(weight) => onChange({ ...plan, weight })} />
        )}
      </div>
      <div className="flex items-center justify-between border border-border bg-background px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Reward</span>
        <span className="font-display text-lg font-bold tabular-nums text-primary" aria-live="polite">
          +{xp} XP
        </span>
      </div>
    </div>
  )
}
