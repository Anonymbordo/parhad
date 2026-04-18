import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, useAnimations, useGLTF } from '@react-three/drei'
import { Box3, Group, MathUtils, PerspectiveCamera, Vector3 } from 'three'

type FocusTarget = {
  groupX: number
  groupY: number
  cameraX: number
  cameraY: number
  cameraZ: number
  lookAtY: number
  rotationY: number
  rotationX: number
  fov: number
}

function ModelContent({ focus }: { focus: FocusTarget | null }) {
  const rootRef = useRef<Group>(null)
  const modelRef = useRef<Group>(null)
  const { scene, animations } = useGLTF('/cauda-equina.glb')
  const clonedScene = useMemo(() => scene.clone(true), [scene])
  const { actions } = useAnimations(animations, modelRef)

  useEffect(() => {
    const activeActions = Object.values(actions).filter(
      (action): action is NonNullable<typeof action> => action !== null,
    )

    activeActions.forEach((action) => {
      action.reset().fadeIn(0.6).play()
    })

    return () => {
      activeActions.forEach((action) => {
        action.fadeOut(0.35)
      })
    }
  }, [actions])

  useLayoutEffect(() => {
    if (!modelRef.current) {
      return
    }

    const box = new Box3().setFromObject(modelRef.current)
    const size = new Vector3()
    const center = new Vector3()

    box.getSize(size)
    box.getCenter(center)

    const maxAxis = Math.max(size.x, size.y, size.z) || 1
    const scale = 5.25 / maxAxis

    modelRef.current.position.set(-center.x, -center.y + size.y * 0.14, -center.z)
    modelRef.current.scale.setScalar(scale)
  }, [clonedScene])

  useFrame((state) => {
    if (!rootRef.current) {
      return
    }

    const elapsed = state.clock.getElapsedTime()
    const targetGroupX = focus?.groupX ?? 0
    const targetGroupY = focus?.groupY ?? 0
    const targetCameraX = focus?.cameraX ?? 0
    const targetCameraY = focus?.cameraY ?? 0.2
    const targetCameraZ = focus?.cameraZ ?? 7.6
    const targetLookAtY = focus?.lookAtY ?? -0.08
    const targetRotationY = focus?.rotationY ?? 0
    const targetRotationX = focus?.rotationX ?? -0.08
    const targetFov = focus?.fov ?? 22
    const camera = state.camera as PerspectiveCamera

    rootRef.current.position.x = MathUtils.lerp(rootRef.current.position.x, targetGroupX, 0.06)
    rootRef.current.position.y = MathUtils.lerp(
      rootRef.current.position.y,
      targetGroupY + Math.sin(elapsed * 0.55) * 0.08,
      0.06,
    )
    rootRef.current.rotation.y = MathUtils.lerp(
      rootRef.current.rotation.y,
      targetRotationY + Math.sin(elapsed * 0.3) * 0.08,
      0.06,
    )
    rootRef.current.rotation.x = MathUtils.lerp(
      rootRef.current.rotation.x,
      targetRotationX + Math.cos(elapsed * 0.22) * 0.03,
      0.06,
    )

    camera.position.x = MathUtils.lerp(camera.position.x, targetCameraX, 0.06)
    camera.position.y = MathUtils.lerp(camera.position.y, targetCameraY, 0.06)
    camera.position.z = MathUtils.lerp(camera.position.z, targetCameraZ, 0.06)
    camera.fov = MathUtils.lerp(camera.fov, targetFov, 0.06)
    camera.lookAt(0, targetLookAtY, 0)
    camera.updateProjectionMatrix()
  })

  return (
    <Float speed={1.1} rotationIntensity={0.1} floatIntensity={0.12}>
      <group ref={rootRef}>
        <group ref={modelRef}>
          <primitive object={clonedScene} />
        </group>
      </group>
    </Float>
  )
}

function SceneFallback() {
  return (
    <div className="intro-model-fallback" aria-hidden="true">
      <img src="/parhad-logo-round-white.png" alt="" />
    </div>
  )
}

export default function IntroModelScene({ focus = null }: { focus?: FocusTarget | null }) {
  return (
    <div className="intro-model-shell" aria-hidden="true">
      <div className="intro-model-halo intro-model-halo-red" />
      <div className="intro-model-halo intro-model-halo-white" />

      <Suspense fallback={<SceneFallback />}>
        <Canvas
          className="intro-model-canvas"
          camera={{ fov: 22, position: [0, 0.2, 7.6] }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={1.05} color="#fff0f0" />
          <directionalLight position={[5, 6, 6]} intensity={3.1} color="#ffffff" />
          <directionalLight position={[-4, 1, 5]} intensity={1.65} color="#ff6b7c" />
          <pointLight position={[0, -1, 4]} intensity={1.3} color="#8ed8ff" />
          <spotLight
            position={[0, 8, 8]}
            angle={0.45}
            penumbra={0.8}
            intensity={24}
            color="#ff5c5c"
          />
          <ModelContent focus={focus} />
        </Canvas>
      </Suspense>
    </div>
  )
}

useGLTF.preload('/cauda-equina.glb')
