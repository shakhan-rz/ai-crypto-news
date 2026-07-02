'use client'

import { SplineScene } from '@/components/ui/splite'

// The original glossy black 3D robot (Spline WebGL scene). It follows the
// pointer natively. Hidden on small screens — the scene is ~2MB + its own GPU
// context, too heavy for phones next to the shader background.
export function HeroScene() {
  return (
    <div className="relative hidden h-[340px] w-[340px] shrink-0 md:block md:h-[400px] md:w-[420px]">
      {/* Soft halo behind the robot */}
      <div className="robot-mascot-glow pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2" />
      <div className="robot-mascot-float relative h-full w-full" style={{ filter: 'contrast(0.9) brightness(0.95)' }}>
        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="h-full w-full"
        />
      </div>
    </div>
  )
}
