// RLR · Aparición suave de secciones · Ricardo López Reyero
// Cada sección (hijo directo del contenedor) entra con un desvanecido corto cuando llega a la
// pantalla. Lo que ya está a la vista al cargar no se anima, y quien pide menos movimiento en
// su sistema no ve animación. Estilos en src/transiciones.css.
import { useEffect } from 'react';

export function useAparicion(ref) {
  useEffect(() => {
    const contenedor = ref.current;
    if (!contenedor || !('IntersectionObserver' in window) || !('MutationObserver' in window)) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const vigia = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          entrada.target.classList.add('rlr-aparece--visto');
          vigia.unobserve(entrada.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.04 }
    );

    const preparar = (el) => {
      if (el.nodeType !== 1 || el.dataset.aparece) return;
      el.dataset.aparece = '1';
      // Lo que ya se ve al llegar (o es una barra fija) se queda como está.
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
      el.classList.add('rlr-aparece');
      vigia.observe(el);
    };

    Array.from(contenedor.children).forEach(preparar);
    // Las secciones que cargan después (lazy) también entran suave.
    const cambios = new MutationObserver((lista) => {
      lista.forEach((cambio) => cambio.addedNodes.forEach(preparar));
    });
    cambios.observe(contenedor, { childList: true });

    return () => {
      vigia.disconnect();
      cambios.disconnect();
    };
  }, [ref]);
}
