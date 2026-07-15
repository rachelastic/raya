import { useMemo, useState, type FormEvent } from 'react'
import { StatusBar } from '../PhoneFrame'
import { Avatar } from '../Avatar'
import { curator, type InviteDraft } from '../../data/mock'
import type { TasteMember } from '../../data/members'

type InviteMembersScreenProps = {
  draft: InviteDraft
  onDraftChange: (draft: InviteDraft) => void
  onBack: () => void
  onSubmitted: () => void
  /** Places members who can be invited (not already in this Circle) */
  candidates: TasteMember[]
}

export function InviteMembersScreen({
  draft,
  onDraftChange,
  onBack,
  onSubmitted,
  candidates,
}: InviteMembersScreenProps) {
  const [sending, setSending] = useState(false)
  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  const selected = draft.memberId
    ? {
        id: draft.memberId,
        name: draft.name,
        initials: draft.initials,
        color: draft.color,
        city: draft.city,
      }
    : null

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const pool = candidates.filter((m) => m.id !== draft.memberId)
    if (!q) return pool.slice(0, 5)
    return pool
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.lastName.toLowerCase().includes(q) ||
          m.city.toLowerCase().includes(q) ||
          `${m.name} ${m.lastName}`.toLowerCase().includes(q),
      )
      .slice(0, 6)
  }, [candidates, query, draft.memberId])

  function selectMember(m: TasteMember) {
    onDraftChange({
      ...draft,
      memberId: m.id,
      name: m.name,
      initials: m.initials,
      color: m.color,
      city: m.city,
    })
    setQuery('')
    setSearchFocused(false)
  }

  function clearMember() {
    onDraftChange({
      ...draft,
      memberId: '',
      name: '',
      initials: '',
      color: '#5c6550',
      city: '',
    })
    setSearchFocused(true)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!draft.memberId) return
    setSending(true)
    window.setTimeout(() => onSubmitted(), 480)
  }

  const showResults = searchFocused || query.trim().length > 0

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
        className="flex flex-1 flex-col overflow-hidden px-5 pb-8"
      >
        <p
          className="fade-up text-[10px] font-medium tracking-[0.22em] uppercase"
          style={{ color: 'var(--ink-muted)' }}
        >
          Invite new members
        </p>
        <h1
          className="fade-up fade-up-delay-1 mt-2 text-[2rem] font-medium leading-[1.1]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Grow the Circle carefully
        </h1>
        <p
          className="fade-up fade-up-delay-2 mt-2 max-w-[34ch] text-[14px] font-light leading-relaxed"
          style={{ color: 'var(--ink-muted)' }}
        >
          Add someone already on Places — {curator.name} will review their
          profile before they can join
        </p>

        <div
          className="fade-up fade-up-delay-2 mt-5 flex items-center gap-3 rounded-xl px-3.5 py-3"
          style={{
            background: 'var(--surface-raised)',
            boxShadow: '0 0 0 1px var(--line)',
          }}
        >
          <Avatar member={curator} size="sm" />
          <div className="min-w-0">
            <p
              className="text-[13px] font-medium"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {curator.name}
            </p>
            <p className="text-[11px]" style={{ color: 'var(--brass)' }}>
              Curator approval required
            </p>
          </div>
        </div>

        <div className="no-scrollbar fade-up fade-up-delay-3 mt-7 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-5">
            <div>
              <span
                className="mb-1.5 block text-[11px] font-medium tracking-[0.14em] uppercase"
                style={{ color: 'var(--ink-muted)' }}
              >
                Places member
              </span>

              {selected ? (
                <div
                  className="rounded-xl px-3.5 py-3.5"
                  style={{
                    background: 'var(--surface-raised)',
                    boxShadow: '0 0 0 1px var(--brass-soft)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      member={{
                        id: selected.id,
                        name: selected.name,
                        initials: selected.initials,
                        color: selected.color,
                      }}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-[15px] font-medium"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {selected.name}
                      </p>
                      <p
                        className="mt-0.5 text-[12px]"
                        style={{ color: 'var(--ink-muted)' }}
                      >
                        {selected.city} · On Places
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearMember}
                      className="shrink-0 text-[12px] font-medium"
                      style={{ color: 'var(--ink-muted)' }}
                    >
                      Change
                    </button>
                  </div>
                  <p
                    className="mt-3 text-[12px] font-light leading-relaxed"
                    style={{ color: 'var(--ink-muted)' }}
                  >
                    {curator.name} can open their Places profile when reviewing
                    this invite
                  </p>
                </div>
              ) : (
                <div>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    placeholder="Search Places members"
                    className="w-full rounded-xl border-0 px-4 py-3.5 text-[15px] placeholder:opacity-40"
                    style={{
                      background: 'var(--surface-raised)',
                      boxShadow: '0 0 0 1px var(--line)',
                      color: 'var(--ink)',
                    }}
                    autoComplete="off"
                  />
                  {showResults && (
                    <ul
                      className="mt-2 overflow-hidden rounded-xl"
                      style={{
                        background: 'var(--surface-raised)',
                        boxShadow: '0 0 0 1px var(--line)',
                      }}
                    >
                      {results.length === 0 ? (
                        <li
                          className="px-4 py-3.5 text-[13px] font-light"
                          style={{ color: 'var(--ink-muted)' }}
                        >
                          No Places members match that name
                        </li>
                      ) : (
                        results.map((m, i) => (
                          <li key={m.id}>
                            <button
                              type="button"
                              onClick={() => selectMember(m)}
                              className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition active:opacity-70"
                              style={{
                                borderTop:
                                  i === 0 ? undefined : '1px solid var(--line)',
                              }}
                            >
                              <Avatar member={m} size="sm" />
                              <div className="min-w-0 flex-1">
                                <p
                                  className="truncate text-[14px] font-medium"
                                  style={{ fontFamily: 'var(--font-display)' }}
                                >
                                  {m.name} {m.lastName}
                                </p>
                                <p
                                  className="text-[11px]"
                                  style={{ color: 'var(--ink-muted)' }}
                                >
                                  {m.city} · Places member
                                </p>
                              </div>
                              <span
                                className="shrink-0 text-[11px] font-medium"
                                style={{ color: 'var(--brass)' }}
                              >
                                Add
                              </span>
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                  <p
                    className="mt-2 text-[12px] font-light leading-relaxed"
                    style={{ color: 'var(--ink-muted)' }}
                  >
                    Choose an existing Places user so the Curator can view their
                    profile
                  </p>
                </div>
              )}
            </div>

            <label className="block">
              <span
                className="mb-1.5 block text-[11px] font-medium tracking-[0.14em] uppercase"
                style={{ color: 'var(--ink-muted)' }}
              >
                How you know them
              </span>
              <input
                type="text"
                value={draft.howYouKnow}
                onChange={(e) =>
                  onDraftChange({ ...draft, howYouKnow: e.target.value })
                }
                placeholder="Dinner last spring, vineyard travel…"
                className="w-full rounded-xl border-0 px-4 py-3.5 text-[15px] placeholder:opacity-40"
                style={{
                  background: 'var(--surface-raised)',
                  boxShadow: '0 0 0 1px var(--line)',
                  color: 'var(--ink)',
                }}
                required
              />
            </label>
          </div>

          <p
            className="mt-6 text-[12px] font-light leading-relaxed"
            style={{ color: 'var(--ink-muted)' }}
          >
            Invites don’t open the Circle on their own — {curator.name} must
            approve before anyone is added
          </p>
        </div>

        <div className="shrink-0 pt-4">
          <button
            type="submit"
            disabled={sending || !draft.memberId}
            className="w-full rounded-full py-4 text-[14px] font-medium tracking-[0.03em] transition active:scale-[0.98] disabled:opacity-40"
            style={{
              background: 'var(--ink)',
              color: 'var(--surface-raised)',
            }}
          >
            {sending ? 'Sending to Curator…' : 'Send for Curator approval'}
          </button>
        </div>
      </form>
    </div>
  )
}
