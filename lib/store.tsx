'use client'

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { FREE_LOG_QUEST_ID, SEED_EXERCISES, STORAGE_KEY } from './constants'
import { applyDailyCap, dateKey, setVolume, setXp, xpEarnedOn } from './game'
import type { AppState, Exercise, Quest, Session, SetPlan } from './types'

const createDefaultState = (): AppState => ({
  hunterName: 'Hunter',
  xp: 0,
  exercises: SEED_EXERCISES,
  quests: [],
  sessions: [],
  restDays: [],
  nextWeight: {},
})

let cache: AppState | null = null
const listeners = new Set<() => void>()

function getSnapshot(): AppState {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    cache = raw ? { ...createDefaultState(), ...JSON.parse(raw) } : createDefaultState()
  } catch {
    cache = createDefaultState()
  }
  return cache as AppState
}

const getServerSnapshot = () => null

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return
    cache = null
    listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

function update(fn: (s: AppState) => AppState) {
  cache = fn(getSnapshot())
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
  listeners.forEach((l) => l())
}

const actions = {
  setHunterName: (name: string) =>
    update((s) => ({ ...s, hunterName: name.trim().slice(0, 24) || s.hunterName })),
  saveExercise: (ex: Exercise) =>
    update((s) => ({
      ...s,
      exercises: s.exercises.some((e) => e.id === ex.id)
        ? s.exercises.map((e) => (e.id === ex.id ? ex : e))
        : [...s.exercises, ex],
    })),
  deleteExercise: (id: string) =>
    update((s) => ({
      ...s,
      exercises: s.exercises.filter((e) => e.id !== id),
      quests: s.quests.map((q) => ({ ...q, exercises: q.exercises.filter((x) => x.exerciseId !== id) })),
    })),
  addQuest: (quest: Quest) => update((s) => ({ ...s, quests: [...s.quests, quest] })),
  deleteQuest: (id: string) => update((s) => ({ ...s, quests: s.quests.filter((q) => q.id !== id) })),
  toggleRestDay: (date: string) =>
    update((s) => ({
      ...s,
      restDays: s.restDays.includes(date) ? s.restDays.filter((d) => d !== date) : [...s.restDays, date],
    })),
  logExercise: (exercise: Exercise, plan: SetPlan) => {
    const s = getSnapshot()
    const sets = Math.min(50, Math.max(0, Math.floor(plan.sets)))
    const reps = Math.min(10000, Math.max(0, plan.reps))
    const weight = exercise.type === 'weight' ? Math.min(1000, Math.max(0, plan.weight)) : 0
    if (!sets || !reps) return 0
    const today = dateKey()
    const raw = sets * setXp(exercise.type, reps, weight)
    const xp = applyDailyCap(raw, xpEarnedOn(s.sessions, today))
    const session: Session = {
      id: crypto.randomUUID(),
      questId: FREE_LOG_QUEST_ID,
      date: today,
      xp,
      volume: sets * setVolume(exercise.type, reps, weight),
      exercises: [{ exerciseId: exercise.id, sets: Array.from({ length: sets }, () => ({ reps, weight })) }],
    }
    update((st) => ({ ...st, xp: st.xp + xp, sessions: [...st.sessions, session] }))
    return xp
  },
  completeSession: (session: Session, increases: Record<string, number>) =>
    update((s) => {
      const nextWeight = { ...s.nextWeight }
      for (const e of session.exercises) delete nextWeight[e.exerciseId]
      return {
        ...s,
        xp: s.xp + session.xp,
        sessions: [...s.sessions, session],
        nextWeight: { ...nextWeight, ...increases },
      }
    }),
}

type StoreValue = { state: AppState | null; actions: typeof actions }

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const value = useMemo(() => ({ state, actions }), [state])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
