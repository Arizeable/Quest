import type { Category, Exercise, ExerciseType } from './types'

export const STORAGE_KEY = 'system-hunter-v1'

export const CATEGORIES: Category[] = ['Push', 'Pull', 'Legs', 'Core', 'Cardio']

export const EXERCISE_TYPES: { value: ExerciseType; label: string }[] = [
  { value: 'weight', label: 'Weight x Reps' },
  { value: 'reps', label: 'Reps only' },
  { value: 'time', label: 'Time' },
]

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const XP_PER_VOLUME = 0.1
export const BODYWEIGHT_BASE = 50
export const XP_PER_SECOND = 0.5
export const DAILY_XP_CAP = 1500

export const LEVEL_BASE_XP = 100
export const LEVEL_GROWTH = 1.5

export const RANKS = [
  { rank: 'S', minLevel: 75 },
  { rank: 'A', minLevel: 50 },
  { rank: 'B', minLevel: 35 },
  { rank: 'C', minLevel: 20 },
  { rank: 'D', minLevel: 10 },
  { rank: 'E', minLevel: 1 },
]

export const STAT_BASE = 10
export const STAT_SETS_PER_POINT = 5

export const WEIGHT_STEP = 2.5
export const TIME_STEP = 5
export const REST_PRESETS = [60, 90, 120]

export const FREE_LOG_QUEST_ID = 'free-log'

export const DEFAULT_PLAN: Record<ExerciseType, { sets: number; reps: number; weight: number }> = {
  weight: { sets: 3, reps: 10, weight: 20 },
  reps: { sets: 3, reps: 12, weight: 0 },
  time: { sets: 3, reps: 30, weight: 0 },
}

export const SEED_EXERCISES: Exercise[] = [
  { id: 'seed-bench', name: 'Bench Press', category: 'Push', type: 'weight' },
  { id: 'seed-pushup', name: 'Push-up', category: 'Push', type: 'reps' },
  { id: 'seed-pullup', name: 'Pull-up', category: 'Pull', type: 'reps' },
  { id: 'seed-squat', name: 'Back Squat', category: 'Legs', type: 'weight' },
  { id: 'seed-plank', name: 'Plank', category: 'Core', type: 'time' },
  { id: 'seed-rope', name: 'Jump Rope', category: 'Cardio', type: 'time' },
]
