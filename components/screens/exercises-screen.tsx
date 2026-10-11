'use client'

import { Pencil, Plus, Search, Trash2, Zap } from 'lucide-react'
import { useState } from 'react'
import { PlanFields, planXp } from '@/components/exercises/plan-fields'
import { Button, FieldLabel, PageHeader, Panel, ScreenLoading, Segmented, SystemLabel, TextInput } from '@/components/system/ui'
import { CATEGORIES, DAILY_XP_CAP, DEFAULT_PLAN, EXERCISE_TYPES } from '@/lib/constants'
import { dateKey, xpEarnedOn } from '@/lib/game'
import { useStore } from '@/lib/store'
import type { Exercise, SetPlan } from '@/lib/types'

const planFor = (ex: Exercise): SetPlan => ex.defaults ?? DEFAULT_PLAN[ex.type]

function ExerciseForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Exercise
  onSave: (e: Exercise, claim: boolean) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState<Exercise>({ ...initial, defaults: planFor(initial) })
  const plan = draft.defaults ?? DEFAULT_PLAN[draft.type]
  const valid = draft.name.trim().length > 0
  const save = (claim: boolean) => valid && onSave({ ...draft, name: draft.name.trim() }, claim)

  return (
    <Panel label={initial.name ? 'Edit exercise' : 'New exercise'}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          save(false)
        }}
      >
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor="exercise-name">Exercise name</FieldLabel>
          <TextInput
            id="exercise-name"
            autoFocus
            value={draft.name}
            maxLength={40}
            placeholder="Type your exercise, e.g. Overhead Press"
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </div>
        <Segmented
          label="Category"
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          value={draft.category}
          onChange={(category) => setDraft({ ...draft, category })}
        />
        <Segmented
          label="Type"
          options={EXERCISE_TYPES}
          value={draft.type}
          onChange={(type) => setDraft({ ...draft, type, defaults: draft.type === type ? draft.defaults : DEFAULT_PLAN[type] })}
        />
        <PlanFields type={draft.type} plan={plan} onChange={(defaults) => setDraft({ ...draft, defaults })} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="outline" disabled={!valid}>
            Save
          </Button>
          <Button disabled={!valid || planXp(draft.type, plan) === 0} onClick={() => save(true)}>
            <Zap aria-hidden />
            Save & claim
          </Button>
        </div>
      </form>
    </Panel>
  )
}

function QuickLog({ exercise, onClaim, onCancel }: { exercise: Exercise; onClaim: (plan: SetPlan) => void; onCancel: () => void }) {
  const [plan, setPlan] = useState(planFor(exercise))
  return (
    <div className="flex flex-col gap-3 border-t border-border bg-background/40 p-4">
      <PlanFields type={exercise.type} plan={plan} onChange={setPlan} />
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={planXp(exercise.type, plan) === 0} onClick={() => onClaim(plan)}>
          <Zap aria-hidden />
          Claim XP
        </Button>
      </div>
    </div>
  )
}

export function ExercisesScreen() {
  const { state, actions } = useStore()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Exercise | null>(null)
  const [loggingId, setLoggingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  if (!state) return <ScreenLoading />

  const typeLabel = (t: Exercise['type']) => EXERCISE_TYPES.find((x) => x.value === t)?.label
  const list = state.exercises.filter((e) => e.name.toLowerCase().includes(query.trim().toLowerCase()))
  const earnedToday = xpEarnedOn(state.sessions, dateKey())

  const claim = (ex: Exercise, plan: SetPlan) => {
    const gained = actions.logExercise(ex, plan)
    setNotice(
      gained > 0
        ? `${ex.name} logged. +${gained} XP acquired.`
        : `${ex.name} logged. Daily XP limit reached — no XP awarded.`,
    )
    setLoggingId(null)
  }

  const describe = (ex: Exercise) => {
    const p = planFor(ex)
    if (ex.type === 'time') return `${p.sets} x ${p.reps}s`
    if (ex.type === 'weight') return `${p.sets} x ${p.reps} @ ${p.weight}kg`
    return `${p.sets} x ${p.reps}`
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        label="Skill registry"
        title="Exercises"
        action={
          <Button
            size="sm"
            onClick={() => {
              setLoggingId(null)
              setEditing({ id: crypto.randomUUID(), name: '', category: 'Push', type: 'weight', defaults: DEFAULT_PLAN.weight })
            }}
          >
            <Plus aria-hidden />
            New
          </Button>
        }
      />

      {notice && (
        <div role="status" className="flex items-center justify-between gap-3 border border-primary/50 bg-primary/10 px-4 py-3">
          <SystemLabel>{notice}</SystemLabel>
          <Button variant="ghost" size="sm" onClick={() => setNotice(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {editing && (
        <ExerciseForm
          key={editing.id}
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={(ex, shouldClaim) => {
            actions.saveExercise(ex)
            setEditing(null)
            if (shouldClaim) claim(ex, planFor(ex))
          }}
        />
      )}

      <p className="text-xs text-muted-foreground">
        XP = sets x reps x weight x 0.1 (bodyweight counts as 50kg, time earns 0.5 XP/sec). Today:{' '}
        <span className="tabular-nums text-foreground">
          {earnedToday} / {DAILY_XP_CAP}
        </span>{' '}
        XP
      </p>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <TextInput aria-label="Search exercises" placeholder="Search exercises" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
      </div>

      <Panel label={`Library · ${state.exercises.length}`} bodyClassName="p-0">
        {list.length ? (
          <ul className="divide-y divide-border">
            {list.map((ex) => (
              <li key={ex.id}>
                <div className="flex items-center gap-2 py-2 pl-4 pr-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{ex.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ex.category} · {typeLabel(ex.type)} · <span className="tabular-nums">{describe(ex)}</span>
                    </p>
                  </div>
                  <Button
                    variant={loggingId === ex.id ? 'primary' : 'outline'}
                    size="sm"
                    aria-expanded={loggingId === ex.id}
                    onClick={() => setLoggingId(loggingId === ex.id ? null : ex.id)}
                  >
                    <Zap aria-hidden />
                    Log
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${ex.name}`}
                    onClick={() => {
                      setLoggingId(null)
                      setEditing(ex)
                    }}
                  >
                    <Pencil />
                  </Button>
                  {confirmId === ex.id ? (
                    <Button variant="danger" size="sm" autoFocus onBlur={() => setConfirmId(null)} onClick={() => actions.deleteExercise(ex.id)}>
                      Delete
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" aria-label={`Delete ${ex.name}`} onClick={() => setConfirmId(ex.id)}>
                      <Trash2 />
                    </Button>
                  )}
                </div>
                {loggingId === ex.id && (
                  <QuickLog key={ex.id} exercise={ex} onCancel={() => setLoggingId(null)} onClaim={(plan) => claim(ex, plan)} />
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">No exercises found.</p>
        )}
      </Panel>
    </div>
  )
}
