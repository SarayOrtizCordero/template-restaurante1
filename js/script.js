/* ============================================================
   SCRIPT.JS — El Fogón Porteño
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── 1. AÑO ACTUAL EN FOOTER ─────────────────────────── */
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* ─── 2. FECHA MÍNIMA EN INPUT DATE (hoy + 1) ─────────── */
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
  }


  /* ─── 3. TELÉFONO CENTRALIZADO ─────────────────────────── */
  const PHONE = document.body.dataset.phone || '5491112345678';

  // Actualiza todos los links de WhatsApp y tel desde un único dato
  document.querySelectorAll('a[href*="wa.me/"]').forEach(link => {
    link.href = link.href.replace(/wa\.me\/[\d]+/, `wa.me/${PHONE}`);
  });
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.href = `tel:+${PHONE}`;
  });


  /* ─── 4. STICKY HEADER ─────────────────────────────────── */
  const header = document.getElementById('header');

  function updateHeader() {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();


  /* ─── 5. MENÚ HAMBURGUESA ───────────────────────────────── */
  const hamburger   = document.getElementById('hamburger');
  const navList     = document.getElementById('nav-list');
  const menuOverlay = document.getElementById('menu-overlay');

  function openMenu() {
    navList.classList.add('open');
    menuOverlay.classList.add('visible');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navList.classList.remove('open');
    menuOverlay.classList.remove('visible');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () =>
    navList.classList.contains('open') ? closeMenu() : openMenu()
  );
  menuOverlay.addEventListener('click', closeMenu);
  navList.querySelectorAll('.nav__link').forEach(link =>
    link.addEventListener('click', closeMenu)
  );
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });


  /* ─── 6. SCROLL SPY con IntersectionObserver ────────────── */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  const scrollSpyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    },
    {
      // Activa cuando la sección entra en el 40% superior de la ventana
      rootMargin: `-${header.offsetHeight}px 0px -55% 0px`,
      threshold: 0
    }
  );
  sections.forEach(s => scrollSpyObserver.observe(s));


  /* ─── 7. TABS DEL MENÚ ──────────────────────────────────── */
  const tabs      = document.querySelectorAll('.menu__tab');
  const menuCards = document.querySelectorAll('.menu__card');

  function filterMenu(category) {
    let visibleIndex = 0;

    menuCards.forEach(card => {
      const match = card.dataset.category === category;

      if (match) {
        card.classList.remove('hidden', 'animate-in');
        card.style.transitionDelay = `${visibleIndex * 0.08}s`;

        // Reflow trick: fuerza el browser a repintar antes de re-agregar las clases
        void card.offsetWidth;

        card.classList.add('visible', 'animate-in');
        visibleIndex++;
      } else {
        card.style.transitionDelay = '';
        card.classList.add('hidden');
        card.classList.remove('visible');
      }
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      filterMenu(tab.dataset.category);
    });
  });

  // Mostrar la primera categoría al cargar
  const firstTab = document.querySelector('.menu__tab.active');
  if (firstTab) filterMenu(firstTab.dataset.category);



  /* ─── 9. SCROLL REVEAL (IntersectionObserver) ───────────── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ─── 11. VALIDACIÓN DEL FORMULARIO ────────────────────── */
  const form       = document.getElementById('reservation-form');
  const successMsg = document.getElementById('form-success');
  const submitBtn  = document.getElementById('submit-btn');
  const resetBtn   = document.getElementById('form-reset-btn');

  if (form) {
    function showError(fieldId, msg) {
      const input = document.getElementById(fieldId);
      const error = document.getElementById(`${fieldId}-error`);
      if (input) { input.classList.add('error'); input.classList.remove('success'); }
      if (error)   error.textContent = msg;
    }

    function clearError(fieldId) {
      const input = document.getElementById(fieldId);
      const error = document.getElementById(`${fieldId}-error`);
      if (input) input.classList.remove('error');
      if (error) error.textContent = '';
    }

    function markSuccess(fieldId) {
      const input = document.getElementById(fieldId);
      if (input) { input.classList.remove('error'); input.classList.add('success'); }
    }

    const fields = ['name', 'email', 'phone', 'guests', 'date', 'time'];

    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input',  () => validateField(id));
      if (el) el.addEventListener('change', () => validateField(id));
    });

    function validateField(id) {
      const val = (document.getElementById(id)?.value || '').trim();

      switch (id) {
        case 'name':
          if (!val)           { showError('name', 'El nombre es obligatorio.');   return false; }
          if (val.length < 2) { showError('name', 'Mínimo 2 caracteres.');        return false; }
          markSuccess('name'); clearError('name'); return true;

        case 'email': {
          const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
          if (!val)         { showError('email', 'El email es obligatorio.');     return false; }
          if (!re.test(val)){ showError('email', 'Ingresá un email válido.');     return false; }
          markSuccess('email'); clearError('email'); return true;
        }

        case 'phone': {
          const digits = val.replace(/\D/g, '');
          if (!val)              { showError('phone', 'El teléfono es obligatorio.');  return false; }
          if (digits.length < 8) { showError('phone', 'Ingresá un teléfono válido.'); return false; }
          markSuccess('phone'); clearError('phone'); return true;
        }

        case 'guests':
          if (!val) { showError('guests', 'Seleccioná la cantidad de personas.'); return false; }
          markSuccess('guests'); clearError('guests'); return true;

        case 'date': {
          if (!val) { showError('date', 'Seleccioná una fecha.'); return false; }
          const chosen  = new Date(val);
          const minDate = new Date();
          minDate.setHours(0, 0, 0, 0);
          if (chosen <= minDate) { showError('date', 'La fecha debe ser a partir de mañana.'); return false; }
          markSuccess('date'); clearError('date'); return true;
        }

        case 'time':
          if (!val) { showError('time', 'Seleccioná un horario.'); return false; }
          markSuccess('time'); clearError('time'); return true;

        default: return true;
      }
    }

    form.addEventListener('submit', e => {
      e.preventDefault();

      const allValid = fields.map(id => validateField(id)).every(Boolean);
      if (!allValid) {
        const firstError = form.querySelector('.form__input.error');
        if (firstError) firstError.focus();
        return;
      }

      // Estado de carga
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Enviando...';

      // Simulación de envío — reemplazar con Formspree o backend real
      setTimeout(() => {
        form.hidden = true;
        if (successMsg) {
          successMsg.removeAttribute('hidden');
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 1200);
    });

    // Botón "Hacer otra reserva"
    if (resetBtn && successMsg) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        form.hidden = false;
        successMsg.hidden = true;
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check-circle" aria-hidden="true"></i> Confirmar Reserva';
        fields.forEach(id => {
          clearError(id);
          const input = document.getElementById(id);
          if (input) input.classList.remove('success', 'error');
        });
        // Restaurar fecha mínima
        if (dateInput) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          dateInput.min = tomorrow.toISOString().split('T')[0];
        }
        form.querySelector('.form__input')?.focus();
      });
    }
  }


  /* ─── 12. LIGHTBOX DE GALERÍA ───────────────────────────── */
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev  = document.getElementById('lightbox-prev');
  const lightboxNext  = document.getElementById('lightbox-next');

  if (lightbox && lightboxImg) {
    const galleryItems = [...document.querySelectorAll('.gallery__item')];
    let currentIndex   = 0;

    function openLightbox(index) {
      currentIndex = (index + galleryItems.length) % galleryItems.length;
      const img = galleryItems[currentIndex].querySelector('img');
      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || '';
      }
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      lightboxClose.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      lightboxImg.src = '';
    }

    function showPrev() { openLightbox(currentIndex - 1); }
    function showNext() { openLightbox(currentIndex + 1); }

    // Abrir al clicar/teclado cada item
    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => openLightbox(index));
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });
    });

    // Botones del lightbox
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev)  lightboxPrev.addEventListener('click', showPrev);
    if (lightboxNext)  lightboxNext.addEventListener('click', showNext);

    // Cerrar al clicar el fondo
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });

    // Navegación con teclado (←, →, Escape)
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape')      closeLightbox();
      if (e.key === 'ArrowLeft')   showPrev();
      if (e.key === 'ArrowRight')  showNext();
    });

    // Swipe táctil en el lightbox
    let lbTouchStartX = 0;
    lightbox.addEventListener('touchstart', e => {
      lbTouchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener('touchend', e => {
      const diff = lbTouchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? showNext() : showPrev();
    }, { passive: true });
  }


  /* ─── 13. PARALLAX SUAVE EN EL HERO ─────────────────────── */
  const heroContent = document.querySelector('.hero__content');
  const heroSection = document.getElementById('inicio');

  if (heroContent && heroSection) {
    let heroHeight = heroSection.offsetHeight;

    function updateParallax() {
      const scrollY = window.scrollY;
      if (scrollY < heroHeight) {
        heroContent.style.transform = `translateY(${scrollY * 0.22}px)`;
      }
    }

    window.addEventListener('scroll', updateParallax, { passive: true });
    window.addEventListener('resize', () => {
      heroHeight = heroSection.offsetHeight;
    });
  }


  /* ─── 14. TOOLTIP DE WHATSAPP (solo desktop) ─────────── */
  const waBtn = document.querySelector('.whatsapp-btn');
  if (waBtn && window.innerWidth >= 768) {
    function showWaTooltip() {
      waBtn.classList.add('show-tooltip');
      setTimeout(() => waBtn.classList.remove('show-tooltip'), 3200);
    }

    // Primera aparición a los 6 segundos, luego cada 10
    setTimeout(() => {
      showWaTooltip();
      setInterval(showWaTooltip, 10000);
    }, 6000);
  }


  /* ─── 15. HORARIOS: DÍA ACTUAL + ESTADO ABIERTO/CERRADO + AVISO TEMPORADA ── */

  // Aviso de temporada — visible en el HTML por defecto (más robusto);
  // JS lo oculta si NO es enero. Así funciona aunque el script tarde o falle.
  const seasonalNotice = document.getElementById('seasonal-notice');
  if (seasonalNotice && new Date().getMonth() !== 0) {
    seasonalNotice.hidden = true;
  }

  // Highlight del día actual en la tabla de horarios
  const hoursItems = document.querySelectorAll('.location__hours li[data-days]');
  const todayDay   = new Date().getDay(); // 0=Dom, 1=Lun … 6=Sáb

  hoursItems.forEach(li => {
    const days = li.dataset.days.split(',').map(Number);
    if (days.includes(todayDay)) li.classList.add('today');
  });

  // Badge Abierto / Cerrado
  const statusBadge = document.getElementById('location-status');
  if (statusBadge) {
    const now2 = new Date();
    const day2 = now2.getDay();
    const t2   = now2.getHours() * 60 + now2.getMinutes();
    const noon = 12 * 60;

    let open = false;
    if      (day2 === 0 && t2 < 60)       open = true;                         // Dom madrugada: sábado extendido hasta la 1am
    else if (day2 === 0)                   open = t2 >= noon && t2 < 23 * 60;  // Dom: 12:00–23:00
    else if (day2 >= 1 && day2 <= 5)       open = t2 >= noon;                  // Lun–Vie: 12:00–00:00 (tras medianoche ya es el día siguiente)
    else if (day2 === 6)                   open = t2 >= noon;                  // Sáb: 12:00–01:00 (la 1am del dom la cubre el primer caso)

    statusBadge.textContent = open ? 'Abierto ahora' : 'Cerrado ahora';
    statusBadge.className   = `location__status location__status--${open ? 'open' : 'closed'} is-ready`;
  }

});
