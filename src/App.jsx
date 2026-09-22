import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, Scroll, ScrollControls, useScroll } from '@react-three/drei';
import Drone from './components/Drone';
import Overlay from './components/Overlay';
import ErrorBoundary from './components/ErrorBoundary';

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}
function ModelNotice({ children }) {
  return <Html position={[0, -2.8, 0]} center style={{ pointerEvents: 'none' }}><p className="model-notice" role="status">{children}</p></Html>;
}
function ScrollContent({ onMeasure, reducedMotion }) {
  const scroll = useScroll();
  useEffect(() => {
    scroll.el.tabIndex = 0;
    scroll.el.setAttribute('aria-label', 'Contenido de Drobot');
  }, [scroll.el]);
  return <>
    <ErrorBoundary fallback={<ModelNotice>Vista 3D no disponible</ModelNotice>}>
      <Suspense fallback={<ModelNotice>Cargando vista 3D…</ModelNotice>}><Drone reducedMotion={reducedMotion}/></Suspense>
    </ErrorBoundary>
    <Scroll html style={{ width: '100%' }}><Overlay scrollElement={scroll.el} onMeasure={onMeasure} reducedMotion={reducedMotion}/></Scroll>
  </>;
}
export default function App() {
  const [pages, setPages] = useState(4);
  const reducedMotion = useReducedMotion();
  const fallback = <div className="static-page"><Overlay/></div>;
  return <ErrorBoundary fallback={fallback}><div className="canvas-shell"><Canvas camera={{ position: [0, 0, 8], fov: 38 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} fallback={fallback}>
    <ambientLight intensity={1.5}/><directionalLight position={[4, 6, 5]} intensity={3}/><directionalLight position={[-5, 2, -2]} color="#a6cdfa" intensity={2}/>
    <ScrollControls pages={pages} damping={reducedMotion ? 0 : .18}>
      <ScrollContent onMeasure={setPages} reducedMotion={reducedMotion}/>
    </ScrollControls>
  </Canvas></div></ErrorBoundary>;
}
