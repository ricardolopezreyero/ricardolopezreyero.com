import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import './App.css';
import './transiciones.css';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

import { IntlProvider } from 'react-intl';
import esMessages from './locales/es.json';
import enMessages from './locales/en.json';
import Documentos from './pages/Documentos';

const messages = {
  es: esMessages,
  en: enMessages,
};
const Home = lazy(() => import('./pages/Home'));
const Descargas = lazy(() => import('./pages/Descargas'));
const Audios = lazy(() => import('./pages/Audios'));
const Escritos = lazy(() => import('./pages/Escritos'));
const Escrito = lazy(() => import('./pages/Escrito'));
// Hook para manejar el scroll a la sección con hash en la URL
function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]); // Se ejecuta cada vez que cambia la ubicación (incluyendo el hash)

  return null; // Este componente solo maneja efectos secundarios
}

// RLR · Transición entre páginas: la que se va se desvanece, se sube al inicio y entra la nueva.
// Los cambios dentro de la misma página (anclas #, filtros ?tema=) no se animan.
function Paginas() {
  const location = useLocation();
  const [mostrada, setMostrada] = useState(location);
  const [fase, setFase] = useState('entra');

  useEffect(() => {
    if (location.pathname === mostrada.pathname) {
      if (location !== mostrada) setMostrada(location);
      return undefined;
    }
    const cambiar = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      setMostrada(location);
      setFase('entra');
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cambiar();
      return undefined;
    }
    setFase('sale');
    const reloj = window.setTimeout(cambiar, 180); // lo que dura rlr-sale en transiciones.css
    return () => window.clearTimeout(reloj);
  }, [location, mostrada]);

  return (
    <main className={`rlr-pagina rlr-pagina--${fase}`} key={mostrada.pathname}>
      <Suspense fallback={<div className="rlr-pagina__espera" />}>
        <Routes location={mostrada}>
          <Route path="/" element={<Home />} />
          <Route path="/descargas" element={<Descargas />} />
          <Route path="/audios" element={<Audios />} />
          <Route path="/escritos" element={<Escritos />} />
          <Route path="/escritos/:slug" element={<Escrito />} />
          <Route path="/documentos-importantes" element={<Documentos />} />

          {/* Mismas páginas con el sitio en inglés */}
          <Route path="/en" element={<Home />} />
          <Route path="/en/descargas" element={<Descargas />} />
          <Route path="/en/audios" element={<Audios />} />
          <Route path="/en/escritos" element={<Escritos />} />
          <Route path="/en/escritos/:slug" element={<Escrito />} />
          <Route path="/en/documentos-importantes" element={<Documentos />} />

          {/* Cualquier otra dirección lleva al inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </main>
  );
}

function App() {
  const [language, setLanguage] = useState('es');

  useEffect(() => {
    const path = window.location.pathname;
    setLanguage(path.startsWith('/en') ? 'en' : 'es');
  }, []);

  const footerRef = useRef(null);

  return (
    <IntlProvider locale={language} messages={messages[language]}>
      <Header footerRef={footerRef} />

      {/* Agrega el componente que maneja el hash */}
      <ScrollToHash />
      <Paginas />
      <Footer footerRef={footerRef} />
    </IntlProvider>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
