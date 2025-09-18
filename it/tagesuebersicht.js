const API_BASE = 'https://homework-manager-2-0-backend.onrender.com';

function setPageDate() {
  const dateTarget = document.getElementById('pageDate');
  if (dateTarget) {
    const today = new Date();
    dateTarget.textContent = new Intl.DateTimeFormat('it-IT', { dateStyle: 'full' }).format(today);
  }
}

function normalizeDay(value) {
  return value ? value.toLocaleLowerCase('it-IT') : '';
}

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('overview');
  setPageDate();

  try {
    const res = await fetch(`${API_BASE}/tagesuebersicht`);
    if (!res.ok) {
      throw new Error(`Errore API: ${res.status}`);
    }
    const data = await res.json();
    container.innerHTML = '';

    const todayKey = normalizeDay(new Intl.DateTimeFormat('it-IT', { weekday: 'long' }).format(new Date()));

    for (const [giorno, voci] of Object.entries(data)) {
      const card = document.createElement('section');
      card.className = 'day-card';
      if (normalizeDay(giorno) === todayKey) {
        card.classList.add('current-day');
      }

      const heading = document.createElement('h2');
      heading.textContent = giorno;
      card.appendChild(heading);

      const table = document.createElement('table');
      table.className = 'schedule-table';
      table.innerHTML = '<thead><tr><th>Orario</th><th>Materia</th><th>Aula</th></tr></thead>';
      const tbody = document.createElement('tbody');

      if (!voci.length) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 3;
        cell.textContent = 'Nessuna voce';
        cell.classList.add('no-entry');
        row.appendChild(cell);
        tbody.appendChild(row);
      } else {
        for (const voce of voci) {
          const row = document.createElement('tr');
          const time = document.createElement('td');
          time.textContent = `${voce.start} – ${voce.end}`;
          const subject = document.createElement('td');
          subject.textContent = voce.fach;
          const room = document.createElement('td');
          room.textContent = voce.raum;
          row.append(time, subject, room);
          tbody.appendChild(row);
        }
      }

      table.appendChild(tbody);
      card.appendChild(table);
      container.appendChild(card);
    }
  } catch (err) {
    console.error('Errore durante il caricamento della panoramica giornaliera:', err);
    container.textContent = 'Errore durante il caricamento dei dati.';
  }
});
