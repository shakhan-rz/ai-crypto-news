'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4'

// Horizontal mouse movement scrubs the video timeline instead of it autoplaying.
// Higher = a small mouse move covers more of the clip.
const SENSITIVITY = 0.8

export function VideoBackground({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    // Const alias keeps the non-null narrowing inside the closures below —
    // otherwise TS widens it back to `HTMLVideoElement | null`.
    const el = video

    let prevX: number | null = null
    let targetTime = 0
    let seeking = false

    const seekToTarget = () => {
      const dur = el.duration
      if (!dur || Number.isNaN(dur)) return
      const clamped = Math.max(0, Math.min(targetTime, dur))
      if (Math.abs(clamped - el.currentTime) < 0.01) {
        seeking = false
        return
      }
      seeking = true
      el.currentTime = clamped
    }

    const onMove = (e: MouseEvent) => {
      const dur = el.duration
      if (prevX === null || !dur || Number.isNaN(dur)) {
        prevX = e.clientX
        return
      }
      const delta = e.clientX - prevX
      prevX = e.clientX
      targetTime = Math.max(
        0,
        Math.min(targetTime + (delta / window.innerWidth) * SENSITIVITY * dur, dur)
      )
      // Only kick off a seek if one isn't already in flight; onSeeked drains the rest.
      if (!seeking) seekToTarget()
    }

    // When a seek finishes, chase the latest target so fast mouse moves don't
    // flood the decoder with seeks it can't keep up with.
    const onSeeked = () => {
      const dur = el.duration || 0
      const clamped = Math.max(0, Math.min(targetTime, dur))
      if (Math.abs(clamped - el.currentTime) > 0.01) seekToTarget()
      else seeking = false
    }

    window.addEventListener('mousemove', onMove)
    el.addEventListener('seeked', onSeeked)
    return () => {
      window.removeEventListener('mousemove', onMove)
      el.removeEventListener('seeked', onSeeked)
    }
  }, [])

  return (
    <video
      ref={videoRef}
      src={VIDEO_SRC}
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      className={cn('pointer-events-none fixed inset-0 h-full w-full object-cover', className)}
      style={{ objectPosition: '70% center' }}
    />
  )
}
