'use client'

import { useEffect, useRef, useState } from 'react'

// Timeline (ms): both characters walk in from the real screen edges, meet,
// shake hands, then the robot tracks the mouse. A single rAF loop writes SVG
// transform attributes (CSS transforms are unreliable on SVG sub-elements).
const WALK_MS = 3800
const SHAKE_MS = 1500

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
    const startId = setTimeout(() => setArrived(true), 60)

    if (reduce) {
      setArrived(true)
      return () => clearTimeout(startId)
    }

    const start = performance.now()

    function onMove(e: PointerEvent) {
      const c = containerRef.current?.getBoundingClientRect()
      if (!c) return
      // Robot rests just right of centre — aim the gaze frame there.
      gaze.current.tx = clamp((e.clientX - (c.left + c.width * 0.56)) / (c.width * 0.4), -1, 1)
      gaze.current.ty = clamp((e.clientY - (c.top + c.height * 0.4)) / (c.height * 0.7), -1, 1)
    }
    window.addEventListener('pointermove', onMove)

    function tick(now: number) {
      const t = now - start

      if (t < WALK_MS) {
        // Walking: swing legs, bob the upper body (slower cadence than before).
        const p = t / 1000
        const swing = Math.sin(p * 6.5) * 18
        const bob = -Math.abs(Math.sin(p * 6.5)) * 4
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
        const shake = Math.sin(s * 18) * 10
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
      className="relative left-1/2 flex h-72 w-screen -translate-x-1/2 items-end justify-center gap-2 overflow-hidden md:h-80"
    >
      {/* Soft halo behind the meeting point */}
      <div className="robot-mascot-glow pointer-events-none absolute left-1/2 top-1/2 h-56 w-72 -translate-x-1/2 -translate-y-1/2" />

      {/* Bitcoin — enters from the far left screen edge */}
      <div
        className="relative h-full"
        style={{
          transform: `translateX(${arrived ? '0px' : '-58vw'})`,
          transition: `transform ${WALK_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        <svg viewBox="0 0 150 210" className="h-full w-auto drop-shadow-2xl" aria-hidden="true">
          <defs>
            {/* Beveled coin: bright rim, glossy face, deep bottom shade */}
            <linearGradient id="hs-coin-edge" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="50%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#5c2705" />
            </linearGradient>
            <radialGradient id="hs-coin" cx="38%" cy="30%" r="82%">
              <stop offset="0%" stopColor="#fffdf2" />
              <stop offset="30%" stopColor="#fde68a" />
              <stop offset="66%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#a15207" />
            </radialGradient>
            <linearGradient id="hs-coin-limb" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#8a3d06" />
            </linearGradient>
            <linearGradient id="hs-coin-gloss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          <g ref={bLegL}>
            <rect x="59" y="138" width="12" height="44" rx="6" fill="url(#hs-coin-limb)" />
            <ellipse cx="61" cy="186" rx="13" ry="7" fill="#4a1f04" />
            <ellipse cx="59" cy="184" rx="6" ry="3" fill="#fbbf24" opacity="0.6" />
          </g>
          <g ref={bLegR}>
            <rect x="81" y="138" width="12" height="44" rx="6" fill="url(#hs-coin-limb)" />
            <ellipse cx="89" cy="186" rx="13" ry="7" fill="#4a1f04" />
            <ellipse cx="87" cy="184" rx="6" ry="3" fill="#fbbf24" opacity="0.6" />
          </g>

          <g ref={bBob}>
            {/* Left arm (outer) */}
            <rect x="18" y="90" width="32" height="11" rx="5.5" fill="url(#hs-coin-limb)" transform="rotate(18 30 96)" />
            <circle cx="20" cy="99" r="7" fill="#fbbf24" stroke="#7c3a08" strokeWidth="1.4" />
            {/* Right arm (inner — the handshake arm) */}
            <g ref={bArm}>
              <rect x="100" y="90" width="36" height="11" rx="5.5" fill="url(#hs-coin-limb)" />
              <circle cx="137" cy="96" r="8" fill="#fbbf24" stroke="#7c3a08" strokeWidth="1.5" />
            </g>

            {/* Coin body — thick beveled edge then glossy raised face */}
            <circle cx="75" cy="90" r="52" fill="url(#hs-coin-edge)" />
            <circle cx="75" cy="88" r="48" fill="url(#hs-coin)" />
            <circle cx="75" cy="88" r="48" fill="none" stroke="#fffdf2" strokeWidth="1.6" opacity="0.5" />
            <circle cx="75" cy="88" r="39" fill="none" stroke="#7c3a08" strokeWidth="2" opacity="0.4" />
            <path d="M40 62 A46 46 0 0 1 96 48" fill="none" stroke="url(#hs-coin-gloss)" strokeWidth="10" strokeLinecap="round" />
            <text
              x="75"
              y="106"
              textAnchor="middle"
              fontSize="50"
              fontWeight="700"
              fill="#7c3a08"
              fontFamily="Georgia, 'Times New Roman', serif"
            >
              ₿
            </text>
            {/* Eyes */}
            <ellipse cx="60" cy="66" rx="8" ry="8.5" fill="#fff" />
            <ellipse cx="90" cy="66" rx="8" ry="8.5" fill="#fff" />
            <circle cx="61" cy="67" r="3.6" fill="#1c1917" />
            <circle cx="91" cy="67" r="3.6" fill="#1c1917" />
            <circle cx="62.6" cy="65.4" r="1.3" fill="#fff" />
            <circle cx="92.6" cy="65.4" r="1.3" fill="#fff" />
          </g>
        </svg>
      </div>

      {/* Robot — enters from the far right screen edge */}
      <div
        className="relative h-full"
        style={{
          transform: `translateX(${arrived ? '0px' : '58vw'})`,
          transition: `transform ${WALK_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        <svg viewBox="0 0 150 210" className="h-full w-auto drop-shadow-2xl" aria-hidden="true">
          <defs>
            {/* Glossy white-and-teal robot with a wide dark visor */}
            <radialGradient id="hs-body" cx="36%" cy="24%" r="88%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="42%" stopColor="#eef2f5" />
              <stop offset="100%" stopColor="#94a3b8" />
            </radialGradient>
            <radialGradient id="hs-head" cx="38%" cy="22%" r="90%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#eaf0f4" />
              <stop offset="100%" stopColor="#9aa8b8" />
            </radialGradient>
            <linearGradient id="hs-limb" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#7c8a9a" />
            </linearGradient>
            <radialGradient id="hs-visor" cx="50%" cy="32%" r="85%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="55%" stopColor="#0b1120" />
              <stop offset="100%" stopColor="#030407" />
            </radialGradient>
            <linearGradient id="hs-gloss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          <g ref={rLegL}>
            <rect x="59" y="150" width="12" height="40" rx="6" fill="url(#hs-limb)" />
            <ellipse cx="63" cy="192" rx="14" ry="7" fill="#334155" />
            <ellipse cx="60" cy="190" rx="6" ry="3" fill="#f1f5f9" opacity="0.6" />
          </g>
          <g ref={rLegR}>
            <rect x="79" y="150" width="12" height="40" rx="6" fill="url(#hs-limb)" />
            <ellipse cx="87" cy="192" rx="14" ry="7" fill="#334155" />
            <ellipse cx="84" cy="190" rx="6" ry="3" fill="#f1f5f9" opacity="0.6" />
          </g>

          <g ref={rBob}>
            {/* Right arm (outer) */}
            <rect x="98" y="112" width="30" height="12" rx="6" fill="url(#hs-limb)" transform="rotate(-16 100 116)" />
            <circle cx="126" cy="106" r="7" fill="#e2e8f0" stroke="#7c8a9a" strokeWidth="1.3" />
            {/* Left arm (inner — the handshake arm) */}
            <g ref={rArm}>
              <rect x="20" y="112" width="34" height="12" rx="6" fill="url(#hs-limb)" />
              <circle cx="21" cy="118" r="8" fill="#e2e8f0" stroke="#7c8a9a" strokeWidth="1.4" />
            </g>

            {/* Capsule torso with teal chest panel */}
            <rect x="50" y="102" width="50" height="58" rx="24" fill="url(#hs-body)" />
            <path d="M60 108 A24 24 0 0 1 90 106" fill="none" stroke="url(#hs-gloss)" strokeWidth="8" strokeLinecap="round" />
            <rect x="61" y="120" width="28" height="26" rx="13" fill="#0b1120" />
            <circle cx="75" cy="133" r="6.5" fill="#22d3ee">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="75" cy="133" r="10" fill="none" stroke="#22d3ee" strokeWidth="1.4" opacity="0.5" />

            {/* Head (tracks the mouse) */}
            <g ref={rHead}>
              <line x1="75" y1="28" x2="75" y2="40" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="75" cy="24" r="5" fill="#22d3ee">
                <animate attributeName="r" values="4;6;4" dur="1.8s" repeatCount="indefinite" />
              </circle>
              {/* Dome head */}
              <path d="M48 74 Q48 40 75 40 Q102 40 102 74 Z" fill="url(#hs-head)" />
              <rect x="48" y="70" width="54" height="20" rx="10" fill="url(#hs-head)" />
              <path d="M58 50 Q66 44 78 46" fill="none" stroke="url(#hs-gloss)" strokeWidth="6" strokeLinecap="round" />
              {/* Side ears */}
              <rect x="42" y="60" width="8" height="18" rx="4" fill="url(#hs-limb)" />
              <rect x="100" y="60" width="8" height="18" rx="4" fill="url(#hs-limb)" />
              <circle cx="46" cy="69" r="3" fill="#22d3ee" opacity="0.8" />
              <circle cx="104" cy="69" r="3" fill="#22d3ee" opacity="0.8" />
              {/* Wide glossy visor */}
              <rect x="54" y="54" width="42" height="30" rx="15" fill="url(#hs-visor)" />
              <ellipse cx="66" cy="61" rx="11" ry="5" fill="#ffffff" opacity="0.1" />
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
