import {
  TASTE_TAGS,
  ensureUniqueInitials,
  type TasteMember,
  type TasteTag,
} from './members'

const MEANINGFUL_THRESHOLD = 0.35
/** Prefer same-city while ranking; relaxed before similarity if under min */
const SAME_CITY_BOOST = 0.12
/** Reasonable cosine floor for fine matching */
const SIMILARITY_FLOOR = 0.22
/** After city is relaxed, still prefer some signal before pure top-N */
const SIMILARITY_RELAXED = 0.05

/** Public controls for Circle size (fine-matching output) */
export const minGroupSize = 6
export const maxGroupSize = 10

export type NicheStats = {
  /** Full generated member pool */
  totalMembers: number
  /** Members in the viewer’s coarse taste cluster (or widened match pool) */
  clusterSize: number
  /** Fine-matched Circle size (0 if unplaced) — always ≤ maxGroupSize when placed */
  circleSize: number
  /** @deprecated use circleSize — kept for older call sites */
  conclaveSize: number
  /** Circle members who meet Curator-table standing gates */
  curatorTableSize: number
}

export type PlacementResult =
  | {
      placed: true
      clusterName: string
      clusterKey: string
      /** Fine-matched Circle only (6–maxGroupSize) — never the full cluster */
      conclave: TasteMember[]
      /** Subset of Circle eligible for the Curator’s table (may be empty) */
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
 * STAGE 1 — Coarse clustering: group by each member's top 1–2 tags.
 * Clusters may be large (dozens). Never treat this as the Circle.
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

type Ranked = {
  member: TasteMember
  sim: number
  sameCity: boolean
  score: number
}

function rankAgainstViewer(
  viewer: TasteMember,
  others: TasteMember[],
): Ranked[] {
  return others
    .map((m) => {
      const sim = cosineSimilarity(viewer, m)
      const sameCity = m.city === viewer.city
      return {
        member: m,
        sim,
        sameCity,
        score: sim + (sameCity ? SAME_CITY_BOOST : 0),
      }
    })
    .sort((a, b) => b.score - a.score || b.sim - a.sim)
}

/**
 * STAGE 2 — Fine matching within a coarse cluster (or widened candidate pool).
 * Selects 6–maxGroupSize members via cosine similarity to the viewer.
 * Never returns the full cluster as a fallback.
 */
export function matchConclave(
  viewer: TasteMember,
  clusterMembers: TasteMember[],
  options?: { minGroupSize?: number; maxGroupSize?: number },
): TasteMember[] {
  const minSize = options?.minGroupSize ?? minGroupSize
  const maxSize = options?.maxGroupSize ?? maxGroupSize
  if (maxSize < 1) return []
  if (minSize > maxSize) {
    throw new Error(`minGroupSize (${minSize}) > maxGroupSize (${maxSize})`)
  }

  const othersMax = maxSize - 1 // room for viewer
  const othersMin = Math.max(0, minSize - 1)

  const others = clusterMembers.filter((m) => m.id !== viewer.id)
  const ranked = rankAgainstViewer(viewer, others)

  const take = (candidates: Ranked[], n: number): TasteMember[] =>
    candidates.slice(0, Math.min(n, othersMax)).map((r) => r.member)

  // Ideal others count when many candidates: prefer mid of [min, max]
  const idealOthers = Math.min(
    othersMax,
    Math.max(othersMin, Math.min(ranked.length, 8)),
  )

  // 1) Same-city + similarity floor
  let picks = take(
    ranked.filter((r) => r.sameCity && r.sim >= SIMILARITY_FLOOR),
    idealOthers,
  )

  // 2) Relax same-city first; keep similarity floor
  if (picks.length < othersMin) {
    picks = take(
      ranked.filter((r) => r.sim >= SIMILARITY_FLOOR),
      idealOthers,
    )
  }

  // 3) Relax similarity floor; still ranked top-N — never dump the cluster
  if (picks.length < othersMin) {
    picks = take(
      ranked.filter((r) => r.sim >= SIMILARITY_RELAXED),
      idealOthers,
    )
  }

  // 4) Last resort: best available scores, still hard-capped at othersMax
  if (picks.length < othersMin) {
    picks = take(ranked, othersMax)
  }

  // Safety: never exceed othersMax even if a step miscounted
  picks = picks.slice(0, othersMax)

  const circle = ensureUniqueInitials([viewer, ...picks], {
    [viewer.id]: viewer.initials,
  })

  // Hard cap including viewer
  return circle.slice(0, maxSize)
}

/** Alias — Circle is the product name for the fine-matched group */
export const matchCircle = matchConclave

function logPlacementSanity(info: {
  clusterSize: number
  circleSize: number
  totalMembers: number
  placed: boolean
}) {
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    console.info(
      '[Circle placement] clusterSize=%d circleSize=%d totalMembers=%d placed=%s',
      info.clusterSize,
      info.circleSize,
      info.totalMembers,
      info.placed,
    )
    if (info.placed && (info.circleSize < minGroupSize || info.circleSize > maxGroupSize)) {
      console.warn(
        '[Circle placement] circleSize out of [%d, %d] — got %d (cluster was %d)',
        minGroupSize,
        maxGroupSize,
        info.circleSize,
        info.clusterSize,
      )
    }
  }
}

/**
 * Full placement pipeline — coarse cluster, then fine match. Never collapse.
 */
export function placeInConclave(
  members: TasteMember[],
  viewerId: string,
  options?: { minGroupSize?: number; maxGroupSize?: number },
): PlacementResult {
  const minSize = options?.minGroupSize ?? minGroupSize
  const maxSize = options?.maxGroupSize ?? maxGroupSize

  const viewer = members.find((m) => m.id === viewerId)
  if (!viewer) {
    throw new Error(`Viewer ${viewerId} not found in member set`)
  }

  // ——— STAGE 1: coarse taste clustering ———
  const { byKey, names } = coarseCluster(members)
  const viewerTags = topTags(viewer, 2)
  const key = viewerTags.length ? clusterKeyFromTags(viewerTags) : null
  const clusterName = key ? (names.get(key) ?? clusterNameFromTags(viewerTags)) : null
  const coarse = key ? (byKey.get(key) ?? [viewer]) : [viewer]
  const totalMembers = members.length

  if (meaningfulTags(viewer).length < 2) {
    const result: PlacementResult = {
      placed: false,
      clusterName,
      viewer,
      curatorTable: [],
      reason: 'insufficient_taste',
      totalMembers,
      clusterSize: coarse.length,
      circleSize: 0,
      conclaveSize: 0,
      curatorTableSize: 0,
    }
    logPlacementSanity({
      clusterSize: result.clusterSize,
      circleSize: 0,
      totalMembers,
      placed: false,
    })
    return result
  }

  // Candidate pool for fine matching. If the exact top-2 clique is tiny,
  // widen to primary-tag peers — still only an INPUT to stage 2.
  let matchPool = coarse
  if (matchPool.length < minSize && viewerTags[0]) {
    const primary = viewerTags[0]
    matchPool = members.filter((m) => topTags(m, 2).includes(primary))
  }

  // ——— STAGE 2: fine cosine match → Circle (hard-capped) ———
  const conclave = matchConclave(viewer, matchPool, {
    minGroupSize: minSize,
    maxGroupSize: maxSize,
  })

  if (conclave.length > maxSize) {
    // Should be unreachable — enforce anyway
    conclave.length = maxSize
  }

  const curatorTable = filterCuratorTable(conclave)
  const circleSize = conclave.length

  const result: PlacementResult = {
    placed: true,
    clusterName: clusterName ?? clusterNameFromTags(viewerTags),
    clusterKey: key ?? 'open',
    conclave,
    curatorTable,
    viewer,
    totalMembers,
    // Taste neighborhood size (coarse clique, or widened primary-tag pool)
    clusterSize: matchPool.length,
    circleSize,
    conclaveSize: circleSize,
    curatorTableSize: curatorTable.length,
  }

  logPlacementSanity({
    clusterSize: result.clusterSize,
    circleSize,
    totalMembers,
    placed: true,
  })

  return result
}
