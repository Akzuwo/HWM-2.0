const API_BASE = 'https://homework-manager-2-0-backend.onrender.com';

document.addEventListener('DOMContentLoaded', async () => {
  const listEl = document.getElementById('upcoming-list');
  try {
    const res = await fetch(`${API_BASE}/entries`);
    if (!res.ok) {
      throw new Error(`API error (${res.status})`);
    }
    const entries = await res.json();
    const prefix = { hausaufgabe: 'HW', pruefung: 'Exam', event: 'Event' };
    const items = entries.map(e => ({
      datum: e.startzeit ? `${e.datum}T${e.startzeit}` : e.datum,
      text: `${prefix[e.typ] || e.typ} ${e.beschreibung}`
    })).sort((a,b) => a.datum.localeCompare(b.datum));
    listEl.innerHTML = '';
    if (items.length === 0) {
      listEl.innerHTML = '<li>No entries found.</li>';
    } else {
      for (const it of items) {
        const li = document.createElement('li');
        li.textContent = `${it.datum} - ${it.text}`;
        listEl.appendChild(li);
      }
    }
  } catch (err) {
    console.error('Error loading data:', err);
    listEl.textContent = 'Error loading data.';
  }
});
