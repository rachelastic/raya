import { StatusBar } from '../PhoneFrame'
import { conclave } from '../../data/mock'

type IntroScreenProps = {
  onEnter: () => void
}

export function IntroScreen({ onEnter }: IntroScreenProps) {
  return (
    <div
      className="screen-enter relative flex h-full min-h-0 flex-col overflow-hidden"
      style={{
        background:
          'linear-gradient(165deg, #1f1c18 0%, #2a241c 42%, #3d3428 100%)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(196,176,138,0.2), transparent 40%), radial-gradient(circle at 80% 70%, rgba(92,101,80,0.25), transparent 45%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
      />

      <StatusBar light />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-7 pb-10 pt-6">
        <p
          className="fade-up text-[11px] font-medium tracking-[0.28em] uppercase"
          style={{ color: 'var(--brass-soft)' }}
        >
          Places
        </p>

        <div className="flex flex-1 flex-col justify-center">
          <p
            className="fade-up fade-up-delay-1 mb-4 text-[12px] font-medium tracking-[0.2em] uppercase"
            style={{ color: 'rgba(250,249,246,0.45)' }}
          >
            A private circle
          </p>

          <h1
            className="fade-up fade-up-delay-2 max-w-[16ch] text-[2.65rem] font-medium leading-[1.05] tracking-[-0.02em]"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--surface-raised)',
            }}
          >
            You’ve been placed in a Conclave
          </h1>

          <p
            className="fade-up fade-up-delay-3 mt-5 max-w-[28ch] text-[15px] font-light leading-relaxed"
            style={{ color: 'rgba(250,249,246,0.62)' }}
          >
            A small circle of members who share your taste for{' '}
            <span style={{ color: 'var(--brass-soft)' }}>
              {conclave.tasteLine}
            </span>
            .
          </p>

          <div
            className="fade-up fade-up-delay-4 mt-10 border-t pt-6"
            style={{ borderColor: 'rgba(196,176,138,0.25)' }}
          >
            <p
              className="text-[11px] tracking-[0.18em] uppercase"
              style={{ color: 'rgba(250,249,246,0.4)' }}
            >
              Your Conclave
            </p>
            <p
              className="mt-2 text-[1.65rem] font-medium italic leading-snug"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--surface-raised)',
              }}
            >
              {conclave.name}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onEnter}
          className="fade-up fade-up-delay-4 brass-pulse w-full rounded-full py-4 text-[14px] font-medium tracking-[0.04em] transition active:scale-[0.98]"
          style={{
            background: 'var(--surface-raised)',
            color: 'var(--ink)',
          }}
        >
          Enter
        </button>
      </div>
    </div>
  )
}
