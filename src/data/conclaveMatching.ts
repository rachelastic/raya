import {
  TASTE_TAGS,
  ensureUniqueInitials,
  type TasteMember,
  type TasteTag,
} from './members'

const MEANINGFUL_THRESHOLD = 0.35
const MIN_CONCLAVE = 6
const MAX_CONCLAVE = 10
const SAME_CITY_BOOST = 0.12

export type NicheStats = {
  /** Full generated member pool */
  totalMembers: number
  /** Members in the viewer’s coarse taste cluster */
  clusterSize: number
  /** Matched Conclave size (0 if unplaced) */
  conclaveSize: number
  /** Circle members who meet Curator-table standing gates */
  curatorTableSize: number
}

export type PlacementResult =
  | {
      placed: true
      clusterName: string
      clusterKey: string
      conclave: TasteMember[]
      /** Subset of conclave eligible for the Curator’s table (may be empty) */
      curatorTable: TasteMember[]
      viewer: TasteMember
    } & NicheStats
  | {
      placed: false
      clusterName: string | null
      viewer: TasteMember
      curatorTable: TasteMember[]
      reason: 'insufficient_taste'
    } & NicheStats


/**
 * Curator’s table eligibility — human-gated standing, not taste matching.
 * All gates required; curatorVerifiedStanding is independent of vouchs.
 */
export function qualifiesForCuratorTable(member: TasteMember): boolean {
  return (
    member.vouchCount >= 2 &&
    member.vouchedByHighStanding &&
    member.tier === 'elevated' &&
    member.curatorVerifiedStanding
  )
}

export function filterCuratorTable(members: TasteMember[]): TasteMember[] {
  return members.filter(qualifiesForCuratorTable)
}

function vector(member: TasteMember): number[] {
  return TASTE_TAGS.map((tag) => member.tastes[tag] ?? 0)
}

export function cosineSimilarity(a: TasteMember, b: TasteMember): number {
  const va = vector(a)
  const vb = vector(b)
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < va.length; i++) {
    dot += va[i] * vb[i]
    na += va[i] * va[i]
    nb += vb[i] * vb[i]
  }
  if (na === 0 || nb === 0) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

/** Tags above threshold, highest weight first */
export function meaningfulTags(member: TasteMember): TasteTag[] {
  return TASTE_TAGS.filter((t) => (member.tastes[t] ?? 0) >= MEANINGFUL_THRESHOLD).sort(
    (a, b) => (member.tastes[b] ?? 0) - (member.tastes[a] ?? 0),
  )
}

function topTags(member: TasteMember, n = 2): TasteTag[] {
  return [...TASTE_TAGS]
    .map((tag) => ({ tag, w: member.tastes[tag] ?? 0 }))
    .filter((x) => x.w > 0)
    .sort((a, b) => b.w - a.w)
    .slice(0, n)
    .map((x) => x.tag)
}

/** "natural wine" → "Natural Wine"; "late-night dining" → "Late-Night Dining" */
function titleTag(tag: TasteTag): string {
  return tag.replace(/\b[a-z]/g, (c) => c.toUpperCase())
}

/** Display names for known taste clusters (UX copy overrides) */
const CLUSTER_DISPLAY_NAMES: Record<string, string> = {
  'late-night dining::natural wine': 'Wine Connoisseur',
}

export function clusterNameFromTags(tags: TasteTag[]): string {
  if (tags.length === 0) return 'Open Tastes'
  const key = clusterKeyFromTags(tags)
  if (CLUSTER_DISPLAY_NAMES[key]) return CLUSTER_DISPLAY_NAMES[key]
  if (tags.length === 1) return titleTag(tags[0])
  return `${titleTag(tags[0])} & ${titleTag(tags[1])}`
}

/** Stable key so "wine + late-night" and reverse map to one cluster */
export function clusterKeyFromTags(tags: TasteTag[]): string {
  return [...tags].sort().join('::')
}

/**
 * Coarse clustering: group by each member's top 1–2 tags.
 * Returns map of clusterKey → members, plus display names.
 */
export function coarseCluster(members: TasteMember[]): {
  byKey: Map<string, TasteMember[]>
  names: Map<string, string>
} {
  const byKey = new Map<string, TasteMember[]>()
  const names = new Map<string, string>()

  for (const member of members) {
    const tags = topTags(member, 2)
    if (tags.length === 0) continue
    const key = clusterKeyFromTags(tags)
    const name = clusterNameFromTags(tags)
    names.set(key, name)
    const list = byKey.get(key) ?? []
    list.push(member)
    byKey.set(key, list)
  }

  return { byKey, names }
}

/**
 * Fine matching within the viewer's taste cluster:
 * rank by cosine similarity, prefer same-city, assemble 6–10 members.
 */
export function matchConclave(
  viewer: TasteMember,
  clusterMembers: TasteMember[],
): TasteMember[] {
  const others = clusterMembers.filter((m) => m.id !== viewer.id)

  const ranked = others
    .map((m) => {
      const sim = cosineSimilarity(viewer, m)
      const cityBonus = m.city === viewer.city ? SAME_CITY_BOOST : 0
      return { member: m, score: sim + cityBonus, sim }
    })
    .sort((a, b) => b.score - a.score)

  const target = Math.min(
    MAX_CONCLAVE - 1,
    Math.max(MIN_CONCLAVE - 1, Math.min(ranked.length, 8)),
  )

  const picks = ranked.slice(0, target).map((r) => r.member)

  // Viewer first, then by score — unique initials within this matched group
  return ensureUniqueInitials([viewer, ...picks], { [viewer.id]: viewer.initials })
}

/**
 * Full placement pipeline — run once before the reveal animation.
 */
export function placeInConclave(
  members: TasteMember[],
  viewerId: string,
): PlacementResult {
  const viewer = members.find((m) => m.id === viewerId)
  if (!viewer) {
    throw new Error(`Viewer ${viewerId} not found in member set`)
  }

  const { byKey, names } = coarseCluster(members)
  const viewerTags = topTags(viewer, 2)
  const key = viewerTags.length ? clusterKeyFromTags(viewerTags) : null
  const clusterName = key ? (names.get(key) ?? clusterNameFromTags(viewerTags)) : null
  const coarseClusterSize = key ? (byKey.get(key)?.length ?? 1) : 0
  const totalMembers = members.length

  if (meaningfulTags(viewer).length < 2) {
    return {
      placed: false,
      clusterName,
      viewer,
      curatorTable: [],
      reason: 'insufficient_taste',
      totalMembers,
      clusterSize: coarseClusterSize,
      conclaveSize: 0,
      curatorTableSize: 0,
    }
  }

  const cluster = key ? (byKey.get(key) ?? [viewer]) : [viewer]
  // If this exact top-2 key is a tiny clique, widen to members who share the top tag
  let pool = cluster
  if (pool.length < MIN_CONCLAVE && viewerTags[0]) {
    const primary = viewerTags[0]
    pool = members.filter((m) => topTags(m, 2).includes(primary))
  }

  const conclave = matchConclave(viewer, pool)
  const curatorTable = filterCuratorTable(conclave)

  return {
    placed: true,
    clusterName: clusterName ?? clusterNameFromTags(viewerTags),
    clusterKey: key ?? 'open',
    conclave,
    curatorTable,
    viewer,
    totalMembers,
    // Effective taste neighborhood (coarse clique, or widened primary-tag pool)
    clusterSize: pool.length,
    conclaveSize: conclave.length,
    curatorTableSize: curatorTable.length,
  }
}
