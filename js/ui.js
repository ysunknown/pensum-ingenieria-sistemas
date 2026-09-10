/*
 * Capa de presentación: construye el DOM a partir de los datos (data.js) y el estado
 * (state.js), usando las evaluaciones de logic.js. No contiene reglas de negocio.
 */

const App = (() => {
  let state = null;
  let index = null; // code -> subject, recalculado cuando cambian los cupos de electiva

  const elSemestres = document.getElementById('semestres');
  const elElectivas = document.getElementById('electivas-catalogos');
  const elTotalAprobadas = document.getElementById('total-uc-aprobadas');
  const elTotalCursando = document.getElementById('total-uc-cursando');
  const elResetBtn = document.getElementById('btn-reset');

  const modalOverlay = document.getElementById('modal-overlay');
  const modalBody = document.getElementById('modal-body');
  const modalTitle = document.getElementById('modal-title');
  const modalClose = document.getElementById('modal-close');

  function init() {
    state = loadState();
    wireStaticEvents();
    renderAll();
  }

  function wireStaticEvents() {
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) closeModal();
    });
    elResetBtn.addEventListener('click', () => {
      if (confirm('¿Reiniciar todo el progreso guardado? Esta acción no se puede deshacer.')) {
        resetState(state);
        renderAll();
      }
    });
  }

  function renderAll() {
    // Recordar la posición de scroll: reconstruir todo el árbol de tarjetas puede
    // hacer que el navegador reancle el scroll a un punto arbitrario (scroll
    // anchoring) al desaparecer el nodo que estaba usando como referencia.
    const scrollY = window.scrollY;

    index = buildSubjectIndex(state.slots);
    const ctx = buildContext(state.status, index, state.slots);

    renderCounters(ctx);
    renderSemesters(ctx);
    renderElectiveCatalogs(ctx);

    window.scrollTo(0, scrollY);
  }

  function renderCounters(ctx) {
    elTotalAprobadas.textContent = ctx.approvedUC;
    elTotalCursando.textContent = sumInProgressUC(state.status, index);
  }

  // ---------- Semestres ----------

  function renderSemesters(ctx) {
    elSemestres.innerHTML = '';
    for (const sem of SEMESTERS) {
      elSemestres.appendChild(createSemesterCard(sem, ctx));
    }
  }

  function createSemesterCard(sem, ctx) {
    const card = document.createElement('section');
    card.className = 'card';

    const header = document.createElement('h2');
    header.className = 'card-title';
    header.textContent = `SEMESTRE ${sem.romano}`;
    card.appendChild(header);

    const table = document.createElement('table');
    table.className = 'subjects-table';
    table.appendChild(createTableHead(true));

    const tbody = document.createElement('tbody');
    let totalUC = 0;
    for (const subj of sem.subjects) {
      totalUC += subj.uc;
      tbody.appendChild(createSubjectRow(subj, ctx, true, sem.romano));
    }
    table.appendChild(tbody);

    const tfoot = document.createElement('tfoot');
    const trFoot = document.createElement('tr');
    const tdLabel = document.createElement('td');
    tdLabel.colSpan = 4;
    tdLabel.className = 'foot-label';
    tdLabel.textContent = 'TOTAL U.C.';
    const tdVal = document.createElement('td');
    tdVal.colSpan = 3;
    tdVal.className = 'foot-value';
    tdVal.textContent = totalUC;
    trFoot.appendChild(tdLabel);
    trFoot.appendChild(tdVal);
    tfoot.appendChild(trFoot);
    table.appendChild(tfoot);

    card.appendChild(table);
    return card;
  }

  function createTableHead(withPorCursar) {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    const cols = ['Código', 'Asignatura', 'UC', 'Requisitos', 'Aprobado', 'Cursando'];
    if (withPorCursar) cols.push('Por cursar');
    for (const c of cols) {
      const th = document.createElement('th');
      th.textContent = c;
      tr.appendChild(th);
    }
    thead.appendChild(tr);
    return thead;
  }

  function createSubjectRow(subj, ctx, withPorCursar, semLabel) {
    const tr = document.createElement('tr');

    if (subj.isElective) {
      const assignedCode = state.slots[subj.slotId];
      if (!assignedCode) {
        return createEmptyElectiveRow(subj, semLabel, withPorCursar);
      }
      const real = index[assignedCode];
      return createResolvedElectiveRow(subj, real, ctx, semLabel, withPorCursar);
    }

    const rowState = getRowState(subj.code, subj.reqs, ctx);
    tr.className = rowClass(rowState);

    tr.appendChild(td(subj.code));
    tr.appendChild(td(nameWithIcon(rowState, subj.name), 'name-cell'));
    tr.appendChild(td(subj.uc));
    tr.appendChild(td(subj.reqText || '—'));
    tr.appendChild(td(checkbox(subj.code, STATUS.APROBADA)));
    tr.appendChild(td(checkbox(subj.code, STATUS.CURSANDO)));
    if (withPorCursar) tr.appendChild(td(checkbox(subj.code, STATUS.POR_CURSAR)));

    return tr;
  }

  function createEmptyElectiveRow(subj, semLabel, withPorCursar) {
    const tr = document.createElement('tr');
    tr.className = 'row-electiva-vacia';
    tr.appendChild(td('—'));

    const tdName = document.createElement('td');
    tdName.className = 'name-cell';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-elegir';
    btn.textContent = `ELECTIVA — elegir…`;
    btn.addEventListener('click', () => openElectiveModal(subj.slotId, semLabel));
    tdName.appendChild(btn);
    tr.appendChild(tdName);

    tr.appendChild(td(subj.uc));
    tr.appendChild(td('—'));
    tr.appendChild(td('', 'checkbox-cell'));
    tr.appendChild(td('', 'checkbox-cell'));
    if (withPorCursar) tr.appendChild(td('', 'checkbox-cell'));
    return tr;
  }

  function createResolvedElectiveRow(subj, real, ctx, semLabel, withPorCursar) {
    const tr = document.createElement('tr');
    const rowState = getRowState(real.code, real.reqs, ctx);
    tr.className = rowClass(rowState);

    tr.appendChild(td(real.code));

    const tdName = document.createElement('td');
    tdName.className = 'name-cell';
    tdName.appendChild(nameWithIcon(rowState, real.name));
    const changeBtn = document.createElement('button');
    changeBtn.type = 'button';
    changeBtn.className = 'btn-cambiar';
    changeBtn.textContent = 'cambiar';
    changeBtn.addEventListener('click', () => openElectiveModal(subj.slotId, semLabel));
    tdName.appendChild(changeBtn);
    tr.appendChild(tdName);

    tr.appendChild(td(real.uc));
    tr.appendChild(td(real.reqText || '—'));
    tr.appendChild(td(checkbox(real.code, STATUS.APROBADA)));
    tr.appendChild(td(checkbox(real.code, STATUS.CURSANDO)));
    if (withPorCursar) tr.appendChild(td(checkbox(real.code, STATUS.POR_CURSAR)));

    return tr;
  }

  function rowClass(rowState) {
    switch (rowState) {
      case 'aprobada': return 'row-aprobada';
      case 'cursando': return 'row-cursando';
      case 'porCursar': return 'row-porcursar';
      case 'disponible': return 'row-disponible';
      default: return 'row-bloqueada';
    }
  }

  function nameWithIcon(rowState, name) {
    const wrap = document.createElement('span');
    wrap.className = 'name-with-icon';
    const icon = createStatusIcon(rowState);
    if (icon) {
      icon.setAttribute('role', 'img');
      const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      titleEl.textContent = STATUS_ICON_PATHS[rowState].title;
      icon.insertBefore(titleEl, icon.firstChild);
      icon.removeAttribute('aria-hidden');
      wrap.appendChild(icon);
    }
    const label = document.createElement('span');
    label.textContent = name;
    wrap.appendChild(label);
    return wrap;
  }

  function td(content, className) {
    const cell = document.createElement('td');
    if (className) cell.className = className;
    if (content instanceof Node) cell.appendChild(content);
    else cell.textContent = content;
    return cell;
  }

  function checkbox(code, statusValue) {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = state.status[code] === statusValue;
    input.addEventListener('change', () => {
      const next = input.checked ? statusValue : STATUS.NONE;
      setSubjectStatus(state, code, next);
      renderAll();
    });
    return input;
  }

  // ---------- Catálogos de electivas ----------

  function renderElectiveCatalogs(ctx) {
    elElectivas.innerHTML = '';
    for (const catalog of ELECTIVE_CATALOGS) {
      elElectivas.appendChild(createCatalogCard(catalog, ctx));
    }
  }

  function createCatalogCard(catalog, ctx) {
    const card = document.createElement('section');
    card.className = 'card';

    const header = document.createElement('h2');
    header.className = 'card-title';
    header.textContent = catalog.titulo;
    card.appendChild(header);

    const table = document.createElement('table');
    table.className = 'subjects-table';
    table.appendChild(createTableHead(false));

    const tbody = document.createElement('tbody');
    for (const subj of catalog.subjects) {
      const rowState = getRowState(subj.code, subj.reqs, ctx);
      const tr = document.createElement('tr');
      tr.className = rowClass(rowState);
      tr.appendChild(td(subj.code));
      tr.appendChild(td(nameWithIcon(rowState, subj.name), 'name-cell'));
      tr.appendChild(td(subj.uc));
      tr.appendChild(td(subj.reqText || '—'));
      tr.appendChild(td(checkbox(subj.code, STATUS.APROBADA)));
      tr.appendChild(td(checkbox(subj.code, STATUS.CURSANDO)));
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    card.appendChild(table);
    return card;
  }

  // ---------- Modal de selección de electiva ----------

  function openElectiveModal(slotId, semLabel) {
    const ctx = buildContext(state.status, index, state.slots);
    const occupied = occupiedElectiveCodes(state, slotId);
    const currentCode = state.slots[slotId];

    modalTitle.textContent = `Elegir electiva — Semestre ${semLabel}`;
    modalBody.innerHTML = '';

    if (currentCode) {
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'btn-quitar';
      removeBtn.textContent = 'Quitar electiva asignada a este cupo';
      removeBtn.addEventListener('click', () => {
        assignSlot(state, slotId, null);
        closeModal();
        renderAll();
      });
      modalBody.appendChild(removeBtn);
    }

    for (const catalog of ELECTIVE_CATALOGS) {
      const group = document.createElement('div');
      group.className = 'modal-group';
      const h4 = document.createElement('h4');
      h4.textContent = catalog.titulo;
      group.appendChild(h4);

      const list = document.createElement('div');
      list.className = 'modal-list';
      for (const subj of catalog.subjects) {
        const isOccupiedElsewhere = occupied.has(subj.code);
        const rowState = getRowState(subj.code, subj.reqs, ctx);
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'modal-item ' + rowClass(rowState);
        if (subj.code === currentCode) item.classList.add('modal-item-selected');
        item.disabled = isOccupiedElsewhere;

        const title = document.createElement('div');
        title.className = 'modal-item-title';
        title.textContent = `${subj.code} — ${subj.name}`;
        const meta = document.createElement('div');
        meta.className = 'modal-item-meta';
        meta.textContent = `UC ${subj.uc}   ·   Requisitos: ${subj.reqText || '—'}` +
          (isOccupiedElsewhere ? '   ·   ya asignada en otro cupo' : '');

        item.appendChild(title);
        item.appendChild(meta);

        item.addEventListener('click', () => {
          if (isOccupiedElsewhere) return;
          assignSlot(state, slotId, subj.code);
          closeModal();
          renderAll();
        });

        list.appendChild(item);
      }
      group.appendChild(list);
      modalBody.appendChild(group);
    }

    modalOverlay.classList.remove('hidden');
  }

  function closeModal() {
    modalOverlay.classList.add('hidden');
    modalBody.innerHTML = '';
  }

  return { init };
})();
