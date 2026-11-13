// RLR · Escritos (lista) · Ricardo López Reyero
// Todos los escritos con su portada, filtrables por tema. El filtro va en la dirección
// (?tema=ideas) para poder compartir la liga de un tema.
import React, { useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { ContentBox } from '../components/Styled';
import Hero from '../sections/Descargas/Hero/Hero';
import escritos from '../escritos/indice.json';
import './Escritos.scss';

const _RLR = 'Ricardo López Reyero';

// Orden en que se ofrecen los temas
const TEMAS = ['Ideas', 'Estado de gobierno', 'Generales', 'Conciencia', 'Meditación'];

export const claveDeTema = (tema) =>
  tema.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');

export const baseDeIdioma = (ruta) => (ruta.startsWith('/en') ? '/en' : '');

const Escritos = () => {
  const intl = useIntl();
  const location = useLocation();
  const [parametros, setParametros] = useSearchParams();
  const base = baseDeIdioma(location.pathname);
  const temaActivo = parametros.get('tema') || '';

  const temas = useMemo(
    () => TEMAS
      .map((tema) => ({
        tema,
        clave: claveDeTema(tema),
        cuantos: escritos.filter((e) => e.etiquetas.includes(tema)).length,
      }))
      .filter((t) => t.cuantos > 0),
    []
  );

  const visibles = useMemo(() => {
    const elegido = temas.find((t) => t.clave === temaActivo);
    return elegido ? escritos.filter((e) => e.etiquetas.includes(elegido.tema)) : escritos;
  }, [temaActivo, temas]);

  const elegir = (clave) => {
    setParametros(clave ? { tema: clave } : {}, { replace: true, preventScrollReset: true });
  };

  return (
    <ContentBox varwidth='100%' varmaxwidth='100%' vardisplay='flex' data-author={_RLR}>
      <Hero
        id='hero'
        encima='escritos.hero.above'
        titulo='downloads.escritos.title'
        descripcion='escritos.hero.description'
      />

      <div className='rlr-escritos'>
        <div className='rlr-escritos__filtros' role='group' aria-label={intl.formatMessage({ id: 'escritos.filtros' })}>
          <button
            type='button'
            className={`rlr-escritos__filtro${!temaActivo ? ' rlr-escritos__filtro--activo' : ''}`}
            aria-pressed={!temaActivo}
            onClick={() => elegir('')}
          >
            <FormattedMessage id='escritos.todos' /> <span>{escritos.length}</span>
          </button>
          {temas.map((t) => (
            <button
              key={t.clave}
              type='button'
              className={`rlr-escritos__filtro${temaActivo === t.clave ? ' rlr-escritos__filtro--activo' : ''}`}
              aria-pressed={temaActivo === t.clave}
              onClick={() => elegir(t.clave)}
            >
              {t.tema} <span>{t.cuantos}</span>
            </button>
          ))}
        </div>

        {/* la llave hace que la rejilla vuelva a entrar suave al cambiar de tema */}
        <ul className='rlr-escritos__rejilla' key={temaActivo || 'todos'}>
          {visibles.map((escrito, i) => (
            <li key={escrito.slug} style={{ '--orden': Math.min(i, 11) }}>
              <Link className='rlr-tarjeta' to={`${base}/escritos/${escrito.slug}`}>
                <div className='rlr-tarjeta__portada'>
                  {escrito.portada && (
                    <img src={escrito.portada} alt='' loading={i < 6 ? 'eager' : 'lazy'} decoding='async' width='900' height='506' />
                  )}
                </div>
                <div className='rlr-tarjeta__cuerpo'>
                  <p className='rlr-tarjeta__temas'>{escrito.etiquetas.join(' · ')}</p>
                  <h2 className='rlr-tarjeta__titulo'>{escrito.titulo}</h2>
                  {escrito.descripcion && <p className='rlr-tarjeta__bajada'>{escrito.descripcion}</p>}
                  <p className='rlr-tarjeta__pie'>
                    <FormattedMessage id='escritos.minutos' values={{ n: escrito.minutos }} />
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </ContentBox>
  );
};

export default Escritos;
