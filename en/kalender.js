// kalender.js

// Base URL of your backend
const API_BASE = 'https://homework-manager-2-0-backend.onrender.com';

// Role from sessionStorage (set on login)
const role = sessionStorage.getItem('role') || 'guest';
const userIsAdmin = (role === 'admin');
let activeEventData = null;
const MODAL_ANIMATION_MS = 200;

// Markdown replacement for *bold*
function mdBold(text) {
  return text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
}

const TYPE_LABELS = {
  hausaufgabe: 'Homework',
  pruefung: 'Exam',
  event: 'Event'
};

function formatDateLabel(dateStr, startStr, endStr) {
  if (!dateStr) return '';
  const baseDate = `${dateStr}T${startStr || '00:00:00'}`;
  const dateObj = new Date(baseDate);
  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
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

// Open modal: view vs. edit
function openModal(event) {
  const overlay = document.getElementById('fc-modal-overlay');
  if (!overlay) {
    return;
  }

  const { id } = event;
  const { type, typeLabel, description, fach, datum, startzeit, endzeit } = event.extendedProps;
  const entryData = {
    id: String(id),
    type,
    description: description || '',
    fach: fach || '',
    datum,
    startzeit,
    endzeit
  };
  activeEventData = entryData;

  const title = `${typeLabel} · ${fach || '—'}`;
  document.getElementById('fc-modal-title').innerText = title;
  document.getElementById('fc-modal-type').innerText = typeLabel;
  document.getElementById('fc-modal-subject').innerText = fach || '—';
  document.getElementById('fc-modal-date').innerText = formatDateLabel(datum, startzeit, endzeit);
  document.getElementById('fc-modal-desc').innerHTML = description ? mdBold(description) : '<em>No description available.</em>';

  const adminActions = document.getElementById('fc-admin-actions');
  const editButton = document.getElementById('fc-edit-button');
  const deleteButton = document.getElementById('fc-delete-button');
  document.getElementById('fc-view-mode').style.display = 'block';

  if (userIsAdmin && adminActions && editButton && deleteButton) {
    adminActions.hidden = false;
    editButton.onclick = () => {
      closeModal(true);
      window.setTimeout(() => {
        if (typeof window.openEntryEditor === 'function') {
          window.openEntryEditor(entryData);
        }
      }, MODAL_ANIMATION_MS);
    };
    deleteButton.onclick = () => deleteEntry();
  } else if (adminActions) {
    adminActions.hidden = true;
  }

  animateOverlay(overlay, true);
}

// Close modal
function closeModal(keepData = false) {
  const overlay = document.getElementById('fc-modal-overlay');
  if (!keepData) {
    activeEventData = null;
  }
  animateOverlay(overlay, false);
}
window.closeModal = closeModal;

// Delete
async function deleteEntry() {
  const id = activeEventData?.id;
  if (!id) {
    console.warn('No active entry to delete.');
    return;
  }
  if (!confirm('Delete entry?')) return;

  try {
    const res = await fetch(`${API_BASE}/delete_entry/${id}`, {
      method: 'DELETE',
      headers: { 'X-Role': role }
    });
    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(err || `Status ${res.status}`);
    }
    activeEventData = null;
    closeModal();
    location.reload();
  } catch (e) {
    console.error('Error deleting:', e);
    showOverlay('Error deleting:\n' + e.message);
  }
}

// Initialize calendar
document.addEventListener('DOMContentLoaded', async () => {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) {
    console.log("No calendar element found – script terminated.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/entries`);
    if (!res.ok) {
      throw new Error(`API error (${res.status})`);
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
        locale:      'en',
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
            const selectedDate = info.date ? new Date(info.date.valueOf()) : null;
            if (selectedDate) {
              const formatter = new Intl.DateTimeFormat('de-CH', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });
              dateInput.value = formatter.format(selectedDate);
              dateInput.dispatchEvent(new Event('input'));
            }
          }
        },
        eventClick: info => {
          info.jsEvent.preventDefault();
          openModal(info.event);
        }
      });

    calendar.render();
  } catch (err) {
    console.error('Error loading calendar:', err);
    calendarEl.innerText = "Error loading calendar entries!";
  }

});
