const API_BASE = 'https://homework-manager-2-0-backend.onrender.com';

document.addEventListener('DOMContentLoaded', async () => {
  const listEl = document.getElementById('upcoming-list');
  const dateFormatter = new Intl.DateTimeFormat('it-IT', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const timeFormatter = new Intl.DateTimeFormat('it-IT', {
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
      throw new Error(`Errore API (${res.status})`);
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
          description: e.beschreibung || '',
          dateObj,
          hasTime: Boolean(e.startzeit)
        };
      })
      .sort((a, b) => a.dateObj - b.dateObj);

    listEl.innerHTML = '';

    if (events.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'upcoming-empty';
      empty.textContent = 'Nessun evento imminente trovato.';
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
      typeBadge.textContent = 'Evento';

      const subjectBadge = document.createElement('span');
      subjectBadge.className = 'upcoming-subject';
      subjectBadge.textContent = event.fach || '—';

      meta.append(typeBadge, subjectBadge);

      const dateLine = document.createElement('div');
      dateLine.className = 'upcoming-date';
      const dateText = dateFormatter.format(event.dateObj);
      const timeText = event.hasTime ? timeFormatter.format(event.dateObj) : 'Tutto il giorno';
      dateLine.textContent = `${dateText} · ${timeText}`;

      const desc = document.createElement('p');
      desc.className = 'upcoming-desc';
      desc.textContent = truncate(event.description) || 'Nessuna descrizione disponibile.';

      card.append(meta, dateLine, desc);
      listEl.appendChild(card);
    }
  } catch (err) {
    console.error('Errore durante il caricamento dei dati:', err);
    listEl.innerHTML = '<p class="upcoming-empty">Errore durante il caricamento dei dati.</p>';
  }
});
