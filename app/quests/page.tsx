import type { Metadata } from 'next'
import { QuestsScreen } from '@/components/screens/quests-screen'

export const metadata: Metadata = { title: 'Quests — SYSTEM' }

export default function Page() {
  return <QuestsScreen />
}
