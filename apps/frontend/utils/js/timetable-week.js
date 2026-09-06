import { showViewState, setViewLoading } from './view-state.js';
import { resolveApiBase } from './api-client.js';

const API_BASE_URL = resolveApiBase();
let loadSequence = 0;

const locale = window.hmI18n ? window.hmI18n.getLocale() : 'de-CH';
let anchorDate = new Date();

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function sameDate(left, right) {
  return isoDate(left) === isoDate(right);
}

function clearNode(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function createBadge(text) {
  const badge = document.createElement('span');
  badge.className = 'timetable-badge';
  badge.textContent = text;
  return badge;
}

function lessonLabel(lesson) {
  if (lesson.status === 'room_change' && lesson.original_room && lesson.new_room) {
    return `${lesson.original_room} -> ${lesson.new_room}`;
  }
  if (lesson.status === 'replacement' && lesson.original_subject && lesson.new_subject) {
    return `${lesson.original_subject} -> ${lesson.new_subject}`;
  }
  if (lesson.status === 'time_shift' && lesson.original_start && lesson.new_start) {
    return `${lesson.original_start}-${lesson.original_end} -> ${lesson.new_start}-${lesson.new_end}`;
  }
  return lesson.room || '-';
}

function renderLesson(tbody, lesson) {
  const row = document.createElement('tr');
  row.className = `schedule-row schedule-row--${lesson.status || 'normal'}`;
  if (lesson.is_real_lesson) {
    row.classList.add('is-real-lesson');
  }

  const time = document.createElement('td');
  time.textContent = `${lesson.start || '--:--'} - ${lesson.end || '--:--'}`;

  const subject = document.createElement('td');
  const title = document.createElement('strong');
  title.textContent = lesson.subject || lesson.fach || '-';
  subject.appendChild(title);
  if (lesson.group || lesson.group_name) {
    subject.appendChild(document.createTextNode(` · ${lesson.group || lesson.group_name}`));
  }
  const badges = lesson.badges || [];
  if (badges.length) {
    const badgeWrap = document.createElement('div');
    badgeWrap.className = 'timetable-badges';
    badges.forEach((badge) => badgeWrap.appendChild(createBadge(badge)));
    subject.appendChild(badgeWrap);
  }
  if (lesson.reason) {
    const reason = document.createElement('small');
    reason.textContent = lesson.reason;
    subject.appendChild(reason);
  }

  const room = document.createElement('td');
  room.textContent = lessonLabel(lesson);

  row.append(time, subject, room);
  tbody.appendChild(row);
}

function renderWeek(container, data) {
  clearNode(container);
  container.setAttribute('aria-busy', 'false');
  const today = new Date();
  if (!data?.days?.length) {
    showViewState(container, { message: 'Für diese Woche sind keine Lektionen eingetragen. Wähle bei Bedarf eine andere Woche.' });
    return;
  }
  const range = document.getElementById('weekRange');
  if (range) {
    const start = new Date(`${data.week_start}T00:00:00`);
    const end = new Date(`${data.week_end}T00:00:00`);
    range.textContent = `${new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(start)} - ${new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(end)}`;
  }

  for (const day of data.days || []) {
    const card = document.createElement('section');
    card.className = 'day-card';
    const dayDate = new Date(`${day.date}T00:00:00`);
    if (sameDate(dayDate, today)) {
      card.classList.add('current-day');
    }

    const heading = document.createElement('h2');
    heading.textContent = new Intl.DateTimeFormat(locale, { weekday: 'long', day: '2-digit', month: '2-digit' }).format(dayDate);
    card.appendChild(heading);

    if (day.day_status_label || day.notice) {
      const notice = document.createElement('p');
      notice.className = 'week-day-notice';
      notice.textContent = day.notice || day.day_status_label;
      card.appendChild(notice);
    }

    const table = document.createElement('table');
    table.className = 'schedule-table';
    table.innerHTML = '<thead><tr><th>Zeit</th><th>Fach</th><th>Raum</th></tr></thead>';
    const tbody = document.createElement('tbody');
    const lessons = day.lessons || [];
    if (!lessons.length) {
      const row = document.createElement('tr');
      const empty = document.createElement('td');
      empty.colSpan = 3;
      empty.className = 'no-entry';
      empty.textContent = day.day_status_label || 'Keine Lektionen';
      row.appendChild(empty);
      tbody.appendChild(row);
    } else {
      lessons.forEach((lesson) => renderLesson(tbody, lesson));
    }
    table.appendChild(tbody);
    card.appendChild(table);
    container.appendChild(card);
  }
}

async function loadWeek(container, { showLoading = false } = {}) {
  const requestId = ++loadSequence;
  if (!container) return;
  if (showLoading) setViewLoading(container);
  try {
    const response = await fetch(`${API_BASE_URL}/api/timetable/week?date=${encodeURIComponent(isoDate(anchorDate))}`, {
      credentials: 'include',
      cache: 'no-store',
    });
    if (requestId !== loadSequence || !container.isConnected) return;
    if (response.status === 401 || response.status === 403) {
      showViewState(container, { message: 'Bitte melde dich an und wähle eine Klasse aus.', login: true });
      return;
    }
    if (response.status === 404) {
      showViewState(container, { message: 'Für diese Klasse ist noch kein Stundenplan verfügbar. Bitte wende dich an deine Klassenadministration.', retry: () => loadWeek(container) });
      return;
    }
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    if (requestId !== loadSequence || !container.isConnected) return;
    renderWeek(container, data);
  } catch (error) {
    if (requestId !== loadSequence || !container.isConnected) return;
    console.error('Error loading timetable week:', error);
    showViewState(container, { message: 'Die Wochenansicht konnte nicht geladen werden. Bitte prüfe die Verbindung.', error: true, retry: () => loadWeek(container), preserve: Boolean(container.querySelector('.day-card')) });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('weekOverview');
  if (!container || container.dataset.enhanced === 'true') return;
  container.dataset.enhanced = 'true';
  document.querySelector('[data-week-prev]')?.addEventListener('click', () => {
    anchorDate = addDays(anchorDate, -7);
    loadWeek(container, { showLoading: true });
  });
  document.querySelector('[data-week-next]')?.addEventListener('click', () => {
    anchorDate = addDays(anchorDate, 7);
    loadWeek(container, { showLoading: true });
  });
  document.querySelector('[data-week-today]')?.addEventListener('click', () => {
    anchorDate = new Date();
    loadWeek(container, { showLoading: true });
  });

  if (window.hmClassSelector) {
    const permissions = window.hmCalendar ? window.hmCalendar.permissions : null;
    const selector = window.hmClassSelector.create({
      container: '[data-class-selector]',
      select: '[data-class-select]',
      permissions,
      text: {
        label: 'Klasse',
        placeholder: 'Klasse auswählen',
        loading: 'Klassen werden geladen...',
        error: 'Klassen konnten nicht geladen werden.',
        changeError: 'Klasse konnte nicht gewechselt werden.',
        required: 'Bitte wähle eine Klasse aus.'
      },
      onError: (message) => {
        if (typeof window.showOverlay === 'function') {
          window.showOverlay(message, 'error');
        } else {
          console.error(message);
        }
      },
      onClassChange: () => loadWeek(container, { showLoading: true })
    });
    selector.init().catch((error) => console.error('Failed to initialise class selector:', error));
  }

  loadWeek(container, { showLoading: true });
});
