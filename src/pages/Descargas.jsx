import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { useAparicion } from '../components/aparicion';
import { useLocation, useNavigate } from 'react-router-dom';
import { ContentBox } from '../components/Styled';
import Hero from '../sections/Descargas/Hero/Hero';
import Indice from '../sections/Descargas/Indice/Indice';
const Tarjetas = lazy(() => import('../sections/Descargas/Tarjetas/Tarjetas'));
const Leidos = lazy(() => import('../sections/Descargas/Leidos/Leidos'));
const Atajos = lazy(() => import('../sections/Descargas/Atajos/Atajos'));
const Cuadros = lazy(() => import('../sections/Descargas/Cuadros/Cuadros'));
const Habladores = lazy(() => import('../sections/Descargas/Habladores/Habladores'));
const Bottom = lazy(() => import('../sections/Descargas/Bottom/Bottom'));

const Descargas = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const contenedor = useRef(null);
  useAparicion(contenedor);

  // RLR · las secciones cargan por partes: se espera a que exista la del enlace (#audios, etc.)
  useEffect(() => {
    const hash = location.hash;
    if (!hash) return undefined;
    if (hash === '#audios') {
      // Los audios ya tienen su propia página
      navigate(location.pathname.startsWith('/en') ? '/en/audios' : '/audios', { replace: true });
      return undefined;
    }
    let intentos = 0;
    let reloj = 0;
    const buscar = () => {
      const element = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else if (intentos < 30) {
        intentos += 1;
        reloj = window.setTimeout(buscar, 100);
      }
    };
    buscar();
    return () => window.clearTimeout(reloj);
  }, [location, navigate]);

  return (
    <ContentBox ref={contenedor} varwidth="100%" varmaxwidth="100%" vardisplay="flex">
      <Suspense fallback={null}>
        <Hero id="hero" />
        <Indice />
        <Tarjetas id="tarjetas-objetivos" />
        <Leidos id="libros-leidos" />
        <Atajos id="atajos-para-la-abundancia" />
        <Cuadros id="cuadros-explicativos" />
        <Habladores id="habladores" />
        <Bottom id="compartir" />
      </Suspense>
    </ContentBox>
  );
};

export default Descargas;