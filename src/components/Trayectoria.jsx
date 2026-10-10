import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ArrowDown,
  ArrowUpRight,
  FlaskConical,
  Leaf,
  Film,
  MapPin,
  Factory,
  Cpu,
} from 'lucide-react';

import { trayectoria } from '../data/trayectoria';
import { content } from '../data/content';
import './Trayectoria.css';

const icons = {
  research: FlaskConical,
  environment: Leaf,
  film: Film,
  territory: MapPin,
  industry: Factory,
  software: Cpu,
};

export default function Trayectoria({ onClose }) {
  const dialogRef = useRef(null);
  const scrollRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const scroller = scrollRef.current;
    const timeline = timelineRef.current;
    const previousFocus = document.activeElement;

    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    if (!dialog.open) {
      dialog.showModal();
    }

    // El scroll observado es el de esta vista, no el de la landing.
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        root: scroller,
        threshold: 0,
        rootMargin: '0px 0px -12% 0px',
      }
    );

    const items = timeline.querySelectorAll('.journey-item');

    timeline.classList.add('is-ready');
    items.forEach(item => observer.observe(item));

    function updateProgress() {
      const timelineRect = timeline.getBoundingClientRect();
      const scrollRect = scroller.getBoundingClientRect();

      const readingPosition =
        scrollRect.top + scroller.clientHeight * 0.6;

      let progress =
        (readingPosition - timelineRect.top) /
        Math.max(1, timelineRect.height);

      const atBottom =
        scroller.scrollTop + scroller.clientHeight >=
        scroller.scrollHeight - 4;

      if (atBottom) progress = 1;

      progress = Math.max(0, Math.min(1, progress));

      timeline.style.setProperty(
        '--journey-progress',
        String(progress)
      );
    }

    scroller.addEventListener('scroll', updateProgress, {
      passive: true,
    });

    const resizeObserver = new ResizeObserver(updateProgress);
    resizeObserver.observe(scroller);
    resizeObserver.observe(timeline);

    updateProgress();

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();

      scroller.removeEventListener('scroll', updateProgress);
      timeline.classList.remove('is-ready');

      if (dialog.open) dialog.close();

      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;

      if (previousFocus instanceof HTMLElement) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, []);

  function startReading() {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const scroller = scrollRef.current;
    const timeline = timelineRef.current;

    const top =
      scroller.scrollTop +
      timeline.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top -
      32;

    scroller.scrollTo({
      top,
      behavior: reduced ? 'instant' : 'smooth',
    });
  }

  return createPortal(
    <dialog
      ref={dialogRef}
      className="journey-dialog"
      aria-labelledby="journey-title"
      onCancel={event => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="journey-toolbar">
        <span className="journey-brand">DROBOT / NOSOTROS</span>

        <button
          type="button"
          className="journey-close"
          onClick={onClose}
          autoFocus
        >
          Volver al sitio
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <div ref={scrollRef} className="journey-scroll">
        <div className="journey-intro">
          <p className="journey-eyebrow">
            DRONES · INGENIERÍA · TECNOLOGÍA
          </p>

          <h1 id="journey-title">
            Una trayectoria.
            <br />
            <span>Muchas perspectivas.</span>
          </h1>

          <p className="journey-intro-copy">
            Conoce los proyectos y áreas de trabajo que forman
            parte de Drobot: de la exploración del territorio
            al desarrollo de soluciones digitales.
          </p>

          <button
            type="button"
            className="journey-start"
            onClick={startReading}
          >
            Explora nuestro recorrido
            <ArrowDown size={20} aria-hidden="true" />
          </button>

          <span className="journey-intro-label" aria-hidden="true">
            01 — {String(trayectoria.length).padStart(2, '0')} / PROYECTOS Y EXPERIENCIA
          </span>
        </div>

        <ol
          ref={timelineRef}
          className="journey-timeline"
          aria-label="Recorrido por proyectos y áreas de Drobot"
        >
          {trayectoria.map(item => {
            const Icon = icons[item.icon];

            return (
              <li className="journey-item" key={item.number}>
                <span className="journey-node" aria-hidden="true">
                  {item.number}
                </span>

                <article className="journey-card">
                  <div className="journey-card-top">
                    <p className="journey-eyebrow">
                      {item.category}
                    </p>

                    <Icon
                      size={30}
                      strokeWidth={1.3}
                      aria-hidden="true"
                    />
                  </div>

                  <h2>{item.title}</h2>
                  {item.description && (
                    <p className="journey-description">
                      {item.description}
                    </p>
                  )}

                  <ul className="journey-details">
                    {item.details.map(detail => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>

                  <span
                    className="journey-card-number"
                    aria-hidden="true"
                  >
                    {item.number}
                  </span>
                </article>
              </li>
            );
          })}
        </ol>

        <div className="journey-outro">
          <p className="journey-eyebrow">
            SIGAMOS CONSTRUYENDO
          </p>

          <h2>
            Tu proyecto puede ser
            <br />
            <span>el siguiente capítulo.</span>
          </h2>

          <a
            className="journey-cta"
            href={content.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
          >
            Hablemos de tu idea
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>

          <button
            type="button"
            className="journey-return"
            onClick={onClose}
          >
            Regresar a Drobot
          </button>
        </div>
      </div>
    </dialog>,
    document.body
  );
}