/*
 * Menú de opciones (⋮): reiniciar progreso, exportar/imprimir y abrir la guía
 * viven aquí para no ocupar espacio permanente en el header. Independiente
 * del estado del pénsum, igual que theme.js.
 */

(function () {
  const toggle = document.getElementById('menu-toggle');
  const dropdown = document.getElementById('menu-dropdown');
  if (!toggle || !dropdown) return;

  function openMenu() {
    dropdown.classList.remove('hidden');
    toggle.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', onOutsideClick);
    document.addEventListener('keydown', onKeydown);
  }

  function closeMenu() {
    dropdown.classList.add('hidden');
    toggle.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', onOutsideClick);
    document.removeEventListener('keydown', onKeydown);
  }

  function onOutsideClick(e) {
    if (!dropdown.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      closeMenu();
      toggle.focus();
    }
  }

  toggle.addEventListener('click', () => {
    if (dropdown.classList.contains('hidden')) openMenu();
    else closeMenu();
  });

  // Las acciones (reiniciar/exportar/ayuda) cierran el menú al elegirse;
  // el switch de tema se queda quieto para poder seguir viendo el cambio.
  dropdown.querySelectorAll('.menu-item').forEach((item) => {
    item.addEventListener('click', closeMenu);
  });

  const exportBtn = document.getElementById('btn-exportar');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => window.print());
  }

  const printDate = document.getElementById('print-date');
  if (printDate) {
    printDate.textContent = new Date().toLocaleDateString('es-VE', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }
})();
