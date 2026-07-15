import { useState } from 'react'
import { StatusBar } from '../PhoneFrame'
import { Avatar, AvatarRow } from '../Avatar'
import {
  conclave,
  curator,
  curatorThread,
  exclusiveAccess,
  feedForConclave,
  type PlaceItem,
} from '../../data/mock'
import type { TasteMember } from '../../data/members'

type HomeScreenProps = {
  savedIds: Set<string>
  onToggleSave: (id: string) => void
  onPropose: (placeName: string) => void
  members: TasteMember[]
  clusterName: string
  viewerId: string
}

function IconClock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M12 7.5V12l3 2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconMessage() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5.75 6.75h12.5A1.75 1.75 0 0 1 20 8.5v7a1.75 1.75 0 0 1-1.75 1.75H9.1L5.75 20V8.5a1.75 1.75 0 0 1 1.75-1.75"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconGift() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="4.5"
        y="10"
        width="15"
        height="9.5"
        rx="1.25"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M4.5 13.5h15M12 10v9.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M12 10c-1.8-2.8-4.7-3-5.5-1.4C5.5 10.3 7.2 11.8 12 10Zm0 0c1.8-2.8 4.7-3 5.5-1.4.9 1.7-.8 3.2-5.5 1.4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
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
        boxShadow: '0 0 0 1px var(--brass-soft)',
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
      className="flex h-full w-[248px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl"
      style={{
        background: 'var(--surface-raised)',
        boxShadow: '0 0 0 1px var(--line)',
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={place.image}
          alt={place.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3">
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
          className="mt-2 truncate text-[1.15rem] font-medium leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {place.name}
        </h3>
        <p
          className="mt-0.5 text-[11px]"
          style={{ color: 'var(--ink-muted)' }}
        >
          {place.neighborhood}
        </p>
        <p
          className="mt-2 line-clamp-2 flex-1 text-[12px] font-light leading-snug"
          style={{ color: 'var(--ink-soft)' }}
        >
          {place.note}
        </p>
        <div className="mt-3">
          <SaveButton saved={saved} onClick={onToggleSave} />
        </div>
      </div>
    </article>
  )
}

function SharedCarousel({
  places,
  byId,
  savedIds,
  onToggleSave,
}: {
  places: PlaceItem[]
  byId: Map<string, TasteMember>
  savedIds: Set<string>
  onToggleSave: (id: string) => void
}) {
  if (places.length === 0) return null

  return (
    <div
      className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-1"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {places.map((place) => (
        <FeedCard
          key={place.id}
          place={place}
          member={place.savedById ? byId.get(place.savedById) : undefined}
          saved={savedIds.has(place.id)}
          onToggleSave={() => onToggleSave(place.id)}
        />
      ))}
    </div>
  )
}

function ExclusiveSection({
  onOpenCurator,
  offerSaved,
  onToggleOffer,
  holdRequested,
  onRequestHold,
}: {
  onOpenCurator: () => void
  offerSaved: boolean
  onToggleOffer: () => void
  holdRequested: boolean
  onRequestHold: () => void
}) {
  const { reservation, offer } = exclusiveAccess

  return (
    <section className="mt-10">
      <h2
        className="mb-5 text-[11px] font-medium tracking-[0.18em] uppercase"
        style={{ color: 'var(--ink-muted)' }}
      >
        Exclusive to your Circle
      </h2>

      <div className="flex flex-col gap-5">
        <article
          className="rounded-2xl px-4 py-5"
          style={{
            background: 'var(--surface-raised)',
            boxShadow: '0 0 0 1px var(--line)',
          }}
        >
          <div
            className="mb-3.5 flex h-8 w-8 items-center justify-center rounded-full"
            style={{
              color: 'var(--ink-soft)',
              background: 'var(--surface-sunken)',
            }}
          >
            <IconClock />
          </div>
          <h3
            className="text-[1.25rem] font-medium leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Priority hold
          </h3>
          <p
            className="mt-2 text-[13px] font-light leading-relaxed"
            style={{ color: 'var(--ink-soft)' }}
          >
            {reservation.venue} — {reservation.detail}
          </p>
          <button
            type="button"
            onClick={onRequestHold}
            className="mt-5 rounded-full px-4 py-2 text-[12px] font-medium transition active:scale-[0.97]"
            style={{
              background: holdRequested ? 'var(--olive)' : 'var(--ink)',
              color: 'var(--surface-raised)',
            }}
          >
            {holdRequested ? 'Hold requested' : 'Request hold'}
          </button>
        </article>

        <article
          className="rounded-2xl px-4 py-5"
          style={{
            background: 'var(--surface-raised)',
            boxShadow: '0 0 0 1px var(--line)',
          }}
        >
          <div className="mb-3.5 flex items-center justify-between">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{
                color: 'var(--ink-soft)',
                background: 'var(--surface-sunken)',
              }}
            >
              <IconMessage />
            </div>
            <div className="flex items-center gap-2">
              <Avatar member={curator} size="sm" />
              <span
                className="text-[12px] font-medium"
                style={{ color: 'var(--ink-soft)' }}
              >
                {curator.name}
              </span>
            </div>
          </div>
          <h3
            className="text-[1.25rem] font-medium leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Message your Curator
          </h3>
          <button
            type="button"
            onClick={onOpenCurator}
            className="mt-4 w-full rounded-xl px-3.5 py-3.5 text-left text-[13px] font-light transition active:scale-[0.99]"
            style={{
              background: 'var(--surface-sunken)',
              color: 'var(--ink-muted)',
              boxShadow: '0 0 0 1px var(--line)',
            }}
          >
            Ask for a table, a recommendation, anything
          </button>
        </article>

        <article
          className="rounded-2xl px-4 py-5"
          style={{
            background: 'var(--surface-raised)',
            boxShadow: '0 0 0 1px var(--brass-soft)',
          }}
        >
          <div
            className="mb-3.5 flex h-8 w-8 items-center justify-center rounded-full"
            style={{
              color: 'var(--brass)',
              background: 'rgba(154,129,88,0.12)',
            }}
          >
            <IconGift />
          </div>
          <h3
            className="text-[1.25rem] font-medium leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {offer.title}
          </h3>
          <p
            className="mt-2 text-[13px] font-light leading-relaxed"
            style={{ color: 'var(--ink-soft)' }}
          >
            {offer.detail}
          </p>
          <div className="mt-5">
            <SaveButton saved={offerSaved} onClick={onToggleOffer} accent />
          </div>
        </article>
      </div>
    </section>
  )
}

function CuratorMessageThread({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="screen-enter absolute inset-0 z-20 flex flex-col"
      style={{ background: 'var(--surface)' }}
    >
      <StatusBar />
      <div
        className="flex items-center gap-3 px-5 pb-3 pt-1"
        style={{ borderBottom: '1px solid var(--line)' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="text-[13px] font-medium"
          style={{ color: 'var(--ink-muted)' }}
        >
          ← Back
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 pr-10">
          <Avatar member={curator} size="sm" />
          <div className="min-w-0 text-center">
            <p
              className="truncate text-[15px] font-medium"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {curator.name}
            </p>
            <p
              className="text-[10px] tracking-[0.14em] uppercase"
              style={{ color: 'var(--brass)' }}
            >
              Curator
            </p>
          </div>
        </div>
      </div>

      <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {curatorThread.map((msg) => {
          const mine = msg.from === 'you'
          return (
            <div
              key={msg.id}
              className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[78%] rounded-2xl px-3.5 py-2.5"
                style={{
                  background: mine ? 'var(--ink)' : 'var(--surface-raised)',
                  color: mine ? 'var(--surface-raised)' : 'var(--ink)',
                  boxShadow: mine ? undefined : '0 0 0 1px var(--line)',
                }}
              >
                <p className="text-[13.5px] font-light leading-relaxed">
                  {msg.text}
                </p>
                <p
                  className="mt-1 text-[10px]"
                  style={{
                    color: mine
                      ? 'rgba(250,249,246,0.45)'
                      : 'var(--ink-muted)',
                  }}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div
        className="px-5 pb-6 pt-3"
        style={{ borderTop: '1px solid var(--line)' }}
      >
        <div
          className="rounded-full px-4 py-3 text-[13px] font-light"
          style={{
            background: 'var(--surface-raised)',
            color: 'var(--ink-muted)',
            boxShadow: '0 0 0 1px var(--line)',
          }}
        >
          Write a message…
        </div>
      </div>
    </div>
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
  const [threadOpen, setThreadOpen] = useState(false)
  const [holdRequested, setHoldRequested] = useState(false)
  const offerId = exclusiveAccess.offer.id

  return (
    <div className="screen-enter relative flex h-full flex-col overflow-hidden">
      <StatusBar />

      <header className="shrink-0 px-5 pb-3 pt-1">
        <p
          className="text-[10px] font-medium tracking-[0.22em] uppercase"
          style={{ color: 'var(--ink-muted)' }}
        >
          Your Circle
        </p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h1
            className="whitespace-nowrap text-[1.55rem] font-medium leading-[1.15]"
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

        <ExclusiveSection
          onOpenCurator={() => setThreadOpen(true)}
          offerSaved={savedIds.has(offerId)}
          onToggleOffer={() => onToggleSave(offerId)}
          holdRequested={holdRequested}
          onRequestHold={() => setHoldRequested(true)}
        />

        <section className="mt-10">
          <h2
            className="mb-4 text-[11px] font-medium tracking-[0.18em] uppercase"
            style={{ color: 'var(--ink-muted)' }}
          >
            Recently
          </h2>
          <div className="-mx-5">
            <SharedCarousel
              places={feed}
              byId={byId}
              savedIds={savedIds}
              onToggleSave={onToggleSave}
            />
          </div>
        </section>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-6 pt-16"
        style={{
          background:
            'linear-gradient(to top, var(--surface) 55%, transparent)',
        }}
      >
        <button
          type="button"
          onClick={() => onPropose(conclave.curatorDrop.name)}
          className="pointer-events-auto w-full rounded-full py-4 text-[14px] font-medium tracking-[0.03em] transition active:scale-[0.98]"
          style={{
            background: 'var(--ink)',
            color: 'var(--surface-raised)',
          }}
        >
          Propose a meetup
        </button>
      </div>

      {threadOpen && (
        <CuratorMessageThread onClose={() => setThreadOpen(false)} />
      )}
    </div>
  )
}
