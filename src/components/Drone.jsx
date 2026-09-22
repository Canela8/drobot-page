import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useScroll } from '@react-three/drei';
import { Box3, Vector3, MathUtils } from 'three';
import { clone } from 'three/addons/utils/SkeletonUtils.js';

// Posiciones como fracciones del viewport 3D; rotaciones en radianes.
const shots = [
  { x: .23, y: .05, rotation: [.15, -.55, -.12] },
  { x: -.24, y: -.03, rotation: [.3, .75, .12] },
  { x: .26, y: -.14, rotation: [.15, 2.2, -.1] },
  { x: .23, y: -.22, rotation: [.05, 3.6, .04] },
];
export default function Drone({ reducedMotion }) {
  const group = useRef();
  const scroll = useScroll();
  const { viewport, size } = useThree();
  const { scene } = useGLTF('/drone.glb');
  const model = useMemo(() => {
    const object = clone(scene);
    const box = new Box3().setFromObject(object);
    const center = box.getCenter(new Vector3());
    const dimensions = box.getSize(new Vector3());
    return { object, center: center.multiplyScalar(-1), unit: 1 / Math.max(dimensions.x, dimensions.y, dimensions.z, .001) };
  }, [scene]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    // offset ya está suavizado por damping en ScrollControls.
    const progress = reducedMotion ? 0 : MathUtils.clamp(scroll.offset, 0, 1) * (shots.length - 1);
    const index = Math.min(Math.floor(progress), shots.length - 2);
    const t = MathUtils.smoothstep(progress - index, 0, 1);
    const a = shots[index], b = shots[index + 1];
    const mobile = size.width < 760;
    const time = clock.elapsedTime;
    const hoverY = reducedMotion ? 0 : Math.sin(time * 1.25) * .065;
    const hoverX = reducedMotion ? 0 : Math.sin(time * .7) * .025;
    group.current.position.set(
      (mobile ? 0 : MathUtils.lerp(a.x, b.x, t) * viewport.width) + hoverX,
      (mobile ? -.28 : MathUtils.lerp(a.y, b.y, t)) * viewport.height + hoverY,
      0,
    );
    group.current.rotation.set(...a.rotation.map((angle, i) => MathUtils.lerp(angle, b.rotation[i], t)));
    if (!reducedMotion) {
      group.current.rotation.x += Math.sin(time * .85) * .015;
      group.current.rotation.z += Math.sin(time * 1.1) * .012;
    }
    group.current.scale.setScalar(
      Math.min(
        viewport.width * (mobile ? .68 : .43),
        viewport.height * .62
      ) * model.unit * 1.3
    );
  });
  return <group ref={group}><group position={model.center}><primitive object={model.object} dispose={null} /></group></group>;
}
