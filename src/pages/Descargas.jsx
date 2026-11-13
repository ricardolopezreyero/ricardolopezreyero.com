import React, { useEffect, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { ContentBox } from '../components/Styled';
import Hero from '../sections/Descargas/Hero/Hero';
import Indice from '../sections/Descargas/Indice/Indice';
const Tarjetas = lazy(() => import('../sections/Descargas/Tarjetas/Tarjetas'));
const Leidos = lazy(() => import('../sections/Descargas/Leidos/Leidos'));
const Atajos = lazy(() => import('../sections/Descargas/Atajos/Atajos'));
const Audios = lazy(() => import('../sections/Descargas/Audios/Audios'));
const Cuadros = lazy(() => import('../sections/Descargas/Cuadros/Cuadros'));
const Habladores = lazy(() => import('../sections/Descargas/Habladores/Habladores'));
const Bottom = lazy(() => import('../sections/Descargas/Bottom/Bottom'));

const Descargas = () => {
  const location = useLocation();

  // RLR · las secciones cargan por partes: se espera a que exista la del enlace (#audios, etc.)
  useEffect(() => {
    const hash = location.hash;
    if (!hash) return undefined;
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
  }, [location]);

  return (
    <ContentBox varwidth="100%" varmaxwidth="100%" vardisplay="flex">
      <Suspense fallback={<div>Cargando...</div>}>
        <Hero id="hero" />
        <Indice />
        <Tarjetas id="tarjetas-objetivos" />
        <Leidos id="libros-leidos" />
        <Atajos id="atajos-para-la-abundancia" />
        <Audios id="audios" />
        <Cuadros id="cuadros-explicativos" />
        <Habladores id="habladores" />
        <Bottom id="compartir" />
      </Suspense>
    </ContentBox>
  );
};

export default Descargas;