import { StatusBar } from '../PhoneFrame'
import { AvatarRow } from '../Avatar'
import type { MeetupDraft } from '../../data/mock'
import type { TasteMember } from '../../data/members'

type MeetupConfirmedScreenProps = {
  meetup: MeetupDraft
  onDone: () => void
  members: TasteMember[]
  viewerId: string
  /** IDs who confirmed (viewer + early RSVPs) */
  goingIds: Set<string>
}

export function MeetupConfirmedScreen({
  meetup,
  onDone,
  members,
  viewerId,
  goingIds,
}: MeetupConfirmedScreenProps) {
  const going = members.filter((m) => goingIds.has(m.id))

  return (
    <div className="screen-enter relative flex h-full flex-col overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #ebe7df 0%, var(--surface) 40%, #e4e0d6 100%)',
        }}
      />
      <StatusBar />

      <div className="relative z-10 flex flex-1 flex-col px-6 pb-8 pt-4">
        <p
          className="fade-up text-center text-[10px] font-medium tracking-[0.28em] uppercase"
          style={{ color: 'var(--brass)' }}
        >
          Quorum reached
        </p>

        <h1
          className="fade-up fade-up-delay-1 mt-3 text-center text-[2.35rem] font-medium leading-[1.05]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          You’re meeting
        </h1>

        <div
          className="fade-up fade-up-delay-2 mt-8 overflow-hidden rounded-2xl"
          style={{
            background: 'var(--surface-raised)',
            boxShadow:
              '0 0 0 1px var(--brass-soft), 0 16px 40px -20px rgba(154,129,88,0.4)',
          }}
        >
          <div
            className="relative h-36 overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, #c5c0b4 0%, #9a9488 35%, #7a756c 70%, #5c6550 100%)',
              backgroundSize: '200% 200%',
              animation: 'map-shimmer 8s ease-in-out infinite alternate',
            }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
                `,
                backgroundSize: '24px 24px',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full shadow-lg"
                style={{ background: 'var(--ink)' }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M8 1.5c-2.5 0-4.5 2-4.5 4.5 0 3.4 4.5 8.5 4.5 8.5s4.5-5.1 4.5-8.5c0-2.5-2-4.5-4.5-4.5Zm0 6.1a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2Z"
                    fill="var(--brass-soft)"
                  />
                </svg>
              </div>
            </div>
            <p
              className="absolute bottom-2.5 left-3 text-[10px] font-medium tracking-[0.12em] uppercase"
              style={{ color: 'rgba(250,249,246,0.7)' }}
            >
              Greenpoint · Map
            </p>
          </div>

          <div className="px-5 py-5">
            <h2
              className="text-[1.65rem] font-medium leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {meetup.place}
            </h2>
            <p
              className="mt-1.5 text-[14px]"
              style={{ color: 'var(--ink-soft)' }}
            >
              {meetup.date}
            </p>
            {meetup.note && (
              <p
                className="mt-3 text-[13px] font-light leading-relaxed"
                style={{ color: 'var(--ink-muted)' }}
              >
                {meetup.note}
              </p>
            )}
          </div>
        </div>

        <div className="fade-up fade-up-delay-3 mt-8">
          <p
            className="mb-3 text-center text-[11px] font-medium tracking-[0.16em] uppercase"
            style={{ color: 'var(--ink-muted)' }}
          >
            {going.length} going
          </p>
          <div className="flex justify-center">
            <AvatarRow members={going} size="lg" goingIds={goingIds} />
          </div>
          <p
            className="mt-4 text-center text-[13px] font-light"
            style={{ color: 'var(--ink-muted)' }}
          >
            {going
              .filter((m) => m.id !== viewerId)
              .map((m) => m.name)
              .join(', ')}{' '}
            & you
          </p>
        </div>

        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={onDone}
            className="w-full rounded-full py-4 text-[14px] font-medium tracking-[0.03em] transition active:scale-[0.98]"
            style={{
              background: 'var(--ink)',
              color: 'var(--surface-raised)',
            }}
          >
            Back to Circle
          </button>
        </div>
      </div>
    </div>
  )
}
