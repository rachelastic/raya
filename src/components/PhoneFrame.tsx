import type { ReactNode } from 'react'

type PhoneFrameProps = {
  children: ReactNode
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-8">
      <div className="relative">
        <div
          className="pointer-events-none absolute -inset-8 rounded-[3rem] opacity-40 blur-3xl"
          style={{
            background:
              'radial-gradient(circle at 50% 30%, rgba(154,129,88,0.25), transparent 70%)',
          }}
        />
        <div
          className="relative overflow-hidden rounded-[2.4rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.06)]"
          style={{ width: 390, height: 844 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, var(--surface) 0%, #ebe7df 100%)',
            }}
          />
          <div className="absolute inset-0 flex flex-col overflow-hidden">
            {children}
          </div>
        </div>
        <p
          className="mt-5 text-center text-[11px] tracking-[0.22em] uppercase"
          style={{ color: 'rgba(243,241,236,0.35)', fontFamily: 'var(--font-body)' }}
        >
          Places · Conclaves
        </p>
      </div>
    </div>
  )
}

export function StatusBar({ light = false }: { light?: boolean }) {
  const color = light ? 'rgba(250,249,246,0.85)' : 'var(--ink)'

  return (
    <div
      className="flex h-11 shrink-0 items-end justify-between px-6 pb-1.5 text-[12px] font-medium"
      style={{ color }}
    >
      <span>9:41</span>
      <div className="flex items-center gap-1.5">
        <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor" aria-hidden>
          <rect x="0" y="3.5" width="3" height="7.5" rx="0.6" opacity="0.35" />
          <rect x="4" y="2" width="3" height="9" rx="0.6" opacity="0.55" />
          <rect x="8" y="0.5" width="3" height="10.5" rx="0.6" opacity="0.75" />
          <rect x="12" y="0" width="3" height="11" rx="0.6" />
        </svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor" aria-hidden>
          <path d="M7.5 3.2c1.9 0 3.6.7 4.9 1.9l1.1-1.1A8.4 8.4 0 0 0 7.5 1.5 8.4 8.4 0 0 0 1.5 4l1.1 1.1A6.9 6.9 0 0 1 7.5 3.2Zm0 2.5c1.2 0 2.3.4 3.2 1.2l1.1-1.1A6 6 0 0 0 7.5 4.2 6 6 0 0 0 3.2 5.8l1.1 1.1A4.4 4.4 0 0 1 7.5 5.7Zm0 2.5c.7 0 1.3.2 1.8.7L7.5 10.7 5.7 8.9c.5-.4 1.1-.7 1.8-.7Z" />
        </svg>
        <svg width="24" height="11" viewBox="0 0 24 11" fill="currentColor" aria-hidden>
          <rect x="0" y="0.5" width="20" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <rect x="1.5" y="2" width="15" height="7" rx="1" />
          <rect x="21" y="3.5" width="2" height="4" rx="0.5" opacity="0.4" />
        </svg>
      </div>
    </div>
  )
}
