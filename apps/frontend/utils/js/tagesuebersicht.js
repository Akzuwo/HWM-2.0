import { showViewState, setViewLoading } from './view-state.js';
import { resolveApiBase } from './api-client.js';

const API_BASE_URL = resolveApiBase();
let loadSequence = 0;

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

const t = window.hmI18n ? window.hmI18n.scope('dayOverview') : (key, fallback) => fallback;
const locale = window.hmI18n ? window.hmI18n.getLocale() : 'en-GB';

const unauthorizedMessage = t(
  'unauthorized',
  'Please sign in and make sure you are assigned to a class to view the daily overview.'
);
const featureUnavailableMessage = t('featureUnavailable', 'This feature is not yet available for your class.');

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
    dateTarget.textContent = new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(today);
  }
}

function normalizeDay(value) {
  return value ? value.toLocaleLowerCase(locale) : '';
}

function renderOverview(container, data) {
  container.innerHTML = '';
  container.setAttribute('aria-busy', 'false');

  const todayKey = normalizeDay(new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(new Date()));
  const normalizedData = data && Array.isArray(data.day_plan)
    ? {
        [new Date(`${data.date}T00:00:00`).toLocaleDateString(locale, { weekday: 'long' })]: data.day_plan,
        ...(data.next_school_day
          ? {
              [new Date(`${data.next_school_day}T00:00:00`).toLocaleDateString(locale, { weekday: 'long' })]:
                data.next_day_plan || []
            }
          : {})
      }
    : data;

  if (!normalizedData || !Object.keys(normalizedData).length) {
    showViewState(container, { message: 'Für diesen Tag sind keine Lektionen eingetragen.' });
    return;
  }

  for (const [tag, entries] of Object.entries(normalizedData || {})) {
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
    table.innerHTML = `<thead><tr><th>${t('table.time', 'Time')}</th><th>${t('table.subject', 'Subject')}</th><th>${t('table.room', 'Room')}</th></tr></thead>`;
    const tbody = document.createElement('tbody');

    if (!entries.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 3;
      cell.textContent = t('table.empty', 'No entries');
      cell.classList.add('no-entry');
      row.appendChild(cell);
      tbody.appendChild(row);
    } else {
      for (const entry of entries) {
        const row = document.createElement('tr');
        if (entry.status && entry.status !== 'normal') {
          row.classList.add(`schedule-row--${entry.status}`);
        }
        const time = document.createElement('td');
        time.textContent = `${entry.start} – ${entry.end}`;
        const subject = document.createElement('td');
        subject.textContent = entry.subject || entry.fach;
        if (Array.isArray(entry.badges) && entry.badges.length) {
          const badgeWrap = document.createElement('div');
          badgeWrap.className = 'timetable-badges';
          for (const badgeText of entry.badges) {
            const badge = document.createElement('span');
            badge.className = 'timetable-badge';
            badge.textContent = badgeText;
            badgeWrap.appendChild(badge);
          }
          subject.appendChild(badgeWrap);
        }
        const room = document.createElement('td');
        room.textContent = entry.status === 'room_change' && entry.original_room && entry.new_room
          ? `${entry.original_room} -> ${entry.new_room}`
          : (entry.room || entry.raum);
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
  const requestId = ++loadSequence;
  if (!container) {
    return;
  }
  if (showLoading) setViewLoading(container);

  try {
    const res = await fetchWithSession(`${API_BASE_URL}/api/timetable/day`);
    if (requestId !== loadSequence || !container.isConnected) return;
    if (await responseRequiresClassContext(res)) {
      showViewState(container, { message: unauthorizedMessage, login: true });
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
        showViewState(container, { message: featureUnavailableMessage, retry: () => loadOverview(container) });
        return;
      }
    }
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    const data = await res.json();
    if (requestId !== loadSequence || !container.isConnected) return;
    renderOverview(container, data);
  } catch (err) {
    if (requestId !== loadSequence || !container.isConnected) return;
    console.error('Error loading daily overview:', err);
    showViewState(container, { message: t('error', 'Die Tagesübersicht konnte nicht geladen werden.'), error: true, retry: () => loadOverview(container), preserve: Boolean(container.querySelector('.day-card')) });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('overview');
  if (!container || container.dataset.enhanced === 'true') return;
  container.dataset.enhanced = 'true';
  setPageDate();

  if (window.hmClassSelector) {
    const permissions = window.hmCalendar ? window.hmCalendar.permissions : null;
    const selector = window.hmClassSelector.create({
      container: '[data-class-selector]',
      select: '[data-class-select]',
      permissions,
      text: {
        label: t('classLabel', 'Class'),
        placeholder: t('classPlaceholder', 'Select class'),
        loading: t('classLoading', 'Loading classes…'),
        error: t('classError', 'Unable to load classes.'),
        changeError: t('classChangeError', 'Unable to change class.'),
        required: t('classRequired', 'Please choose a class to use this feature.')
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
      console.error('Failed to initialise class selector:', error);
    });
  }

  loadOverview(container, { showLoading: true });
});
