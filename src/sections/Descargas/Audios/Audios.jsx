// RLR · Sección de audios de Descargas · Ricardo López Reyero
// Reproductor propio: un solo <audio> para toda la sección, ±10 segundos, velocidad,
// repetir, memoria de avance por audio y guardado en el navegador para oírlos sin internet.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import PauseRounded from '@mui/icons-material/PauseRounded';
import Replay10Rounded from '@mui/icons-material/Replay10Rounded';
import Forward10Rounded from '@mui/icons-material/Forward10Rounded';
import RepeatOneRounded from '@mui/icons-material/RepeatOneRounded';
import DownloadForOfflineRounded from '@mui/icons-material/DownloadForOfflineRounded';
import OfflinePinRounded from '@mui/icons-material/OfflinePinRounded';
import { ContentBox, RedHatDisplay } from '../../../components/Styled';
import ImaginationImg from '../../../assets/img/Imagination_Bob_Proctor.png';
import FrecuenciaImg from '../../../assets/img/Frecuencia_296Hz_x.png';
import Thewill from '../../../assets/img/The_will_Bob_Proctor.png';
import PercepcionImg from '../../../assets/img/Percepcion_Bob_Proctor.png';
import Mundointerno from '../../../assets/img/Mundo_interno_vs_mundo_externo_neville_goddard.png';
import atusordenes from '../../../assets/img/A_tus_ordenes_neville_goddard.png';
import imaginacionDespierta from '../../../assets/img/Imaginacion_despierta_neville_goddard.png';
import {
  audioFrecuencia396,
  audioImagination,
  audioTheWill,
  audioPercepcion,
  audioMundoInterno,
  audioATusOrdenes,
  audioImaginacionDespierta,
} from '../../../pesados';
import {
  sePuedeGuardar,
  listarGuardados,
  guardarAudio,
  leerGuardado,
  quitarAudio,
  llaveDe,
  leerAvances,
  escribirAvances,
} from './audiosGuardados';
import './Audios.scss';

const _RLR = 'Ricardo López Reyero';
const _k = 'EYE', _rev = 181218; // sello de compilación

// RLR · duración y peso van escritos para mostrarlos sin tener que pedir los archivos
const audios = [
  { id: 1, clave: 'frecuencia-396hz', url: audioFrecuencia396, portada: FrecuenciaImg, titulo: 'Frecuencia 396 Hz', autor: '', album: 'Desarrollo Personal', segundos: 7812, bytes: 46874270 },
  { id: 2, clave: 'imagination', url: audioImagination, portada: ImaginationImg, titulo: 'Imagination', autor: 'Bob Proctor', album: 'Desarrollo Personal', segundos: 479, bytes: 7659870 },
  { id: 3, clave: 'the-will', url: audioTheWill, portada: Thewill, titulo: 'The Will', autor: 'Bob Proctor', album: 'Desarrollo Personal', segundos: 763, bytes: 12208519 },
  { id: 4, clave: 'percepcion', url: audioPercepcion, portada: PercepcionImg, titulo: 'Percepción', autor: 'Bob Proctor', album: 'Desarrollo Personal', segundos: 646, bytes: 10332719 },
  { id: 5, clave: 'mundo-interno', url: audioMundoInterno, portada: Mundointerno, titulo: 'Mundo interno vs. mundo externo', autor: 'Neville Goddard', album: 'Mente y Realidad', segundos: 199, bytes: 4773971 },
  { id: 6, clave: 'a-tus-ordenes', url: audioATusOrdenes, portada: atusordenes, titulo: 'A tus órdenes', autor: 'Neville Goddard', album: 'Mente y Realidad', segundos: 1408, bytes: 22772102 },
  { id: 7, clave: 'imaginacion-despierta', url: audioImaginacionDespierta, portada: imaginacionDespierta, titulo: 'Imaginación despierta', autor: 'Neville Goddard', album: 'Mente y Realidad', segundos: 1683, bytes: 27217828 },
];

const VELOCIDADES = [1, 1.25, 1.5, 2, 0.75];
const SALTO = 10;

const megas = (bytes) => Math.round(bytes / 1048576);

// 1:02:03 o 2:03
const reloj = (segundos) => {
  const s = Math.max(0, Math.floor(segundos || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`;
};

// "2 h 10 min" o "8 min"
const duracionCorta = (segundos) => {
  const minutos = Math.max(1, Math.round(segundos / 60));
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
};

// RLR · dónde retomar un audio: su avance apuntado, o el inicio si ya casi había terminado
const puntoDeRetomar = (avances, audio) => {
  const apuntado = avances[audio.clave] || 0;
  return apuntado >= audio.segundos - 5 ? 0 : apuntado;
};

const esIphoneSinInstalar = () => {
  if (typeof navigator === 'undefined') return false;
  const esIos = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const instalada = window.navigator.standalone === true ||
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  return esIos && !instalada;
};

const Audios = ({ id, sinTitulo = false }) => {
  const intl = useIntl();
  const t = useCallback(
    (clave, valores) => intl.formatMessage({ id: `downloads.audios.${clave}` }, valores),
    [intl]
  );

  const elemento = useRef(null);
  const urlsLocales = useRef({});   // clave → dirección del archivo guardado
  const avances = useRef(leerAvances());
  const pendiente = useRef(null);   // { segundos } por aplicar cuando cargue el audio
  const cancelaciones = useRef({});
  const ultimoApunte = useRef(0);
  const actualRef = useRef(null);
  const repetirRef = useRef(false);

  const [actual, setActual] = useState(null);
  const [sonando, setSonando] = useState(false);
  const [tiempo, setTiempo] = useState(0);
  const [duracion, setDuracion] = useState(0);
  const [velocidad, setVelocidad] = useState(1);
  const [repetir, setRepetir] = useState(false);
  const [guardados, setGuardados] = useState({});
  const [bajando, setBajando] = useState({});
  const [aviso, setAviso] = useState('');
  const [enLinea, setEnLinea] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [, repintar] = useState(0);
  const puedeGuardar = sePuedeGuardar();

  const audioActual = audios.find((a) => a.id === actual) || null;

  // RLR · al abrir: ver cuáles ya están guardados y dejarlos listos para sonar
  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const rutas = await listarGuardados();
        const mapa = {};
        for (const audio of audios) {
          if (rutas.includes(llaveDe(audio.url))) {
            const archivo = await leerGuardado(audio.url);
            if (archivo) {
              urlsLocales.current[audio.clave] = URL.createObjectURL(archivo);
              mapa[audio.clave] = true;
            }
          }
        }
        if (vivo) setGuardados(mapa);
      } catch (e) {
        /* sin acceso al almacenamiento: la sección funciona solo en línea */
      }
    })();

    const conConexion = () => setEnLinea(true);
    const sinConexion = () => setEnLinea(false);
    window.addEventListener('online', conConexion);
    window.addEventListener('offline', sinConexion);
    const urls = urlsLocales.current;
    const abortos = cancelaciones.current;
    return () => {
      vivo = false;
      window.removeEventListener('online', conConexion);
      window.removeEventListener('offline', sinConexion);
      Object.values(abortos).forEach((control) => control.abort());
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // RLR · apunta el avance del audio que está cargado
  const apuntarAvance = useCallback((forzar) => {
    const el = elemento.current;
    const audio = audios.find((a) => a.id === actualRef.current);
    if (!el || !audio) return;
    const ahora = Date.now();
    if (!forzar && ahora - ultimoApunte.current < 5000) return;
    ultimoApunte.current = ahora;
    avances.current = { ...avances.current, [audio.clave]: Math.floor(el.currentTime || 0) };
    escribirAvances(avances.current);
  }, []);

  useEffect(() => {
    const alSalir = () => apuntarAvance(true);
    window.addEventListener('pagehide', alSalir);
    return () => {
      window.removeEventListener('pagehide', alSalir);
      apuntarAvance(true);
    };
  }, [apuntarAvance]);

  // RLR · carga un audio en el reproductor (guardado si existe; si no, en línea)
  const cargar = useCallback((audio, { reproducir, segundos }) => {
    const el = elemento.current;
    if (!el) return;
    apuntarAvance(true);
    const inicio = segundos != null ? segundos : puntoDeRetomar(avances.current, audio);
    pendiente.current = { segundos: inicio };
    actualRef.current = audio.id;
    setAviso('');
    setActual(audio.id);
    setTiempo(inicio);
    setDuracion(audio.segundos);
    el.src = urlsLocales.current[audio.clave] || audio.url;
    el.playbackRate = velocidad;
    el.load();
    if (reproducir) el.play().catch(() => {});
  }, [apuntarAvance, velocidad]);

  const alternar = (audio) => {
    const el = elemento.current;
    if (!el) return;
    if (actual === audio.id) {
      if (el.paused) el.play().catch(() => {});
      else el.pause();
      return;
    }
    cargar(audio, { reproducir: true });
  };

  const moverA = (audio, segundos) => {
    const el = elemento.current;
    const destino = Math.min(Math.max(0, segundos), audio.segundos);
    if (actual === audio.id && el) {
      const tope = Number.isFinite(el.duration) ? el.duration : audio.segundos;
      el.currentTime = Math.min(destino, tope);
      setTiempo(el.currentTime);
      return;
    }
    // No es el que está cargado: solo se apunta su punto de inicio, sin interrumpir lo que suena.
    avances.current = { ...avances.current, [audio.clave]: Math.floor(destino) };
    escribirAvances(avances.current);
    repintar((n) => n + 1);
  };

  const saltar = (audio, delta) => {
    const el = elemento.current;
    const base = actual === audio.id && el ? el.currentTime : puntoDeRetomar(avances.current, audio);
    moverA(audio, base + delta);
  };

  const cambiarVelocidad = () => {
    const siguiente = VELOCIDADES[(VELOCIDADES.indexOf(velocidad) + 1) % VELOCIDADES.length];
    setVelocidad(siguiente);
    if (elemento.current) elemento.current.playbackRate = siguiente;
  };

  const alternarRepetir = () => {
    repetirRef.current = !repetirRef.current;
    setRepetir(repetirRef.current);
  };

  // RLR · guardar en el navegador, con avance y posibilidad de cancelar
  const guardar = async (audio) => {
    if (bajando[audio.clave] != null) return;
    const control = new AbortController();
    cancelaciones.current[audio.clave] = control;
    setAviso('');
    setBajando((b) => ({ ...b, [audio.clave]: 0 }));
    let ultimo = 0;
    try {
      const archivo = await guardarAudio(
        audio.url,
        (parte) => {
          const porciento = Math.floor(parte * 100);
          if (porciento !== ultimo) {
            ultimo = porciento;
            setBajando((b) => ({ ...b, [audio.clave]: porciento }));
          }
        },
        control.signal,
        audio.bytes
      );
      urlsLocales.current[audio.clave] = URL.createObjectURL(archivo);
      setGuardados((g) => ({ ...g, [audio.clave]: true }));
    } catch (e) {
      if (e.name !== 'AbortError') {
        setAviso(t(e.name === 'QuotaExceededError' ? 'sinEspacio' : 'falloGuardar'));
      }
    } finally {
      delete cancelaciones.current[audio.clave];
      setBajando((b) => {
        const resto = { ...b };
        delete resto[audio.clave];
        return resto;
      });
    }
  };

  const cancelarGuardado = (audio) => {
    const control = cancelaciones.current[audio.clave];
    if (control) control.abort();
  };

  const quitar = async (audio) => {
    await quitarAudio(audio.url).catch(() => {});
    // Si está sonando desde lo guardado, se deja terminar; solo se libera si no es el actual.
    if (actual !== audio.id && urlsLocales.current[audio.clave]) {
      URL.revokeObjectURL(urlsLocales.current[audio.clave]);
      delete urlsLocales.current[audio.clave];
    }
    setGuardados((g) => {
      const resto = { ...g };
      delete resto[audio.clave];
      return resto;
    });
  };

  // RLR · controles del sistema (pantalla de bloqueo, audífonos, reloj)
  useEffect(() => {
    if (!('mediaSession' in navigator) || !audioActual) return;
    const el = elemento.current;
    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: audioActual.titulo,
        artist: audioActual.autor || _RLR,
        album: audioActual.album,
        artwork: [{ src: audioActual.portada, sizes: '512x512', type: 'image/png' }],
      });
      const indice = audios.findIndex((a) => a.id === audioActual.id);
      const acciones = {
        play: () => el.play().catch(() => {}),
        pause: () => el.pause(),
        seekbackward: (d) => { el.currentTime = Math.max(0, el.currentTime - (d.seekOffset || SALTO)); },
        seekforward: (d) => { el.currentTime = Math.min(el.duration || audioActual.segundos, el.currentTime + (d.seekOffset || SALTO)); },
        seekto: (d) => { if (d.seekTime != null) el.currentTime = d.seekTime; },
        previoustrack: indice > 0 ? () => cargar(audios[indice - 1], { reproducir: true }) : null,
        nexttrack: indice < audios.length - 1 ? () => cargar(audios[indice + 1], { reproducir: true }) : null,
      };
      Object.entries(acciones).forEach(([accion, manejador]) => {
        try { navigator.mediaSession.setActionHandler(accion, manejador); } catch (e) { /* acción no disponible */ }
      });
    } catch (e) {
      /* navegador sin controles del sistema */
    }
  }, [audioActual, cargar]);

  // RLR · eventos del <audio>
  const alCargarDatos = () => {
    const el = elemento.current;
    if (Number.isFinite(el.duration) && el.duration > 0) setDuracion(el.duration);
    if (pendiente.current) {
      const { segundos } = pendiente.current;
      pendiente.current = null;
      if (segundos > 0) el.currentTime = segundos;
    }
  };

  const alAvanzar = () => {
    const el = elemento.current;
    if (pendiente.current) return;
    setTiempo(el.currentTime);
    apuntarAvance(false);
  };

  const alTerminar = () => {
    const el = elemento.current;
    const audio = audios.find((a) => a.id === actualRef.current);
    if (repetirRef.current) {
      el.currentTime = 0;
      el.play().catch(() => {});
      return;
    }
    if (audio) {
      avances.current = { ...avances.current, [audio.clave]: 0 };
      escribirAvances(avances.current);
    }
    setSonando(false);
    setTiempo(0);
  };

  const alFallar = () => {
    if (!actualRef.current) return;
    setSonando(false);
    setAviso(t(navigator.onLine ? 'falloReproducir' : 'sinConexion'));
  };

  const cuantos = audios.filter((a) => guardados[a.clave]).length;
  const pesoGuardado = audios.filter((a) => guardados[a.clave]).reduce((suma, a) => suma + a.bytes, 0);

  return (
    <ContentBox id={id} varmaxwidth='1440px' varwidth='100%' vardisplay='flex' varpadding={sinTitulo ? '48px 0 120px' : '20px 0 120px'}>
      <div className='rlr-audios' data-author='RLR' data-k={_k.toLowerCase()} data-rev={_rev}>
        <div className={`rlr-audios__cabecera${sinTitulo ? ' rlr-audios__cabecera--sola' : ''}`}>
          {!sinTitulo && (
          <RedHatDisplay
              as='h2'
              varfontsize='26px'
              varweight='700'
              varcolor='#232E35'
              vartextalign='left'
              varpadding='0px'
              textalignmovil='center'
            >
              <FormattedMessage id='downloads.audios.title' />
            </RedHatDisplay>
          )}
          {puedeGuardar && (
            <p className='rlr-audios__resumen' aria-live='polite'>
              <OfflinePinRounded fontSize='small' aria-hidden='true' />
              {cuantos
                ? t('resumen', { n: cuantos, total: audios.length, mb: megas(pesoGuardado) })
                : t('resumenVacio')}
            </p>
          )}
        </div>
        {(!sinTitulo || !puedeGuardar) && (
          <p className='rlr-audios__bajada'>
            {puedeGuardar ? t('subtitle') : t('noCompatible')}
          </p>
        )}
        {puedeGuardar && cuantos > 0 && esIphoneSinInstalar() && (
          <p className='rlr-audios__nota'>{t('notaIphone')}</p>
        )}
        {!enLinea && <p className='rlr-audios__nota rlr-audios__nota--alerta'>{t('sinConexion')}</p>}
        {aviso && <p className='rlr-audios__nota rlr-audios__nota--alerta' role='alert'>{aviso}</p>}

        {/* RLR · un solo reproductor para toda la sección */}
        <audio
          ref={elemento}
          preload='none'
          onLoadedMetadata={alCargarDatos}
          onTimeUpdate={alAvanzar}
          onPlay={() => setSonando(true)}
          onPause={() => { setSonando(false); apuntarAvance(true); repintar((n) => n + 1); }}
          onEnded={alTerminar}
          onError={alFallar}
        />

        <div className='rlr-audios__rejilla'>
          {audios.map((audio) => {
            const esActual = actual === audio.id;
            const estaSonando = esActual && sonando;
            const guardado = !!guardados[audio.clave];
            const porciento = bajando[audio.clave];
            const estaBajando = porciento != null;
            const total = esActual && duracion ? duracion : audio.segundos;
            const posicion = esActual ? tiempo : puntoDeRetomar(avances.current, audio);
            const sinAcceso = !enLinea && !guardado;
            const avance = total ? Math.min(100, (posicion / total) * 100) : 0;

            return (
              <article
                key={audio.id}
                className={`rlr-audio${esActual ? ' rlr-audio--actual' : ''}${sinAcceso ? ' rlr-audio--apagado' : ''}`}
              >
                <div className='rlr-audio__portada'>
                  <img src={audio.portada} alt='' loading='lazy' width='327' height='327' />
                  {guardado && (
                    <span className='rlr-audio__sello'>
                      <OfflinePinRounded fontSize='inherit' aria-hidden='true' />
                      {t('sello')}
                    </span>
                  )}
                </div>

                <div className='rlr-audio__cuerpo'>
                  <h3 className='rlr-audio__titulo'>{audio.titulo}</h3>
                  <p className='rlr-audio__datos'>
                    {audio.autor ? `${audio.autor} · ` : ''}{duracionCorta(audio.segundos)}
                  </p>

                  <input
                    className='rlr-audio__barra'
                    type='range'
                    min='0'
                    max={Math.floor(total)}
                    step='1'
                    value={Math.floor(posicion)}
                    disabled={sinAcceso}
                    onChange={(e) => moverA(audio, Number(e.target.value))}
                    aria-label={t('avance', { titulo: audio.titulo })}
                    aria-valuetext={`${reloj(posicion)} / ${reloj(total)}`}
                    style={{ '--avance': `${avance}%` }}
                  />
                  <div className='rlr-audio__tiempos'>
                    <span>{reloj(posicion)}</span>
                    <span>{reloj(total)}</span>
                  </div>

                  <div className='rlr-audio__controles'>
                    <button
                      type='button'
                      className='rlr-audio__chico rlr-audio__chico--texto'
                      onClick={cambiarVelocidad}
                      aria-label={t('velocidad', { x: velocidad })}
                      title={t('velocidad', { x: velocidad })}
                    >
                      {velocidad}×
                    </button>
                    <button
                      type='button'
                      className='rlr-audio__boton'
                      onClick={() => saltar(audio, -SALTO)}
                      disabled={sinAcceso}
                      aria-label={t('atras10')}
                      title={t('atras10')}
                    >
                      <Replay10Rounded aria-hidden='true' />
                    </button>
                    <button
                      type='button'
                      className='rlr-audio__boton rlr-audio__boton--principal'
                      onClick={() => alternar(audio)}
                      disabled={sinAcceso}
                      aria-label={`${t(estaSonando ? 'pausar' : 'reproducir')}: ${audio.titulo}`}
                    >
                      {estaSonando ? <PauseRounded aria-hidden='true' /> : <PlayArrowRounded aria-hidden='true' />}
                    </button>
                    <button
                      type='button'
                      className='rlr-audio__boton'
                      onClick={() => saltar(audio, SALTO)}
                      disabled={sinAcceso}
                      aria-label={t('adelante10')}
                      title={t('adelante10')}
                    >
                      <Forward10Rounded aria-hidden='true' />
                    </button>
                    <button
                      type='button'
                      className={`rlr-audio__chico${repetir ? ' rlr-audio__chico--activo' : ''}`}
                      onClick={alternarRepetir}
                      aria-pressed={repetir}
                      aria-label={t('repetir')}
                      title={t('repetir')}
                    >
                      <RepeatOneRounded fontSize='small' aria-hidden='true' />
                    </button>
                  </div>

                  {puedeGuardar && (
                    <div className='rlr-audio__guardar'>
                      {estaBajando && (
                        <>
                          <div className='rlr-audio__progreso' role='progressbar' aria-valuenow={porciento} aria-valuemin='0' aria-valuemax='100'>
                            <span style={{ width: `${porciento}%` }} />
                          </div>
                          <div className='rlr-audio__fila'>
                            <span>{t('guardando', { pct: porciento })}</span>
                            <button type='button' className='rlr-audio__liga' onClick={() => cancelarGuardado(audio)}>
                              {t('cancelar')}
                            </button>
                          </div>
                        </>
                      )}
                      {!estaBajando && guardado && (
                        <div className='rlr-audio__fila rlr-audio__fila--listo'>
                          <span>
                            <OfflinePinRounded fontSize='small' aria-hidden='true' />
                            {t('guardado')}
                          </span>
                          <button type='button' className='rlr-audio__liga' onClick={() => quitar(audio)}>
                            {t('quitar')}
                          </button>
                        </div>
                      )}
                      {!estaBajando && !guardado && (
                        <button
                          type='button'
                          className='rlr-audio__guardarBoton'
                          onClick={() => guardar(audio)}
                          disabled={!enLinea}
                        >
                          <DownloadForOfflineRounded fontSize='small' aria-hidden='true' />
                          {t('guardar', { mb: megas(audio.bytes) })}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </ContentBox>
  );
};

export default Audios;
// RLR · fin · Ricardo López Reyero
