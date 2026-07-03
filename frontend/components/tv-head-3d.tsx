'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { Suspense, useEffect, useRef } from 'react'
import * as THREE from 'three'

// A real 3D retro CRT monitor "head". It rotates to follow the cursor anywhere
// on the page (not just over the canvas) and bobs gently. Built from primitives:
// a beige body, a recessed dark screen, and two emissive eyes that glow.
function Monitor() {
  const group = useRef<THREE.Group>(null)
  const target = useRef({ x: 0, y: 0 })
  const clock = useRef(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX / window.innerWidth - 0.5
      target.current.y = e.clientY / window.innerHeight - 0.5
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return
    const ty = target.current.x * 1.1
    const tx = target.current.y * 0.7
    g.rotation.y += (ty - g.rotation.y) * 0.07
    g.rotation.x += (tx - g.rotation.x) * 0.07
    clock.current += delta
    g.position.y = Math.sin(clock.current * 1.2) * 0.08
  })

  return (
    <group ref={group}>
      {/* Body */}
      <RoundedBox args={[2.4, 2.3, 2]} radius={0.16} smoothness={6}>
        <meshStandardMaterial color="#d7d2c4" roughness={0.5} metalness={0.15} />
      </RoundedBox>

      {/* Recessed dark screen frame */}
      <RoundedBox args={[1.95, 1.6, 0.25]} radius={0.1} smoothness={5} position={[0, 0.28, 0.95]}>
        <meshStandardMaterial color="#1d211b" roughness={0.35} metalness={0.2} />
      </RoundedBox>

      {/* Glass */}
      <mesh position={[0, 0.28, 1.08]}>
        <planeGeometry args={[1.72, 1.36]} />
        <meshStandardMaterial
          color="#3b463a"
          emissive="#48583f"
          emissiveIntensity={0.3}
          roughness={0.12}
          metalness={0.1}
        />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.42, 0.32, 1.11]} scale={[1, 1.4, 1]}>
        <circleGeometry args={[0.22, 40]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffe3ee" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
      <mesh position={[0.42, 0.32, 1.11]} scale={[1, 1.4, 1]}>
        <circleGeometry args={[0.22, 40]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffe3ee" emissiveIntensity={2.4} toneMapped={false} />
      </mesh>

      {/* Lower control panel */}
      <mesh position={[0, -0.95, 1.005]}>
        <planeGeometry args={[1.95, 0.55]} />
        <meshStandardMaterial color="#cbc5b6" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Disk slot */}
      <mesh position={[0, -0.95, 1.02]}>
        <planeGeometry args={[1.1, 0.09]} />
        <meshStandardMaterial color="#8f897b" roughness={0.7} />
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
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 5, 5]} intensity={1.5} />
      <directionalLight position={[-5, 2, 3]} intensity={0.6} color="#ffd39a" />
      <pointLight position={[0, 1, 4]} intensity={0.7} />
      <Suspense fallback={null}>
        <Monitor />
      </Suspense>
    </Canvas>
  )
}
