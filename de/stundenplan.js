document.addEventListener('DOMContentLoaded', () => {
  if (typeof initCurrentSubjectPage !== 'function') {
    console.warn('initCurrentSubjectPage is not available.');
    return;
  }

  initCurrentSubjectPage({
    text: {
      baseTitle: 'Aktuelles Fach',
      countdownLabel: 'Verbleibende Zeit',
      progressLabel: 'Fortschritt der Lektion',
      freeSlot: 'Frei',
      noLesson: 'Aktuell findet keine Stunde statt.',
      noNextLesson: 'Keine weiteren Stunden heute.',
      error: 'Fehler beim Laden der Daten.',
    },
  });
});
