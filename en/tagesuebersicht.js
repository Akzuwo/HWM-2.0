const API_BASE = 'https://homework-manager-2-0-backend.onrender.com';

function setPageDate() {
  const dateTarget = document.getElementById('pageDate');
  if (dateTarget) {
    const today = new Date();
    dateTarget.textContent = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(today);
  }
}

function normalizeDay(value) {
  return value ? value.toLocaleLowerCase('en-GB') : '';
}

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('overview');
  setPageDate();

  try {
    const res = await fetch(`${API_BASE}/tagesuebersicht`);
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    const data = await res.json();
    container.innerHTML = '';

    const todayKey = normalizeDay(new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(new Date()));

    for (const [tag, entries] of Object.entries(data)) {
      const card = document.createElement('section');
      card.className = 'day-card';
      if (normalizeDay(tag) === todayKey) {
        card.classList.add('current-day');
      }

      const heading = document.createElement('h2');
      heading.textContent = tag;
      card.appendChild(heading);

      const table = document.createElement('table');
      table.className = 'schedule-table';
      table.innerHTML = '<thead><tr><th>Time</th><th>Subject</th><th>Room</th></tr></thead>';
      const tbody = document.createElement('tbody');

      if (!entries.length) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 3;
        cell.textContent = 'No entries';
        cell.classList.add('no-entry');
        row.appendChild(cell);
        tbody.appendChild(row);
      } else {
        for (const entry of entries) {
          const row = document.createElement('tr');
          const time = document.createElement('td');
          time.textContent = `${entry.start} – ${entry.end}`;
          const subject = document.createElement('td');
          subject.textContent = entry.fach;
          const room = document.createElement('td');
          room.textContent = entry.raum;
          row.append(time, subject, room);
          tbody.appendChild(row);
        }
      }

      table.appendChild(tbody);
      card.appendChild(table);
      container.appendChild(card);
    }
  } catch (err) {
    console.error('Error loading daily overview:', err);
    container.textContent = 'Error loading data.';
  }
});
