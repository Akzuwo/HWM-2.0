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

// Modal öffnen: View vs. Edit
function openModal(event) {
  const { id } = event;
  const { type, subject, description } = event.extendedProps;
  const date = event.startStr;
  const title = event.title;

  // View‐Mode füllen
  document.getElementById('fc-modal-title').innerText   = title;
  document.getElementById('fc-modal-subject').innerText = subject;
  document.getElementById('fc-modal-date').innerText    = date;
  document.getElementById('fc-modal-desc').innerHTML    = mdBold(description);

  // Edit‐Formular vorbelegen
  document.getElementById('fc-entry-id').value   = id;
  document.getElementById('fc-entry-type').value = type;
  document.getElementById('fc-edit-subject').value = subject;
  document.getElementById('fc-edit-date').value    = date;
  document.getElementById('fc-edit-desc').value    = description;

  if (userIsAdmin && type !== 'event') {
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
  const id    = document.getElementById('fc-entry-id').value;
  const type  = document.getElementById('fc-entry-type').value;
  const fach  = document.getElementById('fc-edit-subject').value;
  const date  = document.getElementById('fc-edit-date').value;
  const desc  = document.getElementById('fc-edit-desc').value;

  try {
    const res = await fetch(`${API_BASE}/update_entry`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Role': role
      },
      body: JSON.stringify({ id, type, fach, date, description: desc })
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
  const id   = document.getElementById('fc-entry-id').value;
  const type = document.getElementById('fc-entry-type').value;
  if (!confirm('Eintrag wirklich löschen?')) return;

  try {
    const res = await fetch(`${API_BASE}/delete_entry/${type}/${id}`, {
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
    const [resHA, resPR, resEV] = await Promise.all([
      fetch(`${API_BASE}/hausaufgaben`),
      fetch(`${API_BASE}/pruefungen`),
      fetch(`${API_BASE}/events`)
    ]);
    if (!resHA.ok || !resPR.ok || !resEV.ok) {
      throw new Error(`API-Fehler (HA: ${resHA.status}, PR: ${resPR.status}, EV: ${resEV.status})`);
    }

    const hausaufgaben = await resHA.json();
    const pruefungen   = await resPR.json();
    const eventsData   = await resEV.json();

    const events = [
      ...hausaufgaben.map(h => ({
        id:    String(h.id),
        title: `HA ${h.fach}`,
        start: h.faellig_am,
        color: '#007bff',
        extendedProps: {
          type:        'hausaufgabe',
          subject:     h.fach,
          description: h.beschreibung
        }
      })),
      ...pruefungen.map(p => ({
        id:    String(p.id),
        title: `Prüfung ${p.fach}`,
        start: p.pruefungsdatum,
        color: '#dc3545',
        extendedProps: {
          type:        'pruefung',
          subject:     p.fach,
          description: p.beschreibung
        }
      })),
      ...eventsData.map(e => ({
        id:    String(e.id),
        title: `Event ${e.titel}`,
        start: e.startzeit,
        color: '#28a745',
        extendedProps: {
          type:        'event',
          subject:     e.titel,
          description: e.beschreibung
        }
      }))
    ];
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
