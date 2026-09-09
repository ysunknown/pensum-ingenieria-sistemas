/*
 * Persistencia del progreso del estudiante en localStorage.
 * Estructura guardada:
 *   { status: { [code]: 'aprobada'|'cursando'|'porCursar' }, slots: { [slotId]: code } }
 */

const STORAGE_KEY = 'pensum-is-2018-state-v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { status: {}, slots: {} };
    const parsed = JSON.parse(raw);
    return {
      status: parsed.status || {},
      slots: parsed.slots || {},
    };
  } catch (err) {
    console.warn('No se pudo leer el progreso guardado, se inicia limpio.', err);
    return { status: {}, slots: {} };
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('No se pudo guardar el progreso.', err);
  }
}

function setSubjectStatus(state, code, newStatus) {
  if (!code) return;
  if (newStatus === STATUS.NONE) {
    delete state.status[code];
  } else {
    state.status[code] = newStatus;
  }
  saveState(state);
}

function assignSlot(state, slotId, code) {
  if (code) {
    state.slots[slotId] = code;
  } else {
    delete state.slots[slotId];
  }
  saveState(state);
}

/** Códigos de electiva ya ocupados en algún cupo, excluyendo opcionalmente un cupo dado. */
function occupiedElectiveCodes(state, excludeSlotId) {
  const set = new Set();
  for (const slotId in state.slots) {
    if (slotId === excludeSlotId) continue;
    set.add(state.slots[slotId]);
  }
  return set;
}

function resetState(state) {
  state.status = {};
  state.slots = {};
  saveState(state);
}
