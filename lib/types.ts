export type Category = 'Push' | 'Pull' | 'Legs' | 'Core' | 'Cardio'
export type ExerciseType = 'weight' | 'reps' | 'time'

export interface Exercise {
  id: string
  name: string
  category: Category
  type: ExerciseType
  defaults?: SetPlan
}

export interface SetPlan {
  sets: number
  /** Reps, or seconds for time-based exercises. */
  reps: number
  weight: number
}

export interface QuestExercise {
  exerciseId: string
  sets: number
  /** Reps, or seconds for time-based exercises. */
  reps: number
  weight: number
}

export interface Quest {
  id: string
  name: string
  weekdays: number[]
  exercises: QuestExercise[]
}

export interface LoggedSet {
  reps: number
  weight: number
}

export interface Session {
  id: string
  questId: string
  date: string
  xp: number
  volume: number
  exercises: { exerciseId: string; sets: LoggedSet[] }[]
}

export interface AppState {
  hunterName: string
  xp: number
  exercises: Exercise[]
  quests: Quest[]
  sessions: Session[]
  restDays: string[]
  nextWeight: Record<string, number>
}
