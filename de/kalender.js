// kalender.js

// Basis‐URL deines Backends
const API_BASE = 'https://homework-manager-2-0-backend.onrender.com';

// Rolle aus sessionStorage (wird beim Login gesetzt)
const role = sessionStorage.getItem('role') || 'guest';
const userIsAdmin = (role === 'admin');

// Markdown‐Ersatz für *fett*
function mdBold(text) {
  return text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
}

const TYPE_LABELS = {
  hausaufgabe: 'Hausaufgabe',
  pruefung: 'Prüfung',
  event: 'Event'
};

function formatDateLabel(dateStr, startStr, endStr) {
  if (!dateStr) return '';
  const baseDate = `${dateStr}T${startStr || '00:00:00'}`;
  const dateObj = new Date(baseDate);
  const dateFormatter = new Intl.DateTimeFormat('de-DE', {
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

// Modal öffnen: View vs. Edit
function openModal(event) {
  const { id } = event;
  const { type, typeLabel, description, fach, datum, startzeit, endzeit } = event.extendedProps;

  const title = `${typeLabel} · ${fach || '—'}`;
  document.getElementById('fc-modal-title').innerText = title;
  document.getElementById('fc-modal-type').innerText = typeLabel;
  document.getElementById('fc-modal-subject').innerText = fach || '—';
  document.getElementById('fc-modal-date').innerText = formatDateLabel(datum, startzeit, endzeit);
  document.getElementById('fc-modal-desc').innerHTML = description ? mdBold(description) : '<em>Keine Beschreibung vorhanden.</em>';

  document.getElementById('fc-entry-id').value = id;
  document.getElementById('fc-entry-type').value = type;
  document.getElementById('fc-edit-date').value = datum;
  document.getElementById('fc-edit-desc').value = description;
  document.getElementById('fc-edit-subject').value = fach || '';
  document.getElementById('fc-edit-start').value = startzeit ? startzeit.slice(0, 5) : '';
  document.getElementById('fc-edit-end').value = endzeit ? endzeit.slice(0, 5) : '';

  const subjectInput = document.getElementById('fc-edit-subject');
  if (subjectInput) {
    subjectInput.required = type !== 'event';
  }

  if (userIsAdmin) {
    document.getElementById('fc-view-mode').style.display = 'none';
    document.getElementById('fc-edit-form').style.display = 'block';
  } else {
    document.getElementById('fc-view-mode').style.display = 'block';
    document.getElementById('fc-edit-form').style.display = 'none';
  }

  document.getElementById('fc-modal-overlay').style.display = 'block';
}

// Modal schließen
function closeModal() {
  document.getElementById('fc-modal-overlay').style.display = 'none';
}
window.closeModal = closeModal;

// Speichern (Update)
async function saveEdit() {
  const id = document.getElementById('fc-entry-id').value;
  const type = document.getElementById('fc-entry-type').value;
  const date = document.getElementById('fc-edit-date').value;
  const desc = document.getElementById('fc-edit-desc').value.trim();
  const fach = document.getElementById('fc-edit-subject').value.trim();
  let start = document.getElementById('fc-edit-start').value;
  let end = document.getElementById('fc-edit-end').value;

  if (!date) {
    showOverlay('Bitte gib ein Datum an.');
    return;
  }
  if (type !== 'event' && !fach) {
    showOverlay('Bitte gib ein Fachkürzel an (nicht für Events erforderlich).');
    return;
  }

  if (start) {
    if (start.length === 5) {
      start = `${start}:00`;
    }
  } else {
    start = null;
  }

  if (end) {
    if (end.length === 5) {
      end = `${end}:00`;
    }
  } else {
    end = null;
  }

  try {
    const res = await fetch(`${API_BASE}/update_entry`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Role': role
      },
      body: JSON.stringify({ id, type, date, description: desc, startzeit: start, endzeit: end, fach })
    });
    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(err || `Status ${res.status}`);
    }
    closeModal();
    location.reload();
  } catch (e) {
    console.error('Fehler beim Speichern:', e);
    showOverlay('Fehler beim Speichern:\n' + e.message);
  }
}

// Löschen
async function deleteEntry() {
  const id = document.getElementById('fc-entry-id').value;
  if (!confirm('Eintrag wirklich löschen?')) return;

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
    console.error('Fehler beim Löschen:', e);
    showOverlay('Fehler beim Löschen:\n' + e.message);
  }
}

// Kalender initialisieren
document.addEventListener('DOMContentLoaded', async () => {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) {
    console.log("Kein Kalender-Element gefunden – Script beendet.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/entries`);
    if (!res.ok) {
      throw new Error(`API-Fehler (${res.status})`);
    }

    const entries = await res.json();
    const colorMap = { hausaufgabe: '#007bff', pruefung: '#dc3545', event: '#28a745' };
    const events = entries.map(e => {
      const typeLabel = TYPE_LABELS[e.typ] || e.typ;
      const subject = e.fach || '';
      const start = e.startzeit ? `${e.datum}T${e.startzeit}` : e.datum;
      const end = e.endzeit ? `${e.datum}T${e.endzeit}` : undefined;
      const eventConfig = {
        id: String(e.id),
        title: `${typeLabel} · ${subject || '—'}`,
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
          endzeit: e.endzeit
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
        locale:      'de',
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
            dateInput.value = info.dateStr + 'T00:00';
          }
        },
        eventClick: info => {
          info.jsEvent.preventDefault();
          openModal(info.event);
        }
      });

    calendar.render();
  } catch (err) {
    console.error('Fehler beim Laden des Kalenders:', err);
    calendarEl.innerText = "Fehler beim Laden der Kalendereinträge!";
  }

});
