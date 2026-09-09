/*
 * Lógica de negocio del pénsum: evaluación de requisitos, estados y sumatorias.
 * No toca el DOM ni depende de localStorage directamente (eso vive en state.js).
 */

const STATUS = {
  NONE: null,
  APROBADA: 'aprobada',
  CURSANDO: 'cursando',
  POR_CURSAR: 'porCursar',
};

/**
 * Construye un índice code -> asignatura combinando todas las materias de los semestres
 * (resolviendo cupos de electiva ya asignados via `slots`) y todos los catálogos de electivas.
 */
function buildSubjectIndex(slots) {
  const index = {};

  for (const catalog of ELECTIVE_CATALOGS) {
    for (const subj of catalog.subjects) {
      index[subj.code] = subj;
    }
  }

  for (const sem of SEMESTERS) {
    for (const subj of sem.subjects) {
      if (subj.isElective) continue;
      index[subj.code] = subj;
    }
  }

  return index;
}

/** Códigos de todas las materias "obligatorias de la malla" (semestres I-IX), resolviendo electivas. */
function getAllPreviousCodes(slots) {
  const codes = [];
  for (const sem of SEMESTERS) {
    if (sem.numero === 'X') continue;
    for (const subj of sem.subjects) {
      if (subj.isElective) {
        const assigned = slots[subj.slotId];
        if (assigned) codes.push(assigned);
        else codes.push(null); // cupo sin asignar: nunca se puede completar "todas aprobadas"
      } else {
        codes.push(subj.code);
      }
    }
  }
  return codes;
}

function sumApprovedUC(status, index) {
  let total = 0;
  for (const code in status) {
    if (status[code] === STATUS.APROBADA) {
      const subj = index[code];
      if (subj) total += subj.uc;
    }
  }
  return total;
}

function sumInProgressUC(status, index) {
  let total = 0;
  for (const code in status) {
    if (status[code] === STATUS.CURSANDO || status[code] === STATUS.POR_CURSAR) {
      const subj = index[code];
      if (subj) total += subj.uc;
    }
  }
  return total;
}

/**
 * Evalúa si se cumplen TODOS los requisitos (AND) de una asignatura.
 * ctx = { status, approvedUC, allPreviousCodes }
 */
function meetsRequirements(reqs, ctx) {
  if (!reqs || reqs.length === 0) return true;

  for (const clause of reqs) {
    if (clause.type === 'course') {
      if (ctx.status[clause.code] !== STATUS.APROBADA) return false;
    } else if (clause.type === 'parallel') {
      const s = ctx.status[clause.code];
      if (s !== STATUS.APROBADA && s !== STATUS.CURSANDO && s !== STATUS.POR_CURSAR) return false;
    } else if (clause.type === 'uca') {
      if (ctx.approvedUC < clause.amount) return false;
    } else if (clause.type === 'all') {
      for (const code of ctx.allPreviousCodes) {
        if (!code || ctx.status[code] !== STATUS.APROBADA) return false;
      }
    }
  }
  return true;
}

/** Determina el estado visual de una fila: 'aprobada' | 'cursando' | 'porCursar' | 'disponible' | 'bloqueada'. */
function getRowState(subjectCode, reqs, ctx) {
  const status = ctx.status[subjectCode];
  if (status === STATUS.APROBADA) return 'aprobada';
  if (status === STATUS.CURSANDO) return 'cursando';
  if (status === STATUS.POR_CURSAR) return 'porCursar';
  return meetsRequirements(reqs, ctx) ? 'disponible' : 'bloqueada';
}

function buildContext(status, index, slots) {
  return {
    status,
    approvedUC: sumApprovedUC(status, index),
    allPreviousCodes: getAllPreviousCodes(slots),
  };
}
