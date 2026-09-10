/*
 * Guía rápida para quien abre la app por primera vez. Independiente del
 * estado del pénsum: solo recuerda si ya se descartó, en su propia clave
 * de localStorage (mismo patrón que theme.js).
 */

(function () {
  const DISMISSED_KEY = 'pensum-onboarding-dismissed';
  const banner = document.getElementById('onboarding-banner');
  const dismissBtn = document.getElementById('onboarding-dismiss');
  const helpBtn = document.getElementById('btn-ayuda');
  if (!banner) return;

  function safeGet() {
    try {
      return localStorage.getItem(DISMISSED_KEY);
    } catch (e) {
      return null;
    }
  }

  function safeSet() {
    try {
      localStorage.setItem(DISMISSED_KEY, 'true');
    } catch (e) {
      /* localStorage no disponible: el banner simplemente reaparecerá cada vez. */
    }
  }

  if (!safeGet()) banner.classList.remove('hidden');

  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      banner.classList.add('hidden');
      safeSet();
    });
  }

  if (helpBtn) {
    helpBtn.addEventListener('click', () => {
      banner.classList.remove('hidden');
      banner.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
})();
