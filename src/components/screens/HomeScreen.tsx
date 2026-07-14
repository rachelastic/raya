import { StatusBar } from '../PhoneFrame'
import { Avatar, AvatarRow } from '../Avatar'
import {
  conclave,
  feedForConclave,
  type PlaceItem,
} from '../../data/mock'
import type { TasteMember } from '../../data/members'

type HomeScreenProps = {
  savedIds: Set<string>
  onToggleSave: (id: string) => void
  onPropose: (placeName: string) => void
  /** Shared matched conclave from App (same order as the reveal) */
  members: TasteMember[]
  clusterName: string
  viewerId: string
}

function SaveButton({
  saved,
  onClick,
  accent = false,
}: {
  saved: boolean
  onClick: () => void
  accent?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition active:scale-[0.97]"
      style={{
        background: saved
          ? accent
            ? 'var(--brass)'
            : 'var(--ink)'
          : accent
            ? 'rgba(154,129,88,0.12)'
            : 'var(--surface-sunken)',
        color: saved
          ? 'var(--surface-raised)'
          : accent
            ? 'var(--brass)'
            : 'var(--ink-soft)',
      }}
      aria-pressed={saved}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.4"
        aria-hidden
      >
        <path d="M3 1.5h6v9L6 8.5 3 10.5v-9Z" />
      </svg>
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}

function CuratorDropCard({
  place,
  saved,
  onToggleSave,
}: {
  place: PlaceItem
  saved: boolean
  onToggleSave: () => void
}) {
  return (
    <article
      className="overflow-hidden rounded-2xl"
      style={{
        background: 'var(--surface-raised)',
        boxShadow:
          '0 0 0 1px var(--brass-soft), 0 12px 32px -16px rgba(154,129,88,0.35)',
      }}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={place.image}
          alt={place.name}
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(26,23,20,0.55) 0%, transparent 50%)',
          }}
        />
        <span
          className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-medium tracking-[0.14em] uppercase"
          style={{
            background: 'rgba(26,23,20,0.72)',
            color: 'var(--brass-soft)',
            backdropFilter: 'blur(8px)',
          }}
        >
          Curator Drop
        </span>
      </div>
      <div className="px-4 pb-4 pt-3.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3
              className="text-[1.35rem] font-medium leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {place.name}
            </h3>
            <p
              className="mt-0.5 text-[12px]"
              style={{ color: 'var(--ink-muted)' }}
            >
              {place.neighborhood}
            </p>
          </div>
          <SaveButton saved={saved} onClick={onToggleSave} accent />
        </div>
        <p
          className="mt-3 text-[13.5px] font-light leading-relaxed"
          style={{ color: 'var(--ink-soft)' }}
        >
          <span
            className="mr-1 text-[11px] font-medium tracking-wide uppercase"
            style={{ color: 'var(--brass)' }}
          >
            Curator
          </span>
          {place.note}
        </p>
      </div>
    </article>
  )
}

function FeedCard({
  place,
  saved,
  onToggleSave,
  member,
}: {
  place: PlaceItem
  saved: boolean
  onToggleSave: () => void
  member?: TasteMember
}) {
  return (
    <article
      className="overflow-hidden rounded-xl"
      style={{
        background: 'var(--surface-raised)',
        boxShadow: '0 0 0 1px var(--line)',
      }}
    >
      <div className="flex gap-3 p-3">
        <img
          src={place.image}
          alt={place.name}
          className="h-[72px] w-[72px] shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {member && <Avatar member={member} size="sm" />}
            <p
              className="truncate text-[11px]"
              style={{ color: 'var(--ink-muted)' }}
            >
              <span className="font-medium" style={{ color: 'var(--ink-soft)' }}>
                {place.savedBy}
              </span>{' '}
              saved
            </p>
          </div>
          <h3
            className="mt-1 truncate text-[1.05rem] font-medium leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {place.name}
          </h3>
          <p
            className="mt-0.5 line-clamp-2 text-[12px] font-light leading-snug"
            style={{ color: 'var(--ink-soft)' }}
          >
            {place.note}
          </p>
        </div>
      </div>
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderTop: '1px solid var(--line)' }}
      >
        <p className="text-[11px]" style={{ color: 'var(--ink-muted)' }}>
          {place.neighborhood}
        </p>
        <SaveButton saved={saved} onClick={onToggleSave} />
      </div>
    </article>
  )
}

export function HomeScreen({
  savedIds,
  onToggleSave,
  onPropose,
  members,
  clusterName,
  viewerId,
}: HomeScreenProps) {
  const feed = feedForConclave(members, viewerId)
  const byId = new Map(members.map((m) => [m.id, m]))

  return (
    <div className="screen-enter relative flex h-full flex-col">
      <StatusBar />

      <header className="shrink-0 px-5 pb-3 pt-1">
        <p
          className="text-[10px] font-medium tracking-[0.22em] uppercase"
          style={{ color: 'var(--ink-muted)' }}
        >
          Your Conclave
        </p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h1
            className="max-w-[14ch] text-[1.55rem] font-medium leading-[1.15]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {clusterName}
          </h1>
          <AvatarRow members={members} size="sm" max={Math.min(6, members.length)} />
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-28">
        <section className="fade-up">
          <CuratorDropCard
            place={conclave.curatorDrop}
            saved={savedIds.has(conclave.curatorDrop.id)}
            onToggleSave={() => onToggleSave(conclave.curatorDrop.id)}
          />
        </section>

        <section className="mt-7">
          <div className="mb-3 flex items-baseline justify-between">
            <h2
              className="text-[11px] font-medium tracking-[0.18em] uppercase"
              style={{ color: 'var(--ink-muted)' }}
            >
              Shared recently
            </h2>
            <span
              className="text-[11px]"
              style={{ color: 'var(--ink-muted)' }}
            >
              {feed.length} places
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {feed.map((place, i) => (
              <div
                key={place.id}
                className="fade-up"
                style={{ animationDelay: `${80 + i * 60}ms` }}
              >
                <FeedCard
                  place={place}
                  member={place.savedById ? byId.get(place.savedById) : undefined}
                  saved={savedIds.has(place.id)}
                  onToggleSave={() => onToggleSave(place.id)}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-6 pt-16"
        style={{
          background:
            'linear-gradient(to top, var(--surface) 55%, transparent)',
        }}
      >
        <button
          type="button"
          onClick={() => onPropose(conclave.curatorDrop.name)}
          className="pointer-events-auto w-full rounded-full py-4 text-[14px] font-medium tracking-[0.03em] shadow-[0_12px_28px_-8px_rgba(26,23,20,0.45)] transition active:scale-[0.98]"
          style={{
            background: 'var(--ink)',
            color: 'var(--surface-raised)',
          }}
        >
          Propose a meetup
        </button>
      </div>
    </div>
  )
}
