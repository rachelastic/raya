export const TASTE_TAGS = [
  'natural wine',
  'late-night dining',
  'hidden gem hotels',
  'art & galleries',
  'wellness',
  'outdoor/adventure',
  'fine dining',
  'coffee culture',
] as const

export type TasteTag = (typeof TASTE_TAGS)[number]

export const CITIES = [
  'New York',
  'Los Angeles',
  'London',
  'Paris',
  'Mexico City',
] as const

export type City = (typeof CITIES)[number]

export type TasteMember = {
  id: string
  name: string
  lastName: string
  initials: string
  color: string
  city: City
  /** Weights 0–1 for each taste tag (missing keys = 0) */
  tastes: Partial<Record<TasteTag, number>>
}

/** Minimal shape for avatars / rows */
export type AvatarMember = Pick<TasteMember, 'id' | 'name' | 'initials' | 'color'>

const FIRST_NAMES = [
  'Mara', 'Julian', 'Elise', 'Tom', 'Sana', 'Nico', 'Claire', 'Adrian',
  'Lena', 'Omar', 'Priya', 'Hugo', 'Isla', 'Felix', 'Noor', 'Simone',
  'Andre', 'Vera', 'Noah', 'Camille', 'Diego', 'Astrid', 'Ravi', 'Ines',
  'Marcus', 'Yuna', 'Leo', 'Amelia', 'Kai', 'Sophie', 'Elias', 'Nadia',
  'Theo', 'Anika', 'Paul', 'Jun', 'Rosa', 'Mateo', 'Helena', 'Ibrahim',
  'Clara', 'Sebastian', 'Maya', 'Luca', 'Freya', 'Emile', 'Zara', 'Owen',
  'Iris', 'Daniel', 'Aya', 'Graham',
]

const LAST_NAMES = [
  'Kim', 'Rossi', 'Vance', 'Hale', 'Rahman', 'Laurent', 'Wu', 'Demir',
  'Okada', 'Bennett', 'Silva', 'Navarro', 'Fischer', 'Costa', 'Berg',
  'Ali', 'Nguyen', 'Park', 'Moreau', 'Hassan', 'Cho', 'Iyer', 'Sato',
  'Brennan', 'Dubois', 'Tanaka', 'Okonkwo', 'Meyer', 'Santos', 'Clarke',
]

const MIDDLE_INITIALS = 'BCDEFGHJKLMNPRSTVWXYZ'.split('')

const AVATAR_COLORS = [
  '#5c6550', '#7a5c4a', '#4a5568', '#6b5b73', '#5a6b5c', '#8a6b4a',
  '#4a5a6b', '#6b5548', '#556358', '#7a6458', '#5c4f63', '#48585a',
]

/** Deterministic PRNG so placement stays stable across reloads */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pickTags(rand: () => number, count: number): TasteTag[] {
  const pool = [...TASTE_TAGS]
  const picked: TasteTag[] = []
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(rand() * pool.length)
    picked.push(pool.splice(idx, 1)[0])
  }
  return picked
}

/**
 * Ensure initials are unique within a group.
 * Collision order: F+L → F + first two of last → F+middle+L → numbered.
 * Pass `reserved` to lock certain members’ initials (e.g. viewer → YO).
 */
export function ensureUniqueInitials(
  group: TasteMember[],
  reserved: Record<string, string> = {},
): TasteMember[] {
  const used = new Set<string>(Object.values(reserved))

  return group.map((member) => {
    if (reserved[member.id]) {
      return { ...member, initials: reserved[member.id] }
    }

    const first = member.name.trim() || 'X'
    const last = (member.lastName || 'X').trim()
    const candidates: string[] = [
      `${first[0]}${last[0]}`.toUpperCase(),
      `${first[0]}${last.slice(0, 2)}`.toUpperCase(),
      ...MIDDLE_INITIALS.map(
        (m) => `${first[0]}${m}${last[0]}`.toUpperCase(),
      ),
      `${first[0]}${last.slice(0, 3)}`.toUpperCase(),
    ]

    let initials = candidates.find((c) => c.length >= 2 && !used.has(c))
    if (!initials) {
      let n = 2
      do {
        initials = `${first[0]}${last[0]}${n}`.toUpperCase()
        n += 1
      } while (used.has(initials))
    }

    used.add(initials)
    return { ...member, initials }
  })
}

function buildMembers(): TasteMember[] {
  const rand = mulberry32(42)
  const drafts: TasteMember[] = []

  for (let i = 0; i < 52; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length]
    const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]
    const tagCount = 4 + Math.floor(rand() * 3)
    const tags = pickTags(rand, tagCount)
    const tastes: Partial<Record<TasteTag, number>> = {}

    tags.forEach((tag, ti) => {
      const base = ti === 0 ? 0.72 : ti === 1 ? 0.55 : 0.2
      tastes[tag] = Math.min(1, Math.round((base + rand() * 0.28) * 100) / 100)
    })

    drafts.push({
      id: `m-${String(i).padStart(3, '0')}`,
      name: first,
      lastName: last,
      initials: `${first[0]}${last[0]}`.toUpperCase(),
      color: AVATAR_COLORS[i % AVATAR_COLORS.length],
      city: CITIES[Math.floor(rand() * CITIES.length)],
      tastes,
    })
  }

  const pool = ensureUniqueInitials(drafts)

  const viewer = pool[7]
  viewer.id = 'viewer'
  viewer.name = 'You'
  viewer.lastName = 'Okada'
  viewer.city = 'New York'
  viewer.tastes = {
    'natural wine': 0.92,
    'late-night dining': 0.81,
    'fine dining': 0.48,
    'coffee culture': 0.36,
    wellness: 0.22,
  }

  const sparse = pool[48]
  sparse.id = 'viewer-sparse'
  sparse.name = 'You'
  sparse.lastName = 'Ellis'
  sparse.city = 'London'
  sparse.tastes = {
    wellness: 0.41,
  }

  return ensureUniqueInitials(pool, {
    viewer: 'YO',
    'viewer-sparse': 'YE',
  })
}

/** Generated once; shared by App → reveal + home (and meetup screens). */
export const MOCK_MEMBERS = buildMembers()

export const CURRENT_USER_ID = 'viewer'
export const SPARSE_USER_ID = 'viewer-sparse'
