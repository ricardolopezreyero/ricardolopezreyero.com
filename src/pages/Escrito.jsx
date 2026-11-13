// RLR · Un escrito · Ricardo López Reyero
// El texto de cada escrito vive en /escritos/<slug>.json (carpeta public/escritos) y se pide
// al abrirlo; la lista con títulos y portadas viene en src/escritos/indice.json.
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import escritos from '../escritos/indice.json';
import { baseDeIdioma, claveDeTema } from './Escritos';
import './Escritos.scss';

const TITULO_DEL_SITIO = 'Ricardo López Reyero';

const Escrito = () => {
  const { slug } = useParams();
  const intl = useIntl();
  const location = useLocation();
  const base = baseDeIdioma(location.pathname);
  const [estado, setEstado] = useState({ slug: '', html: '', fallo: false });
  const [intento, setIntento] = useState(0);

  const indice = escritos.findIndex((e) => e.slug === (slug || '').toLowerCase());
  const escrito = indice >= 0 ? escritos[indice] : null;
  const anterior = indice > 0 ? escritos[indice - 1] : null;
  const siguiente = indice >= 0 && indice < escritos.length - 1 ? escritos[indice + 1] : null;

  // RLR · trae el texto
  useEffect(() => {
    if (!escrito) return undefined;
    let vivo = true;
    setEstado({ slug: escrito.slug, html: '', fallo: false });
    fetch(`/escritos/${escrito.slug}.json`)
      .then((respuesta) => (respuesta.ok ? respuesta.json() : Promise.reject(new Error('sin texto'))))
      .then((datos) => { if (vivo) setEstado({ slug: escrito.slug, html: datos.html || '', fallo: false }); })
      .catch(() => { if (vivo) setEstado({ slug: escrito.slug, html: '', fallo: true }); });
    return () => { vivo = false; };
  }, [escrito, intento]);

  // RLR · título y descripción de la pestaña
  useEffect(() => {
    if (!escrito) return undefined;
    const tituloPrevio = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const descripcionPrevia = meta ? meta.getAttribute('content') : null;
    document.title = `${escrito.titulo} · ${TITULO_DEL_SITIO}`;
    if (meta && escrito.descripcion) meta.setAttribute('content', escrito.descripcion);
    return () => {
      document.title = tituloPrevio;
      if (meta && descripcionPrevia != null) meta.setAttribute('content', descripcionPrevia);
    };
  }, [escrito]);

  if (!escrito) {
    return (
      <div className='rlr-escrito rlr-escrito--vacio'>
        <p><FormattedMessage id='escritos.noEncontrado' /></p>
        <Link className='rlr-escrito__volver' to={`${base}/escritos`}>
          <ArrowBackRounded fontSize='small' aria-hidden='true' />
          <FormattedMessage id='escritos.volver' />
        </Link>
      </div>
    );
  }

  const fecha = escrito.fecha
    ? intl.formatDate(`${escrito.fecha}T12:00:00`, { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  const cargando = estado.slug !== escrito.slug || (!estado.html && !estado.fallo);

  return (
    <article className='rlr-escrito' key={escrito.slug} data-author='RLR'>
      <Link className='rlr-escrito__volver' to={`${base}/escritos`}>
        <ArrowBackRounded fontSize='small' aria-hidden='true' />
        <FormattedMessage id='escritos.volver' />
      </Link>

      <header className='rlr-escrito__cabecera'>
        <p className='rlr-escrito__temas'>
          {escrito.etiquetas.map((tema) => (
            <Link key={tema} to={`${base}/escritos?tema=${claveDeTema(tema)}`}>{tema}</Link>
          ))}
        </p>
        <h1 className='rlr-escrito__titulo'>{escrito.titulo}</h1>
        {escrito.descripcion && <p className='rlr-escrito__bajada'>{escrito.descripcion}</p>}
        <p className='rlr-escrito__datos'>
          {fecha && <time dateTime={escrito.fecha}>{fecha}</time>}
          {fecha && <span aria-hidden='true'> · </span>}
          <FormattedMessage id='escritos.minutos' values={{ n: escrito.minutos }} />
        </p>
      </header>

      {escrito.portada && (
        <img className='rlr-escrito__portada' src={escrito.portada} alt='' width='900' height='506' decoding='async' />
      )}

      {cargando && <p className='rlr-escrito__aviso' aria-live='polite'><FormattedMessage id='escritos.cargando' /></p>}
      {estado.fallo && (
        <p className='rlr-escrito__aviso' role='alert'>
          <FormattedMessage id='escritos.fallo' />{' '}
          <button type='button' className='rlr-escrito__reintentar' onClick={() => setIntento((n) => n + 1)}>
            <FormattedMessage id='escritos.reintentar' />
          </button>
        </p>
      )}
      {!cargando && !estado.fallo && (
        // El texto viene de los archivos del propio sitio, ya limpiado por scripts/importar-escritos.py
        <div className='rlr-escrito__texto' dangerouslySetInnerHTML={{ __html: estado.html }} />
      )}

      <nav className='rlr-escrito__otros' aria-label={intl.formatMessage({ id: 'downloads.escritos.title' })}>
        {anterior ? (
          <Link className='rlr-escrito__otro' to={`${base}/escritos/${anterior.slug}`}>
            <span><ArrowBackRounded fontSize='inherit' aria-hidden='true' /> <FormattedMessage id='escritos.anterior' /></span>
            <strong>{anterior.titulo}</strong>
          </Link>
        ) : <span />}
        {siguiente ? (
          <Link className='rlr-escrito__otro rlr-escrito__otro--siguiente' to={`${base}/escritos/${siguiente.slug}`}>
            <span><FormattedMessage id='escritos.siguiente' /> <ArrowForwardRounded fontSize='inherit' aria-hidden='true' /></span>
            <strong>{siguiente.titulo}</strong>
          </Link>
        ) : <span />}
      </nav>
    </article>
  );
};

export default Escrito;
