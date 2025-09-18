const API_BASE = 'https://homework-manager-2-0-backend.onrender.com';

document.addEventListener('DOMContentLoaded', async () => {
  const listEl = document.getElementById('upcoming-list');
  const dateFormatter = new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const timeFormatter = new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const truncate = (text, length = 160) => {
    if (!text) return '';
    return text.length > length ? `${text.slice(0, length - 1)}…` : text;
  };

  try {
    const res = await fetch(`${API_BASE}/entries`);
    if (!res.ok) {
      throw new Error(`API-Fehler (${res.status})`);
    }

    const entries = await res.json();
    const events = entries
      .filter(e => (e.typ || '').toLowerCase() === 'event')
      .map(e => {
        const iso = `${e.datum}T${e.startzeit || '00:00:00'}`;
        const dateObj = new Date(iso);
        return {
          id: e.id,
          fach: e.fach || '',
          beschreibung: e.beschreibung || '',
          dateObj,
          hasTime: Boolean(e.startzeit)
        };
      })
      .sort((a, b) => a.dateObj - b.dateObj);

    listEl.innerHTML = '';

    if (events.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'upcoming-empty';
      empty.textContent = 'Keine bevorstehenden Events gefunden.';
      listEl.appendChild(empty);
      return;
    }

    for (const event of events) {
      const card = document.createElement('article');
      card.className = 'upcoming-card';

      const meta = document.createElement('div');
      meta.className = 'upcoming-meta';

      const typeBadge = document.createElement('span');
      typeBadge.className = 'upcoming-type';
      typeBadge.textContent = 'Event';

      const subjectBadge = document.createElement('span');
      subjectBadge.className = 'upcoming-subject';
      subjectBadge.textContent = event.fach || '—';

      meta.append(typeBadge, subjectBadge);

      const dateLine = document.createElement('div');
      dateLine.className = 'upcoming-date';
      const dateText = dateFormatter.format(event.dateObj);
      const timeText = event.hasTime ? timeFormatter.format(event.dateObj) : 'Ganztägig';
      dateLine.textContent = `${dateText} · ${timeText}`;

      const desc = document.createElement('p');
      desc.className = 'upcoming-desc';
      desc.textContent = truncate(event.beschreibung) || 'Keine Beschreibung vorhanden.';

      card.append(meta, dateLine, desc);
      listEl.appendChild(card);
    }
  } catch (err) {
    console.error('Fehler beim Laden der Daten:', err);
    listEl.innerHTML = '<p class="upcoming-empty">Fehler beim Laden der Daten.</p>';
  }
});
