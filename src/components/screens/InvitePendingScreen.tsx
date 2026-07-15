import { useState } from 'react'
import { StatusBar } from '../PhoneFrame'
import { Avatar } from '../Avatar'
import { curator, type InviteDraft } from '../../data/mock'

type InvitePendingScreenProps = {
  invite: InviteDraft
  onDone: () => void
}

export function InvitePendingScreen({
  invite,
  onDone,
}: InvitePendingScreenProps) {
  const [status, setStatus] = useState<'pending' | 'approved'>('pending')

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
          {status === 'pending' ? 'Awaiting curator' : 'Curator approved'}
        </p>

        <h1
          className="fade-up fade-up-delay-1 mt-3 text-center text-[2.2rem] font-medium leading-[1.05]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {status === 'pending'
            ? 'Invite sent to Isabelle'
            : `${invite.name || 'They'} may join`}
        </h1>

        <p
          className="fade-up fade-up-delay-2 mx-auto mt-3 max-w-[30ch] text-center text-[14px] font-light leading-relaxed"
          style={{ color: 'var(--ink-muted)' }}
        >
          {status === 'pending'
            ? `${curator.name} will review their Places profile before deciding`
            : `${curator.name} approved after reviewing their Places profile`}
        </p>

        <div
          className="fade-up fade-up-delay-2 mt-8 overflow-hidden rounded-2xl"
          style={{
            background: 'var(--surface-raised)',
            boxShadow: '0 0 0 1px var(--line)',
          }}
        >
          <div className="px-5 py-5">
            <div className="flex items-center gap-3">
              <Avatar member={curator} size="md" />
              <div className="min-w-0">
                <p
                  className="text-[16px] font-medium"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {curator.name}
                </p>
                <p
                  className="text-[11px] tracking-[0.12em] uppercase"
                  style={{
                    color:
                      status === 'pending' ? 'var(--brass)' : 'var(--olive)',
                  }}
                >
                  {status === 'pending'
                    ? 'Reviewing Places profile'
                    : 'Approved'}
                </p>
              </div>
            </div>

            <div
              className="mt-5 space-y-4 pt-5"
              style={{ borderTop: '1px solid var(--line)' }}
            >
              <div>
                <p
                  className="text-[10px] font-medium tracking-[0.14em] uppercase"
                  style={{ color: 'var(--ink-muted)' }}
                >
                  Places profile
                </p>
                <div className="mt-2.5 flex items-center gap-3">
                  <Avatar
                    member={{
                      id: invite.memberId || 'invitee',
                      name: invite.name || 'Guest',
                      initials: invite.initials || '?',
                      color: invite.color || '#5c6550',
                    }}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-[1.25rem] font-medium leading-tight"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {invite.name || 'Guest'}
                    </p>
                    <p
                      className="mt-0.5 text-[12px]"
                      style={{ color: 'var(--ink-muted)' }}
                    >
                      {invite.city ? `${invite.city} · ` : ''}On Places
                    </p>
                  </div>
                </div>
                <p
                  className="mt-3 text-[12px] font-light"
                  style={{ color: 'var(--brass)' }}
                >
                  Available for Curator review
                </p>
              </div>

              {invite.howYouKnow && (
                <div>
                  <p
                    className="text-[10px] font-medium tracking-[0.14em] uppercase"
                    style={{ color: 'var(--ink-muted)' }}
                  >
                    How you know them
                  </p>
                  <p
                    className="mt-1 text-[14px] font-light leading-relaxed"
                    style={{ color: 'var(--ink-soft)' }}
                  >
                    {invite.howYouKnow}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {status === 'pending' && (
          <button
            type="button"
            onClick={() => setStatus('approved')}
            className="fade-up fade-up-delay-3 mt-6 text-center text-[12px] font-medium"
            style={{ color: 'var(--ink-muted)' }}
          >
            Preview Curator approval
          </button>
        )}

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
