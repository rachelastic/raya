import { useEffect, useState, type CSSProperties } from 'react'
import type { TasteMember } from '../data/members'
import type { PlacementResult } from '../data/conclaveMatching'

type ConclaveRevealProps = {
  onEnter?: () => void
  /** Precomputed placement from App — single shared source of truth */
  placement: PlacementResult
}

const STAGE = 320

/** Positions for 6–10 avatars inside the inner ring */
function avatarLayout(count: number): { x: number; y: number }[] {
  if (count <= 0) return []
  if (count === 1) return [{ x: 0, y: 0 }]

  const hasCenter = count !== 6 && count !== 8
  const around = hasCenter ? count - 1 : count
  const radius = around > 6 ? 36 : 32
  const positions: { x: number; y: number }[] = []

  for (let i = 0; i < around; i++) {
    const angle = (Math.PI * 2 * i) / around - Math.PI / 2
    positions.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    })
  }

  if (hasCenter) positions.push({ x: 0, y: 0 })
  return positions.slice(0, count)
}

/**
 * Animated concentric-circle reveal for Conclave placement.
 * Member / cluster data comes from the parent via `placement`.
 */
export function ConclaveReveal({ onEnter, placement }: ConclaveRevealProps) {
  const [phase, setPhase] = useState(0)
  const placed = placement.placed
  const clusterName = placement.clusterName ?? 'Open Tastes'
  const matched: TasteMember[] = placed ? placement.conclave : []
  const layout = avatarLayout(matched.length)

  useEffect(() => {
    const timers = placed
      ? [
          window.setTimeout(() => setPhase(1), 40),
          window.setTimeout(() => setPhase(2), 500),
          window.setTimeout(() => setPhase(3), 980),
          window.setTimeout(() => setPhase(4), 1460),
          window.setTimeout(() => setPhase(5), 1880),
        ]
      : [
          window.setTimeout(() => setPhase(1), 40),
          window.setTimeout(() => setPhase(2), 500),
          window.setTimeout(() => setPhase(5), 1100),
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
      <div className="relative flex flex-1 items-center justify-center">
        <div className="relative" style={{ width: STAGE, height: STAGE }}>
          <Ring
            size={320}
            visible={phase >= 1}
            stroke="#8a8378"
            strokeWidth={1}
            label="Places"
            labelSide="top"
            labelColor="#6f695f"
          />

          <Ring
            size={232}
            visible={phase >= 2}
            stroke="#8a8378"
            strokeWidth={1}
            label={clusterName}
            labelSide="bottom"
            labelColor="#6f695f"
          />

          {placed && (
            <>
              <Ring
                size={148}
                visible={phase >= 3}
                stroke="#9a8158"
                strokeWidth={2}
                label="Your Conclave"
                labelSide="inner-bottom"
                labelColor="#9a8158"
                labelEmphasis
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
            </>
          )}
        </div>
      </div>

      <div className="px-8 pb-12">
        {placed ? (
          <button
            type="button"
            onClick={onEnter}
            disabled={phase < 5}
            className="w-full rounded-full py-[15px] text-[13px] font-medium tracking-[0.04em] disabled:pointer-events-none"
            style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              background: '#1a1714',
              color: '#faf9f6',
              opacity: phase >= 5 ? 1 : 0,
              transition: 'opacity 450ms ease-out',
            }}
          >
            Enter your Conclave
          </button>
        ) : (
          <p
            className="text-center text-[14px] italic"
            style={{
              color: '#6f695f',
              opacity: phase >= 5 ? 1 : 0,
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

type LabelSide = 'top' | 'bottom' | 'inner-bottom'

type RingProps = {
  size: number
  visible: boolean
  stroke: string
  strokeWidth: number
  label: string
  labelSide: LabelSide
  labelColor: string
  labelEmphasis?: boolean
}

function Ring({
  size,
  visible,
  stroke,
  strokeWidth,
  label,
  labelSide,
  labelColor,
  labelEmphasis = false,
}: RingProps) {
  const offset = (STAGE - size) / 2

  const labelStyle: CSSProperties = {
    color: labelColor,
    fontSize: labelEmphasis ? 14 : 13,
    fontWeight: labelEmphasis ? 500 : 400,
    letterSpacing: labelEmphasis ? '0.06em' : '0.02em',
    fontStyle: labelEmphasis ? 'italic' : 'normal',
    opacity: visible ? 1 : 0,
    transition: 'opacity 380ms ease-out 90ms',
    lineHeight: 1.25,
    maxWidth: 168,
    textAlign: 'center',
    pointerEvents: 'none',
  }

  const labelPosition: Record<LabelSide, CSSProperties> = {
    top: {
      left: '50%',
      top: offset - 26,
      transform: 'translateX(-50%)',
    },
    bottom: {
      left: '50%',
      top: offset + size + 8,
      transform: 'translateX(-50%)',
    },
    'inner-bottom': {
      left: '50%',
      top: offset + size + 8,
      transform: 'translateX(-50%)',
    },
  }

  return (
    <>
      <div
        className="absolute rounded-full bg-transparent"
        style={{
          width: size,
          height: size,
          left: offset,
          top: offset,
          border: `${strokeWidth}px solid ${stroke}`,
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.88)',
          transition:
            'opacity 420ms ease-out, transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        aria-hidden
      />
      <p
        className="absolute"
        style={{ ...labelStyle, ...labelPosition[labelSide] }}
      >
        {label}
      </p>
    </>
  )
}

export default ConclaveReveal
