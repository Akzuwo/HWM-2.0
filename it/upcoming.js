const API_BASE = 'https://homework-manager-2-0-backend.onrender.com';

document.addEventListener('DOMContentLoaded', async () => {
  const listEl = document.getElementById('upcoming-list');
  try {
    const res = await fetch(`${API_BASE}/entries`);
    if (!res.ok) {
      throw new Error(`Errore API (${res.status})`);
    }
    const entries = await res.json();
    const prefix = { hausaufgabe: 'HA', pruefung: 'Esame', event: 'Event' };
    const items = entries.map(e => ({
      datum: e.startzeit ? `${e.datum}T${e.startzeit}` : e.datum,
      text: `${prefix[e.typ] || e.typ} ${e.beschreibung}`
    })).sort((a,b) => a.datum.localeCompare(b.datum));
    listEl.innerHTML = '';
    if (items.length === 0) {
      listEl.innerHTML = '<li>Nessuna voce trovata.</li>';
    } else {
      for (const it of items) {
        const li = document.createElement('li');
        li.textContent = `${it.datum} - ${it.text}`;
        listEl.appendChild(li);
      }
    }
  } catch (err) {
    console.error('Errore durante il caricamento dei dati:', err);
    listEl.textContent = 'Errore durante il caricamento dei dati.';
  }
});
