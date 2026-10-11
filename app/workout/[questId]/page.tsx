import type { Metadata } from 'next'
import { WorkoutScreen } from '@/components/workout/workout-screen'

export const metadata: Metadata = { title: 'Workout — SYSTEM' }

export default async function Page({ params }: { params: Promise<{ questId: string }> }) {
  const { questId } = await params
  return <WorkoutScreen questId={questId} />
}
