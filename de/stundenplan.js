document.addEventListener('DOMContentLoaded', () => {
  if (typeof initCurrentSubjectPage !== 'function') {
    console.warn('initCurrentSubjectPage is not available.');
    return;
  }

  const controller = initCurrentSubjectPage({
    refreshInterval: 15000,
    countdownUpdateInterval: 1000,
    text: {
      baseTitle: 'Aktuelles Fach',
      countdownLabel: 'Verbleibende Zeit',
      progressLabel: 'Fortschritt der Lektion',
      freeSlot: 'Frei',
      noLesson: 'Aktuell findet keine Stunde statt.',
      noNextLesson: 'Keine weiteren Stunden heute.',
      error: 'Fehler beim Laden der Daten.',
      unauthorized: 'Bitte melde dich an und stelle sicher, dass du einer Klasse zugeordnet bist, um das aktuelle Fach zu sehen.',
      featureUnavailable: 'Dieses Feature ist für deine Klasse noch nicht verfügbar.'
    },
  });

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
      onClassChange: () => {
        if (controller && typeof controller.refresh === 'function') {
          controller.refresh();
        }
      }
    });
    selector.init().catch((error) => {
      console.error('Klassen-Auswahl konnte nicht initialisiert werden:', error);
    });
  }
});
