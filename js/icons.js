/*
 * Iconos de estado en SVG inline (sin dependencias externas). Acompañan el color
 * de cada fila para que el estado no dependa solo del matiz (daltonismo).
 */

const STATUS_ICON_PATHS = {
  aprobada: {
    title: 'Aprobada',
    // check-circle
    body: '<circle cx="12" cy="12" r="9"/><path d="M8 12.3l2.6 2.6L16 9.2"/>',
  },
  cursando: {
    title: 'Cursando',
    // clock
    body: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5l3.3 2"/>',
  },
  porCursar: {
    title: 'Por cursar',
    // x-circle
    body: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
  },
  disponible: {
    title: 'Puede cursarse (requisitos cumplidos)',
    // sparkle
    body: '<path d="M12 3l1.9 6.1L20 11l-6.1 1.9L12 19l-1.9-6.1L4 11l6.1-1.9L12 3z"/>',
  },
};

function createStatusIcon(rowState) {
  const spec = STATUS_ICON_PATHS[rowState];
  if (!spec) return null;

  const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  wrapper.setAttribute('viewBox', '0 0 24 24');
  wrapper.setAttribute('width', '15');
  wrapper.setAttribute('height', '15');
  wrapper.setAttribute('fill', rowState === 'disponible' ? 'currentColor' : 'none');
  wrapper.setAttribute('stroke', 'currentColor');
  wrapper.setAttribute('stroke-width', '2');
  wrapper.setAttribute('stroke-linecap', 'round');
  wrapper.setAttribute('stroke-linejoin', 'round');
  wrapper.setAttribute('aria-hidden', 'true');
  wrapper.classList.add('status-icon', 'status-icon-' + rowState);
  wrapper.innerHTML = spec.body;
  return wrapper;
}
