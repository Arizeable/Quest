'use client'

import { ArrowLeft, ChevronLeft, ChevronRight, Plus, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Button, buttonClass, Panel, ScreenLoading, SystemLabel } from '@/components/system/ui'
import { WEIGHT_STEP } from '@/lib/constants'
import { applyDailyCap, dateKey, getLevelInfo, lastSetsFor, setVolume, setXp, xpEarnedOn } from '@/lib/game'
import { useStore } from '@/lib/store'
import type { AppState, Exercise, Quest, QuestExercise } from '@/lib/types'
import { cn } from '@/lib/utils'
import { FinishPanel, type FinishResult } from './finish-panel'
import { RestTimer } from './rest-timer'
import { type ActiveSet, SetRow } from './set-row'

type Item = QuestExercise & { exercise: Exercise }

const formatSet = (type: Exercise['type'], s: { reps: number; weight: number }) =>
  type === 'weight' ? `${s.reps} x ${s.weight}kg` : type === 'time' ? `${s.reps}s` : `${s.reps} reps`

export function WorkoutScreen({ questId }: { questId: string }) {
  const { state } = useStore()
  if (!state) return <ScreenLoading />

  const quest = state.quests.find((q) => q.id === questId)
  const items: Item[] = (quest?.exercises ?? []).flatMap((qe) => {
    const exercise = state.exercises.find((e) => e.id === qe.exerciseId)
    return exercise ? [{ ...qe, exercise }] : []
  })

  if (!quest || !items.length) {
    return (
      <div className="flex flex-col items-start gap-4 py-10">
        <SystemLabel>Quest not found</SystemLabel>
        <p className="text-muted-foreground">This quest does not exist or has no exercises.</p>
        <Link href="/quests" className={buttonClass('outline', 'sm')}>
          Back to quests
        </Link>
      </div>
    )
  }

  return <WorkoutSession key={quest.id} quest={quest} items={items} state={state} />
}

function WorkoutSession({ quest, items, state }: { quest: Quest; items: Item[]; state: AppState }) {
  const { actions } = useStore()
  const [index, setIndex] = useState(0)
  const [sets, setSets] = useState<ActiveSet[][]>(() =>
    items.map((it) =>
      Array.from({ length: it.sets }, () => ({
        reps: it.reps,
        weight: state.nextWeight[it.exerciseId] ?? it.weight,
        done: false,
      })),
    ),
  )
  const [increases, setIncreases] = useState<Record<string, number>>({})
  const [restDuration, setRestDuration] = useState(90)
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null)
  const [result, setResult] = useState<FinishResult | null>(null)

  if (result) return <FinishPanel result={result} questName={quest.name} />

  const item = items[index]
  const { type } = item.exercise
  const current = sets[index]
  const last = lastSetsFor(state.sessions, item.exerciseId)
  const doneCount = sets.flat().filter((s) => s.done).length
  const isLast = index === items.length - 1
  const increased = increases[item.exerciseId]

  const updateCurrent = (fn: (arr: ActiveSet[]) => ActiveSet[]) =>
    setSets((prev) => prev.map((arr, i) => (i === index ? fn(arr) : arr)))

  const startRest = (seconds: number) => {
    setRestDuration(seconds)
    setRestEndsAt(Date.now() + seconds * 1000)
  }

  const toggleIncrease = () =>
    setIncreases((prev) => {
      const next = { ...prev }
      if (increased !== undefined) delete next[item.exerciseId]
      else next[item.exerciseId] = Math.max(...current.map((s) => s.weight)) + WEIGHT_STEP
      return next
    })

  const finish = () => {
    const logged = items
      .map((it, i) => ({
        exerciseId: it.exerciseId,
        type: it.exercise.type,
        sets: sets[i].filter((s) => s.done).map((s) => ({ reps: s.reps, weight: it.exercise.type === 'weight' ? s.weight : 0 })),
      }))
      .filter((e) => e.sets.length)
    const rawXp = logged.reduce((sum, e) => sum + e.sets.reduce((a, s) => a + setXp(e.type, s.reps, s.weight), 0), 0)
    const volume = logged.reduce((sum, e) => sum + e.sets.reduce((a, s) => a + setVolume(e.type, s.reps, s.weight), 0), 0)
    const today = dateKey()
    const xp = applyDailyCap(rawXp, xpEarnedOn(state.sessions, today))

    actions.completeSession(
      {
        id: crypto.randomUUID(),
        questId: quest.id,
        date: today,
        xp,
        volume,
        exercises: logged.map(({ exerciseId, sets }) => ({ exerciseId, sets })),
      },
      increases,
    )
    setResult({ rawXp, xp, volume, levelBefore: getLevelInfo(state.xp).level, totalXp: state.xp + xp })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link href="/quests" className="-ml-1 flex h-9 items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden />
          Quests
        </Link>
        <SystemLabel>
          {quest.name} · Exercise {index + 1}/{items.length}
        </SystemLabel>
        <div className="flex gap-1" aria-hidden>
          {items.map((it, i) => (
            <span
              key={it.exerciseId}
              className={cn('h-1 flex-1', i === index ? 'bg-foreground' : sets[i].some((s) => s.done) ? 'bg-muted-foreground' : 'bg-border')}
            />
          ))}
        </div>
      </div>

      <Panel label={item.exercise.category} bodyClassName="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">{item.exercise.name}</h1>
        <p className="text-sm text-muted-foreground">
          Target: {item.sets} sets · {formatSet(type, item)}
        </p>
        <p className="text-sm text-muted-foreground">
          Last session:{' '}
          {last ? (
            <span className="text-foreground tabular-nums">{last.sets.map((s) => formatSet(type, s)).join(', ')}</span>
          ) : (
            'none yet'
          )}
        </p>
      </Panel>

      <ol className="flex flex-col gap-3">
        {current.map((s, i) => (
          <SetRow
            key={i}
            index={i}
            set={s}
            type={type}
            canRemove={current.length > 1}
            onChange={(patch) => updateCurrent((arr) => arr.map((x, si) => (si === i ? { ...x, ...patch } : x)))}
            onToggle={() => {
              if (!s.done) startRest(restDuration)
              updateCurrent((arr) => arr.map((x, si) => (si === i ? { ...x, done: !x.done } : x)))
            }}
            onRemove={() => updateCurrent((arr) => arr.filter((_, si) => si !== i))}
          />
        ))}
      </ol>

      <div className="flex flex-col gap-3">
        <Button variant="outline" onClick={() => updateCurrent((arr) => [...arr, { ...arr[arr.length - 1], done: false }])}>
          <Plus aria-hidden />
          Add set
        </Button>
        {type === 'weight' && (
          <Button variant="outline" aria-pressed={increased !== undefined} onClick={toggleIncrease} className={cn(increased !== undefined && 'border-foreground')}>
            <TrendingUp aria-hidden />
            {increased !== undefined ? `Next time: ${increased} kg (undo)` : `Increase weight for next time`}
          </Button>
        )}
      </div>

      <RestTimer endsAt={restEndsAt} duration={restDuration} onStart={startRest} onStop={() => setRestEndsAt(null)} />

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          <ChevronLeft aria-hidden />
          Prev
        </Button>
        {isLast ? (
          <Button onClick={finish} disabled={doneCount === 0}>
            Finish
          </Button>
        ) : (
          <Button onClick={() => setIndex(index + 1)}>
            Next
            <ChevronRight aria-hidden />
          </Button>
        )}
      </div>
    </div>
  )
}
