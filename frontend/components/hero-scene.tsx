'use client'

import { useEffect, useRef, useState } from 'react'

// Timeline (ms): both characters stroll in from the real screen edges, meet,
// shake hands, then the robot tracks the mouse. A single rAF loop writes SVG
// transform attributes (CSS transforms are unreliable on SVG sub-elements).
const WALK_MS = 5200
const SHAKE_MS = 1600

export function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [arrived, setArrived] = useState(false)

  // Robot (enters from the right)
  const rBob = useRef<SVGGElement>(null)
  const rLegL = useRef<SVGGElement>(null)
  const rLegR = useRef<SVGGElement>(null)
  const rArm = useRef<SVGGElement>(null) // inner (handshake) arm
  const rHead = useRef<SVGGElement>(null)
  const rPupL = useRef<SVGCircleElement>(null)
  const rPupR = useRef<SVGCircleElement>(null)

  // Bitcoin (enters from the left)
  const bBob = useRef<SVGGElement>(null)
  const bLegL = useRef<SVGGElement>(null)
  const bLegR = useRef<SVGGElement>(null)
  const bArm = useRef<SVGGElement>(null) // inner (handshake) arm

  const gaze = useRef({ tx: 0, ty: 0, cx: 0, cy: 0 })
  const raf = useRef<number | null>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Paint once at the off-screen start, then flip to trigger the walk-in.
    const startId = setTimeout(() => setArrived(true), 60)

    if (reduce) {
      setArrived(true)
      return () => clearTimeout(startId)
    }

    const start = performance.now()

    function onMove(e: PointerEvent) {
      const c = containerRef.current?.getBoundingClientRect()
      if (!c) return
      gaze.current.tx = clamp((e.clientX - (c.left + c.width * 0.56)) / (c.width * 0.4), -1, 1)
      gaze.current.ty = clamp((e.clientY - (c.top + c.height * 0.4)) / (c.height * 0.7), -1, 1)
    }
    window.addEventListener('pointermove', onMove)

    function tick(now: number) {
      const t = now - start

      if (t < WALK_MS) {
        // Walking: gentle leg stride, arms swing at the sides, body bob.
        const p = t / 1000
        const stride = Math.sin(p * 5) * 14
        const swing = Math.sin(p * 5) * 12
        const bob = -Math.abs(Math.sin(p * 5)) * 3
        setT(rLegL.current, `rotate(${stride} 64 150)`)
        setT(rLegR.current, `rotate(${-stride} 86 150)`)
        setT(bLegL.current, `rotate(${-stride} 64 140)`)
        setT(bLegR.current, `rotate(${stride} 86 140)`)
        setT(rBob.current, `translate(0 ${bob})`)
        setT(bBob.current, `translate(0 ${bob})`)
        setT(rArm.current, `rotate(${swing} 52 116)`)
        setT(bArm.current, `rotate(${-swing} 117 96)`)
      } else if (t < WALK_MS + SHAKE_MS) {
        // Handshake: inner arms lift toward the centre and pump.
        const s = (t - WALK_MS) / 1000
        const shake = Math.sin(s * 16) * 8
        setT(rLegL.current, 'rotate(0 64 150)')
        setT(rLegR.current, 'rotate(0 86 150)')
        setT(bLegL.current, 'rotate(0 64 140)')
        setT(bLegR.current, 'rotate(0 86 140)')
        setT(rBob.current, 'translate(0 0)')
        setT(bBob.current, 'translate(0 0)')
        setT(rArm.current, `rotate(${94 + shake} 52 116)`)
        setT(bArm.current, `rotate(${-94 - shake} 117 96)`)
      } else {
        // Idle: arms rest at the sides, robot follows the mouse.
        setT(rArm.current, 'rotate(8 52 116)')
        setT(bArm.current, 'rotate(-8 117 96)')
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
      className="relative left-1/2 flex h-72 w-screen -translate-x-1/2 items-end justify-center gap-3 overflow-hidden md:h-80"
    >
      {/* Soft halo behind the meeting point */}
      <div className="robot-mascot-glow pointer-events-none absolute left-1/2 top-1/2 h-56 w-72 -translate-x-1/2 -translate-y-1/2" />

      {/* Bitcoin — enters from the far left screen edge */}
      <div
        className="relative h-full"
        style={{
          transform: `translateX(${arrived ? '0px' : '-62vw'})`,
          transition: `transform ${WALK_MS}ms cubic-bezier(0.33, 0, 0.15, 1)`,
        }}
      >
        <svg viewBox="0 0 150 210" className="h-full w-auto drop-shadow-2xl" aria-hidden="true">
          <defs>
            <linearGradient id="hs-coin-edge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="50%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#5c2705" />
            </linearGradient>
            <radialGradient id="hs-coin" cx="38%" cy="30%" r="82%">
              <stop offset="0%" stopColor="#fffdf2" />
              <stop offset="32%" stopColor="#fde68a" />
              <stop offset="68%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#a15207" />
            </radialGradient>
            <linearGradient id="hs-coin-limb" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#8a3d06" />
            </linearGradient>
          </defs>

          {/* Legs */}
          <g ref={bLegL}>
            <rect x="60" y="138" width="12" height="44" rx="6" fill="url(#hs-coin-limb)" />
            <ellipse cx="62" cy="185" rx="12" ry="6.5" fill="#4a1f04" />
          </g>
          <g ref={bLegR}>
            <rect x="82" y="138" width="12" height="44" rx="6" fill="url(#hs-coin-limb)" />
            <ellipse cx="88" cy="185" rx="12" ry="6.5" fill="#4a1f04" />
          </g>

          <g ref={bBob}>
            {/* Left arm (outer, resting down) */}
            <g transform="rotate(-10 33 100)">
              <rect x="27" y="98" width="11" height="30" rx="5.5" fill="url(#hs-coin-limb)" />
              <circle cx="32.5" cy="128" r="7" fill="#fbbf24" stroke="#7c3a08" strokeWidth="1.3" />
            </g>
            {/* Right arm (inner — the handshake arm), resting down */}
            <g ref={bArm}>
              <rect x="111" y="96" width="12" height="30" rx="6" fill="url(#hs-coin-limb)" />
              <circle cx="117" cy="126" r="7.5" fill="#fbbf24" stroke="#7c3a08" strokeWidth="1.4" />
            </g>

            {/* Coin body — beveled edge then glossy raised face */}
            <circle cx="75" cy="90" r="50" fill="url(#hs-coin-edge)" />
            <circle cx="75" cy="88" r="46" fill="url(#hs-coin)" />
            <circle cx="75" cy="88" r="37" fill="none" stroke="#7c3a08" strokeWidth="2" opacity="0.4" />
            <path d="M42 64 A44 44 0 0 1 96 50" fill="none" stroke="#fffdf2" strokeWidth="8" strokeLinecap="round" opacity="0.55" />
            <text
              x="75"
              y="105"
              textAnchor="middle"
              fontSize="48"
              fontWeight="700"
              fill="#7c3a08"
              fontFamily="Georgia, 'Times New Roman', serif"
            >
              ₿
            </text>
            {/* Eyes */}
            <ellipse cx="61" cy="66" rx="7.5" ry="8" fill="#fff" />
            <ellipse cx="89" cy="66" rx="7.5" ry="8" fill="#fff" />
            <circle cx="62" cy="67" r="3.4" fill="#1c1917" />
            <circle cx="90" cy="67" r="3.4" fill="#1c1917" />
            <circle cx="63.4" cy="65.4" r="1.2" fill="#fff" />
            <circle cx="91.4" cy="65.4" r="1.2" fill="#fff" />
          </g>
        </svg>
      </div>

      {/* Robot — enters from the far right screen edge */}
      <div
        className="relative h-full"
        style={{
          transform: `translateX(${arrived ? '0px' : '62vw'})`,
          transition: `transform ${WALK_MS}ms cubic-bezier(0.33, 0, 0.15, 1)`,
        }}
      >
        <svg viewBox="0 0 150 210" className="h-full w-auto drop-shadow-2xl" aria-hidden="true">
          <defs>
            <radialGradient id="hs-body" cx="36%" cy="24%" r="88%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#eef2f6" />
              <stop offset="100%" stopColor="#8fa0b2" />
            </radialGradient>
            <radialGradient id="hs-head" cx="38%" cy="22%" r="90%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="52%" stopColor="#eaf0f5" />
              <stop offset="100%" stopColor="#93a4b6" />
            </radialGradient>
            <linearGradient id="hs-limb" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#7c8b9c" />
            </linearGradient>
            <radialGradient id="hs-visor" cx="50%" cy="32%" r="85%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="55%" stopColor="#0b1120" />
              <stop offset="100%" stopColor="#030407" />
            </radialGradient>
          </defs>

          {/* Legs */}
          <g ref={rLegL}>
            <rect x="60" y="150" width="12" height="40" rx="6" fill="url(#hs-limb)" />
            <ellipse cx="64" cy="192" rx="13" ry="6.5" fill="#334155" />
          </g>
          <g ref={rLegR}>
            <rect x="79" y="150" width="12" height="40" rx="6" fill="url(#hs-limb)" />
            <ellipse cx="86" cy="192" rx="13" ry="6.5" fill="#334155" />
          </g>

          <g ref={rBob}>
            {/* Right arm (outer, resting down) */}
            <g transform="rotate(10 98 116)">
              <rect x="92" y="114" width="12" height="30" rx="6" fill="url(#hs-limb)" />
              <circle cx="98" cy="144" r="7" fill="#e2e8f0" stroke="#7c8b9c" strokeWidth="1.3" />
            </g>
            {/* Left arm (inner — the handshake arm), resting down */}
            <g ref={rArm}>
              <rect x="46" y="114" width="12" height="30" rx="6" fill="url(#hs-limb)" />
              <circle cx="52" cy="144" r="7.5" fill="#e2e8f0" stroke="#7c8b9c" strokeWidth="1.4" />
            </g>

            {/* Capsule torso with a glowing core */}
            <rect x="52" y="102" width="46" height="58" rx="23" fill="url(#hs-body)" />
            <path d="M62 110 A22 22 0 0 1 90 108" fill="none" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" opacity="0.85" />
            <circle cx="75" cy="133" r="11" fill="#0b1120" />
            <circle cx="75" cy="133" r="6" fill="#22d3ee">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite" />
            </circle>

            {/* Head (tracks the mouse) */}
            <g ref={rHead}>
              <line x1="75" y1="28" x2="75" y2="40" stroke="#93a4b6" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="75" cy="24" r="5" fill="#22d3ee">
                <animate attributeName="r" values="4;6;4" dur="1.8s" repeatCount="indefinite" />
              </circle>
              {/* Dome head */}
              <path d="M49 76 Q49 42 75 42 Q101 42 101 76 Z" fill="url(#hs-head)" />
              <rect x="49" y="72" width="52" height="18" rx="9" fill="url(#hs-head)" />
              <path d="M58 52 Q66 46 78 48" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
              {/* Ears */}
              <rect x="43" y="60" width="8" height="18" rx="4" fill="url(#hs-limb)" />
              <rect x="99" y="60" width="8" height="18" rx="4" fill="url(#hs-limb)" />
              {/* Wide glossy visor */}
              <rect x="55" y="54" width="40" height="30" rx="15" fill="url(#hs-visor)" />
              <ellipse cx="66" cy="61" rx="10" ry="5" fill="#ffffff" opacity="0.1" />
              <circle ref={rPupL} cx="67" cy="68" r="5.5" fill="#22d3ee" style={{ filter: 'drop-shadow(0 0 4px #22d3ee)' }} />
              <circle ref={rPupR} cx="83" cy="68" r="5.5" fill="#22d3ee" style={{ filter: 'drop-shadow(0 0 4px #22d3ee)' }} />
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
