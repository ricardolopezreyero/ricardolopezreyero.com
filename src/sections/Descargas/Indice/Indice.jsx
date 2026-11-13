// RLR · Índice de secciones de Descargas · Ricardo López Reyero
// Barra que se queda arriba al bajar: un toque lleva a Tarjetas, Libros, Atajos, Cuadros
// o Habladores, y marca en cuál vas. (Los audios tienen su propia página: /audios.)
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import './Indice.scss';

export const SECCIONES = [
  { id: 'tarjetas-objetivos', texto: 'downloads.cards.title' },
  { id: 'libros-leidos', texto: 'downloads.books.title' },
  { id: 'atajos-para-la-abundancia', texto: 'downloads.atajos.title' },
  { id: 'cuadros-explicativos', texto: 'downloads.cuadros.title' },
  { id: 'habladores', texto: 'downloads.habladores.title' },
];

const Indice = () => {
  const intl = useIntl();
  const [activa, setActiva] = useState('');

  // RLR · marca la sección que va pasando bajo la barra
  useEffect(() => {
    let cuadro = 0;
    const medir = () => {
      cuadro = 0;
      let vista = '';
      for (const seccion of SECCIONES) {
        const el = document.getElementById(seccion.id);
        if (el && el.getBoundingClientRect().top <= 140) vista = seccion.id;
      }
      setActiva(vista);
    };
    const alMover = () => {
      if (!cuadro) cuadro = window.requestAnimationFrame(medir);
    };
    window.addEventListener('scroll', alMover, { passive: true });
    medir();
    return () => {
      window.removeEventListener('scroll', alMover);
      if (cuadro) window.cancelAnimationFrame(cuadro);
    };
  }, []);

  const ir = (evento, id) => {
    const destino = document.getElementById(id);
    if (!destino) return;
    evento.preventDefault();
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    destino.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
  };

  return (
    <nav className='rlr-indice' aria-label={intl.formatMessage({ id: 'downloads.indice.label' })} data-author='RLR'>
      <ul className='rlr-indice__lista'>
        {SECCIONES.map((seccion) => (
          <li key={seccion.id}>
            <a
              href={`#${seccion.id}`}
              className={`rlr-indice__liga${activa === seccion.id ? ' rlr-indice__liga--activa' : ''}`}
              aria-current={activa === seccion.id ? 'true' : undefined}
              onClick={(evento) => ir(evento, seccion.id)}
            >
              <FormattedMessage id={seccion.texto} />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Indice;
