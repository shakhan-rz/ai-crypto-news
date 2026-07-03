'use client'

import { useEffect, useRef } from 'react'

// The retro TV-head mascot. It's a flat PNG, so we fake life two ways: an idle
// bob (CSS float animation on the outer layer) plus a cursor-follow tilt + shift
// on the inner layer, driven by pointer movement anywhere on the page. The two
// transforms live on separate elements so they don't overwrite each other.
export function HeroScene() {
  const inner = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = inner.current
    if (!el) return

    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5 // -0.5..0.5
      const ny = e.clientY / window.innerHeight - 0.5
      el.style.transform =
        `perspective(700px) rotateY(${nx * 24}deg) rotateX(${-ny * 16}deg) ` +
        `translate3d(${nx * 44}px, ${ny * 26}px, 0)`
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div className="relative h-[280px] w-[280px] shrink-0 sm:h-[340px] sm:w-[340px] md:h-[400px] md:w-[420px]">
      {/* Soft halo behind the head */}
      <div className="robot-mascot-glow pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2" />
      {/* Idle bob */}
      <div className="robot-mascot-float h-full w-full">
        {/* Cursor-follow tilt + shift */}
        <div
          ref={inner}
          className="h-full w-full transition-transform duration-200 ease-out will-change-transform"
          style={{
            maskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/tv-head.png"
            alt="Retro TV-head mascot"
            className="h-full w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
          />
        </div>
      </div>
    </div>
  )
}
