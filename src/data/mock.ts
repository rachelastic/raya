export type Member = {
  id: string
  name: string
  initials: string
  color: string
}

export type PlaceItem = {
  id: string
  name: string
  neighborhood: string
  image: string
  note: string
  savedBy?: string
  savedById?: string
  isCuratorDrop?: boolean
  curatorLabel?: string
}

export type Conclave = {
  id: string
  name: string
  tasteLine: string
  members: Member[]
  curatorDrop: PlaceItem
  feed: PlaceItem[]
}

export const currentUserId = 'you'

/** Curator attached to this Conclave (also author of Curator Drops) */
export const curator: Member = {
  id: 'curator',
  name: 'Isabelle',
  initials: 'IL',
  color: '#9a8158',
}

export type CuratorMessage = {
  id: string
  from: 'curator' | 'you'
  text: string
  time: string
}

export const curatorThread: CuratorMessage[] = [
  {
    id: 'cm-1',
    from: 'curator',
    text: 'If you’re going for the Jura list, Wednesdays after nine are quieter.',
    time: 'Mon',
  },
  {
    id: 'cm-2',
    from: 'you',
    text: 'Noted — any chance of a bar seat for Thursday?',
    time: 'Mon',
  },
  {
    id: 'cm-3',
    from: 'curator',
    text: 'I’ll put a soft hold. Message me once you’re sure.',
    time: 'Tue',
  },
]

export const exclusiveAccess = {
  reservation: {
    venue: 'Bar Brut',
    detail: 'priority window opens 48h before public booking',
  },
  offer: {
    id: 'offer-private-room',
    title: 'Private room, Thursdays only',
    detail: 'Curator-arranged, this month only',
  },
}

export const conclave: Conclave = {
  id: 'natural-wine',
  name: 'Wine Connoisseur',
  tasteLine: 'Wine Connoisseur',
  members: [
    { id: 'you', name: 'You', initials: 'YO', color: '#5c6550' },
    { id: 'mara', name: 'Mara', initials: 'MK', color: '#7a5c4a' },
    { id: 'julian', name: 'Julian', initials: 'JR', color: '#4a5568' },
    { id: 'elise', name: 'Elise', initials: 'EV', color: '#6b5b73' },
    { id: 'tom', name: 'Tom', initials: 'TH', color: '#5a6b5c' },
    { id: 'sana', name: 'Sana', initials: 'SR', color: '#8a6b4a' },
    { id: 'nico', name: 'Nico', initials: 'NL', color: '#4a5a6b' },
    { id: 'claire', name: 'Claire', initials: 'CW', color: '#6b5548' },
  ],
  curatorDrop: {
    id: 'curator-1',
    name: 'Bar Brut',
    neighborhood: 'Greenpoint',
    image:
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
    note: 'Ask for the cellar list — the Jura whites rarely make the chalkboard.',
    isCuratorDrop: true,
    curatorLabel: 'This week’s Curator Drop',
  },
  feed: [
    {
      id: 'feed-1',
      name: 'Le Crocodile',
      neighborhood: 'Williamsburg',
      image:
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
      note: 'The sole meunière at the bar — no reservation needed after 9.',
      savedBy: 'Mara',
      savedById: 'mara',
    },
    {
      id: 'feed-2',
      name: 'Four Horsemen',
      neighborhood: 'South Williamsburg',
      image:
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
      note: 'Came for wine, stayed for the cheese plate. Twice this month.',
      savedBy: 'Julian',
      savedById: 'julian',
    },
    {
      id: 'feed-3',
      name: 'Saturnia',
      neighborhood: 'East Village',
      image:
        'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80',
      note: 'Quiet enough for a real conversation. The orange wine flights are generous.',
      savedBy: 'Elise',
      savedById: 'elise',
    },
    {
      id: 'feed-4',
      name: 'Wildair',
      neighborhood: 'Lower East Side',
      image:
        'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80',
      note: 'Best seat is the corner by the kitchen. Order whatever’s being opened.',
      savedBy: 'Sana',
      savedById: 'sana',
    },
    {
      id: 'feed-5',
      name: 'Frenchette',
      neighborhood: 'Tribeca',
      image:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      note: 'Weeknight prix fixe if you can get in. Worth the walk afterward.',
      savedBy: 'Tom',
      savedById: 'tom',
    },
  ],
}

export type MeetupDraft = {
  place: string
  date: string
  note: string
}

export const defaultMeetup: MeetupDraft = {
  place: 'Bar Brut',
  date: 'Thursday, July 17 · 8:30 PM',
  note: 'Let’s start at the bar and see where the night goes.',
}

export const quorum = 4

/** Rebind feed “saved by” to the shared matched conclave (skip viewer). */
export function feedForConclave(
  members: Array<{ id: string; name: string }>,
  viewerId: string,
): PlaceItem[] {
  const savers = members.filter((m) => m.id !== viewerId)
  return conclave.feed.map((item, i) => {
    const saver = savers[i % Math.max(savers.length, 1)]
    if (!saver) return item
    return {
      ...item,
      savedBy: saver.name,
      savedById: saver.id,
    }
  })
}
