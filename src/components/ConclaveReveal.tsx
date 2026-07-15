import { useEffect, useMemo, useState } from 'react'
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

/**
 * Animated concentric-circle reveal for Circle placement.
 * Progression narrative explains the hierarchy; rings reinforce it.
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

  const tableLine =
    curatorTableSize > 0
      ? `${formatCount(curatorTableSize)} Curator's Table · locked`
      : 'A Curator\'s Table · locked'

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

  const steps = placed
    ? [
        {
          phase: 1,
          text: `${formatCount(totalMembers)} members interested in ${tasteWord(clusterName)}`,
          color: '#6f695f',
        },
        {
          phase: 2,
          text: `${formatCount(clusterSize)} people who share your taste`,
          color: '#6f695f',
        },
        {
          phase: 3,
          text: `${formatCount(matched.length)} carefully matched into your Circle`,
          color: '#9a8158',
          emphasis: true,
        },
        {
          phase: 6,
          text: tableLine,
          color: '#b5aea3',
          muted: true,
        },
      ]
    : [
        {
          phase: 1,
          text: `${formatCount(totalMembers)} members on Places`,
          color: '#6f695f',
        },
        {
          phase: 2,
          text: 'still learning your taste',
          color: '#6f695f',
        },
      ]

  useEffect(() => {
    // Outer → cluster → Circle → avatars → Curator's table → CTA
    const timers = placed
      ? [
          window.setTimeout(() => setPhase(1), 40),
          window.setTimeout(() => setPhase(2), 700),
          window.setTimeout(() => setPhase(3), 1400),
          window.setTimeout(() => setPhase(4), 2000),
          window.setTimeout(() => setPhase(6), 2600),
          window.setTimeout(() => setPhase(7), 3400),
        ]
      : [
          window.setTimeout(() => setPhase(1), 40),
          window.setTimeout(() => setPhase(2), 700),
          window.setTimeout(() => setPhase(7), 1400),
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
      <div className="relative flex flex-1 flex-col items-center justify-center px-5 pt-8">
        <p
          className="mb-3 text-[11px] font-medium tracking-[0.2em] uppercase"
          style={{
            fontFamily: 'Outfit, system-ui, sans-serif',
            color: '#9a948a',
            opacity: phase >= 1 ? 1 : 0,
            transition: 'opacity 400ms ease-out',
          }}
        >
          {clusterName}
        </p>

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

        {/* Progression narrative — explains narrowing, not just labels */}
        <div
          className="mt-6 flex w-full flex-col items-center px-2"
          style={{ fontFamily: 'Outfit, system-ui, sans-serif' }}
        >
          {steps.map((step, i) => {
            const visible = phase >= step.phase
            const showArrow = i < steps.length - 1 && phase >= steps[i + 1].phase
            return (
              <div key={step.phase} className="flex w-full flex-col items-center">
                <p
                  style={{
                    margin: 0,
                    textAlign: 'center',
                    color: step.color,
                    fontSize: step.emphasis ? 14 : step.muted ? 12 : 13,
                    fontWeight: step.emphasis ? 500 : 400,
                    fontStyle: step.emphasis ? 'italic' : 'normal',
                    letterSpacing: '0.01em',
                    lineHeight: 1.35,
                    maxWidth: '28ch',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(6px)',
                    transition:
                      'opacity 500ms ease-out, transform 500ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  {step.text}
                </p>
                <span
                  aria-hidden
                  style={{
                    display: 'block',
                    margin: '6px 0',
                    color: '#c4beb4',
                    fontSize: 14,
                    lineHeight: 1,
                    opacity: showArrow ? 1 : 0,
                    transition: 'opacity 350ms ease-out',
                  }}
                >
                  ↓
                </span>
              </div>
            )
          })}
          {placed && phase >= 6 && (
            <p
              style={{
                margin: '2px 0 0',
                color: '#9a948a',
                fontSize: 11,
                opacity: 1,
                fontFamily: 'Outfit, system-ui, sans-serif',
              }}
            >
              {curatorTableSize > 0
                ? `${formatCount(curatorTableSize)} in your Circle already at this table · earned, not matched`
                : 'earned, not matched'}
            </p>
          )}
        </div>
      </div>

      <div className="px-8 pb-12">
        {placed ? (
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

/** Soften cluster display names into interest language for the outer step */
function tasteWord(clusterName: string): string {
  const n = clusterName.toLowerCase()
  if (n.includes('wine')) return 'wine'
  if (n.includes('coffee')) return 'coffee'
  if (n.includes('wellness')) return 'wellness'
  return 'places like these'
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

export default ConclaveReveal
