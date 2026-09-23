import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Drone from './components/Drone';
import Overlay from './components/Overlay';
import ErrorBoundary from './components/ErrorBoundary';

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const query = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    const update = () => setReduced(query.matches);

    query.addEventListener('change', update);

    return () => query.removeEventListener('change', update);
  }, []);

  return reduced;
}

export default function App() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const elements = [
      document.documentElement,
      document.body,
      document.getElementById('root'),
    ];

    const previousStyles = elements.map(element =>
      element.getAttribute('style')
    );

    // La página utiliza el desplazamiento normal del navegador.
    elements.forEach(element => {
      element.style.height = 'auto';
      element.style.minHeight = '100%';
      element.style.overflow = 'visible';
    });

    return () => {
      elements.forEach((element, index) => {
        const previous = previousStyles[index];

        if (previous === null) {
          element.removeAttribute('style');
        } else {
          element.setAttribute('style', previous);
        }
      });
    };
  }, []);

  return (
    <>
      {/* El fondo 3D permanece fijo y no intercepta el scroll. */}
      <div
        className="canvas-shell"
        aria-hidden="true"
        style={{
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <ErrorBoundary fallback={null}>
          <Canvas
            frameloop="always"
            camera={{
              position: [0, 0, 8],
              fov: 38,
            }}
            dpr={[1, 1.5]}
            gl={{
              antialias: true,
              alpha: true,
            }}
            resize={{
              scroll: false,
              debounce: {
                resize: 0,
                scroll: 0,
              },
            }}
            fallback={null}
          >
            <ambientLight intensity={1.5} />

            <directionalLight
              position={[4, 6, 5]}
              intensity={3}
            />

            <directionalLight
              position={[-5, 2, -2]}
              color="#a6cdfa"
              intensity={2}
            />

            <ErrorBoundary fallback={null}>
              <Suspense fallback={null}>
                <Drone reducedMotion={reducedMotion} />
              </Suspense>
            </ErrorBoundary>
          </Canvas>
        </ErrorBoundary>
      </div>

      {/* El contenido se desplaza independientemente del Canvas. */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Overlay reducedMotion={reducedMotion} />
      </div>
    </>
  );
}