import { useLayoutEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDown, Instagram, Facebook } from 'lucide-react';
import ServicesCarousel from './ServicesCarousel';
import { content } from '../data/content';

export default function Overlay({ scrollElement, onMeasure, reducedMotion = false }) {
  const root = useRef();
  useLayoutEffect(() => {
    if (!onMeasure || !scrollElement) return;
    const measure = () => onMeasure(Math.max(1, root.current.scrollHeight / scrollElement.clientHeight));
    const observer = new ResizeObserver(measure);
    observer.observe(root.current); observer.observe(scrollElement); measure();
    return () => observer.disconnect();
  }, [scrollElement, onMeasure]);
  function navigate(event, id) {
    if (!scrollElement) return; // Navegación por anclas en el modo sin WebGL.
    event.preventDefault();
    const section = root.current.querySelector(`#${id}`);
    scrollElement.scrollTo({ top: section.offsetTop, behavior: reducedMotion ? 'instant' : 'smooth' });
    section.focus({ preventScroll: true });
  }
  return <main className="overlay" ref={root}>
    <section id="inicio" className="section hero" tabIndex={-1}>
      <header className="header"><a className="brand" href="#inicio" onClick={e => navigate(e, 'inicio')} aria-label="Drobot, inicio"><img className="brand-logo" src="/drobot-logo.PNG" alt="Drobot — soluciones en ingeniería y tecnologías"/></a><nav aria-label="Principal"><a href="#acerca" onClick={e => navigate(e, 'acerca')}>Nosotros</a><a href="#servicios" onClick={e => navigate(e, 'servicios')}>Servicios</a><a href="#contacto" onClick={e => navigate(e, 'contacto')}>Contacto <ArrowUpRight size={16}/></a></nav></header>
      <div className="copy"><p className="eyebrow">DRONES · TECNOLOGÍA · PERSPECTIVA</p><h1>{content.hero.title}</h1><p className="lead">{content.hero.subtitle}</p><a className="button" href="#contacto" onClick={e => navigate(e, 'contacto')}>Hablemos de tu proyecto <ArrowUpRight size={20}/></a></div>
      <a className="scroll-hint" href="#acerca" onClick={e => navigate(e, 'acerca')}><ArrowDown size={18}/> Explora Drobot</a><span className="section-number">01 / 04</span>
    </section>
    <section id="acerca" className="section about" tabIndex={-1}><div className="copy"><p className="eyebrow">02 / ACERCA DE DROBOT</p><h2>{content.about.title}</h2><p className="lead">{content.about.description}</p><a className="text-link" href="#servicios" onClick={e => navigate(e, 'servicios')}>Descubre lo que hacemos <ArrowDown size={18}/></a></div></section>
    <section id="servicios" className="section services" tabIndex={-1}><p className="eyebrow">03 / NUESTROS SERVICIOS</p><h2>Posibilidades<br/>sin límites.</h2><ServicesCarousel reducedMotion={reducedMotion}/></section>
    <section id="contacto" className="section contact" tabIndex={-1}><div className="copy"><p className="eyebrow">04 / CONECTEMOS</p><h2>Tu próxima idea.<br/><em>Más alto.</em></h2><p className="lead">Cuéntanos qué tienes en mente.</p><div className="socials"><a href={content.socials.instagram} target="_blank" rel="noopener noreferrer"><Instagram/> Instagram <ArrowUpRight size={16}/></a><a href={content.socials.facebook} target="_blank" rel="noopener noreferrer"><Facebook/> Facebook <ArrowUpRight size={16}/></a></div></div><footer><a className="brand" href="#inicio" onClick={e => navigate(e, 'inicio')} aria-label="Drobot, inicio"><img className="brand-logo" src="/drobot-logo.PNG" alt="Drobot — soluciones en ingeniería y tecnologías"/></a><p>© {new Date().getFullYear()} Drobot.</p><a href="#inicio" onClick={e => navigate(e, 'inicio')}>Volver arriba ↑</a></footer></section>
  </main>;
}
