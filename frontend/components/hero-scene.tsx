'use client'

import { useEffect, useRef } from 'react'
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
        className="robot-mascot-float relative h-full w-full"
        style={{
          filter: 'contrast(0.9) brightness(0.95)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 78%, transparent 98%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 78%, transparent 98%)',
        }}
      >
        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="h-full w-full"
          onLoad={() => {
            canvasRef.current = wrap.current?.querySelector('canvas') ?? null
          }}
        />
      </div>
    </div>
  )
}
