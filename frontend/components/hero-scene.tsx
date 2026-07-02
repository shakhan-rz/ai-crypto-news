'use client'

import { useEffect, useRef, useState } from 'react'

// Timeline (ms): both characters walk in, meet, shake hands, then the robot
// tracks the mouse. Everything is driven by one rAF loop writing SVG transform
// attributes (CSS transforms are unreliable on SVG sub-elements).
const WALK_MS = 2300
const SHAKE_MS = 1300

export function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [arrived, setArrived] = useState(false)

  // Robot
  const rBob = useRef<SVGGElement>(null)
  const rLegL = useRef<SVGGElement>(null)
  const rLegR = useRef<SVGGElement>(null)
  const rArm = useRef<SVGGElement>(null)
  const rHead = useRef<SVGGElement>(null)
  const rPupL = useRef<SVGCircleElement>(null)
  const rPupR = useRef<SVGCircleElement>(null)

  // Bitcoin
  const bBob = useRef<SVGGElement>(null)
  const bLegL = useRef<SVGGElement>(null)
  const bLegR = useRef<SVGGElement>(null)
  const bArm = useRef<SVGGElement>(null)

  const gaze = useRef({ tx: 0, ty: 0, cx: 0, cy: 0 })
  const raf = useRef<number | null>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Paint once at the off-screen start, then flip to trigger the walk-in.
    const startId = setTimeout(() => setArrived(true), 50)

    if (reduce) {
      setArrived(true)
      return () => clearTimeout(startId)
    }

    const start = performance.now()

    function onMove(e: PointerEvent) {
      const c = containerRef.current?.getBoundingClientRect()
      if (!c) return
      // Robot rests just right of centre — aim the gaze frame there.
      gaze.current.tx = clamp((e.clientX - (c.left + c.width * 0.6)) / (c.width * 0.45), -1, 1)
      gaze.current.ty = clamp((e.clientY - (c.top + c.height * 0.4)) / (c.height * 0.7), -1, 1)
    }
    window.addEventListener('pointermove', onMove)

    function tick(now: number) {
      const t = now - start

      if (t < WALK_MS) {
        // Walking: swing legs, bob the upper body.
        const p = t / 1000
        const swing = Math.sin(p * 10) * 18
        const bob = -Math.abs(Math.sin(p * 10)) * 4
        setT(rLegL.current, `rotate(${swing} 64 150)`)
        setT(rLegR.current, `rotate(${-swing} 86 150)`)
        setT(bLegL.current, `rotate(${-swing} 64 140)`)
        setT(bLegR.current, `rotate(${swing} 86 140)`)
        setT(rBob.current, `translate(0 ${bob})`)
        setT(bBob.current, `translate(0 ${bob})`)
        setT(rArm.current, `rotate(24 52 116)`)
        setT(bArm.current, `rotate(-24 120 96)`)
      } else if (t < WALK_MS + SHAKE_MS) {
        // Handshake: inner arms meet in the middle and pump up and down.
        const s = (t - WALK_MS) / 1000
        const shake = Math.sin(s * 20) * 10
        setT(rLegL.current, 'rotate(0 64 150)')
        setT(rLegR.current, 'rotate(0 86 150)')
        setT(bLegL.current, 'rotate(0 64 140)')
        setT(bLegR.current, 'rotate(0 86 140)')
        setT(rBob.current, 'translate(0 0)')
        setT(bBob.current, 'translate(0 0)')
        setT(rArm.current, `rotate(${-72 + shake} 52 116)`)
        setT(bArm.current, `rotate(${72 - shake} 120 96)`)
      } else {
        // Idle: arms rest, robot follows the mouse.
        setT(rArm.current, 'rotate(-6 52 116)')
        setT(bArm.current, 'rotate(6 120 96)')
        const g = gaze.current
        g.cx += (g.tx - g.cx) * 0.1
        g.cy += (g.ty - g.cy) * 0.1
        setT(rHead.current, `translate(${g.cx * 5} ${g.cy * 4}) rotate(${g.cx * 6} 75 58)`)
        setT(rPupL.current, `translate(${g.cx * 4} ${g.cy * 3})`)
        setT(rPupR.current, `translate(${g.cx * 4} ${g.cy * 3})`)
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      if (raf.current) cancelAnimationFrame(raf.current)
      clearTimeout(startId)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex h-72 w-full max-w-2xl items-end justify-center gap-1 overflow-hidden md:h-80"
    >
      {/* Soft halo behind the meeting point */}
      <div className="robot-mascot-glow pointer-events-none absolute left-1/2 top-1/2 h-56 w-72 -translate-x-1/2 -translate-y-1/2" />

      {/* Bitcoin — enters from the left */}
      <div
        className="relative h-full"
        style={{
          transform: `translateX(${arrived ? 0 : -340}px)`,
          transition: `transform ${WALK_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        <svg viewBox="0 0 150 210" className="h-full w-auto drop-shadow-xl" aria-hidden="true">
          <defs>
            <radialGradient id="hs-coin" cx="38%" cy="32%" r="75%">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="55%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </radialGradient>
          </defs>

          <g ref={bLegL}>
            <rect x="60" y="140" width="9" height="42" rx="4.5" fill="#b45309" />
            <ellipse cx="62" cy="185" rx="11" ry="6" fill="#78350f" />
          </g>
          <g ref={bLegR}>
            <rect x="82" y="140" width="9" height="42" rx="4.5" fill="#b45309" />
            <ellipse cx="88" cy="185" rx="11" ry="6" fill="#78350f" />
          </g>

          <g ref={bBob}>
            {/* Left arm (outer) */}
            <rect x="20" y="92" width="30" height="9" rx="4.5" fill="#d97706" transform="rotate(18 30 96)" />
            {/* Right arm (inner — the handshake arm) */}
            <g ref={bArm}>
              <rect x="100" y="92" width="34" height="9" rx="4.5" fill="#d97706" />
              <circle cx="136" cy="96" r="7" fill="#f59e0b" />
            </g>

            {/* Coin body */}
            <circle cx="75" cy="88" r="50" fill="url(#hs-coin)" stroke="#78350f" strokeWidth="3" />
            <circle cx="75" cy="88" r="41" fill="none" stroke="#fbbf24" strokeWidth="2.5" opacity="0.7" />
            <text
              x="75"
              y="104"
              textAnchor="middle"
              fontSize="46"
              fontWeight="700"
              fill="#78350f"
              fontFamily="Georgia, 'Times New Roman', serif"
            >
              ₿
            </text>
            {/* Eyes */}
            <circle cx="60" cy="66" r="7" fill="#fff" />
            <circle cx="90" cy="66" r="7" fill="#fff" />
            <circle cx="61" cy="67" r="3.2" fill="#1c1917" />
            <circle cx="91" cy="67" r="3.2" fill="#1c1917" />
          </g>
        </svg>
      </div>

      {/* Robot — enters from the right */}
      <div
        className="relative h-full"
        style={{
          transform: `translateX(${arrived ? 0 : 340}px)`,
          transition: `transform ${WALK_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        <svg viewBox="0 0 150 210" className="h-full w-auto drop-shadow-xl" aria-hidden="true">
          <defs>
            <linearGradient id="hs-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f4f4f5" />
              <stop offset="100%" stopColor="#a1a1aa" />
            </linearGradient>
            <linearGradient id="hs-head" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fafafa" />
              <stop offset="100%" stopColor="#c7c7cc" />
            </linearGradient>
            <radialGradient id="hs-visor" cx="50%" cy="40%" r="75%">
              <stop offset="0%" stopColor="#1f2937" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </radialGradient>
          </defs>

          <g ref={rLegL}>
            <rect x="60" y="150" width="10" height="40" rx="5" fill="#71717a" />
            <ellipse cx="64" cy="192" rx="12" ry="6" fill="#3f3f46" />
          </g>
          <g ref={rLegR}>
            <rect x="80" y="150" width="10" height="40" rx="5" fill="#71717a" />
            <ellipse cx="86" cy="192" rx="12" ry="6" fill="#3f3f46" />
          </g>

          <g ref={rBob}>
            {/* Right arm (outer) */}
            <rect x="98" y="112" width="30" height="10" rx="5" fill="url(#hs-body)" transform="rotate(-16 100 116)" />
            {/* Left arm (inner — the handshake arm) */}
            <g ref={rArm}>
              <rect x="22" y="112" width="32" height="10" rx="5" fill="url(#hs-body)" />
              <circle cx="22" cy="117" r="7" fill="#d4d4d8" />
            </g>

            {/* Torso */}
            <rect x="52" y="104" width="46" height="54" rx="18" fill="url(#hs-body)" />
            <circle cx="75" cy="130" r="7" fill="#0a0a0a" />
            <circle cx="75" cy="130" r="3.5" fill="#fb923c">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite" />
            </circle>

            {/* Head (tracks the mouse) */}
            <g ref={rHead}>
              <line x1="75" y1="30" x2="75" y2="42" stroke="#a1a1aa" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="75" cy="26" r="5" fill="#fb923c">
                <animate attributeName="r" values="4;6;4" dur="1.8s" repeatCount="indefinite" />
              </circle>
              <rect x="50" y="42" width="50" height="46" rx="18" fill="url(#hs-head)" />
              <rect x="44" y="58" width="8" height="18" rx="4" fill="#a1a1aa" />
              <rect x="98" y="58" width="8" height="18" rx="4" fill="#a1a1aa" />
              <rect x="58" y="52" width="34" height="28" rx="13" fill="url(#hs-visor)" />
              <circle ref={rPupL} cx="68" cy="66" r="5" fill="#fb923c" style={{ filter: 'drop-shadow(0 0 3px #fb923c)' }} />
              <circle ref={rPupR} cx="82" cy="66" r="5" fill="#fb923c" style={{ filter: 'drop-shadow(0 0 3px #fb923c)' }} />
            </g>
          </g>
        </svg>
      </div>
    </div>
  )
}

function setT(el: SVGElement | null, value: string) {
  if (el) el.setAttribute('transform', value)
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}
