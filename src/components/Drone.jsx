import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Box3, Vector3 } from 'three';
import { clone } from 'three/addons/utils/SkeletonUtils.js';

const ENTRY_DURATION = 1.6;
const EXIT_DURATION = 0.25;
const MODEL_SIZE = 0.9;

// Orientación independiente para cada sección.
const ROTATIONS = {
  'drone-anchor': -0.55 + Math.PI,

  // Gira hacia el lado contrario para mirar al texto de Nosotros.
  'drone-anchor-about': 0.55 - Math.PI,

  'drone-anchor-contact': -0.55 + Math.PI,
};

const ANCHOR_IDS = [
  'drone-anchor',
  'drone-anchor-about',
  'drone-anchor-contact',
];

const clamp01 = value => Math.max(0, Math.min(1, value));

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function setOpacity(model, amount) {
  const opacity = clamp01(amount);

  model.materials.forEach(item => {
    const transparent =
      opacity < 1 || item.originalTransparent;

    item.material.opacity =
      item.originalOpacity * opacity;

    if (item.material.transparent !== transparent) {
      item.material.transparent = transparent;
      item.material.needsUpdate = true;
    }
  });
}

export default function Drone({ reducedMotion = false }) {
  const group = useRef(null);
  const modelRef = useRef(null);

  const animation = useRef({
    anchorId: null,
    phase: 'hidden',
    elapsed: 0,
    opacity: 0,
    exitOpacity: 0,
    floatTime: 0,
  });

  const { scene } = useGLTF('/drone.glb');

  // Prepara una copia independiente del modelo.
  useEffect(() => {
    const object = clone(scene);
    const box = new Box3().setFromObject(object);

    const center = box.getCenter(new Vector3());
    const dimensions = box.getSize(new Vector3());

    const unit =
      1 /
      Math.max(
        dimensions.x,
        dimensions.y,
        dimensions.z,
        0.001
      );

    const materials = [];

    object.traverse(node => {
      if (!node.isMesh || !node.material) return;

      function copyMaterial(original) {
        const material = original.clone();

        materials.push({
          material,
          originalOpacity: original.opacity,
          originalTransparent: original.transparent,
        });

        material.transparent = true;
        material.opacity = 0;

        return material;
      }

      node.material = Array.isArray(node.material)
        ? node.material.map(copyMaterial)
        : copyMaterial(node.material);
    });

    // El contenedor interior centra la geometría.
    const container = group.current;
    if (!container) {
      materials.forEach(({ material }) => material.dispose());
      return;
    }

    // Traslada el centro del modelo al origen.
    object.position.sub(center);
    container.add(object);
    container.visible = false;

    modelRef.current = {
      object,
      materials,
      unit,
    };

    animation.current = {
      anchorId: null,
      phase: 'hidden',
      elapsed: 0,
      opacity: 0,
      exitOpacity: 0,
      floatTime: 0,
    };

    return () => {
      container.remove(object);

      materials.forEach(({ material }) => {
        material.dispose();
      });

      modelRef.current = null;
    };
  }, [scene]);

  useFrame(({ size, viewport, gl }, delta) => {
    const container = group.current;
    const model = modelRef.current;

    if (!container || !model || document.hidden) return;

    const canvasRect =
      gl.domElement.getBoundingClientRect();

    if (
      canvasRect.width <= 0 ||
      canvasRect.height <= 0
    ) {
      return;
    }

    const dt = Math.min(delta, 0.05);
    const state = animation.current;
    const mobile = size.width < 760;

    state.floatTime += dt;

    const screenCenter =
      canvasRect.top + canvasRect.height / 2;

    // Mide las dos posiciones HTML.
    const anchors = ANCHOR_IDS
      .map(id => {
        const element = document.getElementById(id);

        if (!element) return null;

        const rect = element.getBoundingClientRect();

        const visibleHeight = Math.max(
          0,
          Math.min(rect.bottom, canvasRect.bottom) -
            Math.max(rect.top, canvasRect.top)
        );

        const referenceHeight = Math.min(
          rect.height,
          canvasRect.height
        );

        return {
          id,
          rect,
          visible:
            rect.width > 0 &&
            referenceHeight > 0 &&
            visibleHeight / referenceHeight > 0.15,
          distance: Math.abs(
            rect.top + rect.height / 2 - screenCenter
          ),
        };
      })
      .filter(Boolean);

    const candidates = anchors
      .filter(anchor => anchor.visible)
      .sort((a, b) => a.distance - b.distance);

    let desired = candidates[0] || null;

    const current = anchors.find(
      anchor => anchor.id === state.anchorId
    );

    // Pequeño margen para evitar cambios repetidos
    // cuando ambas posiciones están casi a la misma distancia.
    if (
      current?.visible &&
      desired &&
      desired.id !== current.id &&
      current.distance <=
        desired.distance + canvasRect.height * 0.08
    ) {
      desired = current;
    }

    function startEntry(anchor) {
      state.anchorId = anchor.id;
      state.phase = 'entering';
      state.elapsed = 0;
      state.opacity = 0;
    }

    // Movimiento reducido: aparece directamente.
    if (reducedMotion) {
      if (!desired) {
        state.anchorId = null;
        state.phase = 'hidden';
        state.opacity = 0;
        container.visible = false;
        return;
      }

      state.anchorId = desired.id;
      state.phase = 'visible';
      state.elapsed = ENTRY_DURATION;
      state.opacity = 1;
    } else {
      if (state.phase === 'hidden') {
        if (!desired) {
          container.visible = false;
          return;
        }

        startEntry(desired);
      }

      // Primero desvanece la posición anterior.
      if (
        state.phase !== 'exiting' &&
        desired?.id !== state.anchorId
      ) {
        state.phase = 'exiting';
        state.elapsed = 0;
        state.exitOpacity = state.opacity;
      }

      if (state.phase === 'exiting') {
        state.elapsed += dt;

        const progress = clamp01(
          state.elapsed / EXIT_DURATION
        );

        state.opacity =
          state.exitOpacity * (1 - progress);

        setOpacity(model, state.opacity);
        container.visible = state.opacity > 0.001;

        // Durante la salida conserva la última posición.
        if (progress < 1) return;

        state.phase = 'hidden';
        state.anchorId = null;
        state.opacity = 0;

        if (!desired) return;

        startEntry(desired);
      }

      if (state.phase === 'entering') {
        state.elapsed = Math.min(
          ENTRY_DURATION,
          state.elapsed + dt
        );

        state.opacity = easeOutCubic(
          state.elapsed / ENTRY_DURATION
        );

        if (state.elapsed >= ENTRY_DURATION) {
          state.phase = 'visible';
          state.opacity = 1;
        }
      }
    }

    const active = anchors.find(
      anchor => anchor.id === state.anchorId
    );

    if (!active) {
      container.visible = false;
      state.phase = 'hidden';
      state.anchorId = null;
      return;
    }

    const { rect } = active;

    const worldPerPixelX =
      viewport.width / canvasRect.width;

    const worldPerPixelY =
      viewport.height / canvasRect.height;

    // Ancla el modelo al espacio de su sección.
    const targetX =
      (
        rect.left +
        rect.width / 2 -
        canvasRect.left -
        canvasRect.width / 2
      ) * worldPerPixelX;

    const targetY =
      (
        canvasRect.height / 2 -
        (
          rect.top +
          rect.height / 2 -
          canvasRect.top
        )
      ) * worldPerPixelY;

    const scale =
      Math.min(
        rect.width * worldPerPixelX,
        rect.height * worldPerPixelY
      ) * MODEL_SIZE;

    const progress =
      state.phase === 'entering'
        ? clamp01(state.elapsed / ENTRY_DURATION)
        : 1;

    const eased = reducedMotion
      ? 1
      : easeOutCubic(progress);

    const remaining = 1 - eased;
    const isAbout =
      active.id === 'drone-anchor-about';

    const isContact =
      active.id === 'drone-anchor-contact';

    let entryX = 0;
    let entryY = 0;
    let entryTilt = 0;

    if (isAbout) {
      // Nosotros: entra desde la izquierda hacia el texto.
      const startX = -viewport.width / 2 - scale;

      entryX = (startX - targetX) * remaining;
      entryTilt = -0.14 * remaining;
    } else if (isContact || mobile) {
      // Contacto y el Inicio móvil: entran desde la derecha.
      const startX = viewport.width / 2 + scale;

      entryX = (startX - targetX) * remaining;
      entryTilt = 0.14 * remaining;
    } else {
      // Inicio escritorio: entrada desde arriba.
      entryY = viewport.height * 0.2 * remaining;
    }

    const time = state.floatTime;

    // Flotación continua y ligera.
    const floatX = reducedMotion
      ? 0
      : Math.sin(time * 0.7) * scale * 0.012 * eased;

    const floatY = reducedMotion
      ? 0
      : Math.sin(time * 1.3) * scale * 0.025 * eased;

    const tilt = reducedMotion
      ? 0
      : Math.sin(time * 0.9) * 0.018 * eased;

    container.position.set(
      targetX + entryX + floatX,
      targetY + entryY + floatY,
      0
    );

    container.rotation.set(
      0.15,
      ROTATIONS[active.id] ?? ROTATIONS['drone-anchor'],
      (isAbout ? 0.08 : -0.08) + entryTilt + tilt
    );

    container.scale.setScalar(
      scale * model.unit
    );

    container.visible = true;
    setOpacity(model, state.opacity);
  });

  return <group ref={group} />;
}