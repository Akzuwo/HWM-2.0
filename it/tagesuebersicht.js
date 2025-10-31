const API_BASE_URL =
  (typeof window !== 'undefined' && typeof window.hmResolveApiBase === 'function')
    ? window.hmResolveApiBase()
    : 'https://homework-manager-2-5-backend.onrender.com';

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
  'Accedi e assicurati di essere assegnato a una classe per vedere la panoramica giornaliera.';
const featureUnavailableMessage = 'Questa funzione non è ancora disponibile per la tua classe.';

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
    dateTarget.textContent = new Intl.DateTimeFormat('it-IT', { dateStyle: 'full' }).format(today);
  }
}

function normalizeDay(value) {
  return value ? value.toLocaleLowerCase('it-IT') : '';
}

function renderOverview(container, data) {
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
}

async function loadOverview(container, { showLoading = false } = {}) {
  if (!container) {
    return;
  }
  if (showLoading) {
    container.textContent = 'Caricamento dati…';
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
      throw new Error(`Errore API: ${res.status}`);
    }
    const data = await res.json();
    renderOverview(container, data);
  } catch (err) {
    console.error('Errore durante il caricamento della panoramica giornaliera:', err);
    container.textContent = 'Errore durante il caricamento dei dati.';
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
        label: 'Classe',
        placeholder: 'Seleziona classe',
        loading: 'Caricamento delle classi…',
        error: 'Impossibile caricare le classi.',
        changeError: 'Impossibile cambiare classe.',
        required: 'Seleziona una classe per utilizzare questa funzione.'
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
      console.error('Impossibile inizializzare il selettore di classe:', error);
    });
  }

  loadOverview(container, { showLoading: true });
});
