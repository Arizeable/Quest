'use client'

import { Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Button, buttonClass, PageHeader, Panel, ScreenLoading } from '@/components/system/ui'
import { WEEKDAYS } from '@/lib/constants'
import { dateKey, isQuestCleared, questsForDay, questXpReward, weekdayOf } from '@/lib/game'
import { useStore } from '@/lib/store'
import type { Quest } from '@/lib/types'
import { cn } from '@/lib/utils'

function QuestCard({
  quest,
  xp,
  cleared,
  onDelete,
}: {
  quest: Quest
  xp: number
  cleared: boolean
  onDelete: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  return (
    <Panel bodyClassName="flex items-stretch gap-3 p-0">
      <Link href={`/workout/${quest.id}`} className="flex min-w-0 flex-1 flex-col gap-3 p-4 hover:bg-secondary/50">
        <div className="flex items-start justify-between gap-3">
          <h3 className="truncate font-display text-lg font-bold uppercase tracking-wide">{quest.name}</h3>
          <span
            className={cn(
              'shrink-0 border px-2 py-0.5 font-display text-xs font-semibold uppercase tracking-wider',
              cleared ? 'border-foreground text-foreground' : 'border-border text-muted-foreground',
            )}
          >
            {cleared ? 'Cleared' : 'Pending'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="tabular-nums">
            {quest.exercises.length} {quest.exercises.length === 1 ? 'exercise' : 'exercises'}
          </span>
          <span>
            <span className="font-display font-bold tabular-nums text-primary">+{xp}</span> EXP
          </span>
        </div>
        <div className="flex gap-1" aria-label="Repeats on">
          {WEEKDAYS.map((d, i) => (
            <span
              key={d}
              className={cn(
                'w-8 border py-0.5 text-center text-[10px] font-medium uppercase',
                quest.weekdays.includes(i) ? 'border-foreground/60 text-foreground' : 'border-border text-muted-foreground/50',
              )}
            >
              {d.slice(0, 2)}
            </span>
          ))}
        </div>
      </Link>
      <div className="flex items-center border-l border-border px-2">
        {confirming ? (
          <Button variant="danger" size="sm" onClick={onDelete} onBlur={() => setConfirming(false)} autoFocus>
            Delete
          </Button>
        ) : (
          <Button variant="ghost" size="icon" aria-label={`Delete ${quest.name}`} onClick={() => setConfirming(true)}>
            <Trash2 />
          </Button>
        )}
      </div>
    </Panel>
  )
}

export function QuestsScreen() {
  const { state, actions } = useStore()
  if (!state) return <ScreenLoading />

  const today = dateKey()
  const isRest = state.restDays.includes(today)
  const todays = questsForDay(state.quests, today)
  const others = state.quests.filter((q) => !todays.includes(q))

  const renderCard = (q: Quest) => (
    <li key={q.id}>
      <QuestCard
        quest={q}
        xp={questXpReward(q, state.exercises)}
        cleared={isQuestCleared(state.sessions, q.id, today)}
        onDelete={() => actions.deleteQuest(q.id)}
      />
    </li>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        label={isRest ? 'Rest day registered' : 'Daily quest has arrived'}
        title="Quests"
        action={
          <Link href="/quests/new" className={buttonClass('primary', 'sm')}>
            <Plus aria-hidden />
            New
          </Link>
        }
      />

      <button
        type="button"
        aria-pressed={isRest}
        onClick={() => actions.toggleRestDay(today)}
        className="flex min-h-16 items-center justify-between gap-4 border border-border bg-card px-4 py-3 text-left hover:bg-secondary/50"
      >
        <span>
          <span className="block font-display text-sm font-semibold uppercase tracking-wider">Rest day</span>
          <span className="block text-sm text-muted-foreground">Recover today and keep your streak.</span>
        </span>
        <span className="flex h-7 w-12 shrink-0 items-center border border-border p-0.5" aria-hidden>
          <span className={cn('h-full w-1/2 transition-transform', isRest ? 'translate-x-full bg-foreground' : 'bg-muted-foreground/40')} />
        </span>
      </button>

      <section aria-labelledby="today-heading" className="flex flex-col gap-3">
        <h2 id="today-heading" className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Today · {WEEKDAYS[weekdayOf(today)]}
        </h2>
        {todays.length > 0 ? (
          <ul className="flex flex-col gap-3">{todays.map(renderCard)}</ul>
        ) : (
          <div className="border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No quests scheduled today.{' '}
            <Link href="/quests/new" className="text-foreground underline underline-offset-4">
              Create one
            </Link>
          </div>
        )}
      </section>

      {others.length > 0 && (
        <section aria-labelledby="other-heading" className="flex flex-col gap-3">
          <h2 id="other-heading" className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Other quests
          </h2>
          <ul className="flex flex-col gap-3">{others.map(renderCard)}</ul>
        </section>
      )}
    </div>
  )
}
