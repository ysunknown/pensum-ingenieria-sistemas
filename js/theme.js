/*
 * Interruptor de tema claro/oscuro. Independiente del estado del pénsum:
 * solo lee/escribe la preferencia de tema en localStorage.
 */

(function () {
  const THEME_KEY = 'pensum-theme';
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = safeGet();
  const isDark = saved ? saved === 'dark' : prefersDark;
  toggle.checked = isDark;

  toggle.addEventListener('change', () => {
    const theme = toggle.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    safeSet(theme);
  });

  function safeGet() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function safeSet(value) {
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch (e) {
      /* localStorage no disponible: el tema simplemente no persiste. */
    }
  }
})();
