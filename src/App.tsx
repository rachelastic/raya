import { useMemo, useState } from 'react'
import { PhoneFrame } from './components/PhoneFrame'
import { ConclaveReveal } from './components/ConclaveReveal'
import { HomeScreen } from './components/screens/HomeScreen'
import { ProposeMeetupScreen } from './components/screens/ProposeMeetupScreen'
import { MeetupConfirmedScreen } from './components/screens/MeetupConfirmedScreen'
import { defaultMeetup, type MeetupDraft } from './data/mock'
import { CURRENT_USER_ID, MOCK_MEMBERS } from './data/members'
import { maxGroupSize, placeInConclave } from './data/conclaveMatching'

type Screen = 'intro' | 'home' | 'propose' | 'confirmed'

export default function App() {
  const [screen, setScreen] = useState<Screen>('intro')
  const [screenKey, setScreenKey] = useState(0)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [meetup, setMeetup] = useState<MeetupDraft>(defaultMeetup)

  // Generate + match once at the App level — single source for reveal + home
  const placement = useMemo(
    () => placeInConclave(MOCK_MEMBERS, CURRENT_USER_ID),
    [],
  )

  const matchedMembers = placement.placed
    ? placement.conclave.slice(0, maxGroupSize)
    : [placement.viewer]

  const clusterName =
    placement.clusterName ?? 'Wine Connoisseur'

  const goingIds = useMemo(() => {
    const others = matchedMembers
      .filter((m) => m.id !== CURRENT_USER_ID)
      .slice(0, 3)
      .map((m) => m.id)
    return new Set([CURRENT_USER_ID, ...others])
  }, [matchedMembers])

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
            onPropose={(placeName) => {
              setMeetup((m) => ({ ...m, place: placeName }))
              go('propose')
            }}
          />
        )}

        {screen === 'propose' && (
          <ProposeMeetupScreen
            draft={meetup}
            onDraftChange={setMeetup}
            onBack={() => go('home')}
            onQuorumReached={() => go('confirmed')}
            members={matchedMembers}
            viewerId={CURRENT_USER_ID}
          />
        )}

        {screen === 'confirmed' && (
          <MeetupConfirmedScreen
            meetup={meetup}
            onDone={() => go('home')}
            members={matchedMembers}
            viewerId={CURRENT_USER_ID}
            goingIds={goingIds}
          />
        )}
      </div>
    </PhoneFrame>
  )
}
