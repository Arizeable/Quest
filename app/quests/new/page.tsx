import type { Metadata } from 'next'
import { NewQuestScreen } from '@/components/screens/new-quest-screen'

export const metadata: Metadata = { title: 'New Quest — SYSTEM' }

export default function Page() {
  return <NewQuestScreen />
}
