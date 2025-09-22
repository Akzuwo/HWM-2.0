const API_BASE = 'https://homework-manager-2-0-backend.onrender.com';

document.addEventListener('DOMContentLoaded', async () => {
  const listEl = document.getElementById('upcoming-list');
  const backButton = document.getElementById('back-button');

  if (backButton) {
    backButton.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  if (!listEl) {
    return;
  }

  const setStatus = (message) => {
    listEl.innerHTML = '';
    const status = document.createElement('p');
    status.className = 'upcoming__status';
    status.textContent = message;
    listEl.appendChild(status);
  };

  listEl.setAttribute('aria-busy', 'true');

  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const truncate = (text, length = 220) => {
    if (!text) return '';
    return text.length > length ? `${text.slice(0, length - 1)}…` : text;
  };

  try {
    const res = await fetch(`${API_BASE}/entries`);
    if (!res.ok) {
      throw new Error(`API error (${res.status})`);
    }

    const entries = await res.json();
    const events = entries
      .filter((entry) => (entry.typ || '').toLowerCase() === 'event')
      .map((entry) => {
        const iso = `${entry.datum}T${entry.startzeit || '00:00:00'}`;
        const dateObj = new Date(iso);
        return {
          id: entry.id,
          fach: entry.fach || '',
          description: entry.beschreibung || '',
          dateObj,
          hasTime: Boolean(entry.startzeit)
        };
      })
      .sort((a, b) => a.dateObj - b.dateObj);

    listEl.innerHTML = '';

    if (events.length === 0) {
      setStatus('No upcoming events found.');
      listEl.setAttribute('aria-busy', 'false');
      return;
    }

    events.forEach((event, index) => {
      const card = document.createElement('article');
      card.className = 'upcoming-card';
      card.setAttribute('role', 'listitem');
      card.style.setProperty('--card-order', String(index));

      const badges = document.createElement('div');
      badges.className = 'upcoming-card__badges';

      const typeBadge = document.createElement('span');
      typeBadge.className = 'upcoming-card__badge upcoming-card__badge--event';
      typeBadge.textContent = 'EVENT';
      typeBadge.setAttribute('aria-hidden', 'true');

      const subjectBadge = document.createElement('span');
      subjectBadge.className = 'upcoming-card__badge upcoming-card__badge--subject';
      const subject = (event.fach || '—').toUpperCase();
      subjectBadge.textContent = subject;
      subjectBadge.setAttribute('aria-label', event.fach ? `Subject ${event.fach}` : 'No subject provided');

      badges.append(typeBadge, subjectBadge);

      const datetime = document.createElement('div');
      datetime.className = 'upcoming-card__datetime';

      const dateText = dateFormatter.format(event.dateObj);
      const timeText = event.hasTime ? timeFormatter.format(event.dateObj) : 'All day';

      const dateLine = document.createElement('p');
      dateLine.className = 'upcoming-card__date';
      dateLine.textContent = dateText;

      const timeLine = document.createElement('p');
      timeLine.className = 'upcoming-card__time';
      timeLine.textContent = timeText;

      datetime.append(dateLine, timeLine);

      const desc = document.createElement('p');
      const rawDescription = truncate(event.description?.trim());
      const hasDescription = Boolean(rawDescription);
      const descId = `upcoming-desc-${event.id ?? `idx-${index}`}`;
      desc.id = descId;
      desc.className = 'upcoming-card__description';
      if (!hasDescription) {
        desc.classList.add('upcoming-card__description--empty');
        desc.textContent = '– No description –';
      } else {
        desc.textContent = rawDescription;
      }

      const subjectLabel = event.fach ? `${event.fach} ` : '';
      const timeLabel = event.hasTime ? ` at ${timeText}` : '';
      card.setAttribute('aria-label', `Event ${subjectLabel}on ${dateText}${timeLabel}`.trim());
      card.setAttribute('aria-describedby', descId);

      card.append(badges, datetime, desc);
      listEl.appendChild(card);
    });

    listEl.setAttribute('aria-busy', 'false');
  } catch (err) {
    console.error('Error loading data:', err);
    setStatus('Error loading data.');
    listEl.setAttribute('aria-busy', 'false');
  }
});
