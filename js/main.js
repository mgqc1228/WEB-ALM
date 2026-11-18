/* Secundaria Adolfo López Mateos · Campus Poncitlán
   main.js · Base Día 1 + Mejoras visuales
   1) Carga de partials (header y footer)  2) Navegación activa
   3) Menú móvil  4) Animación fade-in */
(() => {
  'use strict';

  // 1) Partials: <div data-include="partials/header.html"></div>
  // Rutas relativas (sin "/" inicial) para que funcione en GitHub Pages.
  async function cargarPartial(el) {
    const url = el.dataset.include;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      el.innerHTML = await res.text();
    } catch (err) {
      console.error('No se pudo cargar ' + url, err);
    }
  }

  // 2) Marca con aria-current el enlace de la página actual
  function marcarActivo() {
    let actual = location.pathname.split('/').pop() || 'index.html';
    if (!actual.includes('.')) actual += '.html';
    document.querySelectorAll('.nav-menu a').forEach(a => {
      if (a.getAttribute('href') === actual) a.setAttribute('aria-current', 'page');
    });
  }

  // 3) Menú hamburguesa
  function iniciarMenu() {
    const boton = document.querySelector('.nav-toggle');
    const menu = document.getElementById('nav-menu');
    if (!boton || !menu) return;

    const abrir = abierto => {
      menu.classList.toggle('open', abierto);
      boton.setAttribute('aria-expanded', String(abierto));
      boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    };

    boton.addEventListener('click', () => abrir(!menu.classList.contains('open')));
    menu.addEventListener('click', e => { if (e.target.closest('a')) abrir(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') abrir(false); });
  }

  // 4) Fade-in al hacer scroll (cualquier elemento con clase .fade)
  function iniciarFade() {
    const items = document.querySelectorAll('.fade');
    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('show'));
      return;
    }
    const observer = new IntersectionObserver(entradas => {
      entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('show');
          observer.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(el => observer.observe(el));
  }

  document.addEventListener('DOMContentLoaded', async () => {
    iniciarFade();
    await Promise.all([...document.querySelectorAll('[data-include]')].map(cargarPartial));
    marcarActivo();
    iniciarMenu();
  });
})();

/* === MEJORAS VISUALES === */

/* Encabezado compacto */
(() => {
  const raiz = document.documentElement;
  let compacto = false;

  function actualizarEncabezado() {
    compacto = window.scrollY > (compacto ? 64 : 96);
    raiz.classList.toggle('encabezado-compacto', compacto);
  }

  window.addEventListener('scroll', actualizarEncabezado, { passive: true });
  window.addEventListener('pageshow', actualizarEncabezado);
  actualizarEncabezado();
})();

/* Indicador de lectura */
(() => {
  const raiz = document.documentElement;
  let cuadro = null;

  function actualizarProgreso() {
    cuadro = null;
    const altoDesplazable = raiz.scrollHeight - raiz.clientHeight;
    const proporcion = altoDesplazable > 0 ? window.scrollY / altoDesplazable : 0;
    raiz.style.setProperty('--progreso-lectura', Math.max(0, Math.min(proporcion, 1)));
  }

  function programarProgreso() {
    if (cuadro === null) cuadro = requestAnimationFrame(actualizarProgreso);
  }

  window.addEventListener('scroll', programarProgreso, { passive: true });
  window.addEventListener('resize', programarProgreso);
  window.addEventListener('pageshow', programarProgreso);
  if ('ResizeObserver' in window) new ResizeObserver(programarProgreso).observe(document.body);
  programarProgreso();
})();

/* Aparición escalonada de tarjetas */
if ('IntersectionObserver' in window) {
  const observarTarjetas = new IntersectionObserver(entradas => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      entrada.target.classList.add('card-entrada');
      observarTarjetas.unobserve(entrada.target);
    }
  }, { rootMargin: '0px 0px -24px 0px' });

  document.querySelectorAll('#contenido .card').forEach(tarjeta => observarTarjetas.observe(tarjeta));
}

/* Volver arriba */
(() => {
  const contenido = document.getElementById('contenido');
  if (!contenido) return;

  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'volver-arriba';
  boton.textContent = 'Volver arriba';
  boton.hidden = true;
  document.body.append(boton);

  function actualizarBoton() {
    boton.hidden = window.scrollY < 480 && document.activeElement !== boton;
  }

  boton.addEventListener('click', () => {
    const teniaTabindex = contenido.hasAttribute('tabindex');
    if (!teniaTabindex) contenido.setAttribute('tabindex', '-1');
    contenido.focus({ preventScroll: true });
    if (!teniaTabindex) contenido.removeAttribute('tabindex');
    window.scrollTo({ top: 0 });
  });
  boton.addEventListener('blur', actualizarBoton);
  window.addEventListener('scroll', actualizarBoton, { passive: true });
  window.addEventListener('pageshow', actualizarBoton);
  actualizarBoton();
})();
