const API_BASE = 'https://homework-manager-2-0-backend.onrender.com';

document.addEventListener('DOMContentLoaded', async () => {
  const listEl = document.getElementById('upcoming-list');
  try {
    const res = await fetch(`${API_BASE}/entries`);
    if (!res.ok) {
      throw new Error(`API-Fehler (${res.status})`);
    }
    const entries = await res.json();
    const prefix = { hausaufgabe: 'HA', pruefung: 'Prüfung', event: 'Event' };
    const items = entries.map(e => ({
      datum: e.startzeit ? `${e.datum}T${e.startzeit}` : e.datum,
      text: `${prefix[e.typ] || e.typ} ${e.beschreibung}`
    })).sort((a,b) => a.datum.localeCompare(b.datum));
    listEl.innerHTML = '';
    if (items.length === 0) {
      listEl.innerHTML = '<li>Keine Einträge gefunden.</li>';
    } else {
      for (const it of items) {
        const li = document.createElement('li');
        li.textContent = `${it.datum} - ${it.text}`;
        listEl.appendChild(li);
      }
    }
  } catch (err) {
    console.error('Fehler beim Laden der Daten:', err);
    listEl.textContent = 'Fehler beim Laden der Daten.';
  }
});
