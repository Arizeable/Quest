import type { Metadata } from 'next'
import { ExercisesScreen } from '@/components/screens/exercises-screen'

export const metadata: Metadata = { title: 'Exercises — SYSTEM' }

export default function Page() {
  return <ExercisesScreen />
}
