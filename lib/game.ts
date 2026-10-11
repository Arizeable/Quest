import {
  BODYWEIGHT_BASE,
  DAILY_XP_CAP,
  LEVEL_BASE_XP,
  LEVEL_GROWTH,
  RANKS,
  STAT_BASE,
  STAT_SETS_PER_POINT,
  XP_PER_SECOND,
  XP_PER_VOLUME,
} from './constants'
import type { Category, Exercise, ExerciseType, Quest, Session } from './types'

export function setXp(type: ExerciseType, reps: number, weight: number) {
  if (reps <= 0) return 0
  if (type === 'time') return Math.round(reps * XP_PER_SECOND)
  const load = type === 'weight' && weight > 0 ? weight : BODYWEIGHT_BASE
  return Math.round(reps * load * XP_PER_VOLUME)
}

export const setVolume = (type: ExerciseType, reps: number, weight: number) =>
  type === 'weight' ? reps * weight : 0

export const xpToNext = (level: number) => Math.round(LEVEL_BASE_XP * Math.pow(level, LEVEL_GROWTH))

export function getLevelInfo(totalXp: number) {
  let level = 1
  let remaining = totalXp
  while (remaining >= xpToNext(level)) {
    remaining -= xpToNext(level)
    level++
  }
  const needed = xpToNext(level)
  return { level, current: remaining, needed, progress: remaining / needed }
}

export const getRank = (level: number) => RANKS.find((r) => level >= r.minLevel)?.rank ?? 'E'

export const applyDailyCap = (rawXp: number, earnedToday: number) =>
  Math.max(0, Math.min(rawXp, DAILY_XP_CAP - earnedToday))

export function dateKey(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function parseKey(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const shiftDate = (key: string, days: number) => {
  const d = parseKey(key)
  d.setDate(d.getDate() + days)
  return dateKey(d)
}

export const weekdayOf = (key: string) => parseKey(key).getDay()

export function getStreak(sessions: Session[], restDays: string[], today = dateKey()) {
  const active = new Set([...restDays, ...sessions.map((s) => s.date)])
  let cursor = active.has(today) ? today : shiftDate(today, -1)
  let streak = 0
  while (active.has(cursor)) {
    streak++
    cursor = shiftDate(cursor, -1)
  }
  return streak
}

export const xpEarnedOn = (sessions: Session[], date: string) =>
  sessions.filter((s) => s.date === date).reduce((sum, s) => sum + s.xp, 0)

export const questsForDay = (quests: Quest[], date: string) =>
  quests.filter((q) => q.weekdays.includes(weekdayOf(date)))

export const isQuestCleared = (sessions: Session[], questId: string, date: string) =>
  sessions.some((s) => s.questId === questId && s.date === date)

export function questXpReward(quest: Quest, exercises: Exercise[]) {
  return quest.exercises.reduce((sum, qe) => {
    const ex = exercises.find((e) => e.id === qe.exerciseId)
    return ex ? sum + qe.sets * setXp(ex.type, qe.reps, qe.weight) : sum
  }, 0)
}

export const totalVolume = (sessions: Session[]) => sessions.reduce((sum, s) => sum + s.volume, 0)

export function lastSetsFor(sessions: Session[], exerciseId: string) {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const entry = sessions[i].exercises.find((e) => e.exerciseId === exerciseId)
    if (entry) return { date: sessions[i].date, sets: entry.sets }
  }
  return null
}

export function getStats(sessions: Session[], exercises: Exercise[]) {
  const sets: Record<Category, number> = { Push: 0, Pull: 0, Legs: 0, Core: 0, Cardio: 0 }
  for (const s of sessions) {
    for (const e of s.exercises) {
      const ex = exercises.find((x) => x.id === e.exerciseId)
      if (ex) sets[ex.category] += e.sets.length
    }
  }
  const stat = (n: number) => STAT_BASE + Math.floor(n / STAT_SETS_PER_POINT)
  return [
    { key: 'STR', label: 'Strength', source: 'Push + Pull', value: stat(sets.Push + sets.Pull) },
    { key: 'VIT', label: 'Vitality', source: 'Legs', value: stat(sets.Legs) },
    { key: 'AGI', label: 'Agility', source: 'Cardio', value: stat(sets.Cardio) },
    { key: 'END', label: 'Endurance', source: 'Core', value: stat(sets.Core) },
  ]
}
