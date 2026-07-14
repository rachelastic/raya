import { useMemo, useState, type FormEvent } from 'react'
import { StatusBar } from '../PhoneFrame'
import { Avatar } from '../Avatar'
import { quorum, type MeetupDraft } from '../../data/mock'
import type { TasteMember } from '../../data/members'

type ProposeMeetupScreenProps = {
  draft: MeetupDraft
  onDraftChange: (draft: MeetupDraft) => void
  onBack: () => void
  onQuorumReached: () => void
  members: TasteMember[]
  viewerId: string
}

export function ProposeMeetupScreen({
  draft,
  onDraftChange,
  onBack,
  onQuorumReached,
  members,
  viewerId,
}: ProposeMeetupScreenProps) {
  const [submitted, setSubmitted] = useState(false)

  // First three non-viewer members start confirmed — mirrors prior mock RSVPs
  const initialRsvps = useMemo(() => {
    const others = members.filter((m) => m.id !== viewerId).slice(0, 3)
    return new Set(others.map((m) => m.id))
  }, [members, viewerId])

  const [rsvps, setRsvps] = useState<Set<string>>(initialRsvps)
  const confirmed = rsvps.size
  const youGoing = rsvps.has(viewerId)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  function toggleYourRsvp() {
    setRsvps((prev) => {
      const next = new Set(prev)
      if (next.has(viewerId)) next.delete(viewerId)
      else next.add(viewerId)

      if (next.size >= quorum) {
        window.setTimeout(() => onQuorumReached(), 650)
      }
      return next
    })
  }

  if (submitted) {
    return (
      <div className="screen-enter flex h-full flex-col">
        <StatusBar />
        <div className="flex items-center gap-3 px-5 pb-2 pt-1">
          <button
            type="button"
            onClick={onBack}
            className="text-[13px] font-medium"
            style={{ color: 'var(--ink-muted)' }}
          >
            ← Back
          </button>
        </div>

        <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto px-5 pb-8">
          <p
            className="fade-up text-[10px] font-medium tracking-[0.22em] uppercase"
            style={{ color: 'var(--brass)' }}
          >
            Proposed
          </p>
          <h1
            className="fade-up fade-up-delay-1 mt-2 text-[2rem] font-medium leading-[1.1]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {draft.place}
          </h1>
          <p
            className="fade-up fade-up-delay-2 mt-2 text-[14px]"
            style={{ color: 'var(--ink-soft)' }}
          >
            {draft.date}
          </p>
          {draft.note && (
            <p
              className="fade-up fade-up-delay-3 mt-4 text-[14px] font-light leading-relaxed"
              style={{ color: 'var(--ink-muted)' }}
            >
              “{draft.note}”
            </p>
          )}

          <div
            className="fade-up fade-up-delay-4 mt-8 rounded-2xl px-4 py-5"
            style={{
              background: 'var(--surface-raised)',
              boxShadow: '0 0 0 1px var(--line)',
            }}
          >
            <div className="flex items-baseline justify-between">
              <h2
                className="text-[1.25rem] font-medium"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                RSVPs
              </h2>
              <p
                className="text-[13px] font-medium tabular-nums"
                style={{ color: 'var(--brass)' }}
              >
                {confirmed} of {members.length} confirmed
              </p>
            </div>
            <p
              className="mt-1 text-[12px]"
              style={{ color: 'var(--ink-muted)' }}
            >
              Quorum at {quorum} — once reached, details lock in.
            </p>

            <ul className="mt-5 flex flex-col gap-3">
              {members.map((m) => {
                const going = rsvps.has(m.id)
                return (
                  <li key={m.id} className="flex items-center gap-3">
                    <Avatar member={m} size="md" dimmed={!going} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium">{m.name}</p>
                      <p
                        className="text-[11px]"
                        style={{
                          color: going ? 'var(--olive)' : 'var(--ink-muted)',
                        }}
                      >
                        {going ? 'Confirmed' : 'Pending'}
                      </p>
                    </div>
                    {m.id === viewerId && (
                      <button
                        type="button"
                        onClick={toggleYourRsvp}
                        className="rounded-full px-3.5 py-1.5 text-[12px] font-medium transition active:scale-[0.97]"
                        style={{
                          background: youGoing
                            ? 'var(--olive)'
                            : 'var(--surface-sunken)',
                          color: youGoing
                            ? 'var(--surface-raised)'
                            : 'var(--ink-soft)',
                        }}
                      >
                        {youGoing ? 'Going' : 'RSVP'}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="screen-enter flex h-full flex-col">
      <StatusBar />
      <div className="flex items-center gap-3 px-5 pb-2 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="text-[13px] font-medium"
          style={{ color: 'var(--ink-muted)' }}
        >
          ← Back
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col px-5 pb-8"
      >
        <p
          className="fade-up text-[10px] font-medium tracking-[0.22em] uppercase"
          style={{ color: 'var(--ink-muted)' }}
        >
          Propose a meetup
        </p>
        <h1
          className="fade-up fade-up-delay-1 mt-2 text-[2rem] font-medium leading-[1.1]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Gather the circle
        </h1>
        <p
          className="fade-up fade-up-delay-2 mt-2 max-w-[32ch] text-[14px] font-light leading-relaxed"
          style={{ color: 'var(--ink-muted)' }}
        >
          Suggest a place and time. Members confirm when they’re free — quorum
          locks the plan.
        </p>

        <div className="fade-up fade-up-delay-3 mt-8 flex flex-col gap-5">
          <label className="block">
            <span
              className="mb-1.5 block text-[11px] font-medium tracking-[0.14em] uppercase"
              style={{ color: 'var(--ink-muted)' }}
            >
              Place or theme
            </span>
            <input
              type="text"
              value={draft.place}
              onChange={(e) =>
                onDraftChange({ ...draft, place: e.target.value })
              }
              className="w-full rounded-xl border-0 px-4 py-3.5 text-[15px]"
              style={{
                background: 'var(--surface-raised)',
                boxShadow: '0 0 0 1px var(--line)',
                color: 'var(--ink)',
              }}
              required
            />
          </label>

          <label className="block">
            <span
              className="mb-1.5 block text-[11px] font-medium tracking-[0.14em] uppercase"
              style={{ color: 'var(--ink-muted)' }}
            >
              Date & time
            </span>
            <input
              type="text"
              value={draft.date}
              onChange={(e) =>
                onDraftChange({ ...draft, date: e.target.value })
              }
              className="w-full rounded-xl border-0 px-4 py-3.5 text-[15px]"
              style={{
                background: 'var(--surface-raised)',
                boxShadow: '0 0 0 1px var(--line)',
                color: 'var(--ink)',
              }}
              required
            />
          </label>

          <label className="block">
            <span
              className="mb-1.5 block text-[11px] font-medium tracking-[0.14em] uppercase"
              style={{ color: 'var(--ink-muted)' }}
            >
              Note
            </span>
            <textarea
              value={draft.note}
              onChange={(e) =>
                onDraftChange({ ...draft, note: e.target.value })
              }
              rows={3}
              className="w-full resize-none rounded-xl border-0 px-4 py-3.5 text-[15px] font-light leading-relaxed"
              style={{
                background: 'var(--surface-raised)',
                boxShadow: '0 0 0 1px var(--line)',
                color: 'var(--ink)',
              }}
            />
          </label>
        </div>

        <div className="mt-auto pt-8">
          <button
            type="submit"
            className="w-full rounded-full py-4 text-[14px] font-medium tracking-[0.03em] transition active:scale-[0.98]"
            style={{
              background: 'var(--ink)',
              color: 'var(--surface-raised)',
            }}
          >
            Send to Circle
          </button>
        </div>
      </form>
    </div>
  )
}
