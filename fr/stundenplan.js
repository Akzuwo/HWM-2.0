document.addEventListener('DOMContentLoaded', () => {
  if (typeof initCurrentSubjectPage !== 'function') {
    console.warn('initCurrentSubjectPage is not available.');
    return;
  }

  initCurrentSubjectPage({
    refreshInterval: 750,
    countdownUpdateInterval: 750,
    text: {
      baseTitle: 'Matière actuelle',
      countdownLabel: 'Temps restant',
      progressLabel: 'Progression du cours',
      freeSlot: 'Créneau libre',
      noLesson: 'Aucun cours en cours.',
      noNextLesson: 'Pas d’autres cours aujourd’hui.',
      error: 'Impossible de charger les données.',
      unauthorized: 'Connecte-toi et assure-toi d’être affecté·e à une classe pour voir la matière actuelle.',
    },
  });
});
