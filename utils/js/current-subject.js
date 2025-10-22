(function () {
  const API_BASE =
    (typeof window !== 'undefined' && typeof window.hmResolveApiBase === 'function')
      ? window.hmResolveApiBase()
      : 'https://homework-manager-2-0-backend.onrender.com';
  const DEFAULT_ENDPOINT = `${API_BASE}/aktuelles_fach`;
  const FREE_TOKENS = ['frei', 'free', 'libero', 'libre', '-'];
  const DEFAULT_REFRESH = 30000;
  const DEFAULT_COUNTDOWN_UPDATE = 1000;

  const DEFAULT_TEXT = {
    baseTitle: 'Current Subject',
    countdownLabel: 'Time remaining',
    progressLabel: 'Lesson progress',
    freeSlot: 'Free period',
    noLesson: 'No lesson in progress',
    noNextLesson: 'No further lessons today',
    error: 'Unable to load data.',
  };

  function bySelector(target) {
    if (!target) {
      return null;
    }
    if (typeof target === 'string') {
      return document.querySelector(target);
    }
    return target;
  }

  function parseSeconds(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return Math.max(0, Math.floor(value));
    }
    if (typeof value === 'string' && value.includes(':')) {
      const parts = value.split(':').map((part) => parseInt(part, 10));
      if (parts.every((num) => Number.isFinite(num))) {
        if (parts.length === 3) {
          return Math.max(0, parts[0] * 3600 + parts[1] * 60 + parts[2]);
        }
        return Math.max(0, parts[0] * 60 + parts[1]);
      }
    }
    return null;
  }

  function formatClock(seconds) {
    if (!Number.isFinite(seconds)) {
      return '--:--';
    }
    const clamped = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(clamped / 60);
    const secs = clamped % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function isActiveLesson(subject) {
    if (!subject) {
      return false;
    }
    const normalized = String(subject).trim().toLowerCase();
    return normalized.length > 0 && !FREE_TOKENS.includes(normalized);
  }

  function clampPercent(value) {
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.max(0, Math.min(100, value));
  }

  window.initCurrentSubjectPage = function initCurrentSubjectPage(options) {
    const config = {
      selector: '[data-current-subject]',
      endpoint: DEFAULT_ENDPOINT,
      refreshInterval: DEFAULT_REFRESH,
      text: {},
      countdownUpdateInterval: DEFAULT_COUNTDOWN_UPDATE,
      ...options,
    };
    const root = bySelector(config.selector);
    if (!root) {
      return;
    }

    const text = { ...DEFAULT_TEXT, ...(config.text || {}) };
    const subjectSuffix = root.querySelector('[data-subject-name]');
    const countdownLabelEl = root.querySelector('[data-countdown-label]');
    const countdownValueEl = root.querySelector('[data-countdown-value]');
    const progressEl = root.querySelector('[data-progress]');
    const progressBar = root.querySelector('[data-progress-bar]');
    const currentDetails = root.querySelector('[data-current-details]');
    const currentEmpty = root.querySelector('[data-current-empty]');
    const currentRoom = root.querySelector('[data-current-room]');
    const currentStart = root.querySelector('[data-current-start]');
    const currentEnd = root.querySelector('[data-current-end]');
    const nextDetails = root.querySelector('[data-next-details]');
    const nextEmpty = root.querySelector('[data-next-empty]');
    const nextSubject = root.querySelector('[data-next-subject]');
    const nextStart = root.querySelector('[data-next-start]');
    const nextRoom = root.querySelector('[data-next-room]');

    if (countdownLabelEl) {
      countdownLabelEl.textContent = text.countdownLabel;
    }
    if (currentEmpty) {
      currentEmpty.textContent = text.noLesson;
    }
    if (nextEmpty) {
      nextEmpty.textContent = text.noNextLesson;
    }
    if (progressEl) {
      progressEl.setAttribute('aria-label', text.progressLabel);
      progressEl.setAttribute('aria-valuemin', '0');
      progressEl.setAttribute('aria-valuemax', '100');
      progressEl.setAttribute('aria-valuenow', '0');
    }

    const countdownInterval =
      Number.isFinite(config.countdownUpdateInterval) && config.countdownUpdateInterval > 0
        ? config.countdownUpdateInterval
        : DEFAULT_COUNTDOWN_UPDATE;

    const state = {
      remainingMs: null,
      totalMs: null,
      rafId: null,
      lastTick: null,
      lastDisplay: null,
      fetchTimer: null,
      lastPayload: null,
    };

    function setSubjectLabel(value, isLessonActive) {
      if (!subjectSuffix) {
        return;
      }
      const subjectText = isLessonActive ? String(value || '').trim() || text.freeSlot : text.freeSlot;
      subjectSuffix.textContent = `· ${subjectText}`;
      subjectSuffix.classList.toggle('is-inactive', !isLessonActive);
    }

    function showCurrentDetails(show) {
      if (currentDetails) {
        currentDetails.hidden = !show;
      }
      if (currentEmpty) {
        currentEmpty.hidden = show;
        if (!show) {
          currentEmpty.textContent = text.noLesson;
        }
      }
    }

    function showNextDetails(show) {
      if (nextDetails) {
        nextDetails.hidden = !show;
      }
      if (nextEmpty) {
        nextEmpty.hidden = show;
        if (!show) {
          nextEmpty.textContent = text.noNextLesson;
        }
      }
    }

    function updateProgress() {
      if (!progressEl || !progressBar) {
        return;
      }
      if (!Number.isFinite(state.totalMs) || state.totalMs <= 0) {
        progressEl.hidden = true;
        progressEl.setAttribute('aria-valuenow', '0');
        progressBar.style.width = '0%';
        progressBar.classList.remove('is-warning', 'is-alert');
        return;
      }

      progressEl.hidden = false;
      const percentRemaining = clampPercent((state.remainingMs / state.totalMs) * 100);
      const rounded = Math.round(percentRemaining);
      progressEl.setAttribute('aria-valuenow', String(rounded));
      progressBar.style.width = `${percentRemaining}%`;
      progressBar.classList.remove('is-warning', 'is-alert');
      if (percentRemaining <= 50 && percentRemaining > 20) {
        progressBar.classList.add('is-warning');
      } else if (percentRemaining <= 20) {
        progressBar.classList.add('is-alert');
      }
    }

    function updateCountdownDisplay() {
      if (countdownValueEl) {
        const seconds = Number.isFinite(state.remainingMs) ? state.remainingMs / 1000 : null;
        countdownValueEl.textContent = formatClock(seconds);
      }
      updateProgress();
    }

    function stopTicker() {
      if (state.rafId) {
        cancelAnimationFrame(state.rafId);
        state.rafId = null;
      }
      state.lastTick = null;
      state.lastDisplay = null;
    }

    function tick(now) {
      if (!Number.isFinite(state.remainingMs)) {
        return;
      }
      if (state.lastTick == null) {
        state.lastTick = now;
        state.lastDisplay = now;
        updateCountdownDisplay();
        state.rafId = requestAnimationFrame(tick);
        return;
      }
      const elapsed = now - state.lastTick;
      state.lastTick = now;
      state.remainingMs = Math.max(0, state.remainingMs - elapsed);

      if (state.lastDisplay == null || now - state.lastDisplay >= countdownInterval || state.remainingMs === 0) {
        state.lastDisplay = now;
        updateCountdownDisplay();
      }

      if (state.remainingMs > 0) {
        state.rafId = requestAnimationFrame(tick);
      }
    }

    function startTicker() {
      stopTicker();
      if (!Number.isFinite(state.remainingMs)) {
        updateCountdownDisplay();
        return;
      }
      updateCountdownDisplay();
      state.rafId = requestAnimationFrame(tick);
    }

    function renderCurrent(data) {
      const active = isActiveLesson(data?.fach);
      setSubjectLabel(data?.fach, active);

      if (!active) {
        state.remainingMs = null;
        state.totalMs = null;
        if (currentRoom) currentRoom.textContent = '–';
        if (currentStart) currentStart.textContent = '--:--';
        if (currentEnd) currentEnd.textContent = '--:--';
        showCurrentDetails(false);
        stopTicker();
        updateCountdownDisplay();
        return;
      }

      showCurrentDetails(true);
      if (currentRoom) {
        currentRoom.textContent = data.raum || '–';
      }
      if (currentStart) {
        currentStart.textContent = data.start || '--:--';
      }
      if (currentEnd) {
        currentEnd.textContent = data.ende || '--:--';
      }

      const totalSeconds = parseSeconds(data.gesamt_sekunden);
      const remainingSeconds = parseSeconds(data.verbleibende_sekunden ?? data.verbleibend);
      state.totalMs = Number.isFinite(totalSeconds) ? totalSeconds * 1000 : null;
      state.remainingMs = Number.isFinite(remainingSeconds) ? remainingSeconds * 1000 : null;
      startTicker();
    }

    function renderNext(data) {
      const hasNext = isActiveLesson(data?.naechstes_fach) && data?.naechste_start && data.naechste_start !== '-';
      if (!hasNext) {
        showNextDetails(false);
        if (nextSubject) nextSubject.textContent = '–';
        if (nextStart) nextStart.textContent = '--:--';
        if (nextRoom) nextRoom.textContent = '–';
        return;
      }

      showNextDetails(true);
      if (nextSubject) {
        nextSubject.textContent = data.naechstes_fach || '–';
      }
      if (nextStart) {
        nextStart.textContent = data.naechste_start || '--:--';
      }
      if (nextRoom) {
        nextRoom.textContent = data.naechster_raum || '–';
      }
    }

    function handleError() {
      setSubjectLabel(null, false);
      if (subjectSuffix) {
        subjectSuffix.textContent = '· —';
        subjectSuffix.classList.add('is-inactive');
      }
      state.remainingMs = null;
      state.totalMs = null;
      stopTicker();
      if (countdownValueEl) {
        countdownValueEl.textContent = '--:--';
      }
      if (currentEmpty) {
        currentEmpty.hidden = false;
        currentEmpty.textContent = text.error;
      }
      if (currentDetails) {
        currentDetails.hidden = true;
      }
      if (nextEmpty) {
        nextEmpty.hidden = false;
      }
      if (nextDetails) {
        nextDetails.hidden = true;
      }
      updateProgress();
    }

    async function fetchData() {
      try {
        const response = await fetch(config.endpoint, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const payload = await response.json();
        state.lastPayload = payload;
        renderCurrent(payload);
        renderNext(payload);
      } catch (error) {
        console.error('Error while loading current subject', error);
        handleError();
      }
    }

    function scheduleRefresh() {
      if (state.fetchTimer) {
        clearInterval(state.fetchTimer);
      }
      if (Number.isFinite(config.refreshInterval) && config.refreshInterval > 0) {
        state.fetchTimer = window.setInterval(fetchData, config.refreshInterval);
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    }

    function cleanup() {
      stopTicker();
      if (state.fetchTimer) {
        clearInterval(state.fetchTimer);
        state.fetchTimer = null;
      }
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', cleanup);
      window.removeEventListener('beforeunload', cleanup);
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', cleanup);
    window.addEventListener('beforeunload', cleanup);

    fetchData();
    scheduleRefresh();
  };
})();
