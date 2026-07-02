'use client'

import { useEffect, useRef } from 'react'

// A single glossy robot mascot. It stands still and tracks the pointer with its
// head and eyes. Gaze is driven by one rAF loop writing SVG transform
// attributes (CSS transforms are unreliable on SVG sub-elements).
export function HeroScene() {
  const wrap = useRef<HTMLDivElement>(null)
  const head = useRef<SVGGElement>(null)
  const pupL = useRef<SVGCircleElement>(null)
  const pupR = useRef<SVGCircleElement>(null)
  const gaze = useRef({ tx: 0, ty: 0, cx: 0, cy: 0 })
  const raf = useRef<number | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    function onMove(e: PointerEvent) {
      const c = wrap.current?.getBoundingClientRect()
      if (!c) return
      gaze.current.tx = clamp((e.clientX - (c.left + c.width / 2)) / (window.innerWidth / 2), -1, 1)
      gaze.current.ty = clamp((e.clientY - (c.top + c.height / 2)) / (window.innerHeight / 2), -1, 1)
    }
    window.addEventListener('pointermove', onMove)

    function tick() {
      const g = gaze.current
      g.cx += (g.tx - g.cx) * 0.1
      g.cy += (g.ty - g.cy) * 0.1
      setT(head.current, `translate(${g.cx * 6} ${g.cy * 4}) rotate(${g.cx * 7} 75 58)`)
      setT(pupL.current, `translate(${g.cx * 4} ${g.cy * 3})`)
      setT(pupR.current, `translate(${g.cx * 4} ${g.cy * 3})`)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <div
      ref={wrap}
      className="robot-mascot-float relative flex h-64 w-56 shrink-0 items-end justify-center md:h-72 md:w-64"
    >
      {/* Soft halo behind the robot */}
      <div className="robot-mascot-glow pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2" />

      <svg viewBox="0 0 150 200" className="h-full w-auto drop-shadow-2xl" aria-hidden="true">
        <defs>
          <radialGradient id="rb-body" cx="36%" cy="24%" r="88%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#eef2f6" />
            <stop offset="100%" stopColor="#8fa0b2" />
          </radialGradient>
          <radialGradient id="rb-head" cx="38%" cy="22%" r="90%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="52%" stopColor="#eaf0f5" />
            <stop offset="100%" stopColor="#93a4b6" />
          </radialGradient>
          <linearGradient id="rb-limb" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#7c8b9c" />
          </linearGradient>
          <radialGradient id="rb-visor" cx="50%" cy="32%" r="85%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="55%" stopColor="#0b1120" />
            <stop offset="100%" stopColor="#030407" />
          </radialGradient>
        </defs>

        {/* Legs */}
        <rect x="60" y="150" width="12" height="40" rx="6" fill="url(#rb-limb)" />
        <ellipse cx="64" cy="192" rx="13" ry="6.5" fill="#334155" />
        <rect x="79" y="150" width="12" height="40" rx="6" fill="url(#rb-limb)" />
        <ellipse cx="86" cy="192" rx="13" ry="6.5" fill="#334155" />

        {/* Arms resting at the sides */}
        <g transform="rotate(-10 52 116)">
          <rect x="46" y="114" width="12" height="30" rx="6" fill="url(#rb-limb)" />
          <circle cx="52" cy="144" r="7.5" fill="#e2e8f0" stroke="#7c8b9c" strokeWidth="1.4" />
        </g>
        <g transform="rotate(10 98 116)">
          <rect x="92" y="114" width="12" height="30" rx="6" fill="url(#rb-limb)" />
          <circle cx="98" cy="144" r="7" fill="#e2e8f0" stroke="#7c8b9c" strokeWidth="1.3" />
        </g>

        {/* Capsule torso with a glowing core */}
        <rect x="52" y="102" width="46" height="58" rx="23" fill="url(#rb-body)" />
        <path d="M62 110 A22 22 0 0 1 90 108" fill="none" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" opacity="0.85" />
        <circle cx="75" cy="133" r="11" fill="#0b1120" />
        <circle cx="75" cy="133" r="6" fill="#22d3ee">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite" />
        </circle>

        {/* Head (tracks the mouse) */}
        <g ref={head}>
          <line x1="75" y1="28" x2="75" y2="40" stroke="#93a4b6" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="75" cy="24" r="5" fill="#22d3ee">
            <animate attributeName="r" values="4;6;4" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <path d="M49 76 Q49 42 75 42 Q101 42 101 76 Z" fill="url(#rb-head)" />
          <rect x="49" y="72" width="52" height="18" rx="9" fill="url(#rb-head)" />
          <path d="M58 52 Q66 46 78 48" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
          <rect x="43" y="60" width="8" height="18" rx="4" fill="url(#rb-limb)" />
          <rect x="99" y="60" width="8" height="18" rx="4" fill="url(#rb-limb)" />
          <rect x="55" y="54" width="40" height="30" rx="15" fill="url(#rb-visor)" />
          <ellipse cx="66" cy="61" rx="10" ry="5" fill="#ffffff" opacity="0.1" />
          <circle ref={pupL} cx="67" cy="68" r="5.5" fill="#22d3ee" style={{ filter: 'drop-shadow(0 0 4px #22d3ee)' }} />
          <circle ref={pupR} cx="83" cy="68" r="5.5" fill="#22d3ee" style={{ filter: 'drop-shadow(0 0 4px #22d3ee)' }} />
        </g>
      </svg>
    </div>
  )
}

function setT(el: SVGElement | null, value: string) {
  if (el) el.setAttribute('transform', value)
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}
