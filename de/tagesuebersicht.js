const API_BASE_URL =
  (typeof window !== 'undefined' && typeof window.hmResolveApiBase === 'function')
    ? window.hmResolveApiBase()
    : 'https://hwm-api.akzuwo.ch';

function fetchWithSession(url, options = {}) {
  const { headers, ...rest } = options || {};
  const init = {
    ...rest,
    credentials: 'include'
  };
  if (headers) {
    init.headers = headers;
  }
  return fetch(url, init);
}

const unauthorizedMessage =
  'Bitte melde dich an und stelle sicher, dass du einer Klasse zugeordnet bist, um die Tagesübersicht zu sehen.';
const featureUnavailableMessage = 'Dieses Feature ist für deine Klasse noch nicht verfügbar.';

async function responseRequiresClassContext(response) {
  if (!response) return false;
  if (response.status === 401) {
    return true;
  }
  if (response.status !== 403) {
    return false;
  }
  try {
    const text = await response.clone().text();
    if (!text) {
      return false;
    }
    try {
      const data = JSON.parse(text);
      return Boolean(data && (data.message === 'class_required' || data.error === 'class_required'));
    } catch (error) {
      return text.includes('class_required');
    }
  } catch (error) {
    return false;
  }
}

function setPageDate() {
  const dateTarget = document.getElementById('pageDate');
  if (dateTarget) {
    const today = new Date();
    dateTarget.textContent = new Intl.DateTimeFormat('de-DE', { dateStyle: 'full' }).format(today);
  }
}

function normalizeDay(value) {
  return value ? value.toLocaleLowerCase('de-DE') : '';
}

function renderOverview(container, data) {
  container.innerHTML = '';

  const todayKey = normalizeDay(new Intl.DateTimeFormat('de-DE', { weekday: 'long' }).format(new Date()));

  for (const [tag, eintraege] of Object.entries(data)) {
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
    table.innerHTML = '<thead><tr><th>Uhrzeit</th><th>Fach</th><th>Raum</th></tr></thead>';
    const tbody = document.createElement('tbody');

    if (!eintraege.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 3;
      cell.textContent = 'Keine Einträge';
      cell.classList.add('no-entry');
      row.appendChild(cell);
      tbody.appendChild(row);
    } else {
      for (const e of eintraege) {
        const row = document.createElement('tr');
        const time = document.createElement('td');
        time.textContent = `${e.start} – ${e.end}`;
        const subject = document.createElement('td');
        subject.textContent = e.fach;
        const room = document.createElement('td');
        room.textContent = e.raum;
        row.append(time, subject, room);
        tbody.appendChild(row);
      }
    }

    table.appendChild(tbody);
    card.appendChild(table);
    container.appendChild(card);
  }
}

async function loadOverview(container, { showLoading = false } = {}) {
  if (!container) {
    return;
  }
  if (showLoading) {
    container.textContent = 'Lade Daten…';
  }

  try {
    const res = await fetchWithSession(`${API_BASE_URL}/tagesuebersicht`);
    if (await responseRequiresClassContext(res)) {
      container.textContent = unauthorizedMessage;
      return;
    }
    if (res.status === 404) {
      let payload = null;
      try {
        payload = await res.clone().json();
      } catch (error) {
        payload = null;
      }
      if (payload && payload.error === 'schedule_unavailable') {
        container.textContent = featureUnavailableMessage;
        return;
      }
    }
    if (!res.ok) {
      throw new Error(`API-Fehler: ${res.status}`);
    }
    const data = await res.json();
    renderOverview(container, data);
  } catch (err) {
    console.error('Fehler beim Laden der Tagesübersicht:', err);
    container.textContent = 'Fehler beim Laden der Daten.';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('overview');
  setPageDate();

  if (window.hmClassSelector) {
    const permissions = window.hmCalendar ? window.hmCalendar.permissions : null;
    const selector = window.hmClassSelector.create({
      container: '[data-class-selector]',
      select: '[data-class-select]',
      permissions,
      text: {
        label: 'Klasse',
        placeholder: 'Klasse wählen',
        loading: 'Klassen werden geladen …',
        error: 'Klassen konnten nicht geladen werden.',
        changeError: 'Klasse konnte nicht gewechselt werden.',
        required: 'Bitte wähle eine Klasse, um dieses Feature zu nutzen.'
      },
      onError: (message) => {
        if (typeof window.showOverlay === 'function') {
          window.showOverlay(message, 'error');
        } else {
          console.error(message);
        }
      },
      onClassChange: () => loadOverview(container, { showLoading: true })
    });
    selector.init().catch((error) => {
      console.error('Klassen-Auswahl konnte nicht initialisiert werden:', error);
    });
  }

  loadOverview(container, { showLoading: true });
});
