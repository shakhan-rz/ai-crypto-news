'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, Environment, Lightformer } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

// A CRT scanline + vignette overlay drawn once to a canvas texture. Gives the
// glass a real "powered-on tube" feel instead of a flat rectangle.
function useScreenTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 256
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, 256, 256)
    // horizontal scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.28)'
    for (let y = 0; y < 256; y += 3) ctx.fillRect(0, y, 256, 1)
    // vignette darkening toward the edges
    const g = ctx.createRadialGradient(128, 128, 60, 128, 128, 170)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, 'rgba(0,0,0,0.55)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
}

function Monitor() {
  const group = useRef<THREE.Group>(null)
  const eyes = useRef<THREE.Group>(null)
  const leftPupil = useRef<THREE.Mesh>(null)
  const rightPupil = useRef<THREE.Mesh>(null)
  const target = useRef({ x: 0, y: 0 })

  const clock = useRef(0)
  const nextBlink = useRef(2.5)
  const blinkStart = useRef(-10)

  const scanTex = useScreenTexture()

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX / window.innerWidth - 0.5
      target.current.y = e.clientY / window.innerHeight - 0.5
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame((_, delta) => {
    clock.current += delta
    const t = clock.current

    // Head follows cursor + gentle bob.
    const g = group.current
    if (g) {
      g.rotation.y += (target.current.x * 0.9 - g.rotation.y) * 0.06
      g.rotation.x += (-target.current.y * 0.55 - g.rotation.x) * 0.06
      g.position.y = Math.sin(t * 1.1) * 0.07
    }

    // Pupils drift toward the cursor so the gaze feels alive.
    const gx = THREE.MathUtils.clamp(target.current.x, -0.5, 0.5) * 0.14
    const gy = THREE.MathUtils.clamp(-target.current.y, -0.5, 0.5) * 0.1
    if (leftPupil.current) leftPupil.current.position.set(-0.42 + gx, 0.32 + gy, 1.14)
    if (rightPupil.current) rightPupil.current.position.set(0.42 + gx, 0.32 + gy, 1.14)

    // Occasional blink: quick close then open over ~0.2s.
    if (t > nextBlink.current) {
      nextBlink.current = t + 2.5 + Math.random() * 3.5
      blinkStart.current = t
    }
    const bt = t - blinkStart.current
    let open = 1
    if (bt < 0.2) {
      const p = bt / 0.2
      open = p < 0.5 ? 1 - p * 2 * 0.94 : 0.06 + (p - 0.5) * 2 * 0.94
    }
    if (eyes.current) eyes.current.scale.y = open
  })

  return (
    <group ref={group}>
      {/* Body */}
      <RoundedBox args={[2.4, 2.35, 2]} radius={0.18} smoothness={8}>
        <meshStandardMaterial color="#dcd7c9" roughness={0.42} metalness={0.2} envMapIntensity={1.1} />
      </RoundedBox>

      {/* Screen recess / bezel */}
      <RoundedBox args={[2.0, 1.65, 0.28]} radius={0.12} smoothness={6} position={[0, 0.3, 0.92]}>
        <meshStandardMaterial color="#171a15" roughness={0.4} metalness={0.25} />
      </RoundedBox>

      {/* Phosphor glass */}
      <mesh position={[0, 0.3, 1.07]}>
        <planeGeometry args={[1.74, 1.4]} />
        <meshStandardMaterial
          color="#2f3a2c"
          emissive="#3d4f35"
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* Eyes (whites) + pupils */}
      <group ref={eyes}>
        <mesh position={[-0.42, 0.32, 1.11]} scale={[1, 1.45, 1]}>
          <circleGeometry args={[0.24, 48]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffe9f1" emissiveIntensity={2.6} toneMapped={false} />
        </mesh>
        <mesh position={[0.42, 0.32, 1.11]} scale={[1, 1.45, 1]}>
          <circleGeometry args={[0.24, 48]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffe9f1" emissiveIntensity={2.6} toneMapped={false} />
        </mesh>
        <mesh ref={leftPupil} position={[-0.42, 0.32, 1.14]}>
          <circleGeometry args={[0.08, 32]} />
          <meshBasicMaterial color="#2a2320" />
        </mesh>
        <mesh ref={rightPupil} position={[0.42, 0.32, 1.14]}>
          <circleGeometry args={[0.08, 32]} />
          <meshBasicMaterial color="#2a2320" />
        </mesh>
      </group>

      {/* Scanline + vignette overlay */}
      <mesh position={[0, 0.3, 1.16]}>
        <planeGeometry args={[1.74, 1.4]} />
        <meshBasicMaterial map={scanTex} transparent opacity={0.85} depthWrite={false} />
      </mesh>

      {/* Lower control panel */}
      <mesh position={[0, -0.98, 1.005]}>
        <planeGeometry args={[2.0, 0.6]} />
        <meshStandardMaterial color="#cfc9ba" roughness={0.55} metalness={0.15} envMapIntensity={1} />
      </mesh>
      {/* Disk slot */}
      <mesh position={[0, -0.98, 1.02]}>
        <planeGeometry args={[1.15, 0.1]} />
        <meshStandardMaterial color="#7f796b" roughness={0.7} />
      </mesh>
    </group>
  )
}

export default function TvHead3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 32 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 5, 5]} intensity={1.2} />
      <directionalLight position={[-5, 1, 3]} intensity={0.4} color="#ffcf94" />

      {/* Procedural reflections (no external HDR download) so the plastic and
          glass pick up realistic highlights. */}
      <Environment resolution={128}>
        <Lightformer position={[0, 3, 4]} scale={6} intensity={2} color="#ffffff" />
        <Lightformer position={[-4, 0, 3]} scale={4} intensity={1.2} color="#ffdca8" />
        <Lightformer position={[4, -1, 2]} scale={4} intensity={0.8} color="#a8c4ff" />
      </Environment>

      <Suspense fallback={null}>
        <Monitor />
      </Suspense>
    </Canvas>
  )
}
