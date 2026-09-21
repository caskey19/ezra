import { Canvas, useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import type { Points } from "three"
import { useDocumentHidden, usePrefersReducedMotion } from "../motion/usePrefersReducedMotion.ts"

function Field({ paused }: { paused: boolean }) {
  const near = useRef<Points>(null)
  const far = useRef<Points>(null)
  const count = 720

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 16
      arr[i * 3 + 1] = (Math.random() - 0.5) * 9
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    return arr
  }, [])

  const mist = useMemo(() => {
    const arr = new Float32Array(220 * 3)
    for (let i = 0; i < 220; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1
    }
    return arr
  }, [])

  useFrame((_, dt) => {
    if (paused) return
    if (near.current) {
      near.current.rotation.y += dt * 0.018
      near.current.rotation.x += dt * 0.006
    }
    if (far.current) {
      far.current.rotation.y -= dt * 0.01
    }
  })

  return (
    <>
      <fog attach="fog" args={["#07080b", 3.5, 13]} />
      <points ref={near}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.028}
          color="#d4c4a8"
          transparent
          opacity={0.42}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      <points ref={far}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[mist, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#8fb7ff"
          transparent
          opacity={0.12}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </>
  )
}

export function Atmosphere() {
  const reduced = usePrefersReducedMotion()
  const hidden = useDocumentHidden()

  if (reduced) {
    return (
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 600px at 70% 20%, rgba(212,196,168,0.08), transparent 55%), radial-gradient(900px 500px at 10% 90%, rgba(143,183,255,0.06), transparent 50%)",
        }}
      />
    )
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        frameloop={hidden ? "never" : "always"}
      >
        <Field paused={hidden} />
      </Canvas>
    </div>
  )
}
