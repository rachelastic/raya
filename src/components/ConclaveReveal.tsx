import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import type { TasteMember } from '../data/members'
import {
  maxGroupSize,
  type PlacementResult,
} from '../data/conclaveMatching'

type ConclaveRevealProps = {
  onEnter?: () => void
  /** Precomputed placement from App — single shared source of truth */
  placement: PlacementResult
}

/** Max outer diameter that fits the 390 phone with side margin */
const MAX_OUTER = 288
/** Min Conclave (ring 3) diameter — room for 6–10 avatar chips in its annulus */
const MIN_INNER = 148
/** Minimum diameter gap between consecutive rings (keeps labels/annuli readable) */
const MIN_GAP = 44
/** Locked tier as a fixed share of Circle diameter (standing-gated, not population-scaled) */
const LOCKED_RATIO = 0.5

/** Positions for 6–10 avatars in the Circle annulus (outside the locked ring) */
function avatarLayout(count: number, orbit: number): { x: number; y: number }[] {
  if (count <= 0) return []
  if (count === 1) return [{ x: 0, y: 0 }]

  // Always ring-layout — center is reserved for the Curator's table
  const positions: { x: number; y: number }[] = []
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2
    positions.push({
      x: Math.cos(angle) * orbit,
      y: Math.sin(angle) * orbit,
    })
  }
  return positions
}

/**
 * Map pool / cluster / circle counts → ring diameters via √ scale.
 * Outer → middle → Circle (ring 3). Locked Curator's table sized separately.
 */
export function computeRingDiameters(
  totalMembers: number,
  clusterSize: number,
  conclaveSize: number,
): { outer: number; middle: number; inner: number; locked: number } {
  const sTotal = Math.sqrt(Math.max(totalMembers, 1))
  const sCluster = Math.sqrt(Math.max(clusterSize, 1))
  const sConclave = Math.sqrt(Math.max(conclaveSize, 1))

  const outer = MAX_OUTER

  let middle = MIN_INNER + (MAX_OUTER - MIN_INNER) * (sCluster / sTotal)
  let inner = MIN_INNER + (MAX_OUTER - MIN_INNER) * (sConclave / sTotal)

  inner = Math.max(MIN_INNER, Math.min(inner, MAX_OUTER - 2 * MIN_GAP))
  middle = Math.max(inner + MIN_GAP, Math.min(middle, outer - MIN_GAP))

  if (middle - inner < MIN_GAP) middle = Math.min(outer - MIN_GAP, inner + MIN_GAP)
  if (outer - middle < MIN_GAP) middle = outer - MIN_GAP
  if (middle - inner < MIN_GAP) inner = Math.max(MIN_INNER, middle - MIN_GAP)

  const locked = Math.round(inner * LOCKED_RATIO)

  return {
    outer: Math.round(outer),
    middle: Math.round(middle),
    inner: Math.round(inner),
    locked,
  }
}

function formatCount(n: number): string {
  return n.toLocaleString('en-US')
}

function rarityLine(conclaveSize: number, totalMembers: number): string {
  const ratio = totalMembers > 0 ? conclaveSize / totalMembers : 1
  if (ratio < 0.001) return 'One of the rarest circles in Places'
  if (ratio < 0.005) return 'An exceptionally niche circle'
  if (ratio < 0.02) return 'A distinctly niche circle'
  return 'A well-matched circle'
}

/**
 * Animated concentric-circle reveal for Circle placement.
 * Ring 3 = Your Circle (algorithmic taste match).
 * Ring 4 = A Curator's table (human-gated standing) — always locked for the viewer.
 */
export function ConclaveReveal({ onEnter, placement }: ConclaveRevealProps) {
  const [phase, setPhase] = useState(0)
  const placed = placement.placed
  const clusterName = placement.clusterName ?? 'Open Tastes'
  // Belt-and-suspenders: Circle avatars never exceed fine-match max
  const matched: TasteMember[] = placed
    ? placement.conclave.slice(0, maxGroupSize)
    : []
  const { totalMembers, clusterSize, curatorTableSize } = placement
  const circleSize =
    placement.circleSize ?? placement.conclaveSize ?? matched.length

  const curatorTableSubtitle =
    curatorTableSize > 0
      ? `${formatCount(curatorTableSize)} in your Circle are already at this table`
      : 'earned, not matched'

  const rings = useMemo(
    () =>
      computeRingDiameters(
        totalMembers,
        Math.max(clusterSize, 1),
        Math.max(circleSize, placed ? matched.length : 1),
      ),
    [totalMembers, clusterSize, circleSize, placed, matched.length],
  )

  const stage = rings.outer
  // Orbit sits in the annulus between locked and Conclave rings
  const avatarOrbit = (rings.inner / 2 + rings.locked / 2) / 2 + 6
  const layout = avatarLayout(matched.length, avatarOrbit)

  useEffect(() => {
    // Outer → cluster → Circle → avatars → rarity → Curator's table → CTA
    const timers = placed
      ? [
          window.setTimeout(() => setPhase(1), 40),
          window.setTimeout(() => setPhase(2), 500),
          window.setTimeout(() => setPhase(3), 980),
          window.setTimeout(() => setPhase(4), 1460),
          window.setTimeout(() => setPhase(5), 1780),
          window.setTimeout(() => setPhase(6), 2200),
          window.setTimeout(() => setPhase(7), 2900),
        ]
      : [
          window.setTimeout(() => setPhase(1), 40),
          window.setTimeout(() => setPhase(2), 500),
          window.setTimeout(() => setPhase(7), 1100),
        ]

    return () => timers.forEach(clearTimeout)
  }, [placed])

  return (
    <div
      className="relative mx-auto flex h-full min-h-[844px] w-full max-w-[390px] flex-col overflow-hidden"
      style={{
        background: '#f0eee8',
        fontFamily: "'Cormorant Garamond', Georgia, serif",
      }}
    >
      <div className="relative flex flex-1 flex-col items-center justify-center px-5 pt-10">
        <Caption
          visible={phase >= 1}
          style={{
            textAlign: 'center',
            marginBottom: 14,
            width: '100%',
          }}
          title="Places"
          subtitle={`${formatCount(totalMembers)} members`}
          titleColor="#6f695f"
        />

        <div className="relative shrink-0" style={{ width: stage, height: stage }}>
          <Ring
            stage={stage}
            size={rings.outer}
            visible={phase >= 1}
            stroke="#8a8378"
            strokeWidth={1}
          />
          <Ring
            stage={stage}
            size={rings.middle}
            visible={phase >= 2}
            stroke="#8a8378"
            strokeWidth={1}
          />
          {placed && (
            <>
              <Ring
                stage={stage}
                size={rings.inner}
                visible={phase >= 3}
                stroke="#9a8158"
                strokeWidth={2}
              />

              {/* Avatars settle in ring 3 — Circle is taste-matched */}
              <div
                className="pointer-events-none absolute left-1/2 top-1/2"
                style={{
                  opacity: phase >= 4 ? 1 : 0,
                  transform: `translate(-50%, -50%) scale(${phase >= 4 ? 1 : 0.92})`,
                  transition:
                    'opacity 400ms ease-out, transform 400ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                aria-hidden={phase < 4}
              >
                {matched.map((m, i) => {
                  const pos = layout[i] ?? { x: 0, y: 0 }
                  return (
                    <div
                      key={m.id}
                      title={`${m.name} · ${m.city}`}
                      className="absolute flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-medium text-white"
                      style={{
                        backgroundColor: m.color,
                        left: pos.x,
                        top: pos.y,
                        marginLeft: -14,
                        marginTop: -14,
                        fontFamily: 'Outfit, system-ui, sans-serif',
                      }}
                      aria-label={m.name}
                    >
                      {m.initials}
                    </div>
                  )
                })}
              </div>

              {/* Ring 4 — Curator's table: locked for viewer; proximity copy only */}
              <Ring
                stage={stage}
                size={rings.locked}
                visible={phase >= 6}
                stroke="#c4beb4"
                strokeWidth={1}
                dashed
                fadeMs={900}
              />
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                style={{
                  opacity: phase >= 6 ? 1 : 0,
                  transition: 'opacity 900ms ease-out',
                }}
                aria-hidden={phase < 6}
              >
                <LockIcon />
              </div>
            </>
          )}
        </div>

        <div className="mt-5 flex w-full flex-col items-center gap-3 px-2">
          <Caption
            visible={phase >= 2}
            style={{ textAlign: 'center', width: '100%' }}
            title={clusterName}
            subtitle={`${formatCount(clusterSize)} share your taste`}
            titleColor="#6f695f"
          />
          {placed && (
            <Caption
              visible={phase >= 3}
              style={{ textAlign: 'center', width: '100%' }}
              title="Your Circle"
              subtitle={`${formatCount(matched.length)} in your Circle`}
              titleColor="#9a8158"
              emphasis
            />
          )}
          {placed && (
            <Caption
              visible={phase >= 6}
              style={{ textAlign: 'center', width: '100%' }}
              title="A Curator's table"
              subtitle={curatorTableSubtitle}
              titleColor="#b5aea3"
              titleSize={12}
              fadeMs={900}
            />
          )}
        </div>
      </div>

      <div className="px-8 pb-12">
        {placed ? (
          <>
            <p
              className="mb-5 text-center text-[13px] italic leading-snug"
              style={{
                color: '#8a8378',
                opacity: phase >= 5 ? 1 : 0,
                transition: 'opacity 450ms ease-out',
              }}
            >
              {rarityLine(matched.length, totalMembers)}
            </p>
            <button
              type="button"
              onClick={onEnter}
              disabled={phase < 7}
              className="w-full rounded-full py-[15px] text-[13px] font-medium tracking-[0.04em] disabled:pointer-events-none"
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                background: '#1a1714',
                color: '#faf9f6',
                opacity: phase >= 7 ? 1 : 0,
                transition: 'opacity 450ms ease-out',
              }}
            >
              Enter your Circle
            </button>
          </>
        ) : (
          <p
            className="text-center text-[14px] italic"
            style={{
              color: '#6f695f',
              opacity: phase >= 7 ? 1 : 0,
              transition: 'opacity 450ms ease-out',
            }}
          >
            still learning your taste
          </p>
        )}
      </div>
    </div>
  )
}

type RingProps = {
  stage: number
  size: number
  visible: boolean
  stroke: string
  strokeWidth: number
  dashed?: boolean
  fadeMs?: number
}

function Ring({
  stage,
  size,
  visible,
  stroke,
  strokeWidth,
  dashed = false,
  fadeMs = 420,
}: RingProps) {
  const offset = (stage - size) / 2
  return (
    <div
      className="absolute rounded-full bg-transparent"
      style={{
        width: size,
        height: size,
        left: offset,
        top: offset,
        border: `${strokeWidth}px ${dashed ? 'dashed' : 'solid'} ${stroke}`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.92)',
        transition: `opacity ${fadeMs}ms ease-out, transform ${fadeMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
      }}
      aria-hidden
    />
  )
}

function LockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      style={{ color: '#b5aea3' }}
    >
      <rect
        x="3.5"
        y="7"
        width="9"
        height="7"
        rx="1.25"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M5.25 7V5.25a2.75 2.75 0 0 1 5.5 0V7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="8" cy="10.5" r="0.9" fill="currentColor" />
    </svg>
  )
}

type CaptionProps = {
  visible: boolean
  title: string
  subtitle?: string
  titleColor: string
  titleSize?: number
  emphasis?: boolean
  fadeMs?: number
  style?: CSSProperties
}

function Caption({
  visible,
  title,
  subtitle,
  titleColor,
  titleSize,
  emphasis = false,
  fadeMs = 380,
  style,
}: CaptionProps) {
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${fadeMs}ms ease-out ${fadeMs === 380 ? 90 : 0}ms`,
        pointerEvents: 'none',
        ...style,
      }}
    >
      <p
        style={{
          margin: 0,
          color: titleColor,
          fontSize: titleSize ?? (emphasis ? 14 : 13),
          fontWeight: emphasis ? 500 : 400,
          letterSpacing: emphasis ? '0.05em' : '0.02em',
          fontStyle: emphasis ? 'italic' : 'normal',
          lineHeight: 1.25,
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </p>
      {subtitle && (
        <p
          style={{
            margin: '3px 0 0',
            color: '#9a948a',
            fontSize: 11,
            fontWeight: 400,
            fontStyle: 'normal',
            letterSpacing: '0.01em',
            lineHeight: 1.25,
            fontFamily: 'Outfit, system-ui, sans-serif',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default ConclaveReveal
