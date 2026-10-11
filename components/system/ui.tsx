import { Minus, Plus } from 'lucide-react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

function Corners() {
  const base = 'pointer-events-none absolute size-2.5 border-foreground/70'
  return (
    <>
      <span aria-hidden className={cn(base, '-left-px -top-px border-l border-t')} />
      <span aria-hidden className={cn(base, '-right-px -top-px border-r border-t')} />
      <span aria-hidden className={cn(base, '-bottom-px -left-px border-b border-l')} />
      <span aria-hidden className={cn(base, '-bottom-px -right-px border-b border-r')} />
    </>
  )
}

export function Panel({
  label,
  action,
  children,
  className,
  bodyClassName,
}: {
  label?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={cn('relative border border-border bg-card', className)}>
      <Corners />
      {label && (
        <header className="flex min-h-11 items-center justify-between gap-2 border-b border-border px-4 py-2">
          <h2 className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </h2>
          {action}
        </header>
      )}
      <div className={cn('p-4', bodyClassName)}>{children}</div>
    </section>
  )
}

export function SystemLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-display text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
      <span className="text-foreground">[ SYSTEM ]</span> {children}
    </p>
  )
}

export function PageHeader({ label, title, action }: { label: string; title: string; action?: ReactNode }) {
  return (
    <header className="flex items-end justify-between gap-4">
      <div className="flex flex-col gap-2">
        <SystemLabel>{label}</SystemLabel>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">{title}</h1>
      </div>
      {action}
    </header>
  )
}

const variants = {
  primary: 'bg-foreground text-background hover:bg-foreground/90',
  outline: 'border border-border text-foreground hover:bg-secondary',
  ghost: 'text-muted-foreground hover:bg-secondary hover:text-foreground',
  danger: 'border border-destructive/60 text-destructive hover:bg-destructive/10',
}
const sizes = { md: 'h-12 px-5', sm: 'h-11 px-4', icon: 'size-11 shrink-0' }

export const buttonClass = (variant: keyof typeof variants = 'primary', size: keyof typeof sizes = 'md') =>
  cn(
    'inline-flex items-center justify-center gap-2 font-display text-sm font-semibold uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4',
    variants[variant],
    sizes[size],
  )

export function Button({
  variant,
  size,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants; size?: keyof typeof sizes }) {
  return <button type="button" className={cn(buttonClass(variant, size), className)} {...props} />
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-12 w-full border border-border bg-background px-3 text-base outline-none placeholder:text-muted-foreground focus:border-foreground/60',
        className,
      )}
      {...props}
    />
  )
}

export function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </label>
  )
}

export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex border border-border">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              'h-11 min-w-0 flex-1 border-r border-border px-1 text-xs font-medium last:border-r-0 sm:text-sm',
              value === o.value ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-secondary',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Stepper({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  unit,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
  unit?: string
}) {
  const set = (v: number) => onChange(Math.max(min, Math.round(v * 100) / 100))
  const btn =
    'flex w-12 shrink-0 items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground active:bg-secondary'
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex h-12 items-stretch border border-border bg-background">
        <button type="button" aria-label={`Decrease ${label}`} onClick={() => set(value - step)} className={cn(btn, 'border-r border-border')}>
          <Minus className="size-4" />
        </button>
        <label className="flex min-w-0 flex-1 items-center justify-center gap-1 px-1">
          <span className="sr-only">{label}</span>
          <input
            type="number"
            inputMode="decimal"
            value={value}
            onChange={(e) => {
              const n = Number(e.target.value)
              if (!Number.isNaN(n)) set(n)
            }}
            className="w-full min-w-0 bg-transparent text-center font-display text-lg font-semibold tabular-nums outline-none"
          />
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </label>
        <button type="button" aria-label={`Increase ${label}`} onClick={() => set(value + step)} className={cn(btn, 'border-l border-border')}>
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  )
}

export function XpBar({ progress, className }: { progress: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, progress * 100))
  return (
    <div
      role="progressbar"
      aria-label="Experience to next level"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={cn('h-2.5 w-full border border-border bg-background', className)}
    >
      <div className="animate-xp-fill h-full bg-primary transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function ScreenLoading() {
  return (
    <div className="py-20 text-center">
      <SystemLabel>Loading hunter data</SystemLabel>
    </div>
  )
}
