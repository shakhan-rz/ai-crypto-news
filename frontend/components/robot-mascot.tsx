'use client'

import { useEffect, useRef, useState } from 'react'

// A lightweight SVG robot whose head tilts and eyes track the mouse.
// No WebGL — cheap enough to run anywhere and looks right in both themes.
export function RobotMascot() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<SVGGElement>(null)
  const leftPupil = useRef<SVGCircleElement>(null)
  const rightPupil = useRef<SVGCircleElement>(null)

  // Target and current (smoothed) gaze, in normalized [-1, 1] range.
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const raf = useRef<number | null>(null)

  const [blink, setBlink] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function onMove(e: PointerEvent) {
      const el = wrapRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height * 0.42 // head sits in the upper part
      // Normalize by a comfortable radius so far-away cursors clamp to the edge.
      target.current.x = clamp((e.clientX - cx) / (r.width * 0.9), -1, 1)
      target.current.y = clamp((e.clientY - cy) / (r.height * 0.9), -1, 1)
    }

    function tick() {
      // Ease current toward target for a smooth, weighty follow.
      current.current.x += (target.current.x - current.current.x) * 0.12
      current.current.y += (target.current.y - current.current.y) * 0.12
      const { x, y } = current.current

      // SVG groups honor the transform *attribute*, not the CSS transform
      // property — set it directly. rotate() takes the pivot in user units.
      if (headRef.current) {
        headRef.current.setAttribute(
          'transform',
          `translate(${x * 6} ${y * 5}) rotate(${x * 6} 100 120)`
        )
      }
      const px = x * 6
      const py = y * 5
      if (leftPupil.current) {
        leftPupil.current.setAttribute('transform', `translate(${px} ${py})`)
      }
      if (rightPupil.current) {
        rightPupil.current.setAttribute('transform', `translate(${px} ${py})`)
      }
      raf.current = requestAnimationFrame(tick)
    }

    // Occasional blink.
    let blinkTimer: ReturnType<typeof setTimeout>
    function scheduleBlink() {
      blinkTimer = setTimeout(() => {
        setBlink(true)
        setTimeout(() => setBlink(false), 140)
        scheduleBlink()
      }, 2600 + Math.random() * 3200)
    }

    if (!reduce) {
      window.addEventListener('pointermove', onMove)
      raf.current = requestAnimationFrame(tick)
      scheduleBlink()
    }

    return () => {
      window.removeEventListener('pointermove', onMove)
      if (raf.current) cancelAnimationFrame(raf.current)
      clearTimeout(blinkTimer)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      className="robot-mascot-float relative mx-auto flex h-64 w-64 items-center justify-center md:h-80 md:w-80"
    >
      {/* Soft glow behind the robot */}
      <div className="robot-mascot-glow pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 md:h-64 md:w-64" />

      <svg
        viewBox="0 0 200 220"
        className="relative h-full w-full drop-shadow-xl"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="rm-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f4f4f5" />
            <stop offset="100%" stopColor="#a1a1aa" />
          </linearGradient>
          <linearGradient id="rm-head" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fafafa" />
            <stop offset="100%" stopColor="#c7c7cc" />
          </linearGradient>
          <radialGradient id="rm-visor" cx="50%" cy="40%" r="75%">
            <stop offset="0%" stopColor="#1f2937" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>
        </defs>

        {/* Torso */}
        <g>
          <rect x="62" y="150" width="76" height="56" rx="20" fill="url(#rm-body)" />
          <circle cx="100" cy="178" r="9" fill="#0a0a0a" />
          <circle cx="100" cy="178" r="4.5" fill="#fb923c">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite" />
          </circle>
          {/* Shoulders / arms */}
          <rect x="44" y="156" width="16" height="38" rx="8" fill="url(#rm-body)" />
          <rect x="140" y="156" width="16" height="38" rx="8" fill="url(#rm-body)" />
        </g>

        {/* Head (this whole group follows the mouse) */}
        <g ref={headRef}>
          {/* Antenna */}
          <line x1="100" y1="34" x2="100" y2="50" stroke="#a1a1aa" strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="30" r="6" fill="#fb923c">
            <animate attributeName="r" values="5;7;5" dur="1.8s" repeatCount="indefinite" />
          </circle>

          {/* Head shell */}
          <rect x="52" y="50" width="96" height="84" rx="30" fill="url(#rm-head)" />
          {/* Ears */}
          <rect x="44" y="80" width="10" height="26" rx="5" fill="#a1a1aa" />
          <rect x="146" y="80" width="10" height="26" rx="5" fill="#a1a1aa" />

          {/* Visor */}
          <rect x="64" y="66" width="72" height="50" rx="24" fill="url(#rm-visor)" />

          {/* Eyes */}
          {blink ? (
            <>
              <rect x="78" y="90" width="14" height="3.5" rx="1.75" fill="#fb923c" />
              <rect x="108" y="90" width="14" height="3.5" rx="1.75" fill="#fb923c" />
            </>
          ) : (
            <>
              <circle ref={leftPupil} cx="85" cy="90" r="7" fill="#fb923c" style={{ filter: 'drop-shadow(0 0 4px #fb923c)' }} />
              <circle ref={rightPupil} cx="115" cy="90" r="7" fill="#fb923c" style={{ filter: 'drop-shadow(0 0 4px #fb923c)' }} />
            </>
          )}
        </g>
      </svg>
    </div>
  )
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}
