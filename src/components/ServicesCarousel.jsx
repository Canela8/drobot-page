import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play, Map, Video, Radio, GraduationCap, Bot, Printer, Settings } from 'lucide-react';
import { content } from '../data/content';
const icons = [Map, Video, Radio, GraduationCap, Bot, Printer, Settings];
export default function ServicesCarousel({ reducedMotion }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const root = useRef(null);
  const touchX = useRef(null);
  const count = content.services.length;
  const running = !paused && !hovered && !focused && !reducedMotion && visible;
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .25 });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => { if (!document.hidden) setActive(i => (i + 1) % count); }, 6000);
    return () => clearInterval(timer);
  }, [running, count]);
  function move(step) { setPaused(true); setActive(i => (i + step + count) % count); }
  return <div ref={root} className="carousel" role="region" aria-roledescription="carrusel" aria-label="Servicios de Drobot"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}
    onKeyDown={e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); move(e.key === 'ArrowRight' ? 1 : -1); } }}>
    <div className="carousel-window" onTouchStart={e => { touchX.current = e.touches[0].clientX; }} onTouchEnd={e => { if (touchX.current !== null) { const delta = e.changedTouches[0].clientX - touchX.current; if (Math.abs(delta) > 50) move(delta < 0 ? 1 : -1); } touchX.current = null; }}>
      <div className="carousel-track" style={{ transform: `translateX(-${active * 100}%)` }}>{content.services.map((service, i) => {
        const Icon = icons[i];
        return <article className="carousel-card" key={service.title} aria-hidden={i !== active} role="group" aria-roledescription="diapositiva" aria-label={`${i + 1} de ${count}`}>
          <div className="service-visual">{service.image ? <img src={service.image} alt={service.alt}/> : <><Icon size={84} strokeWidth={1}/><span>{String(i + 1).padStart(2, '0')}</span></>}</div>
          <div className="service-copy"><p className="eyebrow">DROBOT / {String(i + 1).padStart(2, '0')}</p><h3>{service.title}</h3><p>{service.description}</p></div>
        </article>;
      })}</div>
    </div>
    <div className="carousel-controls"><div className="carousel-arrows"><button aria-label="Servicio anterior" onClick={() => move(-1)}><ArrowLeft/></button><button aria-label="Servicio siguiente" onClick={() => move(1)}><ArrowRight/></button><span aria-live={running ? 'off' : 'polite'}>{active + 1} / {count}</span></div>
      <div className="carousel-dots">{content.services.map((service, i) => <button key={i} className={i === active ? 'selected' : ''} aria-label={`Ver ${service.title}`} aria-current={i === active ? 'true' : undefined} onClick={() => { setPaused(true); setActive(i); }}/>)}</div>
      {!reducedMotion && <button className="autoplay" aria-label={paused ? 'Activar reproducción automática' : 'Pausar reproducción automática'} onClick={() => setPaused(v => !v)}>{paused ? <Play size={18}/> : <Pause size={18}/>}<span>{paused ? 'Reproducir' : 'Pausar'}</span></button>}
    </div>
  </div>;
}
