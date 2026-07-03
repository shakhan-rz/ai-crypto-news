'use client'

import dynamic from 'next/dynamic'

// The 3D CRT monitor is WebGL-only, so load it client-side (no SSR) to avoid
// rendering three.js on the server.
const TvHead3D = dynamic(() => import('@/components/tv-head-3d'), { ssr: false })

// The retro TV-head mascot as a real 3D monitor that follows the cursor and
// bobs. Hidden on small screens to keep the hero compact and skip the GPU cost.
export function HeroScene() {
  return (
    <div className="relative hidden h-[340px] w-[340px] shrink-0 md:block md:h-[420px] md:w-[440px]">
      {/* Soft halo behind the head */}
      <div className="robot-mascot-glow pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2" />
      <TvHead3D />
    </div>
  )
}
