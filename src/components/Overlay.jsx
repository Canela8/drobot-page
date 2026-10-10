import { useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  ArrowDown,
  Instagram,
  Facebook,
} from 'lucide-react';

import Trayectoria from './Trayectoria';
import ServicesCarousel from './ServicesCarousel';
import { content } from '../data/content';

export default function Overlay({
  scrollElement,
  onMeasure,
  reducedMotion = false,
}) {
  const root = useRef(null);
  const [showTrayectoria, setShowTrayectoria] = useState(false);

  useLayoutEffect(() => {
    if (!onMeasure || !scrollElement || !root.current) return;

    function measure() {
      const height = scrollElement.clientHeight;

      if (height > 0) {
        onMeasure(
          Math.max(1, root.current.scrollHeight / height)
        );
      }
    }

    const observer = new ResizeObserver(measure);

    observer.observe(root.current);
    observer.observe(scrollElement);
    measure();

    return () => observer.disconnect();
  }, [scrollElement, onMeasure]);

  function navigate(event, id) {
    const section = root.current?.querySelector(`#${id}`);

    if (!section) return;

    event.preventDefault();

    const behavior = reducedMotion ? 'instant' : 'smooth';

    if (scrollElement) {
      const sectionRect = section.getBoundingClientRect();
      const containerRect = scrollElement.getBoundingClientRect();

      scrollElement.scrollTo({
        top:
          scrollElement.scrollTop +
          sectionRect.top -
          containerRect.top -
          scrollElement.clientTop,
        behavior,
      });
    } else {
      section.scrollIntoView({
        behavior,
        block: 'start',
      });
    }

    section.focus({ preventScroll: true });
  }

  return (
    <main className="overlay" ref={root}>
      <section
        id="inicio"
        className="section hero"
        tabIndex={-1}
      >
        <header className="header">
          <a
            className="brand"
            href="#inicio"
            onClick={event => navigate(event, 'inicio')}
            aria-label="Drobot, inicio"
          >
            <img
              className="brand-logo"
              src="/drobot-logo.PNG"
              alt="Drobot — soluciones en ingeniería y tecnologías"
            />
          </a>

          <nav aria-label="Principal">
            <button
              type="button"
              className="journey-nav-button"
              aria-haspopup="dialog"
              onClick={() => setShowTrayectoria(true)}
            >
              Nosotros
            </button>

            <a
              href="#servicios"
              onClick={event => navigate(event, 'servicios')}
            >
              Servicios
            </a>

            <a
              href="#contacto"
              onClick={event => navigate(event, 'contacto')}
            >
              Contacto
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </nav>
        </header>

        <div className="copy">
          <p className="eyebrow">
            DRONES · TECNOLOGÍA · PERSPECTIVA
          </p>

          <h1>{content.hero.title}</h1>

          <p className="lead">
            {content.hero.subtitle}
          </p>

          <a
            className="button"
            href="#contacto"
            onClick={event => navigate(event, 'contacto')}
          >
            Hablemos de tu proyecto
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
        </div>

        <div
          id="drone-anchor"
          className="hero-drone-space"
          aria-hidden="true"
        />

        <a
          className="scroll-hint"
          href="#acerca"
          onClick={event => navigate(event, 'acerca')}
        >
          <ArrowDown size={18} aria-hidden="true" />
          Explora Drobot
        </a>

        <span className="section-number">
          01 / 04
        </span>
      </section>

      <section
        id="acerca"
        className="section about"
        tabIndex={-1}
      >
        <div className="copy">
          <p className="eyebrow">
            02 / ACERCA DE DROBOT
          </p>

          <h2>{content.about.title}</h2>

          <p className="lead">
            {content.about.description}
          </p>

          <button
            type="button"
            className="text-link journey-open-link"
            aria-haspopup="dialog"
            onClick={() => setShowTrayectoria(true)}
          >
            Conoce nuestra trayectoria
            <ArrowUpRight size={18} aria-hidden="true" />
          </button>

          <div>
            <a
              className="text-link"
              href="#servicios"
              onClick={event => navigate(event, 'servicios')}
            >
              Descubre lo que hacemos
              <ArrowDown size={18} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div
          id="drone-anchor-about"
          className="about-drone-space"
          aria-hidden="true"
        />
      </section>

      <section
        id="servicios"
        className="section services"
        tabIndex={-1}
      >
        <p className="eyebrow">
          03 / NUESTROS SERVICIOS
        </p>

        <h2>
          Posibilidades
          <br />
          sin límites.
        </h2>

        <ServicesCarousel reducedMotion={reducedMotion} />
      </section>

      <section
        id="contacto"
        className="section contact"
        tabIndex={-1}
      >
        <div className="copy">
          <p className="eyebrow">
            04 / CONECTEMOS
          </p>

          <h2>
            Tu próxima idea.
            <br />
            <em>Más alto.</em>
          </h2>

          <p className="lead">
            Cuéntanos qué tienes en mente.
          </p>

          <div className="socials">
            <a
              href={content.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram aria-hidden="true" />
              Instagram
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>

            <a
              href={content.socials.facebook}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook aria-hidden="true" />
              Facebook
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div
          id="drone-anchor-contact"
          className="contact-drone-space"
          aria-hidden="true"
        />

        <footer>
          <a
            className="brand"
            href="#inicio"
            onClick={event => navigate(event, 'inicio')}
            aria-label="Drobot, inicio"
          >
            <img
              className="brand-logo"
              src="/drobot-logo.PNG"
              alt="Drobot — soluciones en ingeniería y tecnologías"
            />
          </a>

          <p>
            © {new Date().getFullYear()} Drobot.
          </p>

          <a
            href="#inicio"
            onClick={event => navigate(event, 'inicio')}
          >
            Volver arriba ↑
          </a>
        </footer>
      </section>

      {showTrayectoria && (
        <Trayectoria
          onClose={() => setShowTrayectoria(false)}
        />
      )}
    </main>
  );
}