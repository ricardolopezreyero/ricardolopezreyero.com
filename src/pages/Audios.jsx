// RLR · Página de Audios · Ricardo López Reyero
// Los audios tienen su propia página (/audios): portada + reproductor con guardado sin internet.
import React, { useRef, lazy, Suspense } from 'react';
import { ContentBox } from '../components/Styled';
import Hero from '../sections/Descargas/Hero/Hero';
import AudiosSeccion from '../sections/Descargas/Audios/Audios';
import { useAparicion } from '../components/aparicion';

const Bottom = lazy(() => import('../sections/Descargas/Bottom/Bottom'));

const Audios = () => {
  const contenedor = useRef(null);
  useAparicion(contenedor);

  return (
    <ContentBox ref={contenedor} varwidth='100%' varmaxwidth='100%' vardisplay='flex'>
      <Hero
        id='hero'
        encima='audios.hero.above'
        titulo='downloads.audios.title'
        descripcion='audios.hero.description'
      />
      <AudiosSeccion id='audios' sinTitulo />
      <Suspense fallback={null}>
        <Bottom id='compartir' />
      </Suspense>
    </ContentBox>
  );
};

export default Audios;
