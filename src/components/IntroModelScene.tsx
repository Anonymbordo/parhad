import './IntroModelScene.css'

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

export default function IntroModelScene({ focus = null }: { focus?: FocusTarget | null }) {
  void focus

  return (
    <div className="logo-scene-shell" aria-hidden="true">
      <div className="logo-scene-halo logo-scene-halo-red" />
      <div className="logo-scene-halo logo-scene-halo-blue" />
      <div className="logo-scene-halo logo-scene-halo-white" />

      <div className="logo-scene-float">
        <img
          src="/parhad-logo-round-white.png"
          alt="PARHAD"
          className="logo-scene-img"
        />
      </div>
    </div>
  )
}
