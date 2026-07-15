import { useMemo, useState } from 'react'
import { PhoneFrame } from './components/PhoneFrame'
import { ConclaveReveal } from './components/ConclaveReveal'
import { HomeScreen } from './components/screens/HomeScreen'
import { InviteMembersScreen } from './components/screens/InviteMembersScreen'
import { InvitePendingScreen } from './components/screens/InvitePendingScreen'
import { defaultInvite, type InviteDraft } from './data/mock'
import { CURRENT_USER_ID, MOCK_MEMBERS } from './data/members'
import { maxGroupSize, placeInConclave } from './data/conclaveMatching'

type Screen = 'intro' | 'home' | 'invite' | 'invitePending'

export default function App() {
  const [screen, setScreen] = useState<Screen>('intro')
  const [screenKey, setScreenKey] = useState(0)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [invite, setInvite] = useState<InviteDraft>(defaultInvite)

  // Generate + match once at the App level — single source for reveal + home
  const placement = useMemo(
    () => placeInConclave(MOCK_MEMBERS, CURRENT_USER_ID),
    [],
  )

  const matchedMembers = placement.placed
    ? placement.conclave.slice(0, maxGroupSize)
    : [placement.viewer]

  const clusterName = placement.clusterName ?? 'Wine Connoisseur'

  function go(next: Screen) {
    setScreen(next)
    setScreenKey((k) => k + 1)
  }

  function toggleSave(id: string) {
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <PhoneFrame>
      <div key={screenKey} className="flex h-full min-h-0 flex-col">
        {screen === 'intro' && (
          <ConclaveReveal
            placement={placement}
            onEnter={() => go('home')}
          />
        )}

        {screen === 'home' && (
          <HomeScreen
            savedIds={savedIds}
            onToggleSave={toggleSave}
            members={matchedMembers}
            clusterName={clusterName}
            viewerId={CURRENT_USER_ID}
            onInvite={() => {
              setInvite(defaultInvite)
              go('invite')
            }}
          />
        )}

        {screen === 'invite' && (
          <InviteMembersScreen
            draft={invite}
            onDraftChange={setInvite}
            onBack={() => go('home')}
            onSubmitted={() => go('invitePending')}
          />
        )}

        {screen === 'invitePending' && (
          <InvitePendingScreen
            invite={invite}
            onDone={() => go('home')}
          />
        )}
      </div>
    </PhoneFrame>
  )
}
