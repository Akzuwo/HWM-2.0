const API_BASE = 'https://homework-manager-2-0-backend.onrender.com';

document.addEventListener('DOMContentLoaded', async () => {
  const listEl = document.getElementById('upcoming-list');
  try {
    const [resHA, resPR, resEV] = await Promise.all([
      fetch(`${API_BASE}/hausaufgaben`),
      fetch(`${API_BASE}/pruefungen`),
      fetch(`${API_BASE}/events`)
    ]);
    if (!resHA.ok || !resPR.ok || !resEV.ok) {
      throw new Error(`API error (HW: ${resHA.status}, EX: ${resPR.status}, EV: ${resEV.status})`);
    }
    const [hausaufgaben, pruefungen, events] = await Promise.all([
      resHA.json(),
      resPR.json(),
      resEV.json()
    ]);
    const items = [
      ...hausaufgaben.map(h => ({datum: h.faellig_am, text: `HW ${h.fach}: ${h.beschreibung}`})),
      ...pruefungen.map(p => ({datum: p.pruefungsdatum, text: `Exam ${p.fach}: ${p.beschreibung}`})),
      ...events.map(e => ({datum: e.startzeit, text: `Event ${e.titel}: ${e.beschreibung}`}))
    ].sort((a,b) => a.datum.localeCompare(b.datum));
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
