import Link from 'next/link'
import { buttonClass, Panel, SystemLabel, XpBar } from '@/components/system/ui'
import { getLevelInfo, getRank } from '@/lib/game'

export interface FinishResult {
  rawXp: number
  xp: number
  volume: number
  levelBefore: number
  totalXp: number
}

export function FinishPanel({ result, questName }: { result: FinishResult; questName: string }) {
  const info = getLevelInfo(result.totalXp)
  const leveled = info.level > result.levelBefore
  const rankBefore = getRank(result.levelBefore)
  const rankAfter = getRank(info.level)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <SystemLabel>Quest cleared</SystemLabel>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">{questName}</h1>
      </div>

      <Panel label="Rewards" bodyClassName="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <p className="font-display text-5xl font-bold tabular-nums text-primary">
            +{result.xp}
            <span className="ml-2 text-lg text-muted-foreground">EXP</span>
          </p>
          <p className="text-right text-sm text-muted-foreground tabular-nums">{result.volume.toLocaleString()} kg volume</p>
        </div>
        {result.xp < result.rawXp && (
          <p className="border-l-2 border-border pl-3 text-sm text-muted-foreground">
            Daily EXP limit reached. {result.rawXp - result.xp} EXP was not counted.
          </p>
        )}
        <div>
          <div className="mb-2 flex justify-between text-xs text-muted-foreground tabular-nums">
            <span className="font-medium uppercase tracking-wider">Lv. {info.level}</span>
            <span>
              {info.current} / {info.needed}
            </span>
          </div>
          <XpBar progress={info.progress} />
        </div>
      </Panel>

      {leveled && (
        <div className="animate-level-up">
          <Panel bodyClassName="flex flex-col items-center gap-2 py-8 text-center">
            <SystemLabel>You have leveled up</SystemLabel>
            <p className="font-display text-5xl font-bold uppercase tracking-[0.15em]">Level up</p>
            <p className="font-display text-2xl font-semibold tabular-nums text-muted-foreground">
              {result.levelBefore} <span aria-hidden>{'->'}</span>
              <span className="sr-only">to</span> <span className="text-primary">{info.level}</span>
            </p>
            {rankAfter !== rankBefore && (
              <p className="mt-2 font-display text-sm font-semibold uppercase tracking-wider">
                Rank {rankBefore} {'->'} {rankAfter}
              </p>
            )}
          </Panel>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link href="/quests" className={buttonClass('outline')}>
          Quests
        </Link>
        <Link href="/" className={buttonClass('primary')}>
          Status
        </Link>
      </div>
    </div>
  )
}
