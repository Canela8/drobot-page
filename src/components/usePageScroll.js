import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';

export function usePageScroll() {
  const state = useRef({ offset: 0 });

  useFrame((_, delta) => {
    const page =
      document.scrollingElement || document.documentElement;

    const viewportHeight =
      document.documentElement.clientHeight;

    if (viewportHeight <= 0 || document.hidden) return;

    // Recalcula el recorrido con el tamaño actual de la ventana.
    const distance = Math.max(
      0,
      page.scrollHeight - viewportHeight
    );

    const target =
      distance > 0
        ? MathUtils.clamp(page.scrollTop / distance, 0, 1)
        : 0;

    // Suaviza únicamente el movimiento del dron.
    state.current.offset = MathUtils.damp(
      state.current.offset,
      target,
      7,
      Math.min(delta, 0.05)
    );
  }, -1);

  return state.current;
}