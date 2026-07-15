import { useState, type FormEvent } from 'react'
import { StatusBar } from '../PhoneFrame'
import { Avatar } from '../Avatar'
import { curator, type InviteDraft } from '../../data/mock'

type InviteMembersScreenProps = {
  draft: InviteDraft
  onDraftChange: (draft: InviteDraft) => void
  onBack: () => void
  onSubmitted: () => void
}

export function InviteMembersScreen({
  draft,
  onDraftChange,
  onBack,
  onSubmitted,
}: InviteMembersScreenProps) {
  const [sending, setSending] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSending(true)
    window.setTimeout(() => onSubmitted(), 480)
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
          Suggest someone who shares this taste. {curator.name} reviews every
          invite before they can join.
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
            <p
              className="text-[11px]"
              style={{ color: 'var(--brass)' }}
            >
              Curator approval required
            </p>
          </div>
        </div>

        <div className="fade-up fade-up-delay-3 mt-7 flex flex-col gap-5">
          <label className="block">
            <span
              className="mb-1.5 block text-[11px] font-medium tracking-[0.14em] uppercase"
              style={{ color: 'var(--ink-muted)' }}
            >
              Their name
            </span>
            <input
              type="text"
              value={draft.name}
              onChange={(e) =>
                onDraftChange({ ...draft, name: e.target.value })
              }
              placeholder="Who are you inviting?"
              className="w-full rounded-xl border-0 px-4 py-3.5 text-[15px] placeholder:opacity-40"
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

          <label className="block">
            <span
              className="mb-1.5 block text-[11px] font-medium tracking-[0.14em] uppercase"
              style={{ color: 'var(--ink-muted)' }}
            >
              Why they fit
            </span>
            <textarea
              value={draft.note}
              onChange={(e) =>
                onDraftChange({ ...draft, note: e.target.value })
              }
              rows={3}
              placeholder="A short note for Isabelle — taste, discretion, how they move through places…"
              className="w-full resize-none rounded-xl border-0 px-4 py-3.5 text-[15px] font-light leading-relaxed placeholder:opacity-40"
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
          Invites don’t open the Circle on their own. {curator.name} must
          approve before anyone is added.
        </p>

        <div className="mt-auto pt-6">
          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-full py-4 text-[14px] font-medium tracking-[0.03em] transition active:scale-[0.98] disabled:opacity-60"
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
