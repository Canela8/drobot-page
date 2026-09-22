# Drobot — base React + React Three Fiber

Proyecto de código preparado para completar con los textos, imágenes y modelo definitivos. No incluye un dron ficticio ni un archivo GLB de muestra.

## Iniciar

Requiere Node.js 20.19+ o 22.12+.

```bash
npm ci
npm run dev
```

Abre la URL que indique Vite. Para producción: `npm run build`; para revisar esa compilación: `npm run preview`.

## Archivos

- `src/App.jsx`: Canvas fijo, luces, ScrollControls, Suspense y recuperación de errores.
- `src/components/Drone.jsx`: useGLTF, normalización del tamaño e interpolación del recorrido.
- `src/components/Overlay.jsx`: Hero, Acerca, Servicios y Contacto; navegación accesible.
- `src/components/ErrorBoundary.jsx`: mantiene disponible la página si falla WebGL o el modelo.
- `src/data/content.js`: textos, tarjetas, rutas de imágenes y enlaces sociales.
- `src/styles.css`: paleta azul marino/lima, grid responsive y adaptación móvil.

## Añadir el modelo

Coloca tu archivo en `public/drone.glb`. Vite lo sirve en `/drone.glb`, la ruta exacta utilizada por `useGLTF`. Recarga la página después de añadirlo. Hasta entonces se muestra “Vista 3D no disponible” y el HTML continúa funcionando. La consola puede mostrar el 404 esperado del recurso ausente.

Usa un GLB autocontenido con mallas y texturas incorporadas; esta base presupone un modelo sin compresión Draco. Para modelos Draco configura el decoder local con `useGLTF.setDecoderPath('/draco/')` y añade los archivos del decoder en `public/draco/`. Para KTX2 configura además su loader. No se incluyen decoders remotos ni iluminación HDR externa.

El modelo se clona, se centra mediante su bounding box y se normaliza para evitar que las unidades de exportación alteren el encuadre. La orientación frontal depende del GLB: ajusta las rotaciones en `shots` si es necesario. Esta versión mueve el dron completo, no anima sus hélices ni sus clips GLTF.

## Cómo funciona el scroll

```jsx
<ScrollControls pages={pages} damping={0.18}>
  <Drone />
  <Scroll html><Overlay /></Scroll>
</ScrollControls>
```

El Canvas queda fijo y ScrollControls crea el único contenedor desplazable. Drone vive fuera de `<Scroll>` pero dentro de `<ScrollControls>` para recibir `useScroll()` sin ser desplazado automáticamente. El HTML vive dentro de `<Scroll html>`.

`useScroll().offset` representa el progreso normalizado 0–1 y ya está amortiguado por `damping`. En `useFrame` se convierte en una posición dentro de los cuatro puntos del recorrido:

```js
const progress = scroll.offset * (shots.length - 1);
const index = Math.min(Math.floor(progress), shots.length - 2);
const t = MathUtils.smoothstep(progress - index, 0, 1);
const a = shots[index], b = shots[index + 1];
// Repetido para X, Y y cada ángulo de rotación:
const x = MathUtils.lerp(a.x, b.x, t) * viewport.width;
group.current.position.x = x;
```

Las coordenadas x/y de `shots` son fracciones del viewport 3D. Los ángulos están en radianes. Se modifica el objeto Three directamente, sin provocar renderizados React en cada fotograma. La cámara permanece fija en `[0, 0, 8]`.

Los cuatro puntos se distribuyen uniformemente por el recorrido total. En escritorio corresponden aproximadamente a las cuatro secciones; en móvil el bloque de servicios puede ser más alto. `ResizeObserver` recalcula `pages = alturaContenido / alturaViewport` para no cortar tarjetas o contacto. Si necesitas sincronía exacta con cada título, reemplaza los intervalos uniformes por los offsets medidos de las secciones.

La navegación usa `scroll.el.scrollTo`, no `window.scrollTo`. Respeta preferencias de movimiento reducido: el dron permanece quieto y el scroll no se amortigua. DPR limitado a 1.5 para reducir carga gráfica. En móvil el dron ocupa la zona inferior y las tarjetas pasan a una columna. Sin WebGL se conserva una página HTML con scroll nativo.

## Sustituir contenido

Edita `src/data/content.js`. Para cada servicio:

```js
{ title: 'Nombre real', description: 'Descripción real', image: '/images/servicio.jpg', alt: 'Descripción de la fotografía' }
```

Guarda la foto en `public/images/servicio.jpg`. `image: null` muestra el placeholder intencional. Cambia también hero y about. El wordmark es texto provisional, no una reproducción del logo oficial. No se han incorporado imágenes de las capturas ni datos del PDF porque esta entrega prepara la estructura a la espera del contenido definitivo.

## Validación y límites

La compilación valida imports y JSX. La presencia, fidelidad y orientación del dron solo pueden comprobarse con el GLB definitivo. Los textos e imágenes de servicios están pendientes deliberadamente. No se ha desplegado esta base: el entregable es el código fuente solicitado.

Documentación: https://drei.docs.pmnd.rs/controls/scroll-controls
