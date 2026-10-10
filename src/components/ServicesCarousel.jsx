import { useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Map,
  Video,
  Code2,
  GraduationCap,
  Bot,
  Printer,
  Settings,
} from 'lucide-react';
import { content } from '../data/content';

const icons = [
  Map,
  Video,
  Code2,
  GraduationCap,
  Bot,
  Printer,
  Settings,
];

export default function ServicesCarousel({ reducedMotion = false }) {
  const [active, setActive] = useState(0);

  const touchX = useRef(null);

  const count = content.services.length;
  // El cambio de tarjeta es exclusivamente manual.

  function move(step) {
    if (count < 2) return;
    setActive(current => (current + step + count) % count);
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    }
  }

  function handleTouchStart(event) {
    touchX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event) {
    if (touchX.current !== null) {
      const delta = event.changedTouches[0].clientX - touchX.current;

      if (Math.abs(delta) > 50) {
        move(delta < 0 ? 1 : -1);
      }
    }

    touchX.current = null;
  }

  return (
    <div
      className="carousel"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Servicios de Drobot"
      onKeyDown={handleKeyDown}
    >
      <div
        className="carousel-window"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          touchX.current = null;
        }}
      >
        <div
          className="carousel-track"
          style={{
            transform: `translateX(-${active * 100}%)`,
            transition: reducedMotion
              ? 'none'
              : 'transform 650ms ease-in-out',
          }}
        >
          {content.services.map((service, i) => {
            const Icon = icons[i] || Settings;

            return (
              <article
                className="carousel-card"
                key={service.title}
                aria-hidden={i !== active}
                role="group"
                aria-roledescription="diapositiva"
                aria-label={`${i + 1} de ${count}`}
              >
                <div className="service-visual">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.alt || service.title}
                    />
                  ) : (
                    <>
                      <Icon
                        size={84}
                        strokeWidth={1}
                        aria-hidden="true"
                      />
                      <span>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </>
                  )}
                </div>

                <div className="service-copy">
                  <p className="eyebrow">
                    DROBOT / {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="carousel-controls">
        <div className="carousel-arrows">
          <button
            type="button"
            aria-label="Servicio anterior"
            onClick={() => move(-1)}
            disabled={count < 2}
          >
            <ArrowLeft />
          </button>

          <button
            type="button"
            aria-label="Servicio siguiente"
            onClick={() => move(1)}
            disabled={count < 2}
          >
            <ArrowRight />
          </button>

          <span aria-live="polite" aria-atomic="true">
            {count > 0 ? active + 1 : 0} / {count}
          </span>
        </div>

        <div className="carousel-dots">
          {content.services.map((service, i) => (
            <button
              type="button"
              key={service.title}
              className={i === active ? 'selected' : ''}
              aria-label={`Ver ${service.title}`}
              aria-current={i === active ? 'true' : undefined}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}