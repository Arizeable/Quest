'use client'

import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { PageHeader, Panel, ScreenLoading, XpBar } from '@/components/system/ui'
import { DAILY_XP_CAP } from '@/lib/constants'
import {
  dateKey,
  getLevelInfo,
  getRank,
  getStats,
  getStreak,
  isQuestCleared,
  questsForDay,
  totalVolume,
  xpEarnedOn,
} from '@/lib/game'
import { useStore } from '@/lib/store'

function HunterName({ name, onSave }: { name: string; onSave: (n: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)

  if (editing) {
    const commit = () => {
      onSave(draft)
      setEditing(false)
    }
    return (
      <input
        autoFocus
        aria-label="Hunter name"
        value={draft}
        maxLength={24}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) commit()
          if (e.key === 'Escape') setEditing(false)
        }}
        className="h-12 w-full border border-foreground/60 bg-background px-3 font-display text-2xl font-bold uppercase tracking-wide outline-none"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(name)
        setEditing(true)
      }}
      className="group flex h-12 w-full items-center gap-3 text-left"
    >
      <span className="truncate font-display text-2xl font-bold uppercase tracking-wide">{name}</span>
      <Pencil className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden />
      <span className="sr-only">Edit name</span>
    </button>
  )
}

function Tile({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold tabular-nums">
        {value}
        {unit && <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span>}
      </p>
    </div>
  )
}

export function StatusScreen() {
  const { state, actions } = useStore()
  if (!state) return <ScreenLoading />

  const today = dateKey()
  const info = getLevelInfo(state.xp)
  const todays = questsForDay(state.quests, today)
  const cleared = todays.filter((q) => isQuestCleared(state.sessions, q.id, today)).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader label="Status window" title="Status" />

      <Panel label="Hunter">
        <HunterName name={state.hunterName} onSave={actions.setHunterName} />
        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Level</p>
            <p className="font-display text-6xl font-bold leading-none tabular-nums text-primary">{info.level}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Rank</p>
            <p className="font-display text-5xl font-bold leading-none">{getRank(info.level)}</p>
          </div>
        </div>
        <div className="mt-6">
          <div className="mb-2 flex justify-between text-xs text-muted-foreground tabular-nums">
            <span className="font-medium uppercase tracking-wider">EXP</span>
            <span>
              {info.current.toLocaleString()} / {info.needed.toLocaleString()}
            </span>
          </div>
          <XpBar progress={info.progress} />
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-3">
        <Tile label="Streak" value={getStreak(state.sessions, state.restDays, today)} unit="days" />
        <Tile label="Quests today" value={`${cleared}/${todays.length}`} />
        <Tile label="Total volume" value={totalVolume(state.sessions).toLocaleString()} unit="kg" />
        <Tile label="EXP today" value={xpEarnedOn(state.sessions, today)} unit={`/ ${DAILY_XP_CAP}`} />
      </div>

      <Panel label="Stats" bodyClassName="p-0">
        <ul className="divide-y divide-border">
          {getStats(state.sessions, state.exercises).map((s) => (
            <li key={s.key} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex items-baseline gap-3">
                <span className="w-10 font-display text-lg font-bold">{s.key}</span>
                <span className="text-sm text-muted-foreground">
                  {s.label} <span className="text-xs">· {s.source}</span>
                </span>
              </div>
              <span className="font-display text-xl font-bold tabular-nums">{s.value}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
