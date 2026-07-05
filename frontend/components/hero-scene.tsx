'use client'

import { useEffect, useRef, useState } from 'react'
import { SplineScene } from '@/components/ui/splite'

// The original glossy black 3D robot (Spline WebGL scene). Spline only tracks
// the pointer while it's over the canvas, so we forward the whole page's mouse
// movement into the canvas — that way the robot follows the cursor anywhere on
// the page, not just inside its own box.
//
// Hidden on small screens: the scene is ~2MB + its own GPU context, too heavy
// for phones next to the shader background.
export function HeroScene() {
  const wrap = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  // The Spline scene plays a close-up intro zoom on load; at its closest the
  // head fills the canvas and its hard edges read as a "box". Keep the robot
  // hidden until the camera has pulled back, then fade it in.
  const [revealed, setRevealed] = useState(false)
  // The wrapper is CSS-hidden below md, but React would still download the
  // ~2MB Spline runtime + scene. Skip mounting it entirely on small screens.
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    setIsDesktop(window.matchMedia('(min-width: 768px)').matches)
  }, [])

  useEffect(() => {
    const id = setTimeout(() => setRevealed(true), 1700)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    function onMove(e: PointerEvent) {
      // Ignore the synthetic events we dispatch below to avoid a feedback loop.
      if (!e.isTrusted) return
      const canvas = canvasRef.current
      if (!canvas) return
      const opts = {
        clientX: e.clientX,
        clientY: e.clientY,
        bubbles: true,
        pointerType: 'mouse',
      }
      canvas.dispatchEvent(new PointerEvent('pointermove', opts))
      canvas.dispatchEvent(new MouseEvent('mousemove', opts))
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div
      ref={wrap}
      className="relative hidden h-[340px] w-[340px] shrink-0 md:block md:h-[400px] md:w-[420px]"
    >
      {/* Soft halo behind the robot */}
      <div className="robot-mascot-glow pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2" />
      <div
        className="robot-mascot-float relative h-full w-full transition-opacity duration-1000 ease-out"
        style={{
          opacity: revealed ? 1 : 0,
          filter: 'contrast(0.9) brightness(0.95)',
          // Two masks combined: a radial feather softens the side/top edges so
          // shoulders/arms don't show a hard rectangular cut, and a strong
          // linear bottom fade dissolves the lower body/legs into the
          // background around waist level — so no feet or bottom box edge ever
          // appears.
          maskImage:
            'linear-gradient(to bottom, black 0%, black 80%, transparent 98%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 0%, black 80%, transparent 98%)',
        }}
      >
        {isDesktop && (
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="h-full w-full"
            onLoad={() => {
              canvasRef.current = wrap.current?.querySelector('canvas') ?? null
            }}
          />
        )}
      </div>
    </div>
  )
}
