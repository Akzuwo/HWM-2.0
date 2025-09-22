// kalender.js

const API_BASE = 'https://homework-manager-2-0-backend.onrender.com';
const role = sessionStorage.getItem('role') || 'guest';
const userIsAdmin = role === 'admin';

const t = window.hmI18n ? window.hmI18n.scope('calendar') : (key, fallback) => fallback;
const modalT = window.hmI18n ? window.hmI18n.scope('calendar.modal') : (key, fallback) => fallback;

const TYPE_LABELS = {
  hausaufgabe: t('legend.homework', 'Compito'),
  pruefung: t('legend.exam', 'Verifica'),
  event: t('legend.event', 'Evento')
};

const actionText = {
  exportLabel: t('actions.export.label', 'Esporta'),
  exportLoading: t('actions.export.loading', 'Esportazione …'),
  exportError: t('actions.export.error', 'Errore durante l\'esportazione del calendario.'),
  exportSuccess: t('actions.export.success', 'Calendario esportato con successo.'),
  exportFileName: t('actions.export.fileName', 'homework-calendar.ics'),
  backTooltip: t('actions.back.tooltip', 'Torna alla pagina iniziale'),
  createTooltip: t('actions.create.tooltip', 'Crea una nuova voce di calendario')
};

const modalText = {
  noDescription: modalT('noDescription', '<em>Nessuna descrizione disponibile.</em>'),
  subjectLabel: modalT('labels.subject', 'Materia'),
  eventTitleLabel: modalT('labels.eventTitle', 'Titolo evento'),
  deleteConfirm: modalT('confirmDelete', 'Vuoi davvero eliminare questa voce?'),
  deleteError: modalT('messages.deleteError', 'Impossibile eliminare la voce.'),
  saveError: modalT('messages.saveError', 'Impossibile salvare la voce.')
};

const modalButtons = {
  save: modalT('buttons.save', 'Salva'),
  saveLoading: modalT('buttons.saveLoading', 'Salvataggio …'),
  delete: modalT('buttons.delete', 'Elimina'),
  deleteLoading: modalT('buttons.deleteLoading', 'Eliminazione …')
};

let editFormController = null;
let calendarInstance = null;

function mdBold(text = '') {
  return text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
}

function formatSwissDateFromISO(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
}

function parseTimeLabel(value) {
  if (!value) return '';
  return value.slice(0, 5);
}

function splitEventDescription(type, text) {
  if (type !== 'event' || !text) {
    return { eventTitle: '', description: text || '' };
  }
  const sections = text.split('\n\n');
  const [first, ...rest] = sections;
  const eventTitle = (first || '').trim();
  const description = rest.join('\n\n').trim();
  return { eventTitle, description };
}

function formatDateLabel(dateStr, startStr, endStr) {
  if (!dateStr) return '';
  const locale = document.documentElement.lang || 'it-IT';
  const formatter = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const baseDate = new Date(`${dateStr}T${startStr || '00:00:00'}`);
  const formattedDate = formatter.format(baseDate);
  const startLabel = parseTimeLabel(startStr);
  const endLabel = parseTimeLabel(endStr);
  if (startLabel && endLabel) {
    return `${formattedDate} · ${startLabel} – ${endLabel}`;
  }
  if (startLabel) {
    return `${formattedDate} · ${startLabel}`;
  }
  return formattedDate;
}

function debounce(fn, wait = 160) {
  let timeout = null;
  return (...args) => {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => fn(...args), wait);
  };
}

function toggleViewMode(isAdmin) {
  const viewMode = document.getElementById('fc-view-mode');
  const editForm = document.getElementById('fc-edit-form');
  if (!viewMode || !editForm) return;
  if (isAdmin) {
    viewMode.classList.add('is-hidden');
    editForm.classList.remove('is-hidden');
  } else {
    viewMode.classList.remove('is-hidden');
    editForm.classList.add('is-hidden');
  }
}

function setModalDescription(html) {
  const description = document.getElementById('fc-modal-desc');
  if (description) {
    description.innerHTML = html;
  }
}

function openModal(event) {
  const { id } = event;
  const { type, typeLabel, description, fach, datum, startzeit, endzeit } = event.extendedProps;

  const overlay = document.getElementById('fc-modal-overlay');
  const subjectLabel = document.querySelector('[data-view-label="subject"]');
  if (!overlay) {
    console.error("Overlay del modal non trovato.");
    return;
  }

  const { eventTitle: storedTitle, descriptionBody } = event.extendedProps;
  const { eventTitle: computedTitle, description: computedDescription } = splitEventDescription(type, description);
  const eventTitle = storedTitle !== undefined ? storedTitle : computedTitle;
  const detailDescription = descriptionBody !== undefined ? descriptionBody : computedDescription;
  const isEvent = type === 'event';
  const modalTitle = isEvent ? (eventTitle || typeLabel) : `${typeLabel}${fach ? ` · ${fach}` : ''}`;
  const subjectValue = isEvent ? (eventTitle || '—') : (fach || '—');

  const titleElement = document.getElementById('fc-modal-title');
  if (titleElement) {
    titleElement.textContent = modalTitle;
  }
  const typeElement = document.getElementById('fc-modal-type');
  if (typeElement) {
    typeElement.textContent = typeLabel;
  }
  const subjectElement = document.getElementById('fc-modal-subject');
  if (subjectElement) {
    subjectElement.textContent = subjectValue;
  }
  const dateElement = document.getElementById('fc-modal-date');
  if (dateElement) {
    dateElement.textContent = formatDateLabel(datum, startzeit, endzeit);
  }

  setModalDescription(detailDescription ? mdBold(detailDescription) : modalText.noDescription);

  if (subjectLabel) {
    subjectLabel.textContent = isEvent ? modalText.eventTitleLabel : modalText.subjectLabel;
  }

  const dateInput = document.getElementById('fc-edit-date');
  const descInput = document.getElementById('fc-edit-desc');
  const subjectSelect = document.getElementById('fc-edit-subject');
  const startInput = document.getElementById('fc-edit-start');
  const endInput = document.getElementById('fc-edit-end');
  const typeSelect = document.getElementById('fc-edit-type');
  const eventTitleInput = document.getElementById('fc-edit-event-title');

  document.getElementById('fc-entry-id').value = id;

  if (typeSelect) {
    typeSelect.value = type;
  }
  if (subjectSelect) {
    subjectSelect.value = fach || '';
  }
  if (eventTitleInput) {
    eventTitleInput.value = isEvent ? eventTitle : '';
  }
  if (dateInput) {
    dateInput.value = formatSwissDateFromISO(datum);
  }
  if (startInput) {
    startInput.value = parseTimeLabel(startzeit);
  }
  if (endInput) {
    endInput.value = parseTimeLabel(endzeit);
    if (startInput && !startInput.value) {
      endInput.value = '';
      endInput.disabled = true;
    }
  }
  if (descInput) {
    descInput.value = detailDescription;
  }

  editFormController = setupModalFormInteractions(document.getElementById('fc-edit-form'), ENTRY_FORM_MESSAGES);
  if (editFormController) {
    editFormController.setType(type);
    editFormController.evaluate();
  }

  toggleViewMode(userIsAdmin);

  const initialFocusTarget = userIsAdmin
    ? document.querySelector('#fc-edit-form [data-hm-modal-initial-focus]')
    : overlay.querySelector('.hm-modal__close');

  if (window.hmModal) {
    window.hmModal.open(overlay, {
      initialFocus: initialFocusTarget,
      onRequestClose: closeModal
    });
  } else {
    overlay.classList.add('is-open');
    if (initialFocusTarget && typeof initialFocusTarget.focus === 'function') {
      initialFocusTarget.focus();
    }
  }
}

function closeModal() {
  const overlay = document.getElementById('fc-modal-overlay');
  const editForm = document.getElementById('fc-edit-form');
  const viewMode = document.getElementById('fc-view-mode');
  if (overlay) {
    if (window.hmModal) {
      window.hmModal.close(overlay);
    } else {
      overlay.classList.remove('is-open');
    }
  }
  if (editForm) {
    editForm.reset();
    editFormController = setupModalFormInteractions(editForm, ENTRY_FORM_MESSAGES);
    editFormController?.setType('event');
    editFormController?.evaluate();
    editForm.classList.add('is-hidden');
  }
  if (viewMode) {
    viewMode.classList.remove('is-hidden');
  }
}
window.closeModal = closeModal;

async function saveEdit(evt) {
  if (evt) {
    evt.preventDefault();
  }

  const form = document.getElementById('fc-edit-form');
  if (!form) {
    console.error('Modulo di modifica mancante.');
    return;
  }

  editFormController = setupModalFormInteractions(form, ENTRY_FORM_MESSAGES);
  editFormController?.evaluate();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const id = document.getElementById('fc-entry-id').value;
  const typeSelect = document.getElementById('fc-edit-type');
  const subjectSelect = document.getElementById('fc-edit-subject');
  const eventTitleInput = document.getElementById('fc-edit-event-title');
  const dateInput = document.getElementById('fc-edit-date');
  const startInput = document.getElementById('fc-edit-start');
  const endInput = document.getElementById('fc-edit-end');
  const descInput = document.getElementById('fc-edit-desc');
  const submitButton = form.querySelector('[data-role="submit"]');

  const type = typeSelect ? typeSelect.value : '';
  const isoDate = dateInput ? parseSwissDate(dateInput.value.trim()) : null;
  if (!isoDate) {
    showOverlay(ENTRY_FORM_MESSAGES.invalidDate);
    dateInput?.focus();
    return;
  }

  const startValue = startInput ? startInput.value : '';
  const endValue = endInput && !endInput.disabled ? endInput.value : '';
  if (endValue && startValue && endValue < startValue) {
    showOverlay(ENTRY_FORM_MESSAGES.invalidEnd);
    return;
  }

  const subject = type === 'event' ? '' : (subjectSelect ? subjectSelect.value.trim() : '');
  const eventTitle = type === 'event' ? (eventTitleInput ? eventTitleInput.value.trim() : '') : '';
  const description = descInput ? descInput.value.trim() : '';

  const payloadDescription = type === 'event'
    ? eventTitle + (description ? `\n\n${description}` : '')
    : description;

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = modalButtons.saveLoading;
  }

  try {
    const res = await fetch(`${API_BASE}/update_entry`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Role': role
      },
      body: JSON.stringify({
        id,
        type,
        date: isoDate,
        description: payloadDescription,
        startzeit: startValue ? `${startValue}:00` : null,
        endzeit: endValue ? `${endValue}:00` : null,
        fach: subject
      })
    });
    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(err || `Status ${res.status}`);
    }
    closeModal();
    location.reload();
  } catch (e) {
    console.error('Errore durante il salvataggio:', e);
    showOverlay(`${modalText.saveError}\n${e.message}`);
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = modalButtons.save;
    }
  }
}

async function deleteEntry() {
  const id = document.getElementById('fc-entry-id').value;
  if (!confirm(modalText.deleteConfirm)) return;

  const deleteButton = document.querySelector('#fc-edit-form [data-role="delete"]');
  if (deleteButton) {
    deleteButton.disabled = true;
    deleteButton.textContent = modalButtons.deleteLoading;
  }

  try {
    const res = await fetch(`${API_BASE}/delete_entry/${id}`, {
      method: 'DELETE',
      headers: { 'X-Role': role }
    });
    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(err || `Status ${res.status}`);
    }
    closeModal();
    location.reload();
  } catch (e) {
    console.error('Errore durante l\'eliminazione:', e);
    showOverlay(`${modalText.deleteError}\n${e.message}`);
  } finally {
    if (deleteButton) {
      deleteButton.disabled = false;
      deleteButton.textContent = modalButtons.delete;
    }
  }
}

window.deleteEntry = deleteEntry;
window.saveEdit = saveEdit;

function initActionBar() {
  const actionBar = document.querySelector('.calendar-action-bar');
  if (!actionBar) return;
  const createBtn = actionBar.querySelector('[data-action="create"]');
  const exportBtn = actionBar.querySelector('[data-action="export"]');
  const backBtn = actionBar.querySelector('[data-action="back"]');

  if (createBtn) {
    if (!userIsAdmin) {
      createBtn.disabled = true;
      createBtn.setAttribute('aria-disabled', 'true');
    } else {
      createBtn.addEventListener('click', () => showEntryForm());
    }
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', handleExportClick);
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
}

async function handleExportClick(event) {
  const button = event.currentTarget;
  if (!(button instanceof HTMLElement)) return;
  const label = button.querySelector('.calendar-action__label');
  const defaultLabel = label ? label.textContent : actionText.exportLabel;
  button.classList.add('is-loading');
  button.disabled = true;
  if (label) label.textContent = actionText.exportLoading;

  try {
    const response = await fetch(`${API_BASE}/calendar.ics`);
    if (!response.ok) {
      throw new Error(`${response.status}`);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = actionText.exportFileName || 'homework-calendar.ics';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    showOverlay(actionText.exportSuccess);
  } catch (error) {
    console.error('Esportazione fallita', error);
    showOverlay(actionText.exportError);
  } finally {
    button.classList.remove('is-loading');
    button.disabled = false;
    if (label) {
      label.textContent = defaultLabel || actionText.exportLabel;
    }
  }
}

function getISOWeekNumber(date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target - yearStart) / 86400000 + 1) / 7);
}

function updateWeekStrip(calendar) {
  const container = document.querySelector('[data-week-strip]');
  const list = document.querySelector('[data-week-strip-list]');
  if (!container || !list) return;

  const viewType = calendar.view.type ? calendar.view.type.toLowerCase() : '';
  const isWeekView = viewType.includes('week');

  if (!isWeekView) {
    container.classList.add('is-hidden');
    list.innerHTML = '';
    return;
  }

  container.classList.remove('is-hidden');
  list.innerHTML = '';

  const locale = document.documentElement.lang || 'it-IT';
  const formatter = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' });
  const { currentStart, currentEnd } = calendar.view;
  if (!currentStart || !currentEnd) {
    container.classList.add('is-hidden');
    list.innerHTML = '';
    return;
  }

  const startDate = new Date(currentStart.getTime());
  const endDate = new Date(currentEnd.getTime() - 1);

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekNumber = String(getISOWeekNumber(startDate));
  const isCurrentWeek = today >= startDate && today <= endDate;

  const item = document.createElement('div');
  item.className = 'calendar-weekstrip__item';
  if (isCurrentWeek) {
    item.classList.add('is-current');
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'calendar-weekstrip__button';
  button.setAttribute('data-week-index', '0');
  button.innerHTML = `
    <span>${t('weekStrip.week', 'Sett.')} ${weekNumber}</span>
    <span class="calendar-weekstrip__week">${formatter.format(startDate)} – ${formatter.format(endDate)}</span>
  `;

  item.appendChild(button);
  list.appendChild(item);
}

function createEventContent(info) {
  const type = info.event.extendedProps.type;
  const typeLabel = info.event.extendedProps.typeLabel || TYPE_LABELS[type] || info.event.title;
  const subjectLabel = info.event.title;
  const startLabel = info.event.extendedProps.startLabel;
  const endLabel = info.event.extendedProps.endLabel;
  const metaPieces = [typeLabel];
  if (startLabel && endLabel) {
    metaPieces.push(`${startLabel} – ${endLabel}`);
  } else if (startLabel) {
    metaPieces.push(startLabel);
  }

  const container = document.createElement('div');
  container.className = 'calendar-event';
  container.setAttribute('data-event-type', type);

  const title = document.createElement('span');
  title.className = 'calendar-event__title';
  title.textContent = subjectLabel;
  container.appendChild(title);

  if (metaPieces.length) {
    const meta = document.createElement('span');
    meta.className = 'calendar-event__meta';
    const dot = document.createElement('span');
    dot.className = 'calendar-event__dot';
    meta.appendChild(dot);
    const metaText = document.createElement('span');
    metaText.textContent = metaPieces.join(' · ');
    meta.appendChild(metaText);
    container.appendChild(meta);
  }

  return { domNodes: [container] };
}

function normaliseEvent(entry) {
  const typeLabel = TYPE_LABELS[entry.typ] || entry.typ;
  const subject = entry.fach || '';
  const { eventTitle, description: descriptionBody } = splitEventDescription(entry.typ, entry.beschreibung || '');
  const displaySubject = entry.typ === 'event' ? (eventTitle || typeLabel) : (subject || typeLabel);
  const startTime = entry.startzeit ? entry.startzeit.trim() : '';
  const endTime = entry.endzeit ? entry.endzeit.trim() : '';
  const startLabel = parseTimeLabel(startTime);
  const endLabel = parseTimeLabel(endTime);

  const eventConfig = {
    id: String(entry.id),
    title: displaySubject,
    start: startLabel ? `${entry.datum}T${startTime}` : entry.datum,
    allDay: !startLabel,
    extendedProps: {
      type: entry.typ,
      typeLabel,
      description: entry.beschreibung || '',
      fach: subject,
      datum: entry.datum,
      startzeit: entry.startzeit,
      endzeit: entry.endzeit,
      eventTitle,
      descriptionBody,
      startLabel,
      endLabel
    }
  };

  if (endLabel) {
    eventConfig.end = `${entry.datum}T${entry.endzeit}`;
  }

  return eventConfig;
}

function determineInitialView() {
  return window.matchMedia('(max-width: 767px)').matches ? 'timeGridWeek' : 'dayGridMonth';
}

function updateMonthLabel(calendar) {
  const label = document.querySelector('[data-calendar-month-label]');
  if (label) {
    label.textContent = calendar.view.title;
  }
}

function updateViewButtons(calendar) {
  const buttons = document.querySelectorAll('[data-calendar-view]');
  buttons.forEach((button) => {
    const targetView = button.getAttribute('data-calendar-view');
    const isActive = targetView === calendar.view.type;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function setupCalendarControls(calendar) {
  const controls = document.querySelector('[data-calendar-controls]');
  if (!controls) {
    updateMonthLabel(calendar);
    updateViewButtons(calendar);
    return;
  }

  controls.querySelectorAll('[data-calendar-nav]').forEach((button) => {
    const action = button.getAttribute('data-calendar-nav');
    button.addEventListener('click', () => {
      if (action === 'prev') {
        calendar.prev();
      } else if (action === 'next') {
        calendar.next();
      } else if (action === 'today') {
        calendar.today();
      }
      updateMonthLabel(calendar);
    });
  });

  controls.querySelectorAll('[data-calendar-view]').forEach((button) => {
    const view = button.getAttribute('data-calendar-view');
    button.addEventListener('click', () => {
      calendar.changeView(view);
      updateMonthLabel(calendar);
      updateViewButtons(calendar);
    });
  });

  updateMonthLabel(calendar);
  updateViewButtons(calendar);
}

function initialiseCalendar(events) {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;

  calendarEl.innerHTML = '';

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: determineInitialView(),
    locale: 'it',
    headerToolbar: false,
    buttonText: {
      month: t('views.month', 'Mese'),
      week: t('views.week', 'Settimana'),
      day: t('views.day', 'Giorno')
    },
    events,
    eventContent: createEventContent,
    dateClick: (info) => {
      showEntryForm();
      const dateInput = document.getElementById('datum');
      if (dateInput) {
        dateInput.value = formatSwissDateFromISO(info.dateStr);
      }
    },
    eventClick: (info) => {
      info.jsEvent.preventDefault();
      openModal(info.event);
    },
    datesSet: () => {
      updateWeekStrip(calendar);
      updateMonthLabel(calendar);
      updateViewButtons(calendar);
    }
  });

  calendar.render();
  updateWeekStrip(calendar);
  setupCalendarControls(calendar);
  calendarInstance = calendar;

  const handleResize = debounce(() => {
    if (!calendarInstance) return;
    updateWeekStrip(calendarInstance);
  }, 180);

  window.addEventListener('resize', handleResize);
}

async function loadCalendar() {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;
  calendarEl.textContent = t('status.loading', 'Caricamento del calendario …');

  try {
    const res = await fetch(`${API_BASE}/entries`);
    if (!res.ok) {
      throw new Error(`Errore API (${res.status})`);
    }

    const entries = await res.json();
    const events = entries.map(normaliseEvent);
    initialiseCalendar(events);
  } catch (err) {
    console.error('Errore durante il caricamento del calendario:', err);
    calendarEl.textContent = t('status.error', 'Impossibile caricare le voci del calendario!');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initActionBar();
  loadCalendar();
});
