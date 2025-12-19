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
  'Connecte-toi et assure-toi d’être affecté·e à une classe pour voir l’aperçu quotidien.';
const featureUnavailableMessage = 'Cette fonctionnalité n’est pas encore disponible pour ta classe.';

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
    dateTarget.textContent = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full' }).format(today);
  }
}

function normalizeDay(value) {
  return value ? value.toLocaleLowerCase('fr-FR') : '';
}

function renderOverview(container, data) {
  container.innerHTML = '';

  const todayKey = normalizeDay(new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(new Date()));

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
    table.innerHTML = '<thead><tr><th>Heure</th><th>Matière</th><th>Salle</th></tr></thead>';
    const tbody = document.createElement('tbody');

    if (!entries.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 3;
      cell.textContent = 'Aucune entrée';
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
}

async function loadOverview(container, { showLoading = false } = {}) {
  if (!container) {
    return;
  }
  if (showLoading) {
    container.textContent = 'Chargement des données…';
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
      throw new Error(`API error: ${res.status}`);
    }
    const data = await res.json();
    renderOverview(container, data);
  } catch (err) {
    console.error('Erreur lors du chargement de la vue quotidienne :', err);
    container.textContent = 'Impossible de charger les données.';
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
        placeholder: 'Sélectionner une classe',
        loading: 'Chargement des classes…',
        error: 'Impossible de charger les classes.',
        changeError: 'Impossible de changer de classe.',
        required: 'Sélectionne une classe pour utiliser cette fonctionnalité.'
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
      console.error('La sélection de classe n’a pas pu être initialisée :', error);
    });
  }

  loadOverview(container, { showLoading: true });
});
