'use client'

import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button, FieldLabel, PageHeader, Panel, ScreenLoading, Stepper, TextInput } from '@/components/system/ui'
import { TIME_STEP, WEEKDAYS, WEIGHT_STEP } from '@/lib/constants'
import { dateKey, weekdayOf } from '@/lib/game'
import { useStore } from '@/lib/store'
import type { Exercise, QuestExercise } from '@/lib/types'
import { cn } from '@/lib/utils'

export function NewQuestScreen() {
  const { state, actions } = useStore()
  const router = useRouter()
  const [name, setName] = useState('')
  const [weekdays, setWeekdays] = useState<number[]>(() => [weekdayOf(dateKey())])
  const [items, setItems] = useState<QuestExercise[]>([])
  const [query, setQuery] = useState('')

  if (!state) return <ScreenLoading />

  const byId = new Map(state.exercises.map((e) => [e.id, e]))
  const available = state.exercises.filter(
    (e) => !items.some((i) => i.exerciseId === e.id) && e.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  const toggleDay = (d: number) =>
    setWeekdays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()))
  const addItem = (ex: Exercise) =>
    setItems((prev) => [
      ...prev,
      { exerciseId: ex.id, sets: 3, reps: ex.type === 'time' ? 30 : 10, weight: ex.type === 'weight' ? 20 : 0 },
    ])
  const patchItem = (i: number, patch: Partial<QuestExercise>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  const move = (i: number, dir: -1 | 1) =>
    setItems((prev) => {
      const next = [...prev]
      ;[next[i], next[i + dir]] = [next[i + dir], next[i]]
      return next
    })

  const missing = [!name.trim() && 'a name', !weekdays.length && 'a weekday', !items.length && 'an exercise'].filter(Boolean)

  const save = () => {
    if (missing.length) return
    actions.addQuest({ id: crypto.randomUUID(), name: name.trim(), weekdays, exercises: items })
    router.push('/quests')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader label="Quest registration" title="New quest" />

      <Panel label="Details" bodyClassName="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="quest-name">Name</FieldLabel>
          <TextInput id="quest-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Upper body" maxLength={40} />
        </div>
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Repeat on</legend>
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d, i) => (
              <button
                key={d}
                type="button"
                aria-pressed={weekdays.includes(i)}
                onClick={() => toggleDay(i)}
                className={cn(
                  'h-12 border text-xs font-medium uppercase',
                  weekdays.includes(i) ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:bg-secondary',
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </fieldset>
      </Panel>

      {items.length > 0 && (
        <ol className="flex flex-col gap-3">
          {items.map((it, i) => {
            const ex = byId.get(it.exerciseId)
            if (!ex) return null
            return (
              <li key={it.exerciseId}>
                <Panel
                  label={`${String(i + 1).padStart(2, '0')} · ${ex.category}`}
                  action={
                    <div className="-mr-2 flex">
                      <Button variant="ghost" size="icon" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                        <ChevronUp />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                        <ChevronDown />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Remove ${ex.name}`} onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))}>
                        <X />
                      </Button>
                    </div>
                  }
                  bodyClassName="flex flex-col gap-4"
                >
                  <h3 className="font-display text-lg font-bold uppercase tracking-wide">{ex.name}</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Stepper label="Sets" value={it.sets} min={1} onChange={(v) => patchItem(i, { sets: Math.round(v) })} />
                    <Stepper
                      label={ex.type === 'time' ? 'Seconds' : 'Reps'}
                      value={it.reps}
                      min={1}
                      step={ex.type === 'time' ? TIME_STEP : 1}
                      onChange={(v) => patchItem(i, { reps: v })}
                    />
                    {ex.type === 'weight' && (
                      <Stepper label="Weight" unit="kg" value={it.weight} step={WEIGHT_STEP} onChange={(v) => patchItem(i, { weight: v })} />
                    )}
                  </div>
                </Panel>
              </li>
            )
          })}
        </ol>
      )}

      <Panel label="Add from library" bodyClassName="flex flex-col gap-3">
        <TextInput aria-label="Search exercises" placeholder="Search exercises" value={query} onChange={(e) => setQuery(e.target.value)} />
        {available.length ? (
          <ul className="flex flex-col divide-y divide-border border border-border">
            {available.map((ex) => (
              <li key={ex.id}>
                <button type="button" onClick={() => addItem(ex)} className="flex h-12 w-full items-center justify-between gap-3 px-3 text-left hover:bg-secondary">
                  <span className="truncate">{ex.name}</span>
                  <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                    {ex.category}
                    <Plus className="size-4" aria-hidden />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No more exercises to add.</p>
        )}
      </Panel>

      <div className="flex flex-col gap-2">
        <Button onClick={save} disabled={missing.length > 0} className="w-full">
          Save quest
        </Button>
        {missing.length > 0 && <p className="text-center text-sm text-muted-foreground">Add {missing.join(', ')} to save.</p>}
      </div>
    </div>
  )
}
