// kalender.js

// Basis‐URL deines Backends
const API_BASE = 'https://homework-manager-2-0-backend.onrender.com';

// Rolle aus sessionStorage (wird beim Login gesetzt)
const role = sessionStorage.getItem('role') || 'guest';
const userIsAdmin = (role === 'admin');

// Sostituzione Markdown per *grassetto*
function mdBold(text) {
  return text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
}

const TYPE_LABELS = {
  hausaufgabe: 'Compito',
  pruefung: 'Esame',
  event: 'Evento'
};

let editFormController = null;

function formatSwissDateFromISO(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  const [year, month, day] = parts;
  return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
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
  const baseDate = `${dateStr}T${startStr || '00:00:00'}`;
  const dateObj = new Date(baseDate);
  const dateFormatter = new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const formattedDate = dateFormatter.format(dateObj);
  const startLabel = startStr ? startStr.slice(0,5) : '';
  const endLabel = endStr ? endStr.slice(0,5) : '';
  if (startLabel && endLabel) {
    return `${formattedDate} · ${startLabel} – ${endLabel}`;
  }
  if (startLabel) {
    return `${formattedDate} · ${startLabel}`;
  }
  return formattedDate;
}

// Apri modal: visualizza vs. modifica
function openModal(event) {
  const { id } = event;
  const { type, typeLabel, description, fach, datum, startzeit, endzeit } = event.extendedProps;

  const overlay = document.getElementById('fc-modal-overlay');
  const viewMode = document.getElementById('fc-view-mode');
  const editForm = document.getElementById('fc-edit-form');
  const subjectLabel = document.querySelector('[data-view-label="subject"]');
  if (!overlay || !viewMode || !editForm) {
    console.error('Elementi del modal mancanti.');
    return;
  }

  const { eventTitle: storedTitle, descriptionBody } = event.extendedProps;
  const { eventTitle: computedTitle, description: computedDescription } = splitEventDescription(type, description);
  const eventTitle = storedTitle !== undefined ? storedTitle : computedTitle;
  const detailDescription = descriptionBody !== undefined ? descriptionBody : computedDescription;
  const isEvent = type === 'event';
  const modalTitle = isEvent
    ? (eventTitle || typeLabel)
    : `${typeLabel}${fach ? ` · ${fach}` : ''}`;

  const subjectValue = isEvent ? (eventTitle || '—') : (fach || '—');
  if (subjectLabel) {
    subjectLabel.textContent = isEvent ? 'Titolo evento' : 'Materia';
  }

  document.getElementById('fc-modal-title').innerText = modalTitle;
  document.getElementById('fc-modal-type').innerText = typeLabel;
  document.getElementById('fc-modal-subject').innerText = subjectValue;
  document.getElementById('fc-modal-date').innerText = formatDateLabel(datum, startzeit, endzeit);
  document.getElementById('fc-modal-desc').innerHTML = detailDescription
    ? mdBold(detailDescription)
    : '<em>Nessuna descrizione disponibile.</em>';

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
    startInput.value = startzeit ? startzeit.slice(0, 5) : '';
  }
  if (endInput) {
    endInput.value = endzeit ? endzeit.slice(0, 5) : '';
    endInput.disabled = !startInput || !startInput.value;
  }
  if (descInput) {
    descInput.value = detailDescription;
  }

  editFormController = setupModalFormInteractions(editForm, ENTRY_FORM_MESSAGES);
  if (editFormController) {
    editFormController.setType(type);
    editFormController.evaluate();
  }

  if (userIsAdmin) {
    viewMode.style.display = 'none';
    editForm.style.display = 'flex';
  } else {
    viewMode.style.display = 'block';
    editForm.style.display = 'none';
  }

  const initialFocusTarget = userIsAdmin
    ? editForm.querySelector('[data-hm-modal-initial-focus]')
    : overlay.querySelector('.hm-modal__close');

  if (window.hmModal) {
    window.hmModal.open(overlay, {
      initialFocus: initialFocusTarget,
      onRequestClose: closeModal
    });
  } else {
    overlay.classList.add('is-open');
  }
}

// Chiudi modal
function closeModal() {
  const overlay = document.getElementById('fc-modal-overlay');
  const editForm = document.getElementById('fc-edit-form');
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
  }
}
window.closeModal = closeModal;

// Salva (aggiorna)
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

  const fach = type === 'event' ? '' : (subjectSelect ? subjectSelect.value.trim() : '');
  const eventTitle = type === 'event' ? (eventTitleInput ? eventTitleInput.value.trim() : '') : '';
  const beschreibung = descInput ? descInput.value.trim() : '';

  const payloadDescription = type === 'event'
    ? eventTitle + (beschreibung ? `\n\n${beschreibung}` : '')
    : beschreibung;

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Salvataggio…';
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
        fach
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
    showOverlay('Errore durante il salvataggio:\n' + e.message);
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Salva';
    }
  }
}

// Elimina
async function deleteEntry() {
  const id = document.getElementById('fc-entry-id').value;
  if (!confirm('Eliminare davvero questa voce?')) return;

  const deleteButton = document.querySelector('#fc-edit-form [data-role="delete"]');
  if (deleteButton) {
    deleteButton.disabled = true;
    deleteButton.textContent = 'Eliminazione…';
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
    showOverlay('Errore durante l\'eliminazione:\n' + e.message);
  } finally {
    if (deleteButton) {
      deleteButton.disabled = false;
      deleteButton.textContent = 'Elimina';
    }
  }
}

// Kalender initialisieren
document.addEventListener('DOMContentLoaded', async () => {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) {
    console.log("Nessun elemento calendario trovato – script terminato.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/entries`);
    if (!res.ok) {
      throw new Error(`Errore API (${res.status})`);
    }

    const entries = await res.json();
    const colorMap = { hausaufgabe: '#007bff', pruefung: '#dc3545', event: '#28a745' };
    const events = entries.map(e => {
      const typeLabel = TYPE_LABELS[e.typ] || e.typ;
      const subject = e.fach || '';
      const { eventTitle, description: descriptionBody } = splitEventDescription(e.typ, e.beschreibung || '');
      const displaySubject = e.typ === 'event' ? (eventTitle || '—') : (subject || '—');
      const start = e.startzeit ? `${e.datum}T${e.startzeit}` : e.datum;
      const end = e.endzeit ? `${e.datum}T${e.endzeit}` : undefined;
      const eventConfig = {
        id: String(e.id),
        title: `${typeLabel} · ${displaySubject}`,
        start,
        allDay: !e.startzeit,
        color: colorMap[e.typ] || '#000',
        extendedProps: {
          type: e.typ,
          typeLabel,
          description: e.beschreibung || '',
          fach: subject,
          datum: e.datum,
          startzeit: e.startzeit,
          endzeit: e.endzeit,
          eventTitle,
          descriptionBody
        }
      };
      if (end) {
        eventConfig.end = end;
      }
      return eventConfig;
    });
    // Remove loading text once events are ready
    calendarEl.textContent = '';

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale:      'it',
        headerToolbar: {
          left:   'prev,next today',
          center: 'title',
          right:  'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events,
        dateClick: info => {
          showEntryForm();
          const dateInput = document.getElementById('datum');
          if (dateInput) {
            dateInput.value = formatSwissDateFromISO(info.dateStr);
          }
        },
        eventClick: info => {
          info.jsEvent.preventDefault();
          openModal(info.event);
        }
      });

    calendar.render();
  } catch (err) {
    console.error('Errore durante il caricamento del calendario:', err);
    calendarEl.innerText = "Errore durante il caricamento delle voci del calendario!";
  }

});
