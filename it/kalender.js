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

// Apri modal: visualizza vs. modifica
function openModal(event) {
  const { id } = event;
  const { type, description } = event.extendedProps;
  const date = event.startStr;
  const title = event.title;

  // Compila modalità visualizzazione
  document.getElementById('fc-modal-title').innerText   = title;
  document.getElementById('fc-modal-subject').innerText = '';
  document.getElementById('fc-modal-date').innerText    = date;
  document.getElementById('fc-modal-desc').innerHTML    = mdBold(description);

  // Pre-riempire il modulo di modifica
  document.getElementById('fc-entry-id').value   = id;
  document.getElementById('fc-entry-type').value = type;
  document.getElementById('fc-edit-date').value  = date;
  document.getElementById('fc-edit-desc').value  = description;

  if (userIsAdmin && type !== 'event') {
    document.getElementById('fc-view-mode').style.display = 'none';
    document.getElementById('fc-edit-form').style.display = 'block';
  } else {
    document.getElementById('fc-view-mode').style.display = 'block';
    document.getElementById('fc-edit-form').style.display = 'none';
  }

  document.getElementById('fc-modal-overlay').style.display = 'block';
}

// Chiudi modal
function closeModal() {
  document.getElementById('fc-modal-overlay').style.display = 'none';
}
window.closeModal = closeModal;

// Speichern (Update)
async function saveEdit() {
  const id    = document.getElementById('fc-entry-id').value;
  const type  = document.getElementById('fc-entry-type').value;
  const date  = document.getElementById('fc-edit-date').value;
  const desc  = document.getElementById('fc-edit-desc').value;

  try {
    const res = await fetch(`${API_BASE}/update_entry`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Role': role
      },
      body: JSON.stringify({ id, type, date, description: desc, startzeit: null, endzeit: null })
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
  }
}

// Elimina
async function deleteEntry() {
  const id = document.getElementById('fc-entry-id').value;
  if (!confirm('Eliminare veramente la voce?')) return;

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
    const events = entries.map(e => ({
      id: String(e.id),
      title: e.beschreibung,
      start: e.startzeit ? `${e.datum}T${e.startzeit}` : e.datum,
      color: colorMap[e.typ] || '#000',
      extendedProps: {
        type: e.typ,
        description: e.beschreibung
      }
    }));
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
    console.error('Errore durante il caricamento del calendario:', err);
    calendarEl.innerText = "Errore durante il caricamento delle voci del calendario!";
  }

});
